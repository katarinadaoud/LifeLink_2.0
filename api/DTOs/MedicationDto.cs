using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public sealed class MedicationDto
    {
        public string medicationName { get; set; } = "";   
        public int PatientId { get; set; }
        public string PatientName { get; set; } = "";
        public string Indication { get; set; } = "";
        public string Dosage { get; set; } = "";
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }

        //create a DTO from the Medication entity
        public static MedicationDto FromEntity(Medication m) => new()
        {
            medicationName = m.medicineName,
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
            medicineName = medicationName,
            PatientId = PatientId,
            Indication = Indication,
            Dosage = Dosage,
            StartDate = StartDate,
            EndDate = EndDate
        };
    }
}

