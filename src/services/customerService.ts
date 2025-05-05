// src/api/customerService.ts
import axiosInstance from './axios.ts';

// Yeni müşteri eklemek için servis
export const createCustomer = async (data: {
    customer_id: number;
    address: string;
    phone_number: number;
}) => {
    try {
        const response = await axiosInstance.post('/Customer', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Customer creation failed');
    }
};

// Tüm müşterileri getirme servisi
export const getAllCustomers = async () => {
    try {
        const response = await axiosInstance.get('/Customer');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
};

// Belirli bir müşteri bilgilerini getirme servisi
export const getCustomerById = async (customer_id: number) => {
    try {
        const response = await axiosInstance.get(`/Customer/${customer_id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customer');
    }
};

// Müşteri bilgilerini güncelleme servisi
export const updateCustomer = async (customer_id: number, data: {
    address?: string;
    phone_number?: number;
}) => {
    try {
        const response = await axiosInstance.put(`/Customer/${customer_id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Customer update failed');
    }
};

// Müşteri silme servisi
export const deleteCustomer = async (customer_id: number) => {
    try {
        const response = await axiosInstance.delete(`/Customer/${customer_id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Customer deletion failed');
    }
};

export default {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};
