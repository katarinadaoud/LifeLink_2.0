using HomeCareApp.Data;
using HomeCareApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeCareApp.Repositories.Interfaces;
using HomeCareApp.DTOs;

namespace HomeCareApp.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly ILogger<AppointmentController> _logger;

    public AppointmentController(IAppointmentRepository appointmentRepository, ILogger<AppointmentController> logger)
    {
        _appointmentRepository = appointmentRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments()
    {
        var appointments = await _appointmentRepository.GetAll();
        if (appointments == null)
        {
            _logger.LogError("[AppointmentController] Appointment list not found while executing _appointmentRepository.GetAll()");
            return NotFound("Appointment list not found");
        }
        var appointmentDtos = appointments.Select(appointment => new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            Subject = appointment.Subject,
            Description = appointment.Description,
            Date = appointment.Date,
            PatientId = appointment.PatientId ?? 0,
            EmployeeId = appointment.EmployeeId ?? 0,
            PatientName = appointment.Patient?.FullName ?? "Unknown Patient",
            EmployeeName = appointment.Employee?.FullName ?? "Unknown Employee"
        });
        return Ok(appointmentDtos);
    }

    // GET: api/appointment/patient/{patientId}
    [HttpGet("patient/{patientId}")]
    [Authorize]
    public async Task<IActionResult> GetAppointmentsByPatientId(int patientId)
    {
        var appointments = await _appointmentRepository.GetAll();
        var patientAppointments = appointments.Where(a => a.PatientId == patientId);
        
        var appointmentDtos = patientAppointments.Select(appointment => new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            Subject = appointment.Subject,
            Description = appointment.Description,
            Date = appointment.Date,
            PatientId = appointment.PatientId ?? 0,
            EmployeeId = appointment.EmployeeId ?? 0,
            PatientName = appointment.Patient?.FullName ?? "Unknown Patient",
            EmployeeName = appointment.Employee?.FullName ?? "Unknown Employee"
        });
        
        return Ok(appointmentDtos);
    }
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentDto appointmentDto)
    {
        if (appointmentDto == null)
        {
            return BadRequest("Appointment cannot be null");
        }
        var newAppointment = new Appointment
        {
            Subject = appointmentDto.Subject,
            Description = appointmentDto.Description,
            Date = appointmentDto.Date,
            PatientId = appointmentDto.PatientId,
            EmployeeId = appointmentDto.EmployeeId,
            Patient = null!, // Will be set by EF Core
            Employee = null! // Will be set by EF Core
        };
        bool returnOk = await _appointmentRepository.Create(newAppointment);
        if (returnOk)
            return CreatedAtAction(nameof(GetAppointments), new { id = newAppointment.AppointmentId }, newAppointment);

        _logger.LogWarning("[AppointmentController] Appointment creation failed {@appointment}", newAppointment);
        return StatusCode(500, "Internal server error");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAppointment(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
        {
            _logger.LogError("[AppointmentController] Appointment not found for the AppointmentId {AppointmentId:0000}", id);
            return NotFound("Appointment not found for the AppointmentId");
        }

        var appointmentDto = new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            Subject = appointment.Subject,
            Description = appointment.Description,
            Date = appointment.Date,
            PatientId = appointment.PatientId ?? 0,
            EmployeeId = appointment.EmployeeId ?? 0,
            PatientName = appointment.Patient?.FullName ?? "Unknown Patient",
            EmployeeName = appointment.Employee?.FullName ?? "Unknown Employee"
        };

        return Ok(appointmentDto);
    }
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AppointmentDto appointmentDto)
    {
        if (appointmentDto == null)
        {
            return BadRequest("Appointment data cannot be null");
        }
        // Find the appointment in the database
        var existingAppointment = await _appointmentRepository.GetAppointmentById(id);
        if (existingAppointment == null)
        {
            return NotFound("Appointment not found");
        }
        // Update the appointment properties
        existingAppointment.Subject = appointmentDto.Subject;
        existingAppointment.Description = appointmentDto.Description;
        existingAppointment.Date = appointmentDto.Date;
        existingAppointment.PatientId = appointmentDto.PatientId;
        existingAppointment.EmployeeId = appointmentDto.EmployeeId;
        // Save the changes
        bool updateSuccessful = await _appointmentRepository.Update(existingAppointment);
        if (updateSuccessful)
        {
            return Ok(existingAppointment); // Return the updated appointment
        }

        _logger.LogWarning("[AppointmentController] Appointment update failed {@appointment}", existingAppointment);
        return StatusCode(500, "Internal server error");
    }
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        bool returnOk = await _appointmentRepository.Delete(id);
        if (!returnOk)
        {
            _logger.LogError("[AppointmentController] Appointment deletion failed for the AppointmentId {AppointmentId:0000}", id);
            return BadRequest("Appointment deletion failed");
        }
        return NoContent();
    }
}

   
   