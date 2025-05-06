import axiosInstance from './axios';

export const getAllNotifications = async () => {
    try {
        const response = await axiosInstance.get('/Notifications');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Bildirimler alınamadı');
    }
};

export const getNotificationById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/Notifications/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Bildirim bulunamadı');
    }
};

export const createNotification = async (data: {
    user_id: number;
    message: string;
    created_at: string;
}) => {
    try {
        const response = await axiosInstance.post('/Notifications', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Bildirim oluşturulamadı');
    }
};

export const deleteNotification = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/Notifications/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Bildirim silinemedi');
    }
};
