// src/api/paymentService.ts
import axiosInstance from './axios';

export const getPayments = async () => {
    try {
        const response = await axiosInstance.get('/payments');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch payments');
    }
};

export const getPaymentById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/payments/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch payment');
    }
};

export const createPayment = async (data: {
    booking_id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
}) => {
    try {
        const response = await axiosInstance.post('/payments', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
};

export const updatePayment = async (id: number, data: {
    booking_id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
}) => {
    try {
        const response = await axiosInstance.put(`/payments/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update payment');
    }
};

export const deletePayment = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/payments/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to delete payment');
    }
};
