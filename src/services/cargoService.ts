import axiosInstance from './axios.ts';

export interface Cargo {
    id: number;
    userId: string;
    title: string;
    description: string;
    weight: number;
    cargoType: string;
    pickupCountry: string;
    pickupCity: string;
    dropoffCountry: string;
    dropoffCity: string;
    price: number;
    currency: 'TRY' | 'USD' | 'EUR';
    isExpired?: boolean;
}

const fetchAllCargos = async () => {
    const response = await axiosInstance.get('api/CargoAd');
    return response.data;
};

const fetchMyCargos = async (customerId: string) => {
    const response = await axiosInstance.get(`api/CargoAd/by-customer/${customerId}`);
    return response.data;
};

const getCargoById = async (id: number) => {
    const response = await axiosInstance.get(`api/CargoAd/${id}`);
    return response.data;
};

const createCargo = async (data: Omit<Cargo, 'id' | 'isExpired'>) => {
    const response = await axiosInstance.post('api/CargoAd', data);
    return response.data;
};

const updateCargo = async (id: number, data: Omit<Cargo, 'id'>) => {
    const response = await axiosInstance.put(`api/CargoAd/${id}`, data);
    return response.data;
};

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
