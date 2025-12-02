using Microsoft.EntityFrameworkCore;
using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace HomeCareApp.Repositories.Implementations
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _db;
        private readonly ILogger<NotificationRepository> _logger;

        public NotificationRepository(AppDbContext db, ILogger<NotificationRepository> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<IEnumerable<Notification>> GetAllAsync() //get all notifications
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] GetAllAsync() - Retrieving all notifications");
                var notifications = await _db.Notifications
                    .Include(n => n.User)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();
                _logger.LogInformation("[NotificationRepository] GetAllAsync() - Successfully retrieved {Count} notifications", notifications.Count());
                return notifications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NotificationRepository] GetAllAsync() failed: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(string userId) // get notifications for a specific user
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] GetByUserIdAsync({UserId}) - Retrieving notifications for user", userId);
                var notifications = await _db.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();
                _logger.LogInformation("[NotificationRepository] GetByUserIdAsync({UserId}) - Successfully retrieved {Count} notifications", userId, notifications.Count());
                return notifications;
            }
            catch (Exception ex) // catch block for error handling
            {
                _logger.LogError(ex, "[NotificationRepository] GetByUserIdAsync({UserId}) failed: {Message}", userId, ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(string userId) // gets all unread notifications for a specific user
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] GetUnreadByUserIdAsync({UserId}) - Retrieving unread notifications for user", userId);
                var notifications = await _db.Notifications // go to notifications table
                    .Where(n => n.UserId == userId && !n.IsRead) // gets notifications where user id matches and is not read
                    .OrderByDescending(n => n.CreatedAt) // order by created date descending
                    .ToListAsync();
                _logger.LogInformation("[NotificationRepository] GetUnreadByUserIdAsync({UserId}) - Successfully retrieved {Count} unread notifications", userId, notifications.Count());
                return notifications;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NotificationRepository] GetUnreadByUserIdAsync({UserId}) failed: {Message}", userId, ex.Message);
                throw;
            }
        }

        public async Task<Notification?> GetByIdAsync(int notificationId) //get a single notification by its id
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] GetByIdAsync({NotificationId}) - Retrieving notification", notificationId);
                var notification = await _db.Notifications // go to notifications table
                    .Include(n => n.User) // include related user data for the notification
                    .FirstOrDefaultAsync(n => n.NotificationId == notificationId); //finds notification by id or returns null if not found
                if (notification != null)
                {
                    _logger.LogInformation("[NotificationRepository] GetByIdAsync({NotificationId}) - Notification found for user: {UserId}", notificationId, notification.UserId);
                }
                else
                {
                    _logger.LogWarning("[NotificationRepository] GetByIdAsync({NotificationId}) - Notification not found", notificationId);
                }
                return notification;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NotificationRepository] GetByIdAsync({NotificationId}) failed: {Message}", notificationId, ex.Message);
                throw;
            }
        }

        public async Task<bool> CreateAsync(Notification notification) // create a new notification
        {
            try // try to add notification 
            {
                _logger.LogInformation("[NotificationRepository] CreateAsync() - Creating notification for user: {UserId} with message: {Message}", notification.UserId, notification.Message);
                _db.Notifications.Add(notification); // add notification to notifications table
                await _db.SaveChangesAsync(); // save new notification to database
                _logger.LogInformation("[NotificationRepository] CreateAsync() - Successfully created notification with ID: {NotificationId}", notification.NotificationId);
                return true; // return true if successful
            }
            catch (Exception ex) // if saving fails, return false
            {
                _logger.LogError(ex, "[NotificationRepository] CreateAsync() failed for user: {UserId} - {Message}", notification.UserId, ex.Message);
                return false;
            }
        }

        public async Task<bool> MarkAsReadAsync(int notificationId) // mark a single notification as read
        {
            try // try to mark as read
            {
                _logger.LogInformation("[NotificationRepository] MarkAsReadAsync({NotificationId}) - Attempting to mark notification as read", notificationId);
                var notification = await _db.Notifications.FindAsync(notificationId); // find notification by id
                if (notification != null) // if a notification is found, mark as read and save changes
                {
                    notification.IsRead = true;
                    await _db.SaveChangesAsync();
                    _logger.LogInformation("[NotificationRepository] MarkAsReadAsync({NotificationId}) - Successfully marked notification as read", notificationId);
                    return true;
                }
                _logger.LogWarning("[NotificationRepository] MarkAsReadAsync({NotificationId}) - Notification not found", notificationId);
                return false; // return false if notification not found
            }
            catch (Exception ex) // database fails or other error, return false
            {
                _logger.LogError(ex, "[NotificationRepository] MarkAsReadAsync({NotificationId}) failed: {Message}", notificationId, ex.Message);
                return false;
            }
        }

        public async Task<bool> MarkAllAsReadAsync(string userId) // mark all notifications for a user as read
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] MarkAllAsReadAsync({UserId}) - Marking all notifications as read for user", userId);
                var notifications = await _db.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications) // mark each notification as read
                {
                    notification.IsRead = true;
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation("[NotificationRepository] MarkAllAsReadAsync({UserId}) - Successfully marked {Count} notifications as read", userId, notifications.Count);
                return true;
            }
            catch (Exception ex) // if fails, return false
            {
                _logger.LogError(ex, "[NotificationRepository] MarkAllAsReadAsync({UserId}) failed: {Message}", userId, ex.Message);
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int notificationId)
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] DeleteAsync({NotificationId}) - Attempting to delete notification", notificationId);
                var notification = await _db.Notifications.FindAsync(notificationId); // find notification by id
                if (notification != null) // if found, remove from database
                {
                    _logger.LogInformation("[NotificationRepository] DeleteAsync({NotificationId}) - Deleting notification for user: {UserId}", notificationId, notification.UserId);
                    _db.Notifications.Remove(notification); // remove notification from notifications table
                    await _db.SaveChangesAsync(); // save changes to database
                    _logger.LogInformation("[NotificationRepository] DeleteAsync({NotificationId}) - Successfully deleted notification", notificationId);
                    return true; // return true if successful
                }
                _logger.LogWarning("[NotificationRepository] DeleteAsync({NotificationId}) - Notification not found", notificationId);
                return false; // return false if notification not found
            }
            catch (Exception ex) // if database fails or other error, return false
            {
                _logger.LogError(ex, "[NotificationRepository] DeleteAsync({NotificationId}) failed: {Message}", notificationId, ex.Message);
                return false;
            }
        }

        public async Task<int> GetUnreadCountAsync(string userId) // get count of unread notifications for a user
        {
            try
            {
                _logger.LogInformation("[NotificationRepository] GetUnreadCountAsync({UserId}) - Getting unread count for user", userId);
                var count = await _db.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead) // filter by user id and unread notifications
                    .CountAsync();
                _logger.LogInformation("[NotificationRepository] GetUnreadCountAsync({UserId}) - User has {Count} unread notifications", userId, count);
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NotificationRepository] GetUnreadCountAsync({UserId}) failed: {Message}", userId, ex.Message);
                throw;
            }
        }
    }
}