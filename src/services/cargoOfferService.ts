import axiosInstance from './axios.ts';

// Status constants
export const CARGO_OFFER_STATUS = {
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

export interface CargoOfferRequest {
    senderId: string;
    receiverId: string;
    cargoAdId: number;
    price: number;
    message: string;
    expiryDate: string; // ISO format
}

export interface CargoOfferResponse {
    id: number;
    senderId: string;
    receiverId: string;
    cargoAdId: number;
    cargoAdTitle: string;
    price: number;
    message: string;
    status: OfferStatus;
    adminStatus: string; // 0=Pending, 1=Accept, 2=Reject
    expiryDate: string;
    createdDate: string;
}

export interface UpdateCargoOfferStatus {
    offerId: number;
    status: OfferStatus;
}

// Teklif oluşturma
const createCargoOffer = async (data: CargoOfferRequest) => {
    const response = await axiosInstance.post<CargoOfferResponse>('api/CargoOffer', data);
    return response.data;
};

// Teklif durumu güncellemeconst updateCargoOfferStatus = async (offerId: number, status: OfferStatus) => {
const updateCargoOfferStatus = async (offerId: number, status: OfferStatus) => {
    const response = await axiosInstance.put<CargoOfferResponse>(
        `api/CargoOffer/${offerId}/status`,
        { offerId, status }
    );
    return response.data;
};


// Belirli bir kullanıcıya gelen teklifler
const fetchOffersByReceiver = async (receiverId: string, adminStatus?: number) => {
    let url = `api/CargoOffer/receiver/${receiverId}`;
    if (adminStatus !== undefined) {
        url += `?adminStatus=${adminStatus}`;
    }
    const response = await axiosInstance.get<CargoOfferResponse[]>(url);
    return response.data;
};

// Belirli bir kullanıcı tarafından gönderilen teklifler
const fetchOffersBySender = async (senderId: string, adminStatus?: number) => {
    let url = `api/CargoOffer/sender/${senderId}`;
    if (adminStatus !== undefined) {
        url += `?adminStatus=${adminStatus}`;
    }
    const response = await axiosInstance.get<CargoOfferResponse[]>(url);
    return response.data;
};

// Tek bir teklif detayını getir
const getOfferById = async (id: number) => {
    const response = await axiosInstance.get<CargoOfferResponse>(`api/CargoOffer/${id}`);
    return response.data;
};
const fetchOffersByCargoAdId = async (cargoAdId: number, adminStatus?: number) => {
    let url = `api/CargoOffer/by-cargo-ad/${cargoAdId}`;
    if (adminStatus !== undefined) {
        url += `?adminStatus=${adminStatus}`;
    }
    const response = await axiosInstance.get<CargoOfferResponse[]>(url);
    return response.data;
};




export default {
    createCargoOffer,
    updateCargoOfferStatus,
    fetchOffersByReceiver,
    fetchOffersBySender,
    getOfferById,
    fetchOffersByCargoAdId
};
