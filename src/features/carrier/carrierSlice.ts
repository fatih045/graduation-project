import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllCarriers,
    getCarrierById,
    createCarrier,
    updateCarrier,
    deleteCarrier,
    getCarrierByUserId,
} from '../../services/carrierService';

// 🎯 Types
export interface Carrier {
    carrierId: number;
    userId: number;
    licenseNumber: string;
    availabilityStatus: boolean;
    id: number;
}

interface CarrierState {
    carriers: Carrier[];
    selectedCarrier: Carrier | null;
    loading: boolean;
    error: string | null;
}

// 🧊 Initial State
const initialState: CarrierState = {
    carriers: [],
    selectedCarrier: null,
    loading: false,
    error: null,
};

// 🔄 Thunks
export const fetchAllCarriers = createAsyncThunk('carrier/fetchAll', async (_, thunkAPI) => {
    try {
        return await getAllCarriers();
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const fetchCarrierById = createAsyncThunk('carrier/fetchById', async (id: number, thunkAPI) => {
    try {
        return await getCarrierById(id);
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const fetchCarrierByUserId = createAsyncThunk('carrier/fetchByUserId', async (userId: number, thunkAPI) => {
    try {
        return await getCarrierByUserId(userId);
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const addCarrier = createAsyncThunk('carrier/create', async (data: {
    userId: number;
    licenseNumber: string;
    availabilityStatus: boolean;
}, thunkAPI) => {
    try {
        return await createCarrier(data);
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const editCarrier = createAsyncThunk('carrier/update', async (data: {
    carrierId: number;
    licenseNumber: string;
    availabilityStatus: boolean;
}, thunkAPI) => {
    try {
        return await updateCarrier(data);
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const removeCarrier = createAsyncThunk('carrier/delete', async (id: number, thunkAPI) => {
    try {
        await deleteCarrier(id);
        return id;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

// 🧩 Slice
const carrierSlice = createSlice({
    name: 'carrier',
    initialState,
    reducers: {
        clearSelectedCarrier(state) {
            state.selectedCarrier = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchAllCarriers
            .addCase(fetchAllCarriers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCarriers.fulfilled, (state, action: PayloadAction<Carrier[]>) => {
                state.loading = false;
                state.carriers = action.payload;
            })
            .addCase(fetchAllCarriers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // fetchCarrierById
            .addCase(fetchCarrierById.fulfilled, (state, action: PayloadAction<Carrier>) => {
                state.selectedCarrier = action.payload;
            })

            // fetchCarrierByUserId
            .addCase(fetchCarrierByUserId.fulfilled, (state, action: PayloadAction<Carrier>) => {
                state.selectedCarrier = action.payload;
            })

            // addCarrier
            .addCase(addCarrier.fulfilled, (state, action: PayloadAction<Carrier>) => {
                state.carriers.push(action.payload);
            })

            // editCarrier
            .addCase(editCarrier.fulfilled, (state, action: PayloadAction<Carrier>) => {
                const index = state.carriers.findIndex(c => c.carrierId === action.payload.carrierId);
                if (index !== -1) state.carriers[index] = action.payload;
            })

            // removeCarrier
            .addCase(removeCarrier.fulfilled, (state, action: PayloadAction<number>) => {
                state.carriers = state.carriers.filter(c => c.carrierId !== action.payload);
            });
    },
});

// 📤 Export
export const { clearSelectedCarrier } = carrierSlice.actions;
export default carrierSlice.reducer;
