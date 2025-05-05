// src/features/location/locationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService from '../../services/locationService';

export interface Location {
    id: number;
    address: string;
    city: string;
    state: string;
    postal_Code: number;
    coordinates: string;
}

interface LocationState {
    locations: Location[];
    selectedLocation: Location | null;
    loading: boolean;
    error: string | null;
}

const initialState: LocationState = {
    locations: [],
    selectedLocation: null,
    loading: false,
    error: null,
};

// Thunks
export const fetchAllLocations = createAsyncThunk(
    'location/fetchAll',
    async (_, thunkAPI) => {
        try {
            return await locationService.fetchAllLocations();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const getLocationById = createAsyncThunk(
    'location/getById',
    async (id: number, thunkAPI) => {
        try {
            return await locationService.getLocationById(id);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const createLocation = createAsyncThunk(
    'location/create',
    async (locationData: Omit<Location, 'id'>, thunkAPI) => {
        try {
            return await locationService.createLocation(locationData);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const updateLocation = createAsyncThunk(
    'location/update',
    async ({ id, updatedData }: { id: number; updatedData: Omit<Location, 'id'> }, thunkAPI) => {
        try {
            return await locationService.updateLocation(id, updatedData);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteLocation = createAsyncThunk(
    'location/delete',
    async (id: number, thunkAPI) => {
        try {
            await locationService.deleteLocation(id);
            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Slice
const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        clearSelectedLocation(state) {
            state.selectedLocation = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.locations = action.payload;
            })
            .addCase(fetchAllLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(getLocationById.fulfilled, (state, action) => {
                state.selectedLocation = action.payload;
            })

            .addCase(createLocation.fulfilled, (state, action) => {
                state.locations.push(action.payload);
            })

            .addCase(updateLocation.fulfilled, (state, action) => {
                const index = state.locations.findIndex(l => l.id === action.payload.id);
                if (index !== -1) state.locations[index] = action.payload;
            })

            .addCase(deleteLocation.fulfilled, (state, action) => {
                state.locations = state.locations.filter(l => l.id !== action.payload);
            });
    },
});

export const { clearSelectedLocation } = locationSlice.actions;
export default locationSlice.reducer;
