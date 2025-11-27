using System.ComponentModel.DataAnnotations;
using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public sealed class MedicationDto
    {
        [Required]
        [StringLength(100, ErrorMessage = "Medication name cannot exceed 100 characters.")]
        [Display(Name = "Medication Name")]
        public string MedicineName { get; set; } = "";
        
        [Required]
        public int PatientId { get; set; }
        
        public string PatientName { get; set; } = "";
        
        [Required]
        [StringLength(200, ErrorMessage = "Indication cannot exceed 200 characters.")]
        public string Indication { get; set; } = "";
        
        [Required]
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters.")]
        public string Dosage { get; set; } = "";
        
        [Required]
        public DateOnly StartDate { get; set; }
        
        public DateOnly? EndDate { get; set; }

        //create a DTO from the Medication entity
        public static MedicationDto FromEntity(Medication m) => new()
        {
            MedicineName = m.MedicineName,
            PatientId = m.PatientId,
            PatientName = m.Patient?.FullName ?? "",
            Indication = m.Indication,
            Dosage = m.Dosage,
            StartDate = m.StartDate,
            EndDate = m.EndDate
        };

        //convert the DTO back to a Medication entity
        public Medication ToEntity() => new()
        {
            MedicineName = MedicineName,
            PatientId = PatientId,
            Indication = Indication,
            Dosage = Dosage,
            StartDate = StartDate,
            EndDate = EndDate
        };
    }
}

