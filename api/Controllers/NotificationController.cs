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

        //Get all notifications for current user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetMyNotifications()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[NotificationController] Unauthorized access attempt - User not found");
                return Unauthorized("User not found");
            }

            //Get notifications from repository
            _logger.LogInformation("[NotificationController] Getting all notifications for UserId: {UserId}", currentUserId);
            var notifications = await _notificationRepo.GetByUserIdAsync(currentUserId);
            var notificationDtos = notifications.Select(NotificationDto.FromEntity);

            _logger.LogInformation("[NotificationController] Retrieved {Count} notifications for UserId: {UserId}", notifications.Count(), currentUserId);
            return Ok(notificationDtos);
        }

        //Get unread notifications count for current user//
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[NotificationController] Unauthorized access attempt for unread count - User not found");
                return Unauthorized("User not found");
            }

            _logger.LogInformation("[NotificationController] Getting unread count for UserId: {UserId}", currentUserId);
            var count = await _notificationRepo.GetUnreadCountAsync(currentUserId);
            _logger.LogInformation("[NotificationController] Found {Count} unread notifications for UserId: {UserId}", count, currentUserId);
            return Ok(count);
        }

        //Get only unread notifications for current user
        [HttpGet("unread")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUnreadNotifications()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[NotificationController] Unauthorized access attempt for unread notifications - User not found");
                return Unauthorized("User not found");
            }
            //Get unread notifications from repository
            _logger.LogInformation("[NotificationController] Getting unread notifications for UserId: {UserId}", currentUserId);
            var notifications = await _notificationRepo.GetUnreadByUserIdAsync(currentUserId);
            var notificationDtos = notifications.Select(NotificationDto.FromEntity);

            _logger.LogInformation("[NotificationController] Retrieved {Count} unread notifications for UserId: {UserId}", notifications.Count(), currentUserId);
            return Ok(notificationDtos);
        }

        //Mark notification as read
        [HttpPut("{id}/mark-read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[NotificationController] Unauthorized access attempt for mark as read - User not found");
                return Unauthorized("User not found");
            }

            _logger.LogInformation("[NotificationController] Attempting to mark notification {NotificationId} as read for UserId: {UserId}", id, currentUserId);

            //Verify notification belongs to current user
            var notification = await _notificationRepo.GetByIdAsync(id);
            if (notification == null)
            {
                _logger.LogWarning("[NotificationController] Notification {NotificationId} not found", id);
                return NotFound("Notification not found");
            }

            if (notification.UserId != currentUserId)
            {
                _logger.LogWarning("[NotificationController] Forbidden access: UserId {UserId} attempted to mark notification {NotificationId} belonging to {OwnerId}", currentUserId, id, notification.UserId);
                return Forbid("You can only mark your own notifications as read");
            }

            //Mark as read in repository
            var success = await _notificationRepo.MarkAsReadAsync(id);
            if (!success)
            {
                _logger.LogError("[NotificationController] Failed to mark notification {NotificationId} as read for UserId: {UserId}", id, currentUserId);
                return BadRequest("Failed to mark notification as read");
            }

            _logger.LogInformation("[NotificationController] Successfully marked notification {NotificationId} as read for UserId: {UserId}", id, currentUserId);
            return NoContent();
        }

        //Mark all notifications as read for current user
        [HttpPut("mark-all-read")]
        public async Task<ActionResult> MarkAllAsRead()
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[NotificationController] Unauthorized access attempt for mark all as read - User not found");
                return Unauthorized("User not found");
            }

            _logger.LogInformation("[NotificationController] Attempting to mark all notifications as read for UserId: {UserId}", currentUserId);

            var success = await _notificationRepo.MarkAllAsReadAsync(currentUserId);
            if (!success)
            {
                _logger.LogError("[NotificationController] Failed to mark all notifications as read for UserId: {UserId}", currentUserId);
                return BadRequest("Failed to mark notifications as read");
            }

            _logger.LogInformation("[NotificationController] Successfully marked all notifications as read for UserId: {UserId}", currentUserId);
            return NoContent();
        }

        //Delete notification by id
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                _logger.LogWarning("[NotificationController] Unauthorized access attempt for delete notification - User not found");
                return Unauthorized("User not found");
            }

            //Delete notification from repository
            _logger.LogInformation("[NotificationController] Attempting to delete notification {NotificationId} for UserId: {UserId}", id, currentUserId);

            var notification = await _notificationRepo.GetByIdAsync(id);
            if (notification == null)
            {
                _logger.LogWarning("[NotificationController] Notification {NotificationId} not found for deletion", id);
                return NotFound("Notification not found");
            }

            if (notification.UserId != currentUserId) // Verify ownership
            {
                _logger.LogWarning("[NotificationController] Forbidden delete attempt: UserId {UserId} attempted to delete notification {NotificationId} belonging to {OwnerId}", currentUserId, id, notification.UserId);
                return Forbid("You can only delete your own notifications");
            }

            //Delete notification
            var success = await _notificationRepo.DeleteAsync(id);
            if (!success)
            {
                _logger.LogError("[NotificationController] Failed to delete notification {NotificationId} for UserId: {UserId}", id, currentUserId);
                return BadRequest("Failed to delete notification");
            }

            _logger.LogInformation("[NotificationController] Successfully deleted notification {NotificationId} for UserId: {UserId}", id, currentUserId);
            return NoContent();
        }
    }
}