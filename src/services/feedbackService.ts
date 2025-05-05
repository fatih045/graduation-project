import axios from 'axios';

const BASE_URL = 'https://your-api-url.com/api/feedback';

export const addFeedback = async (feedbackData: {
    booking_id: number;
    user_id: number;
    rating: number;
    comment: string;
    date: string;
}) => {
    try {
        const response = await axios.post(BASE_URL, feedbackData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Feedback eklenemedi');
    }
};

export const getAllFeedbacks = async () => {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Feedback listesi alınamadı');
    }
};

export const getFeedbackById = async (id: number) => {
    try {
        const response = await axios.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Feedback getirilemedi');
    }
};

export const updateFeedback = async (id: number, feedbackData: {
    booking_id: number;
    user_id: number;
    rating: number;
    comment: string;
    date: string;
}) => {
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, feedbackData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Feedback güncellenemedi');
    }
};

export const deleteFeedback = async (id: number) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Feedback silinemedi');
    }
};
