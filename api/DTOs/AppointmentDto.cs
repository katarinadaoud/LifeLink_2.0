using System.ComponentModel.DataAnnotations;
using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public class AppointmentDto
    {
        public int? AppointmentId { get; set; }

        [Required]
        [RegularExpression(@"[0-9a-zA-ZæøåÆØÅ. \-]{2,20}", ErrorMessage = "The Subject must be numbers or letters and between 2 to 20 characters.")]
        [Display(Name = "Appointment subject")]
        public string Subject { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int PatientId { get; set; } 
        
        [Required]
        public int EmployeeId { get; set; } 

        // Display names for better user experience
        public string? PatientName { get; set; }
        public string? EmployeeName { get; set; }
        
        // Create a DTO from the Appointment entity
        public static AppointmentDto FromEntity(Appointment appointment) => new()
        {
            AppointmentId = appointment.AppointmentId,
            Subject = appointment.Subject,
            Description = appointment.Description,
            Date = appointment.Date,
            PatientId = appointment.PatientId ?? 0, // Using null operator to avoid null reference
            EmployeeId = appointment.EmployeeId ?? 0,
            PatientName = appointment.Patient?.FullName ?? "Unknown Patient",
            EmployeeName = appointment.Employee?.FullName ?? "Unknown Employee"
        };

        // Convert the DTO back to an Appointment entity
        public Appointment ToEntity() => new()
        {
            AppointmentId = AppointmentId ?? 0,
            Subject = Subject,
            Description = Description,
            Date = Date,
            PatientId = PatientId,
            EmployeeId = EmployeeId,
            //Navigation properties will be set by EF Core
            Patient = null!,
            Employee = null!
        };
    }
}