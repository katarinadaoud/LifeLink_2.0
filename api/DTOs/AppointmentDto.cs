using System.ComponentModel.DataAnnotations;


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
        
    }
}