using System.ComponentModel.DataAnnotations;
using HomeCareApp.Models;

namespace HomeCareApp.DTOs
{
    public class NotificationDto
    {
        public int? NotificationId { get; set; }

        [Required] 
        public string UserId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Message { get; set; } = string.Empty;

        public string? Type { get; set; }

        public int? RelatedId { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; }

        // Create a DTO from Notification entity
        public static NotificationDto FromEntity(Notification notification) => new()
        {
            NotificationId = notification.NotificationId,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            RelatedId = notification.RelatedId,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };

        // Convert DTO to Notification entity
        public Notification ToEntity() => new()
        {
            NotificationId = NotificationId ?? 0,
            UserId = UserId,
            Title = Title,
            Message = Message,
            Type = Type,
            RelatedId = RelatedId,
            IsRead = IsRead,
            CreatedAt = CreatedAt == default ? DateTime.Now : CreatedAt
        };
    }
}