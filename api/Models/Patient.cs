using System;
using System.ComponentModel.DataAnnotations;
using System.IO.Compression;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation; 

namespace HomeCareApp.Models
{
    public class Patient
    {
        [Key]
        public int PatientId { get; set; } //PK

        //Validation for name
        [Required, RegularExpression(@"^[A-Za-zÆØÅæøå '\-]{1,50}$", ErrorMessage = "FullName must be 1-50 characters and contain only letters.")]

        public string FullName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        [Required]                    
        [DataType(DataType.Date)]     
        [Display(Name = "Date of Birth")]  
        public DateTime DateOfBirth { get; set; }

        //Validation for phone number
        [RegularExpression(@"^[0-9]{8}$", ErrorMessage = "Phone number must be 8 digits.")]
        [DataType(DataType.PhoneNumber)]
        public string phonenumber { get; set; } = string.Empty;
        
        public string HealthRelated_info { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty; //FK to User

        //navigation properties
        [ValidateNever]
        public required AuthUser? User { get; set; }

        [ValidateNever]
        public required ICollection<Appointment> Appointments { get; set; }

    }
}