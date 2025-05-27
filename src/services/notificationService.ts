import axiosInstance from './axios.ts';

export interface NotificationResponse {
    id: number;
    title: string;
    message: string;
    type: number;
    isRead: boolean;
    createdDate: string;
    relatedEntityId: number;
}

// Tüm bildirimleri getir (opsiyonel: userId gibi filtreler eklenebilir)
const fetchNotifications = async () => {
    const response = await axiosInstance.get<NotificationResponse[]>('api/Notification');
    return response.data;
};

// Bildirimi okundu olarak işaretle
const markNotificationAsRead = async (notificationId: number) => {
    const response = await axiosInstance.put<NotificationResponse>(
        `api/Notification/${notificationId}/mark-as-read`,
        {}
    );
    return response.data;
};

export default {
    fetchNotifications,
    markNotificationAsRead
};
