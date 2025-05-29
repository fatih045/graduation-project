import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import cargoOfferService, {
    CargoOfferRequest,
    CargoOfferResponse,
    OfferStatus,
    CARGO_OFFER_STATUS
} from '../../services/cargoOfferService';

// Re-export status constants for convenience
export { CARGO_OFFER_STATUS };

interface CargoOfferState {
    offers: CargoOfferResponse[];
    offersByReceiver: CargoOfferResponse[];
    offersBySender: CargoOfferResponse[];
    selectedOffer: CargoOfferResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: CargoOfferState = {
    offers: [],
    offersByReceiver: [],
    offersBySender: [],
    selectedOffer: null,
    loading: false,
    error: null,
};

// === Thunks ===

// Tüm teklifler (cargoAdId'ye göre)
export const fetchOffersByCargoAdId = createAsyncThunk(
    'cargoOffers/fetchByCargoAdId',
    async (params: { cargoAdId: number, adminStatus?: number }) => {
        return await cargoOfferService.fetchOffersByCargoAdId(params.cargoAdId, params.adminStatus);
    }
);

// Belirli kullanıcıya gelen teklifler
export const fetchOffersByReceiver = createAsyncThunk(
    'cargoOffers/fetchByReceiver',
    async (params: { receiverId: string, adminStatus?: number }) => {
        return await cargoOfferService.fetchOffersByReceiver(params.receiverId, params.adminStatus);
    }
);

// Belirli kullanıcı tarafından gönderilen teklifler
export const fetchOffersBySender = createAsyncThunk(
    'cargoOffers/fetchBySender',
    async (params: { senderId: string, adminStatus?: number }) => {
        return await cargoOfferService.fetchOffersBySender(params.senderId, params.adminStatus);
    }
);

// Tek bir teklifin detayını çek
export const getOfferById = createAsyncThunk(
    'cargoOffers/getById',
    async (id: number) => {
        return await cargoOfferService.getOfferById(id);
    }
);

// Teklif oluştur
export const createCargoOffer = createAsyncThunk(
    'cargoOffers/create',
    async (offer: CargoOfferRequest) => {
        return await cargoOfferService.createCargoOffer(offer);
    }
);

// Teklif durumu güncelle
export const updateCargoOfferStatus = createAsyncThunk(
    'cargoOffers/updateStatus',
    async ({ offerId, status }: { offerId: number; status: OfferStatus }) => {
        return await cargoOfferService.updateCargoOfferStatus(offerId, status);
    }
);

// === Slice ===

const cargoOfferSlice = createSlice({
    name: 'cargoOffers',
    initialState,
    reducers: {
        clearOffers: (state) => {
            state.offers = [];
            state.error = null;
        },
        clearSelectedOffer: (state) => {
            state.selectedOffer = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // fetch by cargoAdId, receiver, sender
            .addCase(fetchOffersByCargoAdId.fulfilled, (state, action) => {
                state.offers = action.payload;
                state.loading = false;
            })
            .addCase(fetchOffersByReceiver.fulfilled, (state, action) => {
                state.offersByReceiver = action.payload;
                state.loading = false;
            })
            .addCase(fetchOffersBySender.fulfilled, (state, action) => {
                state.offersBySender = action.payload;
                state.loading = false;
            })

            // Tek bir teklif detayını getir
            .addCase(getOfferById.fulfilled, (state, action) => {
                state.selectedOffer = action.payload;
                state.loading = false;
            })

            // Teklif oluşturulduğunda listeye ekle
            .addCase(createCargoOffer.fulfilled, (state, action) => {
                state.offers.push(action.payload);
                state.loading = false;
            })

            // Teklif güncellendiğinde listeyi güncelle
            .addCase(updateCargoOfferStatus.fulfilled, (state, action) => {
                const index = state.offers.findIndex((o) => o.id === action.payload.id);
                if (index !== -1) {
                    state.offers[index] = action.payload;
                }
                state.loading = false;
            })

            // Loading + Error yönetimi
            .addMatcher(
                (action) => action.type.startsWith('cargoOffers') && action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action): action is PayloadAction<string> =>
                    action.type.startsWith('cargoOffers') && action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = typeof action.payload === 'string' ? action.payload : 'Bir hata oluştu.';
                }
            );
    },
});

export const { clearOffers, clearSelectedOffer } = cargoOfferSlice.actions;

export default cargoOfferSlice.reducer;
