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
    public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
    {
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
    public async Task<IActionResult> UpdatePatient(int id, PatientDto patientDto)
    {
        _logger.LogInformation("[PatientController] Updating patient with ID: {PatientId}", id);
        
        //id must match the url and dto, making sure the correct patient is updated
        if (patientDto.PatientId != id)
        {
            _logger.LogWarning("[PatientController] ID mismatch: URL ID {UrlId} vs DTO ID {DtoId}", id, patientDto.PatientId);
            return BadRequest("ID mismatch");
        }

        var existingPatient = await _patientRepository.GetPatientById(id);
        if (existingPatient == null)
        {
            _logger.LogWarning("[PatientController] Patient with ID {PatientId} not found for update", id);
            return NotFound();
        }

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("[PatientController] Invalid model state for patient update {PatientId}", id);
            return BadRequest(ModelState);
        }

        // Map updated fields from DTO to entity
        var updatedPatient = patientDto.ToEntity();
        updatedPatient.PatientId = id;
        updatedPatient.Appointments = existingPatient.Appointments;

        await _patientRepository.Update(updatedPatient);
        _logger.LogInformation("[PatientController] Successfully updated patient {PatientId}", id);
        return NoContent();
    }


}
