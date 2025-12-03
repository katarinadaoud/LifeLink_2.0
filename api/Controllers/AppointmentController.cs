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
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<AppointmentController> _logger;

    public AppointmentController(IAppointmentRepository appointmentRepository, INotificationRepository notificationRepository, ILogger<AppointmentController> logger)
    {
        _appointmentRepository = appointmentRepository;
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    //Get all appointments and returns a list of appointments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAppointments()
    {
        //Retrieve all appointments: return empty list if no appointments found
        var appointments = await _appointmentRepository.GetAll();
        
        //Map the appointments to DTO
        var appointmentDtos = appointments.Select(AppointmentDto.FromEntity);
        
        _logger.LogInformation("[AppointmentController] Retrieved {Count} appointments", appointments.Count());
        return Ok(appointmentDtos);
    }

    //Get appointments by patient id and return a list for that patient
    [HttpGet("patient/{patientId}")]
    [Authorize]
    public async Task<IActionResult> GetAppointmentsByPatientId(int patientId)
    {
        var appointments = await _appointmentRepository.GetAll();
        var patientAppointments = appointments.Where(a => a.PatientId == patientId);
        
        var appointmentDtos = patientAppointments.Select(AppointmentDto.FromEntity);
        
        _logger.LogInformation("[AppointmentController] Found {Count} appointments for PatientId: {PatientId}", patientAppointments.Count(), patientId);
        
        return Ok(appointmentDtos);
    }

    //Get a single appointment by id
    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentDto>> GetAppointmentById(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
        {
            _logger.LogWarning("[AppointmentController] Appointment with ID {AppointmentId} not found", id);
            return NotFound($"Appointment with ID {id} not found");
        }

        var appointmentDto = AppointmentDto.FromEntity(appointment);
        _logger.LogInformation("[AppointmentController] Retrieved appointment with ID {AppointmentId}", id);
        return Ok(appointmentDto);
    }
    
    //Create a new appointment
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AppointmentDto appointmentDto)
    {
        if (appointmentDto == null)
        {
            return BadRequest("Appointment cannot be null");
        }
        // Validate appointment date is not in the past
        if (appointmentDto.Date < DateTime.Now)
        {
            _logger.LogWarning("[AppointmentController] Attempted to create appointment in the past: {Date}", appointmentDto.Date);
            return BadRequest("Appointment date cannot be in the past");
        }
        var newAppointment = appointmentDto.ToEntity();
        
        // Check if the current user is an employee
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var userRoles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();
        bool isEmployeeCreating = userRoles.Contains("Employee");
        
        // If employee creates the appointment, it's automatically confirmed
        // If patient creates it, it remains pending until employee confirms
        newAppointment.IsConfirmed = isEmployeeCreating;
        
        _logger.LogInformation("[AppointmentController] Creating appointment with IsConfirmed={IsConfirmed} (created by {Role})", 
            newAppointment.IsConfirmed, isEmployeeCreating ? "Employee" : "Patient");
        
        bool returnOk = await _appointmentRepository.Create(newAppointment);
        if (returnOk)
        {
            // Create notifications for patient and employee
            await CreateAppointmentNotifications(newAppointment);
            
            return CreatedAtAction(nameof(GetAppointments), new { id = newAppointment.AppointmentId }, newAppointment);
        }

        _logger.LogWarning("[AppointmentController] Appointment creation failed {@appointment}", newAppointment);
        return StatusCode(500, "Internal server error");
    }



    //Update an existing appointment by id
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AppointmentDto appointmentDto)
    {
        if (appointmentDto == null)
        {
            return BadRequest("Appointment data cannot be null");
        }
        // Prevent updating to a past date
        if (appointmentDto.Date < DateTime.Now)
        {
            _logger.LogWarning("[AppointmentController] Attempted to update appointment to a past date: {Date}", appointmentDto.Date);
            return BadRequest("Appointment date cannot be in the past");
        }
        // Find the appointment in the database
        var existingAppointment = await _appointmentRepository.GetAppointmentById(id);
        if (existingAppointment == null)
        {
            return NotFound("Appointment not found");
        }
        
        // Check if the user updating is the patient who owns this appointment
        // The current user ID is retrieved from the JWT token claims
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        bool isPatientUpdate = !string.IsNullOrEmpty(currentUserId) && existingAppointment.Patient?.UserId == currentUserId;
        
        //Use ToEntity method for consistent mapping
        var updatedAppointment = appointmentDto.ToEntity();
        updatedAppointment.AppointmentId = id;
        updatedAppointment.Patient = existingAppointment.Patient;
        updatedAppointment.Employee = existingAppointment.Employee;
        
        // Important: When a patient changes their appointment (e.g., new time), 
        // the employee needs to confirm the changes again
        if (isPatientUpdate)
        {
            // Reset to pending status so employee must approve the changes
            updatedAppointment.IsConfirmed = false;
            _logger.LogInformation("[AppointmentController] Patient updated appointment {AppointmentId}, resetting to pending status", id);
        }
        else
        {
            // If employee or admin is updating, keep the current confirmation status
            updatedAppointment.IsConfirmed = existingAppointment.IsConfirmed;
        }
     
        bool updateSuccessful = await _appointmentRepository.Update(updatedAppointment);
        if (updateSuccessful)
        {
            // Send notification to employee about the change
            await CreateAppointmentUpdateNotifications(updatedAppointment, isPatientUpdate);
            
            // Return the updated appointment with the correct confirmation status
            var responseDto = AppointmentDto.FromEntity(updatedAppointment);
            return Ok(responseDto);
        }

        _logger.LogWarning("[AppointmentController] Appointment update failed {@appointment}", existingAppointment);
        return StatusCode(500, "Internal server error");
    }

    //Delete an appointment by id//
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        //Get appointment details before deletion for notifications
        var appointmentToDelete = await _appointmentRepository.GetAppointmentById(id);
        if (appointmentToDelete == null)
        {
            return NotFound("Appointment not found");
        }

        bool returnOk = await _appointmentRepository.Delete(id);
        if (!returnOk)
        {
            _logger.LogError("[AppointmentController] Appointment deletion failed for the AppointmentId {AppointmentId:0000}", id);
            return BadRequest("Appointment deletion failed");
        }

        //Create notifications for appointment deletion
        await CreateAppointmentDeleteNotifications(appointmentToDelete);
        
        return NoContent();
    }

    //Creating notifications, we use several methods here because the notifications affect different users//
    private async Task CreateAppointmentNotifications(Appointment appointment)
    {
        try
        {
            //Get patient and employee information first
            var fullAppointment = await _appointmentRepository.GetAppointmentById(appointment.AppointmentId);
            if (fullAppointment?.Patient?.UserId == null || fullAppointment?.Employee?.UserId == null)
            {
                _logger.LogWarning("[AppointmentController] Missing user IDs for appointment {AppointmentId}", appointment.AppointmentId);
                return;
            }

            // Only notify employee of pending request (patient created request, not confirmed yet)
            var employeeNotification = new Notification
            {
                UserId = fullAppointment.Employee!.UserId,
                Title = "New Appointment Request",
                Message = $"You have a new appointment request from {fullAppointment.Patient?.FullName ?? "patient"} for '{fullAppointment.Subject}' on {fullAppointment.Date:MMM dd, yyyy}. Please review and confirm.",
                Type = "appointment", 
                RelatedId = fullAppointment.AppointmentId,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            await _notificationRepository.CreateAsync(employeeNotification);

            _logger.LogInformation("[AppointmentController] Created request notification for employee for appointment {AppointmentId}", appointment.AppointmentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AppointmentController] Failed to create notifications for appointment {AppointmentId}", appointment.AppointmentId);
        }
    }

    //Creating update notifications//
    private async Task CreateAppointmentUpdateNotifications(Appointment appointment, bool isPatientUpdate = false)
    {
        try
        {
            if (appointment?.Patient?.UserId == null || appointment?.Employee?.UserId == null)
            {
                _logger.LogWarning("[AppointmentController] Missing user IDs for appointment update {AppointmentId}", appointment?.AppointmentId ?? 0);
                return;
            }

            // If patient updated, notify employee about new request requiring confirmation
            if (isPatientUpdate)
            {
                var employeeNotification = new Notification
                {
                    UserId = appointment.Employee!.UserId,
                    Title = "Appointment Change Request",
                    Message = $"{appointment.Patient?.FullName ?? "Patient"} has updated their appointment '{appointment.Subject}'. New date: {appointment.Date:MMM dd, yyyy}. Please review and confirm the changes.",
                    Type = "appointment",
                    RelatedId = appointment.AppointmentId,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                await _notificationRepository.CreateAsync(employeeNotification);
                _logger.LogInformation("[AppointmentController] Created change request notification for employee for appointment {AppointmentId}", appointment.AppointmentId);
            }
            else
            {
                // Employee or other update - notify both parties
                var patientNotification = new Notification
                {
                    UserId = appointment.Patient.UserId,
                    Title = "Appointment Updated",
                    Message = $"Your appointment '{appointment.Subject}' has been updated. New date: {appointment.Date:MMM dd, yyyy} with {appointment.Employee?.FullName ?? "healthcare provider"}.",
                    Type = "appointment",
                    RelatedId = appointment.AppointmentId,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                var employeeNotification = new Notification
                {
                    UserId = appointment.Employee!.UserId,
                    Title = "Appointment Updated",
                    Message = $"Appointment '{appointment.Subject}' with {appointment.Patient?.FullName ?? "patient"} has been updated. New date: {appointment.Date:MMM dd, yyyy}.",
                    Type = "appointment",
                    RelatedId = appointment.AppointmentId,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                await _notificationRepository.CreateAsync(patientNotification);
                await _notificationRepository.CreateAsync(employeeNotification);

                _logger.LogInformation("[AppointmentController] Created update notifications for appointment {AppointmentId}", appointment.AppointmentId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AppointmentController] Failed to create update notifications for appointment {AppointmentId}", appointment.AppointmentId);
        }
    }

    //Creating delete notifications//
    private async Task CreateAppointmentDeleteNotifications(Appointment appointment)
    {
        try
        {
            if (appointment?.Patient?.UserId == null || appointment?.Employee?.UserId == null)
            {
                _logger.LogWarning("[AppointmentController] Missing user IDs for appointment deletion {AppointmentId}", appointment?.AppointmentId ?? 0);
                return;
            }

    
            var patientNotification = new Notification // Notify patient about cancellation
            {
                UserId = appointment.Patient.UserId,
                Title = "Appointment Cancelled",
                Message = $"Your appointment '{appointment.Subject}' scheduled for {appointment.Date:MMM dd, yyyy} has been cancelled.",
                Type = "appointment",
                RelatedId = appointment.AppointmentId,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            var employeeNotification = new Notification // Notify employee about cancellation
            {
                UserId = appointment.Employee!.UserId,
                Title = "Appointment Cancelled",
                Message = $"Appointment '{appointment.Subject}' with {appointment.Patient?.FullName ?? "patient"} scheduled for {appointment.Date:MMM dd, yyyy} has been cancelled.",
                Type = "appointment",
                RelatedId = appointment.AppointmentId,
                IsRead = false,
                CreatedAt = DateTime.Now
            };


            await _notificationRepository.CreateAsync(patientNotification);
            await _notificationRepository.CreateAsync(employeeNotification);

            _logger.LogInformation("[AppointmentController] Created deletion notifications for appointment {AppointmentId}", appointment.AppointmentId); // Successfully created notifications
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AppointmentController] Failed to create deletion notifications for appointment {AppointmentId}", appointment.AppointmentId); // Error during notification creation
        }
    }

    // Confirm appointment request (employee action)
    [Authorize]
    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmAppointment(int id)
    {
        var appointment = await _appointmentRepository.GetAppointmentById(id);
        if (appointment == null)
        {
            _logger.LogWarning("[AppointmentController] Appointment {AppointmentId} not found for confirmation", id);
            return NotFound("Appointment not found");
        }

        // Check if the current user is the assigned employee
        var currentUserId = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId) || appointment.Employee?.UserId != currentUserId)
        {
            _logger.LogWarning("[AppointmentController] User {UserId} is not authorized to confirm appointment {AppointmentId}", currentUserId, id);
            return Forbid("Only the assigned healthcare provider can confirm this appointment");
        }

        if (appointment.IsConfirmed) // Already confirmed
        {
            _logger.LogInformation("[AppointmentController] Appointment {AppointmentId} already confirmed", id);
            return Ok(new { Message = "Appointment already confirmed" });
        }

        bool success = await _appointmentRepository.SetConfirmed(id, true); // Set to confirmed
        if (!success)
        {
            _logger.LogError("[AppointmentController] Failed to confirm appointment {AppointmentId}", id);
            return StatusCode(500, "Failed to confirm appointment");
        }

        // Send confirmation notification to patient
        try
        {
            if (appointment.Patient?.UserId != null)
            {
                var patientNotification = new Notification // Notify patient of confirmation
                {
                    UserId = appointment.Patient.UserId,
                    Title = "Appointment Confirmed",
                    Message = $"Your appointment '{appointment.Subject}' on {appointment.Date:MMM dd, yyyy} with {appointment.Employee?.FullName ?? "healthcare provider"} has been confirmed.",
                    Type = "appointment",
                    RelatedId = appointment.AppointmentId,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };
                await _notificationRepository.CreateAsync(patientNotification); // Send notification
                _logger.LogInformation("[AppointmentController] Sent confirmation notification to patient for appointment {AppointmentId}", id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AppointmentController] Failed to send confirmation notification for appointment {AppointmentId}", id); // Error during notification sending
        }

        _logger.LogInformation("[AppointmentController] Appointment {AppointmentId} confirmed successfully", id);
        return Ok(new { Message = "Appointment confirmed successfully" });
    }
}
   