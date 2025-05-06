import axiosInstance from './axios.ts';

export const getAllCarriers = async () => {
    try {
        const response = await axiosInstance.get('/Carriers');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcılar alınamadı');
    }
};

export const getCarrierById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/Carriers/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcı bulunamadı');
    }
};

export const createCarrier = async (data: {
    vehicleType_id: number;
    license_number: string;
    availability_Status: boolean;
}) => {
    try {
        const response = await axiosInstance.post('/Carriers', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcı oluşturulamadı');
    }
};

export const updateCarrier = async (
    id: number,
    data: {
        vehicleType_id: number;
        license_number: string;
        availability_Status: boolean;
    }
) => {
    try {
        const response = await axiosInstance.put(`/Carriers/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteCarrier = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/Carriers/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};
