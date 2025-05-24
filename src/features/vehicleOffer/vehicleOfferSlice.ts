import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import vehicleOfferService, {
    VehicleOfferRequest,
    VehicleOfferResponse,
    OfferStatus,
} from '../../services/vehicleOfferService';

interface VehicleOfferState {
    offersBySender: VehicleOfferResponse[];
    offersByReceiver: VehicleOfferResponse[];
    offersByVehicleAdId: VehicleOfferResponse[];
    currentOffer?: VehicleOfferResponse;
    loading: boolean;
    error?: string;
}

const initialState: VehicleOfferState = {
    offersBySender: [],
    offersByReceiver: [],
    offersByVehicleAdId: [],
    currentOffer: undefined,
    loading: false,
    error: undefined,
};

// Async Thunks

export const createVehicleOffer = createAsyncThunk(
    'vehicleOffers/create',
    async (data: VehicleOfferRequest, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.createVehicleOffer(data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Teklif oluşturulamadı.');
        }
    }
);

export const updateVehicleOfferStatus = createAsyncThunk(
    'vehicleOffers/updateStatus',
    async (
        { offerId, status }: { offerId: number; status: OfferStatus },
        { rejectWithValue }
    ) => {
        try {
            return await vehicleOfferService.updateVehicleOfferStatus(offerId, status);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Durum güncellenemedi.');
        }
    }
);

export const fetchVehicleOffersBySender = createAsyncThunk(
    'vehicleOffers/fetchBySender',
    async (senderId: string, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.fetchOffersBySender(senderId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Gönderici teklifleri alınamadı.');
        }
    }
);

export const fetchVehicleOffersByReceiver = createAsyncThunk(
    'vehicleOffers/fetchByReceiver',
    async (receiverId: string, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.fetchOffersByReceiver(receiverId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Alıcı teklifleri alınamadı.');
        }
    }
);

export const fetchVehicleOffersByVehicleAdId = createAsyncThunk(
    'vehicleOffers/fetchByVehicleAdId',
    async (vehicleAdId: number, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.fetchOffersByVehicleAdId(vehicleAdId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'İlan teklifleri alınamadı.');
        }
    }
);

export const getVehicleOfferById = createAsyncThunk(
    'vehicleOffers/getById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.getOfferById(id);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Teklif detayına ulaşılamadı.');
        }
    }
);

// Slice

const vehicleOfferSlice = createSlice({
    name: 'vehicleOffers',
    initialState,
    reducers: {
        clearCurrentOffer(state) {
            state.currentOffer = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createVehicleOffer.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(createVehicleOffer.fulfilled, (state, action) => {
                state.loading = false;
                state.offersBySender.push(action.payload);
            })
            .addCase(createVehicleOffer.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateVehicleOfferStatus.fulfilled, (state, action) => {
                const updated = action.payload;
                const allOffers = [
                    ...state.offersBySender,
                    ...state.offersByReceiver,
                    ...state.offersByVehicleAdId,
                ];
                for (const offer of allOffers) {
                    if (offer.id === updated.id) {
                        offer.status = updated.status;
                    }
                }
            })

            .addCase(fetchVehicleOffersBySender.fulfilled, (state, action) => {
                state.offersBySender = action.payload;
            })

            .addCase(fetchVehicleOffersByReceiver.fulfilled, (state, action) => {
                state.offersByReceiver = action.payload;
            })

            .addCase(fetchVehicleOffersByVehicleAdId.fulfilled, (state, action) => {
                state.offersByVehicleAdId = action.payload;
            })

            .addCase(getVehicleOfferById.fulfilled, (state, action) => {
                state.currentOffer = action.payload;
            });
    },
});

export const { clearCurrentOffer } = vehicleOfferSlice.actions;
export default vehicleOfferSlice.reducer;
