using System.ComponentModel.DataAnnotations;
using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public class MedicationDto
    {
        public int MedicationId { get; set; }
        
        [Required(ErrorMessage = "The Medication Name field is required.")] // Medication name is required when creating or updating a medication
        [StringLength(100, ErrorMessage = "Medication name cannot exceed 100 characters.")]
        [Display(Name = "Medication Name")]
        public string MedicationName { get; set; } = "";
        
        [Required]
        public int PatientId { get; set; }
        
        public string PatientName { get; set; } = "";
        
        [Required(ErrorMessage = "The Indication field is required.")] // Indication is required when creating or updating a medication
        [StringLength(200, ErrorMessage = "Indication cannot exceed 200 characters.")]
        public string Indication { get; set; } = "";
        
        [Required(ErrorMessage = "The Dosage field is required.")] // Dosage is required when creating or updating a medication
        [StringLength(100, ErrorMessage = "Dosage cannot exceed 100 characters.")]
        public string Dosage { get; set; } = "";
        
        [Required(ErrorMessage = "The Start Date field is required.")] // StartDate is required when creating or updating a medication
        public DateOnly StartDate { get; set; }
        
        public DateOnly? EndDate { get; set; }

        //create a DTO from the Medication entity
        public static MedicationDto FromEntity(Medication m) => new()
        {
            MedicationId = m.MedicationId,
            MedicationName = m.MedicineName,
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
            MedicationId = MedicationId,
            MedicineName = MedicationName,
            PatientId = PatientId,
            Indication = Indication,
            Dosage = Dosage,
            StartDate = StartDate,
            EndDate = EndDate
        };
    }
}

