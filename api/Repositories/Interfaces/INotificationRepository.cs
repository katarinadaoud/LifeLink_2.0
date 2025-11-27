using HomeCareApp.Models;

namespace HomeCareApp.Repositories.Interfaces
/*This interface defines all operations for managing Notification entities.
   It includes methods for retrieving  notifications, creating/fetching/delete/mark notifications
   Distincts between user and employee based by userId */
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetAllAsync();
        Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
        Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(string userId);
        Task<Notification?> GetByIdAsync(int notificationId);
        Task<bool> CreateAsync(Notification notification);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task<bool> DeleteAsync(int notificationId);
        Task<int> GetUnreadCountAsync(string userId);
    }
}