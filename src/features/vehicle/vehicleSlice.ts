import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehiclesByCarrier
} from '../../services/vehicleService';

// Yeni Vehicle tipi
export interface Vehicle {
    id: number;
    carrierId: string;
    title: string;
    vehicleType: string;
    capacity: number;
    licensePlate: string;
    model: string;
}

interface VehicleState {
    items: Vehicle[];
    selected: Vehicle | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: VehicleState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

// Thunks
export const fetchVehicles = createAsyncThunk('vehicle/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await getAllVehicles();
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchVehicleById = createAsyncThunk('vehicle/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        return await getVehicleById(id);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const addVehicle = createAsyncThunk(
    'vehicle/add',
    async (data: Omit<Vehicle, 'id'>, { rejectWithValue }) => {
        try {
            return await createVehicle(data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const editVehicle = createAsyncThunk(
    'vehicle/edit',
    async ({ id, data }: { id: number; data: Omit<Vehicle, 'id'> }, { rejectWithValue }) => {
        try {
            return await updateVehicle(id, data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeVehicle = createAsyncThunk('vehicle/remove', async (id: number, { rejectWithValue }) => {
    try {
        await deleteVehicle(id);
        return { id };
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchVehiclesByCarrier = createAsyncThunk(
    'vehicle/fetchByCarrier',
    async (carrierId: string, { rejectWithValue }) => {
        try {
            return await getVehiclesByCarrier(carrierId);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const vehicleSlice = createSlice({
    name: 'vehicle',
    initialState,
    reducers: {
        clearSelectedVehicle: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchVehicleById.fulfilled, (state, action: PayloadAction<Vehicle>) => {
                state.selected = action.payload;
            })

            .addCase(addVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
                state.items.push(action.payload);
            })

            .addCase(editVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
                const index = state.items.findIndex(v => v.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })

            .addCase(removeVehicle.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
                state.items = state.items.filter(v => v.id !== action.payload.id);
            })

            .addCase(fetchVehiclesByCarrier.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchVehiclesByCarrier.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchVehiclesByCarrier.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
