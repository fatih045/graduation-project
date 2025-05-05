// src/api/locationService.ts
import axiosInstance from './axios.ts';

// Tüm lokasyonları getir
export const fetchAllLocations = async () => {
    try {
        const response = await axiosInstance.get('/Location');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lokasyonlar alınamadı');
    }
};

// ID'ye göre lokasyon getir
export const getLocationById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/Location/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lokasyon bulunamadı');
    }
};

// Yeni lokasyon oluştur
export const createLocation = async (locationData: {
    address: string;
    city: string;
    state: string;
    postal_Code: number;
    coordinates: string;
}) => {
    try {
        const response = await axiosInstance.post('/Location', locationData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lokasyon oluşturulamadı');
    }
};

// Lokasyonu güncelle
export const updateLocation = async (id: number, updatedData: {
    address: string;
    city: string;
    state: string;
    postal_Code: number;
    coordinates: string;
}) => {
    try {
        const response = await axiosInstance.put(`/Location/${id}`, updatedData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lokasyon güncellenemedi');
    }
};

// Lokasyonu sil
export const deleteLocation = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/Location/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lokasyon silinemedi');
    }
};

export default {
    fetchAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
};
