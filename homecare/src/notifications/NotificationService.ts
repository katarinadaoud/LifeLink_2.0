import type { NotificationDto, CreateNotificationDto } from '../types/notification';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7268';

export const NotificationService = {
    // Get all notifications for current user
    async getMyNotifications(): Promise<NotificationDto[]> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch notifications: ${response.statusText}`);
        }

        return await response.json();
    },

    // Get unread notifications count
    async getUnreadCount(): Promise<number> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification/unread-count`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch unread count: ${response.statusText}`);
        }

        return await response.json();
    },

    // Get only unread notifications
    async getUnreadNotifications(): Promise<NotificationDto[]> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification/unread`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch unread notifications: ${response.statusText}`);
        }

        return await response.json();
    },

    // Mark notification as read
    async markAsRead(notificationId: number): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification/${notificationId}/mark-read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to mark notification as read: ${response.statusText}`);
        }
    },

    // Mark all notifications as read
    async markAllAsRead(): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification/mark-all-read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
        }
    },

    // Delete notification
    async deleteNotification(notificationId: number): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete notification: ${response.statusText}`);
        }
    },

    // Create notification (for testing)
    async createNotification(notification: CreateNotificationDto): Promise<NotificationDto> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/Notification`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification),
        });

        if (!response.ok) {
            throw new Error(`Failed to create notification: ${response.statusText}`);
        }

        return await response.json();
    }
};