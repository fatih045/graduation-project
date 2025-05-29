import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleOfferService, {
    VehicleOfferRequest,
    VehicleOfferResponse,
    OfferStatus,
    VEHICLE_OFFER_STATUS
} from '../../services/vehicleOfferService';

// Re-export the status constants
export { VEHICLE_OFFER_STATUS };

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
    async ({ senderId, status }: { senderId: string; status?: number }, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.fetchOffersBySender(senderId, status);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Gönderici teklifleri alınamadı.');
        }
    }
);

export const fetchVehicleOffersByReceiver = createAsyncThunk(
    'vehicleOffers/fetchByReceiver',
    async ({ receiverId, status }: { receiverId: string; status?: number }, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.fetchOffersByReceiver(receiverId, status);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Alıcı teklifleri alınamadı.');
        }
    }
);

export const fetchVehicleOffersByVehicleAdId = createAsyncThunk(
    'vehicleOffers/fetchByVehicleAdId',
    async ({ vehicleAdId, status }: { vehicleAdId: number; status?: number }, { rejectWithValue }) => {
        try {
            return await vehicleOfferService.fetchOffersByVehicleAdId(vehicleAdId, status);
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
    extraReducers(builder) {
        builder
            // Create Offer
            .addCase(createVehicleOffer.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(createVehicleOffer.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOffer = action.payload;
                // Add to sender offers if exists
                if (state.offersBySender.length > 0) {
                    state.offersBySender.push(action.payload);
                }
            })
            .addCase(createVehicleOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update Offer Status
            .addCase(updateVehicleOfferStatus.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(updateVehicleOfferStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOffer = action.payload;
                
                // Update in sender offers
                const index = state.offersBySender.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.offersBySender[index] = action.payload;
                }
                
                // Update in receiver offers
                const recIndex = state.offersByReceiver.findIndex(o => o.id === action.payload.id);
                if (recIndex !== -1) {
                    state.offersByReceiver[recIndex] = action.payload;
                }
                
                // Update in vehicle ad offers
                const adIndex = state.offersByVehicleAdId.findIndex(o => o.id === action.payload.id);
                if (adIndex !== -1) {
                    state.offersByVehicleAdId[adIndex] = action.payload;
                }
            })
            .addCase(updateVehicleOfferStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by Sender
            .addCase(fetchVehicleOffersBySender.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchVehicleOffersBySender.fulfilled, (state, action) => {
                state.loading = false;
                state.offersBySender = action.payload;
            })
            .addCase(fetchVehicleOffersBySender.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by Receiver
            .addCase(fetchVehicleOffersByReceiver.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchVehicleOffersByReceiver.fulfilled, (state, action) => {
                state.loading = false;
                state.offersByReceiver = action.payload;
            })
            .addCase(fetchVehicleOffersByReceiver.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch by Vehicle Ad ID
            .addCase(fetchVehicleOffersByVehicleAdId.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchVehicleOffersByVehicleAdId.fulfilled, (state, action) => {
                state.loading = false;
                state.offersByVehicleAdId = action.payload;
            })
            .addCase(fetchVehicleOffersByVehicleAdId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get by ID
            .addCase(getVehicleOfferById.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getVehicleOfferById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOffer = action.payload;
            })
            .addCase(getVehicleOfferById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentOffer } = vehicleOfferSlice.actions;
export default vehicleOfferSlice.reducer;
