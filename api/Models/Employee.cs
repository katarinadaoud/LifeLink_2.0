using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace HomeCareApp.Models
{
    public class Employee
    {
        [Key]
        public int EmployeeId { get; set; } //PK

        //Validation for name 
        [Required, RegularExpression(@"^[A-Za-zÆØÅæøå '\-]{1,50}$", ErrorMessage = "FullName must be 1-50 characters and contain only letters.")]

        public String FullName { get; set; } = string.Empty;
        public String Address { get; set; } = string.Empty;
        public String Department { get; set; } = string.Empty;

        [Required]
        public required String UserId { get; set; } = string.Empty; //FK to User

        //navigation properties
        [ValidateNever] public required AuthUser? User { get; set; }
        [ValidateNever] public ICollection<Appointment>? Appointments { get; set; } = new List<Appointment>();
        //[ValidateNever] public ICollection<AvailableDay>? AvailableDays { get; set; } = new List<AvailableDay>();
        //[ValidateNever] public ICollection<EmergencyCall>? EmergencyCalls { get; set; } = new List<EmergencyCall>();


        
    }
}