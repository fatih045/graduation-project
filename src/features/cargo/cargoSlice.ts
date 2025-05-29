import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cargoService, { Cargo } from '../../services/cargoService';

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
    async (params: { userId: string, status?: number }, thunkAPI) => {
        try {
            return await cargoService.fetchMyCargos(params.userId, params.status);
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
    async (cargoData: Omit<Cargo, 'id' | 'isExpired'>, thunkAPI) => {
        try {
            return await cargoService.createCargo(cargoData);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateCargo = createAsyncThunk(
    'cargo/update',
    async (updatedData: Cargo, thunkAPI) => {
        try {
            return await cargoService.updateCargo(updatedData.id, updatedData);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
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

// Şehir bazlı kargo ilanlarını getir
export const fetchCargosByPickCity = createAsyncThunk(
    'cargo/fetchByPickCity',
    async (city: string, thunkAPI) => {
        try {
            return await cargoService.fetchCargosByPickCity(city);
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

            .addCase(fetchMyCargos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyCargos.fulfilled, (state, action) => {
                state.loading = false;
                state.cargos = action.payload;
            })
            .addCase(fetchMyCargos.rejected, (state, action) => {
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
            })
            
            .addCase(fetchCargosByPickCity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCargosByPickCity.fulfilled, (state, action) => {
                state.loading = false;
                state.cargos = action.payload;
            })
            .addCase(fetchCargosByPickCity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedCargo } = cargoSlice.actions;
export default cargoSlice.reducer;
