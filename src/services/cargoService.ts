import axiosInstance from './axios.ts';

export interface Cargo {
    id: number;
    userId: string;
    title: string;
    description: string;
    weight: number;
    cargoType: string;
    pickupLocationId: number;
    dropoffLocationId: number;
    price: number;
    isExpired?: boolean;  // sadece update için opsiyonel
}

// Tüm kargoları getir
const fetchAllCargos = async () => {
    const response = await axiosInstance.get('api/Cargo');
    return response.data;
};

// Kullanıcının kargolarını getir
const fetchMyCargos = async (userId: string) => {
    const response = await axiosInstance.get(`api/Cargo/by-user/${userId}`);
    return response.data;
};

// ID'ye göre kargo getir
const getCargoById = async (id: number) => {
    const response = await axiosInstance.get(`api/Cargo/${id}`);
    return response.data;
};

// Yeni kargo oluştur
const createCargo = async (data: Omit<Cargo, 'id' | 'isExpired'>) => {
    const response = await axiosInstance.post('api/Cargo', data);
    return response.data;
};

// Varolan kargoyu güncelle
const updateCargo = async (id: number, data: Omit<Cargo, 'id'>) => {
    const response = await axiosInstance.put(`api/Cargo/${id}`, data);
    return response.data;
};

// Kargoyu sil
const deleteCargo = async (id: number) => {
    const response = await axiosInstance.delete(`api/Cargo/${id}`);
    return response.data;
};

export default {
    fetchAllCargos,
    fetchMyCargos,
    getCargoById,
    createCargo,
    updateCargo,
    deleteCargo,
};
