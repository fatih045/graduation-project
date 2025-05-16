import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle, getVehiclesByCarrier
} from '../../services/vehicleService';

export interface Vehicle {
    id: number;
    carrierId: number;
    vehicleTypeId: number;
    capacity: number;
    licensePlate: string;
    availabilityStatus: boolean;
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
        const response = await getAllVehicles();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchVehicleById = createAsyncThunk('vehicle/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        const response = await getVehicleById(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const addVehicle = createAsyncThunk(
    'vehicle/add',
    async (data: Omit<Vehicle, 'id'>, { rejectWithValue }) => {
        try {
            const response = await createVehicle(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const editVehicle = createAsyncThunk(
    'vehicle/edit',
    async ({ id, data }: { id: number; data: Omit<Vehicle, 'id'> }, { rejectWithValue }) => {
        try {
            const response = await updateVehicle(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeVehicle = createAsyncThunk('vehicle/remove', async (id: number, { rejectWithValue }) => {
    try {
        const response = await deleteVehicle(id);
        return { id };
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});
export const fetchVehiclesByCarrier = createAsyncThunk(
    'vehicle/fetchByCarrier',
    async (carrierId: number, { rejectWithValue }) => {
        try {
            const response = await getVehiclesByCarrier(carrierId);
            return response;
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
