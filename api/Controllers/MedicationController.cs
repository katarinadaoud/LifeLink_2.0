using HomeCareApp.DTOs;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicationController : ControllerBase
    {
        private readonly IMedicationRepository _medicationRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly ILogger<MedicationController> _logger;

        public MedicationController(IMedicationRepository medicationRepository, INotificationRepository notificationRepository, ILogger<MedicationController> logger)
        {
            _medicationRepository = medicationRepository;
            _notificationRepository = notificationRepository;
            _logger = logger;
        }

        // Get all medications, returns it as a list//
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetAll()
        {
            //find medication list
            var medications = await _medicationRepository.GetAllAsync();
            if (medications == null)
            {
                _logger.LogError("[MedicationController] Medication list not found while executing _medicationRepository.GetAllAsync()");
                return NotFound("Medication list not found");
            }

            //Map medication to DTOs
            var medicationDtos = medications.Select(MedicationDto.FromEntity);

            _logger.LogInformation("[MedicationController] Retrieved {Count} medications", medications.Count());
            return Ok(medicationDtos);
        }

        // Get medications by patient id and returns list of that patients medications//
        [HttpGet("patient/{patientId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MedicationDto>>> GetByPatientId(int patientId)
        {
            _logger.LogInformation("[MedicationController] Getting medications for PatientId: {PatientId}", patientId);
            
            var medications = await _medicationRepository.GetByPatientAsync(patientId);
            
            _logger.LogInformation("[MedicationController] Found {Count} medications for PatientId: {PatientId}", medications.Count(), patientId);
            return Ok(medications.Select(MedicationDto.FromEntity));
        }

        // Get a medication by its name//
        [HttpGet("{medicationName}")]
        public async Task<ActionResult<MedicationDto>> GetByName(string medicationName)
        {
            _logger.LogInformation("[MedicationController] Getting medication by name: {MedicationName}", medicationName);
            
            var medications = await _medicationRepository.GetByNameAsync(medicationName);
            if (medications == null)
            {
                _logger.LogWarning("[MedicationController] Medication not found: {MedicationName}", medicationName);
                return NotFound();
            }
            
            return Ok(MedicationDto.FromEntity(medications));
        }

        // Create a new medication//
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
                
                return CreatedAtAction(nameof(GetByName), new { medicationName = entity.MedicineName }, MedicationDto.FromEntity(createdMedication));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Medication creation failed for {MedicationName}", dto.MedicationName);
                return StatusCode(500, "Internal server error");
            }
        }

        //Update medication//
        [HttpPut("{medicationName}")]
        [Authorize]
        public async Task<IActionResult> Update(string medicationName, MedicationDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Medication data cannot be null");
            }

            try
            {
                //Find the existing medication
                var existingMedication = await _medicationRepository.GetByNameAsync(medicationName);
                if (existingMedication == null)
                {
                    _logger.LogWarning("[MedicationController] Medication not found for update: {MedicationName}", medicationName);
                    return NotFound("Medication not found");
                }

                //Update medication properties
                existingMedication.Dosage = dto.Dosage;
                existingMedication.StartDate = dto.StartDate;
                existingMedication.EndDate = dto.EndDate;
                existingMedication.PatientId = dto.PatientId;
                existingMedication.Indication = dto.Indication;

                //we don't need to call AddAsync. Changes will be saved automatically.
                
                
                //Create notification for medication update
                await CreateMedicationNotification(existingMedication, "updated");
                
                _logger.LogInformation("[MedicationController] Successfully updated medication: {MedicationName} for PatientId: {PatientId}", medicationName, existingMedication.PatientId);
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Medication update failed for {MedicationName}", medicationName);
                return StatusCode(500, "Internal server error");
            }
        }

        //Delete medication//
        [HttpDelete("{medicationName}")]
        [Authorize]
        public async Task<IActionResult> Delete(string medicationName)
        {
            try
            {
                //Get medication details before deletion for notifications
                var medicationToDelete = await _medicationRepository.GetByNameAsync(medicationName);
                if (medicationToDelete == null)
                {
                    _logger.LogWarning("[MedicationController] Medication not found for deletion: {MedicationName}", medicationName);
                    return NotFound("Medication not found");
                }

                //Create notification before deletion
                await CreateMedicationNotification(medicationToDelete, "deleted");

                //Delete using repository
                await _medicationRepository.DeleteAsync(medicationToDelete);
                
                _logger.LogInformation("[MedicationController] Successfully deleted medication: {MedicationName} for PatientId: {PatientId}", medicationName, medicationToDelete.PatientId);
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Medication deletion failed for {MedicationName}", medicationName);
                return StatusCode(500, "Internal server error");
            }
        }


        //Create notifications, only one simple method because it is only one user affected//
        private async Task CreateMedicationNotification(Medication medication, string action)
        {
            try
            {
                // Check if patient information is available
                if (medication.Patient?.UserId == null)
                {
                    _logger.LogWarning("[MedicationController] Missing patient UserId for medication {MedicineName}", medication.MedicineName);
                    return;
                }

                string title = action switch
                {
                    "created" => "New Medication Added",
                    "updated" => "Medication Updated", 
                    "deleted" => "Medication Removed",
                    _ => "Medication Changed"
                };

                var message = action switch
                {
                    "created" => $"A new medication '{medication.MedicineName}' has been added to your treatment plan. Dosage: {medication.Dosage}.",
                    "updated" => $"Your medication '{medication.MedicineName}' has been updated. New dosage: {medication.Dosage}.",
                    "deleted" => $"The medication '{medication.MedicineName}' has been removed from your treatment plan.",
                    _ => $"Your medication '{medication.MedicineName}' has been changed."
                };

                var notification = new Notification
                {
                    UserId = medication.Patient.UserId,
                    Title = title,
                    Message = message,
                    Type = "medication",
                    RelatedId = null, // Medications use string key, not int
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                await _notificationRepository.CreateAsync(notification);
                _logger.LogInformation("[MedicationController] Created {Action} notification for medication {MedicineName}", action, medication.MedicineName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[MedicationController] Failed to create {Action} notification for medication {MedicineName}", action, medication.MedicineName);
            }
        }
    }
}


