import axiosInstance from './axios.ts';

export const getAllVehicles = async () => {
    try {
        const response = await axiosInstance.get('/Vehicles');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Veriler alınamadı');
    }
};

export const getVehicleById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/Vehicles/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç bulunamadı');
    }
};

export const createVehicle = async (data: {
    carrier_id: number;
    vehicleType_id: number;
    capacity: number;
    license_palete: string;
    availability_status: boolean;
}) => {
    try {
        const response = await axiosInstance.post('/Vehicles', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç eklenemedi');
    }
};

export const updateVehicle = async (
    id: number,
    data: {
        carrier_id: number;
        vehicleType_id: number;
        capacity: number;
        license_palete: string;
        availability_status: boolean;
    }
) => {
    try {
        const response = await axiosInstance.put(`/Vehicles/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteVehicle = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/Vehicles/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};
