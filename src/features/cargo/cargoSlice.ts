
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cargoService from '../../services/cargoService';

export interface Cargo {
    id: number;
    customerId: number;
    description: string;
    weight: number;
    cargoType: string;
    pickupLocationId: number;
    dropoffLocationId: number;
}

interface CargoState {
    cargos: Cargo[];
    selectedCargo: Cargo | null;
    loading: boolean;
    error: string | null;
}

const initialState: CargoState = {
    cargos: [],
    selectedCargo: null,
    loading: false,
    error: null,
};

// Thunks
export const fetchAllCargos = createAsyncThunk(
    'cargo/fetchAll',
    async (_, thunkAPI) => {
        try {
            return await cargoService.fetchAllCargos();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const fetchMyCargos = createAsyncThunk(
    'cargo/fetchMy',
    async (customerId:number, thunkAPI) => {
        try {
            return await cargoService.fetchMyCargos(customerId);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const getCargoById = createAsyncThunk(
    'cargo/getById',
    async (id: number, thunkAPI) => {
        try {
            return await cargoService.getCargoById(id);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const createCargo = createAsyncThunk(
    'cargo/create',
    async (cargoData: Omit<Cargo, 'id'>, thunkAPI) => {
        try {
            return await cargoService.createCargo(cargoData);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateCargo = createAsyncThunk(
    'cargo/update',
    async ({ id, updatedData }: { id: number; updatedData: Omit<Cargo, 'id'> }, thunkAPI) => {
        try {
            const result = await cargoService.updateCargo(id, updatedData);
            return result;
        } catch (error: any) {
            const errorMessage = error.message || 'Kargo güncellenirken bir hata oluştu';
            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

export const deleteCargo = createAsyncThunk(
    'cargo/delete',
    async (id: number, thunkAPI) => {
        try {
            await cargoService.deleteCargo(id);
            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Slice
const cargoSlice = createSlice({
    name: 'cargo',
    initialState,
    reducers: {
        clearSelectedCargo(state) {
            state.selectedCargo = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCargos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCargos.fulfilled, (state, action) => {
                state.loading = false;
                state.cargos = action.payload;
            })
            .addCase(fetchAllCargos.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(getCargoById.fulfilled, (state, action) => {
                state.selectedCargo = action.payload;
            })

            .addCase(createCargo.fulfilled, (state, action) => {
                state.cargos.push(action.payload);
            })

            .addCase(updateCargo.fulfilled, (state, action) => {
                const index = state.cargos.findIndex(c => c.id === action.payload.id);
                if (index !== -1) state.cargos[index] = action.payload;
            })

            .addCase(deleteCargo.fulfilled, (state, action) => {
                state.cargos = state.cargos.filter(c => c.id !== action.payload);
            });
    },
});

export const { clearSelectedCargo } = cargoSlice.actions;
export default cargoSlice.reducer;