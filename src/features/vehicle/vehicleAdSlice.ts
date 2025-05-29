import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleAdService from '../../services/vehicleAdService';

export interface VehicleAd {
    id: number;
    title: string;
    description: string;
    country: string,
    city: string,
    carrierId: string;
    vehicleType: string;
    capacity: number;
    createdDate: string;
    carrierName: string;
    adDate: string;
    status?: number;
}

interface VehicleAdState {
    vehicleAds: VehicleAd[];
    selectedVehicleAd: VehicleAd | null;
    loading: boolean;
    error: string | null;
}

const initialState: VehicleAdState = {
    vehicleAds: [],
    selectedVehicleAd: null,
    loading: false,
    error: null,
};

// Thunks
export const fetchAllVehicleAds = createAsyncThunk(
    'vehicleAd/fetchAll',
    async (status: number | undefined = undefined, { rejectWithValue }) => {
        try {
            return await vehicleAdService.fetchAllVehicleAds(status);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getVehicleAdById = createAsyncThunk(
    'vehicleAd/getById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await vehicleAdService.getVehicleAdById(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createVehicleAd = createAsyncThunk(
    'vehicleAd/create',
    async (vehicleAdData: Omit<VehicleAd, 'id'>, { rejectWithValue }) => {
        try {
            return await vehicleAdService.createVehicleAd(vehicleAdData);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateVehicleAd = createAsyncThunk(
    'vehicleAd/update',
    async (
        {
            id,
            updatedData,
        }: { id: number; updatedData: { 
            id: number;
            title: string; 
            description: string; 
            country: string; 
            city: string; 
            vehicleType: string; 
            capacity: number; 
        } },
        { rejectWithValue }
    ) => {
        try {
            return await vehicleAdService.updateVehicleAd(id, updatedData);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteVehicleAd = createAsyncThunk(
    'vehicleAd/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await vehicleAdService.deleteVehicleAd(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Yeni thunk: Fetch by carrierId
export const fetchVehicleAdsByCarrier = createAsyncThunk(
    'vehicleAd/fetchByCarrier',
    async (params: { carrierId: string, status?: number }, { rejectWithValue }) => {
        try {
            return await vehicleAdService.getVehicleAdsByCarrierId(params.carrierId, params.status);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Yeni thunk: Şehre göre araç ilanlarını getir
export const fetchVehicleAdsByCity = createAsyncThunk(
    'vehicleAd/fetchByCity',
    async (params: { city: string, status?: number }, { rejectWithValue }) => {
        try {
            return await vehicleAdService.fetchCargosByPickCitys(params.city, params.status);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const vehicleAdSlice = createSlice({
    name: 'vehicleAd',
    initialState,
    reducers: {
        clearSelectedVehicleAd(state) {
            state.selectedVehicleAd = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllVehicleAds.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllVehicleAds.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicleAds = action.payload;
            })
            .addCase(fetchAllVehicleAds.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getVehicleAdById.fulfilled, (state, action) => {
                state.selectedVehicleAd = action.payload;
            })
            .addCase(createVehicleAd.fulfilled, (state, action) => {
                state.vehicleAds.push(action.payload);
            })
            .addCase(updateVehicleAd.fulfilled, (state, action) => {
                const index = state.vehicleAds.findIndex((v) => v.id === action.payload.id);
                if (index !== -1) state.vehicleAds[index] = action.payload;
            })
            .addCase(deleteVehicleAd.fulfilled, (state, action) => {
                state.vehicleAds = state.vehicleAds.filter((v) => v.id !== action.payload);
            })
            .addCase(fetchVehicleAdsByCarrier.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVehicleAdsByCarrier.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicleAds = action.payload;
            })
            .addCase(fetchVehicleAdsByCarrier.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchVehicleAdsByCity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVehicleAdsByCity.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicleAds = action.payload;
            })
            .addCase(fetchVehicleAdsByCity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedVehicleAd } = vehicleAdSlice.actions;
export default vehicleAdSlice.reducer;
