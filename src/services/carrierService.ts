import axiosInstance from './axios.ts';

export const getAllCarriers = async () => {
    try {
        const response = await axiosInstance.get('api/Carrier');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcılar alınamadı');
    }
};

export const getCarrierById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`api/Carrier/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcı bulunamadı');
    }
};

export const createCarrier = async (data: {
    userId: number;
    licenseNumber: string;
    availabilityStatus: boolean;
}) => {
    try {
        const response = await axiosInstance.post('api/Carrier', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcı oluşturulamadı');
    }
};

export const updateCarrier = async (

    data: {
        carrierId: number;
        licenseNumber: string;
        availabilityStatus: boolean;
    }
) => {
    try {
        const response = await axiosInstance.put(`api/Carrier`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteCarrier = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`api/Carrier/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};

export const getCarrierByUserId = async (userId: number) => {
    try {
        const response = await axiosInstance.get(`api/Carrier/by-user/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Taşıyıcı bulunamadı');
    }
};
