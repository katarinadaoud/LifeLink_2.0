using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Models;
using HomeCareApp.DTOs;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly IPatientRepository _patientRepository;
    private readonly ILogger<PatientController> _logger;
    
    public PatientController(IPatientRepository patientRepository, ILogger<PatientController> logger)
    {
        _patientRepository = patientRepository;
        _logger = logger;
    }

    //Get all patients and returns as a list//
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
    {
        // Robust role check supporting various JWT role claim types
        var roleClaims = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
        roleClaims.AddRange(User.FindAll("role").Select(c => c.Value));
        roleClaims.AddRange(User.FindAll("roles").Select(c => c.Value));

        var isEmployee = roleClaims.Any(r => string.Equals(r, "Employee", StringComparison.OrdinalIgnoreCase));
        if (!isEmployee)
        {
            _logger.LogWarning("[PatientController] Non-employee attempted to list patients");
            return Forbid();
        }
        //Find patient list
        var patients = await _patientRepository.GetAll();
        if (patients == null)
        {
            _logger.LogError("[PatientController] Patient list not found while executing _patientRepository.GetAll()");
            return NotFound("Patient list not found");
        }

        //Map patients to DTOs using FromEntity
        var patientDtos = patients.Select(PatientDto.FromEntity);
        
        _logger.LogInformation("[PatientController] Retrieved {Count} patients", patients.Count());
        return Ok(patientDtos);
    }



    //Get patient by user id//
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PatientDto>> GetPatientByUserId(string userId)
    {
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;
        var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
        var isEmployee = userRoles.Contains("Employee");
        if (!isEmployee && currentUserId != userId)
        {
            _logger.LogWarning("[PatientController] Forbidden access to patient by UserId {UserId} by user {CurrentUserId}", userId, currentUserId);
            return Forbid();
        }
        _logger.LogInformation("[PatientController] Getting patient by UserId: {UserId}", userId);
        var patients = await _patientRepository.GetAll();
        _logger.LogInformation("[PatientController] Total patients in database: {Count}", patients.Count());
        
        foreach (var p in patients)
        {
            _logger.LogDebug("[PatientController] Patient: {PatientId}, UserId: {UserId}", p.PatientId, p.UserId);
        }
        
        var patient = patients.FirstOrDefault(p => p.UserId == userId);
        
        if (patient == null)
        {
            _logger.LogWarning("[PatientController] Patient with UserId {UserId} not found", userId);
            return NotFound($"Patient with UserId {userId} not found");
        }

        var patientDto = PatientDto.FromEntity(patient);

        _logger.LogInformation("[PatientController] Successfully retrieved patient {PatientId} for UserId: {UserId}", patient.PatientId, userId);
        return Ok(patientDto);
    }

        //Update patient details in My Profile//
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PatientDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (dto.PatientId == null || dto.PatientId != id)
        {
            return BadRequest("Patient ID mismatch.");
        }

        //Get existing patient from database
        var existing = await _patientRepository.GetPatientById(id);
        if (existing == null)
        {
            return NotFound("Patient not found.");
        }

        // Ownership/role check: patients can only update their own record; employees allowed
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;
        var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
        var isEmployee = userRoles.Contains("Employee");
        if (!isEmployee && existing.UserId != currentUserId)
        {
            _logger.LogWarning("[PatientController] Forbidden update of patient {PatientId} by user {UserId}", id, currentUserId);
            return Forbid();
        }

        // Check if phone number is already in use by another patient
        if (!string.IsNullOrWhiteSpace(dto.phonenumber))
        {
            var allPatients = await _patientRepository.GetAll();
            _logger.LogInformation("[PatientController] Checking phone number {PhoneNumber} for patient {PatientId}. Total patients: {Count}", 
                dto.phonenumber, id, allPatients.Count());
            
            var duplicatePhone = allPatients.FirstOrDefault(p => 
                !string.IsNullOrWhiteSpace(p.phonenumber) && 
                p.phonenumber == dto.phonenumber && 
                p.PatientId != id);
            
            if (duplicatePhone != null)
            {
                _logger.LogWarning("[PatientController] Phone number already in use: {PhoneNumber} by patient {DuplicatePatientId}", 
                    dto.phonenumber, duplicatePhone.PatientId);
                return BadRequest("This phone number is already in use");
            }
        }

        //Update only simple/scalar fields
        existing.FullName = dto.FullName;
        existing.Address = dto.Address;
        existing.DateOfBirth = dto.DateOfBirth;
        existing.phonenumber = dto.phonenumber;
        existing.HealthRelated_info = dto.HealthRelated_info;

        // Save using repository
        await _patientRepository.Update(existing);

        //Return updated profile
        var resultDto = PatientDto.FromEntity(existing);
        return Ok(resultDto);
    }

}
