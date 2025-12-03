using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public class PatientDto
    {
        public int? PatientId { get; set; } // Primary key

        [Required] // FullName is required when creating or updating a patient
        [RegularExpression(@"[0-9a-zA-ZæøåÆØÅ. \-]{2,20}", ErrorMessage = "The Name must be numbers or letters and between 2 to 20 characters.")]
        [Display(Name = "Patient Name")]
        public string FullName { get; set; } = string.Empty;

        [Required] // Address is required when creating or updating a patient
        public string Address { get; set; } = string.Empty;

        [Required] // DateOfBirth is required when creating or updating a patient
        public DateTime DateOfBirth { get; set; }

        [RegularExpression(@"^[0-9]{8}$", ErrorMessage = "Phone number must be 8 digits.")]
        [DataType(DataType.PhoneNumber)]
        public string phonenumber { get; set; } = string.Empty;

        [Required] 
        [JsonPropertyName("healthRelated_info")]
        public string HealthRelated_info { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty;

        public AuthUser? User { get; set; }

        // Create a DTO from Patient entity
        public static PatientDto FromEntity(Patient patient) => new()
        {
            PatientId = patient.PatientId,
            FullName = patient.FullName,
            Address = patient.Address,
            DateOfBirth = patient.DateOfBirth,
            phonenumber = patient.phonenumber,
            HealthRelated_info = patient.HealthRelated_info,
            UserId = patient.UserId,
            User = patient.User
        };

            // Convert DTO to Patient entity
        public Patient ToEntity(string? userIdOverride = null) => new()
    {
        PatientId = PatientId ?? 0,
        FullName = FullName,
        Address = Address,
        DateOfBirth = DateOfBirth,
        phonenumber = phonenumber,
        HealthRelated_info = HealthRelated_info,
        UserId = userIdOverride ?? UserId
        // DO NOT include User or Appointments
    };

    }
}