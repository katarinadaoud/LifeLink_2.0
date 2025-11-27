using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace HomeCareApp.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty; // Foreign key to AuthUser

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public string? Type { get; set; } // "appointment", "medication", "general"

        public int? RelatedId { get; set; } // ID of related entity (appointment, medication, etc.)

        public bool IsRead { get; set; } = false;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property
        [ValidateNever]
        public AuthUser? User { get; set; }
    }
}