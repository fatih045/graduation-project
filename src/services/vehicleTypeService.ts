import axiosInstance from './axios.ts';

export const getAllVehicleTypes = async () => {
    try {
        const response = await axiosInstance.get('api/VehicleTypes');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Veriler alınamadı');
    }
};

export const getVehicleTypeById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`api/VehicleTypes/${id}`);
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
        const response = await axiosInstance.post('api/VehicleTypes', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç tipi eklenemedi');
    }
};

export const updateVehicleType = async (id: number, data: {
    name: string;
    desc: string;
}) => {
    try {
        const response = await axiosInstance.put(`api/VehicleTypes/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteVehicleType = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`api/VehicleTypes/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};
