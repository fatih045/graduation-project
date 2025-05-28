import axiosInstance from './axios.ts';

// Tüm araç ilanlarını getir
export const fetchAllVehicleAds = async () => {
    const response = await axiosInstance.get('api/VehicleAd');
    return response.data;
};

// ID'ye göre araç ilanı getir
export const getVehicleAdById = async (id: number) => {
    const response = await axiosInstance.get(`api/VehicleAd/${id}`);
    return response.data;
};
// Taşıyıcı ID'sine göre araç ilanlarını getir
export const getVehicleAdsByCarrierId = async (carrierId: string) => {
    const response = await axiosInstance.get(`api/VehicleAd/by-carrier/${carrierId}`);
    return response.data;
};


// Yeni araç ilanı oluştur
export const createVehicleAd = async (adData: {
    title: string;
    description: string;

    country: string,
    city: string,
    carrierId: string;
    vehicleType: string;
    capacity: number;
    adDate: string;
}) => {
    const response = await axiosInstance.post('api/VehicleAd', adData);
    return response.data;
};

// Araç ilanını güncelle
export const updateVehicleAd = async (
    id: number,
    updatedData: {
        id: number;
        title: string;
        description: string;
        country: string,
        city: string,
        vehicleType: string,
        capacity: number;
    }
) => {
    const response = await axiosInstance.put(`api/VehicleAd/${id}`, updatedData);
    return response.data;
};

// Araç ilanını sil
export const deleteVehicleAd = async (id: number) => {
    const response = await axiosInstance.delete(`api/VehicleAd/${id}`);
    return response.data;
};

const fetchCargosByPickCitys = async (city: string) => {
    const response = await axiosInstance.get(`api/VehicleAd/by-city/${city}`);
    return response.data;
};

export default {
    fetchAllVehicleAds,
    getVehicleAdById,
    createVehicleAd,
    updateVehicleAd,
    deleteVehicleAd,
    getVehicleAdsByCarrierId,
    fetchCargosByPickCitys
};
