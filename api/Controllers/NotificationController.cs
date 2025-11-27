using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeCareApp.DTOs;
using HomeCareApp.Repositories.Interfaces;
using System.Security.Claims;

namespace HomeCareApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepo;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(INotificationRepository notificationRepo, ILogger<NotificationController> logger)
        {
            _notificationRepo = notificationRepo;
            _logger = logger;
        }

        //Get all notifications for current user//
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMyNotifications()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("User not found");
            }

            var notifications = await _notificationRepo.GetByUserIdAsync(currentUserId);
            var notificationDtos = notifications.Select(NotificationDto.FromEntity);

            return Ok(notificationDtos);
        }

        //Get unread notifications count for current user//
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("User not found");
            }

            var count = await _notificationRepo.GetUnreadCountAsync(currentUserId);
            return Ok(count);
        }

        //Get only unread notifications for current user//
        [HttpGet("unread")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUnreadNotifications()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("User not found");
            }

            var notifications = await _notificationRepo.GetUnreadByUserIdAsync(currentUserId);
            var notificationDtos = notifications.Select(NotificationDto.FromEntity);

            return Ok(notificationDtos);
        }

        //Mark notification as read//
        [HttpPut("{id}/mark-read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("User not found");
            }

            //Verify notification belongs to current user
            var notification = await _notificationRepo.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound("Notification not found");
            }

            if (notification.UserId != currentUserId)
            {
                return Forbid("You can only mark your own notifications as read");
            }

            var success = await _notificationRepo.MarkAsReadAsync(id);
            if (!success)
            {
                return BadRequest("Failed to mark notification as read");
            }

            return NoContent();
        }

        //Mark all notifications as read for current user//
        [HttpPut("mark-all-read")]
        public async Task<ActionResult> MarkAllAsRead()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("User not found");
            }

            var success = await _notificationRepo.MarkAllAsReadAsync(currentUserId);
            if (!success)
            {
                return BadRequest("Failed to mark notifications as read");
            }

            return NoContent();
        }

        //Delete notification by id//
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized("User not found");
            }

            var notification = await _notificationRepo.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound("Notification not found");
            }

            if (notification.UserId != currentUserId)
            {
                return Forbid("You can only delete your own notifications");
            }

            var success = await _notificationRepo.DeleteAsync(id);
            if (!success)
            {
                return BadRequest("Failed to delete notification");
            }

            return NoContent();
        }
    }
}