using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace HomeCareApp.Models
{
    // Medication entity representing a patient's medication details
    public class Medication
    {

        [Key] // Primary key
        public string MedicineName { get; set; } = string.Empty;

        [Required] // PatientId is required when creating or updating a medication
        public int PatientId { get; set; }
        
        [ValidateNever] // Prevent validation loops
        public Patient? Patient { get; set; }

        [Required, MaxLength(100)] // Name is required and has a maximum length of 100 characters
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)] // Indication has a maximum length of 200 characters
        public string Indication { get; set; } = string.Empty;

        [MaxLength(100)] // Dosage has a maximum length of 100 characters
        public string Dosage { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; } 
        public DateOnly? EndDate { get; set; }  // null = still active

        [NotMapped] 
        public bool IsActive =>
            !EndDate.HasValue || EndDate.Value >= DateOnly.FromDateTime(DateTime.Today);
    }
}
