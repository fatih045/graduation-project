import axiosInstance from './axios.ts';

export const getAllVehicleTypes = async () => {
    try {
        const response = await axiosInstance.get('api/VehicleType');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Veriler alınamadı');
    }
};

export const getVehicleTypeById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`api/VehicleType/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç tipi bulunamadı');
    }
};

export const createVehicleType = async (data: {
    name: string;
    description: string;
}) => {
    try {
        const response = await axiosInstance.post('api/VehicleType', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç tipi eklenemedi');
    }
};

export const updateVehicleType = async (id: number, data: {
    vehicleTypeId: number;
    name: string;
    description: string;
}) => {
    try {
        const response = await axiosInstance.put(`api/VehicleType/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteVehicleType = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`api/VehicleType/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};
