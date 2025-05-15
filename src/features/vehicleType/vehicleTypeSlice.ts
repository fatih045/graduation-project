import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllVehicleTypes,
    getVehicleTypeById,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType
} from '../../services/vehicleTypeService';

// Tip tanımı
export interface VehicleType {
    id: number;
    name: string;
    description: string;
}

interface VehicleTypeState {
    items: VehicleType[];
    selected: VehicleType | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: VehicleTypeState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

// Thunk'lar
export const fetchVehicleTypes = createAsyncThunk('vehicleType/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await getAllVehicleTypes();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchVehicleTypeById = createAsyncThunk('vehicleType/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        const response = await getVehicleTypeById(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const addVehicleType = createAsyncThunk('vehicleType/add', async (data: { name: string; desc: string }, { rejectWithValue }) => {
    try {
        const response = await createVehicleType(data);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const editVehicleType = createAsyncThunk('vehicleType/edit', async ({ id, data }: { id: number; data: { name: string; desc: string } }, { rejectWithValue }) => {
    try {
        const response = await updateVehicleType(id, data);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const removeVehicleType = createAsyncThunk('vehicleType/remove', async (id: number, { rejectWithValue }) => {
    try {
        const response = await deleteVehicleType(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Slice
const vehicleTypeSlice = createSlice({
    name: 'vehicleType',
    initialState,
    reducers: {
        clearSelectedVehicleType: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicleTypes.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchVehicleTypes.fulfilled, (state, action: PayloadAction<VehicleType[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchVehicleTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchVehicleTypeById.fulfilled, (state, action: PayloadAction<VehicleType>) => {
                state.selected = action.payload;
            })

            .addCase(addVehicleType.fulfilled, (state, action: PayloadAction<VehicleType>) => {
                state.items.push(action.payload);
            })

            .addCase(editVehicleType.fulfilled, (state, action: PayloadAction<VehicleType>) => {
                const index = state.items.findIndex((x) => x.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })

            .addCase(removeVehicleType.fulfilled, (state, action: PayloadAction<any>) => {
                state.items = state.items.filter((x) => x.id !== action.payload.id);
            });
    },
});

export const { clearSelectedVehicleType } = vehicleTypeSlice.actions;

export default vehicleTypeSlice.reducer;
