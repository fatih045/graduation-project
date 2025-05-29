import axiosInstance from './axios.ts';

// Status constants
export const CARGO_STATUS = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2
};

export interface Cargo {
    id: number;
    userId: string;
    customerName?: string;
    title: string;
    description: string;
    weight: number;
    cargoType: string;
    pickCountry: string;
    createdDate?: string;
    adDate?: string;
    pickCity: string;
    dropCountry: string;
    dropCity: string;
    price: number;
    currency: 'TRY' | 'USD' | 'EUR';
    isExpired?: boolean;
    status?: number;
}

const fetchAllCargos = async () => {
    const response = await axiosInstance.get('api/CargoAd?status=1');
    return response.data;
};

const fetchMyCargos = async (customerId: string, status?: number) => {
    let url = `api/CargoAd/by-customer/${customerId}`;
    if (status !== undefined) {
        url += `?status=${status}`;
    }
    console.log('Fetching cargos with URL:', url);
    const response = await axiosInstance.get(url);
    console.log('API Response for fetchMyCargos:', response.data);
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
    const response = await axiosInstance.delete(`api/CargoAd/${id}`);
    return response.data;
};

const fetchCargosByPickCity = async (city: string) => {
    const response = await axiosInstance.get(`api/CargoAd/by-pick-city/${city}`);
    return response.data;
};


export default {
    fetchAllCargos,
    fetchMyCargos,
    getCargoById,
    createCargo,
    updateCargo,
    deleteCargo,
    fetchCargosByPickCity
};
