using Microsoft.EntityFrameworkCore;
using HomeCareApp.Data;
using HomeCareApp.Models;
using HomeCareApp.Repositories.Interfaces;

namespace HomeCareApp.Repositories.Implementations
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _db;

        public NotificationRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Notification>> GetAllAsync() //get all notifications
        {
            return await _db.Notifications // go to notifications table
                .Include(n => n.User) // include related user data
                .OrderByDescending(n => n.CreatedAt) // order by created date descending
                .ToListAsync(); // return list of notifications
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(string userId) // get notifications for a specific user
        {
            return await _db.Notifications // go to notifications table
                .Where(n => n.UserId == userId) // filter by user id, only notifications for that user
                .OrderByDescending(n => n.CreatedAt) // order by created date descending
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(string userId) // gets all unread notifications for a specific user
        {
            return await _db.Notifications // go to notifications table
                .Where(n => n.UserId == userId && !n.IsRead) // gets notifications where user id matches and is not read
                .OrderByDescending(n => n.CreatedAt) // order by created date descending
                .ToListAsync();
        }

        public async Task<Notification?> GetByIdAsync(int notificationId) //get a single notification by its id
        {
            return await _db.Notifications // go to notifications table
                .Include(n => n.User) // include related user data for the notification
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId); //finds notification by id or returns null if not found
        }

        public async Task<bool> CreateAsync(Notification notification) // create a new notification
        {
            try // try to add notification 
            {
                _db.Notifications.Add(notification); // add notification to notifications table
                await _db.SaveChangesAsync(); // save new notification to database
                return true; // return true if successful
            }
            catch // if saving fails, return false
            {
                return false;
            }
        }

        public async Task<bool> MarkAsReadAsync(int notificationId) // mark a single notification as read
        {
            try // try to mark as read
            {
                var notification = await _db.Notifications.FindAsync(notificationId); // find notification by id
                if (notification != null) // if a notification is found, mark as read and save changes
                {
                    notification.IsRead = true;
                    await _db.SaveChangesAsync();
                    return true;
                }
                return false; // return false if notification not found
            }
            catch // database fails or other error, return false
            {
                return false;
            }
        }

        public async Task<bool> MarkAllAsReadAsync(string userId) // mark all notifications for a user as read
        {
            try
            {
                var notifications = await _db.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications) // mark each notification as read
                {
                    notification.IsRead = true;
                }

                await _db.SaveChangesAsync();
                return true;
            }
            catch // if fails, return false
            {
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int notificationId)
        {
            try
            {
                var notification = await _db.Notifications.FindAsync(notificationId); // find notification by id
                if (notification != null) // if found, remove from database
                {
                    _db.Notifications.Remove(notification); // remove notification from notifications table
                    await _db.SaveChangesAsync(); // save changes to database
                    return true; // return true if successful
                }
                return false; // return false if notification not found
            }
            catch // if database fails or other error, return false
            {
                return false;
            }
        }

        public async Task<int> GetUnreadCountAsync(string userId) // get count of unread notifications for a user
        {
            return await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead) // filter by user id and unread notifications
                .CountAsync();
        }
    }
}