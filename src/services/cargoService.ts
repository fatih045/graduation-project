// src/api/cargoService.ts
import axiosInstance from './axios.ts';

interface Cargo {
    customerId: number;
    description: string;
    weight: number;
    cargoType: string;
    pickupLocationId: number;
    dropoffLocationId: number;
}

// Tüm kargoları getir
const fetchAllCargos = async () => {
    try {
        const response = await axiosInstance.get('api/Cargo');
        return response.data;
    } catch (error: any) {
        // API'den gelen hata mesajını yakalayarak bir hata fırlatıyoruz
        throw new Error(error.response?.data?.message || 'Kargolar alınamadı');
    }
};

// Kullanıcının kargolarını getir
const fetchMyCargos = async (customerId: number) => {
    try {
        const response = await axiosInstance.get(`api/Cargo/by-customer/${customerId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Kullanıcıya ait kargolar alınamadı');
    }
};

// ID'ye göre kargo getir
const getCargoById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`api/Cargo/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Kargo bilgisi bulunamadı');
    }
};

// Yeni kargo oluştur
const createCargo = async (data: {
    customerId: number;
    description: string;
    weight: number;
    cargoType: string;
    pickupLocationId: number;
    dropoffLocationId: number;

}) => {
    try {
        const response = await axiosInstance.post('api/Cargo', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Kargo oluşturulamadı');
    }
};

// Varolan bir kargoyu güncelle
const updateCargo = async (id: number, data: Omit<Cargo, 'id'>) => {
    try {
        const response = await axiosInstance.put(`api/Cargo/${id}`, data);
        return response.data; // Doğru tür döndürülüyor
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Kargo güncellenemedi');
    }
};


// Kargoyu sil
const deleteCargo = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`api/Cargo/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Kargo silinemedi');
    }
};

export default {
    fetchAllCargos,
    fetchMyCargos,
    getCargoById,
    createCargo,
    updateCargo,
    deleteCargo,
};