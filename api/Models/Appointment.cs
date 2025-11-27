using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace HomeCareApp.Models
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; } //PK

        [Required, StringLength(100, ErrorMessage = "Subject must be between 1 and 100 characters.")]
        public string Subject { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "date")]   // saves as a date in SQL
        public DateTime Date { get; set; }

        [Required]
        public int? PatientId { get; set; } //FK to patient
        
        [Required]
        public int? EmployeeId { get; set; } //FK to employee

        //navigation properties
        [ValidateNever]
        public required Patient? Patient { get; set; }
        
        [ValidateNever]
        public required Employee? Employee { get; set; }

    }

   
}