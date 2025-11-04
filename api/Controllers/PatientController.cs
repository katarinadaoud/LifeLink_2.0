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

    public PatientController(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
    }

    // GET: api/patient
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients()
    {
        var patients = await _patientRepository.GetAll();
        var patientDtos = patients.Select(p => new PatientDto
        {
            PatientId = p.PatientId,
            FullName = p.FullName,
            Address = p.Address,
            DateOfBirth = p.DateOfBirth,
            phonenumber = p.phonenumber,
            HealthRelated_info = p.HealthRelated_info,
            UserId = p.UserId,
            User = p.User
        });
        return Ok(patientDtos);
    }

    // GET: api/patient/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetPatient(int id)
    {
        var patient = await _patientRepository.GetPatientById(id);
        if (patient == null)
            return NotFound();

        var patientDto = new PatientDto
        {
            PatientId = patient.PatientId,
            FullName = patient.FullName,
            Address = patient.Address,
            DateOfBirth = patient.DateOfBirth,
            phonenumber = patient.phonenumber,
            HealthRelated_info = patient.HealthRelated_info,
            UserId = patient.UserId,
            User = patient.User
        };

        return Ok(patientDto);
    }

    // GET: api/patient/user/{userId}
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PatientDto>> GetPatientByUserId(string userId)
    {
        var patients = await _patientRepository.GetAll();
        var patient = patients.FirstOrDefault(p => p.UserId == userId);
        
        if (patient == null)
            return NotFound($"Patient with UserId {userId} not found");

        var patientDto = new PatientDto
        {
            PatientId = patient.PatientId,
            FullName = patient.FullName,
            Address = patient.Address,
            DateOfBirth = patient.DateOfBirth,
            phonenumber = patient.phonenumber,
            HealthRelated_info = patient.HealthRelated_info,
            UserId = patient.UserId,
            User = patient.User
        };

        return Ok(patientDto);
    }

    // POST: api/patient
    [HttpPost]
    public async Task<ActionResult<PatientDto>> CreatePatient(PatientDto patientDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var patient = new Patient
        {
            FullName = patientDto.FullName,
            Address = patientDto.Address,
            DateOfBirth = patientDto.DateOfBirth,
            phonenumber = patientDto.phonenumber,
            HealthRelated_info = patientDto.HealthRelated_info,
            UserId = patientDto.UserId,
            User = null!,
            Appointments = null!
        };

        await _patientRepository.Create(patient);
        
        var createdPatientDto = new PatientDto
        {
            PatientId = patient.PatientId,
            FullName = patient.FullName,
            Address = patient.Address,
            DateOfBirth = patient.DateOfBirth,
            phonenumber = patient.phonenumber,
            HealthRelated_info = patient.HealthRelated_info,
            UserId = patient.UserId,
            User = patient.User
        };

        return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientId }, createdPatientDto);
    }

    // PUT: api/patient/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(int id, PatientDto patientDto)
    {
        if (patientDto.PatientId != id)
            return BadRequest("ID mismatch");

        var existingPatient = await _patientRepository.GetPatientById(id);
        if (existingPatient == null)
            return NotFound();

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        existingPatient.FullName = patientDto.FullName;
        existingPatient.Address = patientDto.Address;
        existingPatient.DateOfBirth = patientDto.DateOfBirth;
        existingPatient.phonenumber = patientDto.phonenumber;
        existingPatient.HealthRelated_info = patientDto.HealthRelated_info;
        existingPatient.UserId = patientDto.UserId;

        await _patientRepository.Update(existingPatient);
        return NoContent();
    }

    // DELETE: api/patient/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _patientRepository.GetPatientById(id);
        if (patient == null)
            return NotFound();

        await _patientRepository.Delete(id);
        return NoContent();
    }
}
