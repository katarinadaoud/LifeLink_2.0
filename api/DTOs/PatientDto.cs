using System.ComponentModel.DataAnnotations;
using HomeCareApp.Models;


namespace HomeCareApp.DTOs
{
    public class PatientDto
    {
        public int? PatientId { get; set; }

        [Required]
        [RegularExpression(@"[0-9a-zA-ZæøåÆØÅ. \-]{2,20}", ErrorMessage = "The Name must be numbers or letters and between 2 to 20 characters.")]

        [Display(Name = "Patient Name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [RegularExpression(@"^\+47\d{8}$", ErrorMessage = "Phone number must start with +47 and have 8 numbers.")]
        [DataType(DataType.PhoneNumber)]
        public string phonenumber { get; set; } = string.Empty;

        [Required]
        public string HealthRelated_info { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty;

        public AuthUser? User { get; set; }

    }
}