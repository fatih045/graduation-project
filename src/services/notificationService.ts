// src/services/notificationService.ts
import axiosInstance from './axios.ts';

export interface Notification {
    id: number;
    user_id: number;
    message: string;
    created_at: string; // ISO format DateTime
}

// Get all notifications
export const getAllNotifications = async (): Promise<Notification[]> => {
    try {
        const response = await axiosInstance.get('/notifications');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
};

// Get single notification by ID
export const getNotificationById = async (id: number): Promise<Notification> => {
    try {
        const response = await axiosInstance.get(`/notifications/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notification');
    }
};

// Create new notification
export const addNotification = async (data: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> => {
    try {
        const response = await axiosInstance.post('/notifications', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
};

// Update notification
export const updateNotification = async (id: number, data: Partial<Notification>): Promise<Notification> => {
    try {
        const response = await axiosInstance.put(`/notifications/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update notification');
    }
};

// Delete notification
export const deleteNotification = async (id: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/notifications/${id}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
};
