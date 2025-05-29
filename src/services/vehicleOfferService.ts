import axiosInstance from './axios.ts';

// Status constants
export const VEHICLE_OFFER_STATUS = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2
};

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
    adminStatus: string;
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
const updateVehicleOfferStatus = async (offerId: number, status: OfferStatus) => {
    const response = await axiosInstance.put<VehicleOfferResponse>(
        `api/VehicleOffer/${offerId}/status`,
        { offerId, status }
    );
    return response.data;
};

// Alıcıya gelen teklifler
const fetchOffersByReceiver = async (receiverId: string, status?: number) => {
    let url = `api/VehicleOffer/receiver/${receiverId}`;
    if (status !== undefined) {
        url += `?status=${status}`;
    }
    const response = await axiosInstance.get<VehicleOfferResponse[]>(url);
    return response.data;
};

// Gönderici tarafından yapılan teklifler
const fetchOffersBySender = async (senderId: string, status?: number) => {
    let url = `api/VehicleOffer/sender/${senderId}`;
    if (status !== undefined) {
        url += `?status=${status}`;
    }
    const response = await axiosInstance.get<VehicleOfferResponse[]>(url);
    return response.data;
};

// Teklif detayını getir
const getOfferById = async (id: number) => {
    const response = await axiosInstance.get<VehicleOfferResponse>(`api/VehicleOffer/${id}`);
    return response.data;
};

// İlan ID'sine göre teklifleri getir
const fetchOffersByVehicleAdId = async (vehicleAdId: number, status?: number) => {
    let url = `api/VehicleOffer/vehicle/${vehicleAdId}`;
    if (status !== undefined) {
        url += `?status=${status}`;
    }
    const response = await axiosInstance.get<VehicleOfferResponse[]>(url);
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
