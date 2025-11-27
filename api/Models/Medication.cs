using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace HomeCareApp.Models
{
    public class Medication
    {
        [Key]
        public string MedicineName { get; set; } = string.Empty;

        [Required]
        public int PatientId { get; set; }
        
        [ValidateNever]
        public Patient? Patient { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Indication { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Dosage { get; set; } = string.Empty;

        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }  // null = still active

        [NotMapped]
        public bool IsActive =>
            !EndDate.HasValue || EndDate.Value >= DateOnly.FromDateTime(DateTime.Today);
    }
}
