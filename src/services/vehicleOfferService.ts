import axiosInstance from './axios.ts';

export type OfferStatus =
    | 'Pending'
    | 'Accepted'
    | 'Rejected'
    | 'Cancelled'
    | 'Expired'
    | 'Completed';

export interface VehicleOfferRequest {
    senderId: string;
    receiverId: string;
    vehicleAdId: number;
    message: string;
    expiryDate: string; // ISO format
}

export interface VehicleOfferResponse {
    id: number;
    senderId: string;
    receiverId: string;
    vehicleAdId: number;
    vehicleAdTitle: string;
    message: string;
    status: OfferStatus;
    expiryDate: string;
    createdDate: string;
}

export interface UpdateVehicleOfferStatus {
    offerId: number;
    status: OfferStatus;
}

// Teklif oluştur
const createVehicleOffer = async (data: VehicleOfferRequest) => {
    const response = await axiosInstance.post<VehicleOfferResponse>('api/VehicleOffer', data);
    return response.data;
};

// Teklif durumu güncelle
const updateVehicleOfferStatus = async (id: number, status: OfferStatus) => {
    const response = await axiosInstance.put<VehicleOfferResponse>(
        `api/VehicleOffer/${id}status/`,
        { id, status }
    );
    return response.data;
};

// Alıcıya gelen teklifler
const fetchOffersByReceiver = async (receiverId: string) => {
    const response = await axiosInstance.get<VehicleOfferResponse[]>(
        `api/VehicleOffer/receiver/${receiverId}`
    );
    return response.data;
};

// Gönderici tarafından yapılan teklifler
const fetchOffersBySender = async (senderId: string) => {
    const response = await axiosInstance.get<VehicleOfferResponse[]>(
        `api/VehicleOffer/sender/${senderId}`
    );
    return response.data;
};

// Teklif detayını getir
const getOfferById = async (id: number) => {
    const response = await axiosInstance.get<VehicleOfferResponse>(`api/VehicleOffer/${id}`);
    return response.data;
};

// İlan ID'sine göre teklifleri getir
const fetchOffersByVehicleAdId = async (vehicleAdId: number) => {
    const response = await axiosInstance.get<VehicleOfferResponse[]>(
        `api/VehicleOffer/by-vehicle-ad/${vehicleAdId}`
    );
    return response.data;
};

export default {
    createVehicleOffer,
    updateVehicleOfferStatus,
    fetchOffersByReceiver,
    fetchOffersBySender,
    getOfferById,
    fetchOffersByVehicleAdId,
};
