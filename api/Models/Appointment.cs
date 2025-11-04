using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; 

namespace HomeCareApp.Models
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; } //PK

        public string Subject { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        
        [Column(TypeName = "date")]   // saves as a date in SQL
        public DateTime Date { get; set; }

        public int? PatientId { get; set; } //FK to patient
        public int? EmployeeId { get; set; } //FK to employee

        //navigation keys
        public required Patient? Patient { get; set; }
        public required Employee? Employee { get; set; }
        //public required ICollection<AppointmentTask>? AppointmentTasks { get; set; }

    }

   
}