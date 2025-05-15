// src/api/customerService.ts
import axiosInstance from './axios.ts';
import store from "../store/store.ts";

// Yeni müşteri eklemek için servis
export const createCustomer = async (data: {

    userId: string;
    address: string;
}) => {
    try {
        const response = await axiosInstance.post('api/Customer', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Customer creation failed');
    }
};

// Tüm müşterileri getirme servisi
export const getAllCustomers = async () => {
    try {
        const response = await axiosInstance.get('api/Customer');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
};

// Belirli bir müşteri bilgilerini getirme servisi
export const getCustomerById = async (customer_id: number) => {
    try {
        const response = await axiosInstance.get(`api/Customer/${customer_id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch customer');
    }
};

export const updateCustomer = async (data: {
    address?: string;
}) => {
    const state = store.getState();
    const customerId = state.customer.selectedCustomer?.customerId;

    if (!customerId) throw new Error("Müşteri ID bulunamadı.");

    try {
        const response = await axiosInstance.put(`api/Customer`, {
            customerId: customerId, // camelCase'e sadık kal
            address: data.address
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Müşteri güncellenemedi");
    }
};

// Müşteri silme servisi
export const deleteCustomer = async (customer_id: number) => {
    try {
        const response = await axiosInstance.delete(`api/Customer/${customer_id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Customer deletion failed');
    }
};

// Oturumdaki kullanıcıya ait müşteri bilgisi
export const getCustomerByUserIdFromStore = async () => {
    const state = store.getState();
    const userId = state.auth.user?.uid; // JWT'den decode edilen userId burada olmalı

    if (!userId) {
        throw new Error('Oturum açmış kullanıcı bulunamadı');
    }

    try {
        const response = await axiosInstance.get(`/api/Customer/by-user/${userId}`);
        return response.data;
        console.log("deney")
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Müşteri bilgisi alınamadı');
    }
};

export default {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};
