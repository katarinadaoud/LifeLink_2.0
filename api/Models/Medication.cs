using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeCareApp.Models
{
    public class Medication
    {
        [Key] public string medicineName { get; set; } = string.Empty;

        [Required] public int PatientId { get; set; }
        public Patient? Patient { get; set; }   // nav.prop

        [Required, MaxLength(100)]
        public string Name { get; set; } = "";

        [MaxLength(200)]
        public string Indication { get; set; } = "";

        [MaxLength(100)]
        public string Dosage { get; set; } = "";

        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }  // null = still active

        [NotMapped]
        public bool IsActive =>
            !EndDate.HasValue || EndDate.Value >= DateOnly.FromDateTime(DateTime.Today);
    }
}
