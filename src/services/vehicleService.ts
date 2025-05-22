import axiosInstance from './axios.ts';

export const getAllVehicles = async () => {
    try {
        const response = await axiosInstance.get('api/Vehicle');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Veriler alınamadı');
    }
};

export const getVehicleById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`api/Vehicle/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç bulunamadı');
    }
};

export const createVehicle = async (data: {
    carrierId: string;
    title: string;
    vehicleType: string;
    capacity: number;
    licensePlate: string;
    model: string;
}) => {
    try {
        const response = await axiosInstance.post('api/Vehicle', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araç eklenemedi');
    }
};

export const updateVehicle = async (
    id: number,
    data: {
        carrierId: string;
        title: string;
        vehicleType: string;
        capacity: number;
        licensePlate: string;
        model: string;
    }
) => {
    try {
        const response = await axiosInstance.put(`api/Vehicle/${id}`, { id, ...data });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteVehicle = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`api/Vehicle/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};

export const getVehiclesByCarrier = async (carrierId: number) => {
    try {
        const response = await axiosInstance.get(`api/Vehicle/by-carrier/${carrierId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Araçlar getirilemedi');
    }
};
