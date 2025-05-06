import axiosInstance from './axios.ts';

export const getAllBookings = async () => {
    try {
        const response = await axiosInstance.get('/Bookings');
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Rezervasyonlar alınamadı');
    }
};

export const getBookingById = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/Bookings/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Rezervasyon bulunamadı');
    }
};

export const createBooking = async (data: {
    customer_id: number;
    carrier_id: number;
    vehicle_id: number;
    cargo_id: number;
    pickup_date: string;
    dropoff_data: string;
    totalPrice: number;
    status: string;
}) => {
    try {
        const response = await axiosInstance.post('/Bookings', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Rezervasyon oluşturulamadı');
    }
};

export const updateBooking = async (
    id: number,
    data: {
        customer_id: number;
        carrier_id: number;
        vehicle_id: number;
        cargo_id: number;
        pickup_date: string;
        dropoff_data: string;
        totalPrice: number;
        status: string;
    }
) => {
    try {
        const response = await axiosInstance.put(`/Bookings/${id}`, data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Güncelleme başarısız');
    }
};

export const deleteBooking = async (id: number) => {
    try {
        const response = await axiosInstance.delete(`/Bookings/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Silme başarısız');
    }
};
