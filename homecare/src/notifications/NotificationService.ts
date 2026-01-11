import type { NotificationDto } from '../types/notification';
import { get as httpGet, put as httpPut, del as httpDel } from '../shared/http';

export const NotificationService = {
    //get all notifications for current user
    async getMyNotifications(): Promise<NotificationDto[]> {
        return await httpGet('/api/Notification') as NotificationDto[];
    },

    //get unread notifications count on bell icon
    async getUnreadCount(): Promise<number> {
        return await httpGet('/api/Notification/unread-count') as number;
    },

    //get only unread notifications on bell icon
    async getUnreadNotifications(): Promise<NotificationDto[]> {
        return await httpGet('/api/Notification/unread') as NotificationDto[];
    },

    //mark notification as read
    async markAsRead(notificationId: number): Promise<void> {
        await httpPut(`/api/Notification/${notificationId}/mark-read`);
    },

    //mark all notifications as read
    async markAllAsRead(): Promise<void> {
        await httpPut('/api/Notification/mark-all-read');
    },

    //delete notification
    async deleteNotification(notificationId: number): Promise<void> {
        await httpDel(`/api/Notification/${notificationId}`);
    }
};