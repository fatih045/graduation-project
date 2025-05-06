import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllCarriers,
    getCarrierById,
    createCarrier,
    updateCarrier,
    deleteCarrier,
} from '../../services/carrierService';

export interface Carrier {
    carrier_id: number;
    vehicleType_id: number;
    license_number: string;
    availability_Status: boolean;
}

interface CarrierState {
    items: Carrier[];
    selected: Carrier | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CarrierState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

// Thunks
export const fetchCarriers = createAsyncThunk('carrier/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await getAllCarriers();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchCarrierById = createAsyncThunk('carrier/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        const response = await getCarrierById(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const addCarrier = createAsyncThunk('carrier/add', async (data: Omit<Carrier, 'carrier_id'>, { rejectWithValue }) => {
    try {
        const response = await createCarrier(data);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const editCarrier = createAsyncThunk(
    'carrier/edit',
    async ({ id, data }: { id: number; data: Omit<Carrier, 'carrier_id'> }, { rejectWithValue }) => {
        try {
            const response = await updateCarrier(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeCarrier = createAsyncThunk('carrier/remove', async (id: number, { rejectWithValue }) => {
    try {
        const response = await deleteCarrier(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Slice
const carrierSlice = createSlice({
    name: 'carrier',
    initialState,
    reducers: {
        clearSelectedCarrier: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCarriers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCarriers.fulfilled, (state, action: PayloadAction<Carrier[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchCarriers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchCarrierById.fulfilled, (state, action: PayloadAction<Carrier>) => {
                state.selected = action.payload;
            })

            .addCase(addCarrier.fulfilled, (state, action: PayloadAction<Carrier>) => {
                state.items.push(action.payload);
            })

            .addCase(editCarrier.fulfilled, (state, action: PayloadAction<Carrier>) => {
                const index = state.items.findIndex(c => c.carrier_id === action.payload.carrier_id);
                if (index !== -1) state.items[index] = action.payload;
            })

            .addCase(removeCarrier.fulfilled, (state, action: PayloadAction<any>) => {
                state.items = state.items.filter(c => c.carrier_id !== action.payload.carrier_id);
            });
    },
});

export const { clearSelectedCarrier } = carrierSlice.actions;

export default carrierSlice.reducer;
