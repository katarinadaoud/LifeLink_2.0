using HomeCareApp.DTOs;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicationController : ControllerBase
    {
        private readonly IMedicationRepository _medicationRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<MedicationController> _logger;

        public MedicationController(IMedicationRepository medicationRepository, INotificationRepository notificationRepository, IPatientRepository patientRepository, ILogger<MedicationController> logger)
        {
            _medicationRepository = medicationRepository;
            _notificationRepository = notificationRepository;
            _patientRepository = patientRepository;
            _logger = logger;
        }

        // Get all medications, returns it as a list//
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetAll()
        {
            //find medication list
            var medications = await _medicationRepository.GetAllAsync();
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                               ?? User.FindFirst("sub")?.Value;
            var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

            // Employees see all; patients see only their own
            var visible = userRoles.Contains("Employee") || string.IsNullOrEmpty(currentUserId)
                ? medications
                : medications.Where(m => m.Patient?.UserId == currentUserId);

            //Map medication to DTOs
            var medicationDtos = visible.Select(MedicationDto.FromEntity);

            _logger.LogInformation("[MedicationController] Retrieved {Count} medications (filtered by role)", medicationDtos.Count());
            return Ok(medicationDtos);
        }

        // Get medications by patient id and returns list of that patients medications//
        [HttpGet("patient/{patientId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetByPatientId(int patientId)
        {
            _logger.LogInformation("[MedicationController] Getting medications for PatientId: {PatientId}", patientId);
            
            var medications = await _medicationRepository.GetByPatientAsync(patientId);
            // Ownership/role check: patients can only access their own patientId; employees allowed
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                               ?? User.FindFirst("sub")?.Value;
            var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isEmployee = userRoles.Contains("Employee");
            var owned = medications.Any(m => m.Patient?.UserId == currentUserId);
            if (!isEmployee && !owned)
            {
                _logger.LogWarning("[MedicationController] Forbidden access to medications for PatientId {PatientId} by user {UserId}", patientId, currentUserId);
                return Forbid();
            }
            
            _logger.LogInformation("[MedicationController] Found {Count} medications for PatientId: {PatientId}", medications.Count(), patientId);
            return Ok(medications.Select(MedicationDto.FromEntity));
        }

        // Get current user's medications (patient convenience endpoint)
        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetMyMedications()
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                               ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[MedicationController] Unauthorized access attempt for my medications - User not found");
                return Unauthorized("User not found");
            }

            // Resolve patient by current user
            var allPatients = await _patientRepository.GetAll();
            var patient = allPatients.FirstOrDefault(p => p.UserId == currentUserId);
            if (patient == null)
            {
                _logger.LogWarning("[MedicationController] Patient record not found for current user {UserId}", currentUserId);
                return NotFound("Patient record not found");
            }

            var medications = await _medicationRepository.GetByPatientAsync(patient.PatientId);
            _logger.LogInformation("[MedicationController] Retrieved {Count} medications for current user {UserId}", medications.Count(), currentUserId);
            return Ok(medications.Select(MedicationDto.FromEntity));
        }

        // Get a medication by its ID
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicationDto>> GetById(int id)
        {
            _logger.LogInformation("[MedicationController] Getting medication by ID: {MedicationId}", id);
            
            var medication = await _medicationRepository.GetByIdAsync(id);
            if (medication == null)
            {
                _logger.LogWarning("[MedicationController] Medication not found: {MedicationId}", id);
                return NotFound();
            }
            // Ownership/role check: patients can only access their own; employees allowed
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                               ?? User.FindFirst("sub")?.Value;
            var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
            var isEmployee = userRoles.Contains("Employee");
            var isOwner = medication.Patient?.UserId == currentUserId;
            if (!isEmployee && !isOwner)
            {
                _logger.LogWarning("[MedicationController] Forbidden access to medication {MedicationId} by user {UserId}", id, currentUserId);
                return Forbid();
            }
            
            return Ok(MedicationDto.FromEntity(medication));
        }

        // Create a new medication
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<MedicationDto>> Create(MedicationDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Medication data cannot be null");
            }

            try
            {
                var entity = dto.ToEntity();
                var createdMedication = await _medicationRepository.AddAsync(entity);
                
                // Create notification for medication creation
                await CreateMedicationNotification(createdMedication, "created");
                
                _logger.LogInformation("[MedicationController] Successfully created medication: {MedicationName} for PatientId: {PatientId}", entity.MedicineName, entity.PatientId);
                
                return CreatedAtAction(nameof(GetById), new { id = createdMedication.MedicationId }, MedicationDto.FromEntity(createdMedication));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Medication creation failed for {MedicationName}", dto.MedicationName);
                return StatusCode(500, "Internal server error");
            }
        }

        //Update medication
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] MedicationDto medicationDto)
        {
            if (medicationDto == null)
            {
                return BadRequest("Medication data cannot be null");
            }

            try
            {
                //Find the existing medication
                var existingMedication = await _medicationRepository.GetByIdAsync(id);
                if (existingMedication == null)
                {
                    _logger.LogWarning("[MedicationController] Medication not found for update: {MedicationId}", id);
                    return NotFound("Medication not found");
                }

                // Authorization: only employee or patient owner can update
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                   ?? User.FindFirst("sub")?.Value;
                var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
                var isEmployee = userRoles.Contains("Employee");
                var isOwner = existingMedication.Patient?.UserId == currentUserId;
                if (!isEmployee && !isOwner)
                {
                    _logger.LogWarning("[MedicationController] Forbidden update of medication {MedicationId} by user {UserId}", id, currentUserId);
                    return Forbid();
                }

                //Update medication properties
                existingMedication.Dosage = medicationDto.Dosage;
                existingMedication.StartDate = medicationDto.StartDate;
                existingMedication.EndDate = medicationDto.EndDate;
                // Prevent patient from reassigning to another patient
                existingMedication.PatientId = isEmployee ? medicationDto.PatientId : existingMedication.PatientId;
                existingMedication.Indication = medicationDto.Indication;
                existingMedication.MedicineName = medicationDto.MedicationName;

                //we don't need to call AddAsync. Changes will be saved automatically.
                
                
                //Create notification for medication update
                await CreateMedicationNotification(existingMedication, "updated");
                
                _logger.LogInformation("[MedicationController] Successfully updated medication: {MedicationName} for PatientId: {PatientId}", existingMedication.MedicineName, existingMedication.PatientId);
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Medication update failed for {MedicationId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        //Delete medication
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                //Get medication details before deletion for notifications
                var medicationToDelete = await _medicationRepository.GetByIdAsync(id);
                if (medicationToDelete == null)
                {
                    _logger.LogWarning("[MedicationController] Medication not found for deletion: {MedicationId}", id);
                    return NotFound("Medication not found");
                }

                // Authorization: only employee or patient owner can delete
                var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                                   ?? User.FindFirst("sub")?.Value;
                var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
                var isEmployee = userRoles.Contains("Employee");
                var isOwner = medicationToDelete.Patient?.UserId == currentUserId;
                if (!isEmployee && !isOwner)
                {
                    _logger.LogWarning("[MedicationController] Forbidden deletion of medication {MedicationId} by user {UserId}", id, currentUserId);
                    return Forbid();
                }

                //Create notification before deletion
                await CreateMedicationNotification(medicationToDelete, "deleted");

                //Delete using repository
                await _medicationRepository.DeleteAsync(medicationToDelete);
                
                _logger.LogInformation("[MedicationController] Successfully deleted medication: {MedicationName} for PatientId: {PatientId}", medicationToDelete.MedicineName, medicationToDelete.PatientId);
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Medication deletion failed for {MedicationId}", id);
                return StatusCode(500, "Internal server error");
            }
        }


        //Create notifications, only one simple method because it is only one user affected
        private async Task CreateMedicationNotification(Medication medication, string action)
        {
            try
            {
                var fullMedication = await _medicationRepository.GetByIdAsync(medication.MedicationId);
                // Check if patient information is available
                if (fullMedication?.Patient?.UserId == null)
                {
                    _logger.LogWarning("[MedicationController] Missing patient UserId for medication {MedicineName} (PatientId: {PatientId})", medication.MedicineName, medication.PatientId);
                    return;
                }

                string title = action switch
                {
                    "created" => "New Medication Added",
                    "updated" => "Medication Updated", 
                    "deleted" => "Medication Removed",
                    _ => "Medication Changed"
                };

                var message = action switch //  message based on action
                {
                    "created" => $"A new medication '{fullMedication.MedicineName}' has been added to your treatment plan. Dosage: {medication.Dosage}.",
                    "updated" => $"Your medication '{fullMedication.MedicineName}' has been updated. New dosage: {medication.Dosage}.",
                    "deleted" => $"The medication '{fullMedication.MedicineName}' has been removed from your treatment plan.",
                    _ => $"Your medication '{fullMedication.MedicineName}' has been changed."
                };

                var notification = new Notification // Create notification entity
                {
                    UserId = fullMedication.Patient.UserId,
                    Title = title,
                    Message = message,
                    Type = "medication",
                    RelatedId = fullMedication.MedicationId,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                await _notificationRepository.CreateAsync(notification); // Save notification
                _logger.LogInformation("[MedicationController] Created {Action} notification for medication {MedicineName} (PatientId: {PatientId})", action, fullMedication.MedicineName, fullMedication.PatientId
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Failed to create {Action} notification for medication {MedicineName}", action, medication.MedicineName);
            }
        }
    }
}


