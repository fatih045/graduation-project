import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
} from '../../services/bookingService';

export interface Booking {
    id: number;
    customer_id: number;
    carrier_id: number;
    vehicle_id: number;
    cargo_id: number;
    pickup_date: string;
    dropoff_data: string;
    totalPrice: number;
    status: string;
}

interface BookingState {
    items: Booking[];
    selected: Booking | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BookingState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

// Thunks
export const fetchBookings = createAsyncThunk('booking/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await getAllBookings();
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchBookingById = createAsyncThunk('booking/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        const response = await getBookingById(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const addBooking = createAsyncThunk('booking/add', async (data: Omit<Booking, 'id'>, { rejectWithValue }) => {
    try {
        const response = await createBooking(data);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const editBooking = createAsyncThunk(
    'booking/edit',
    async ({ id, data }: { id: number; data: Omit<Booking, 'id'> }, { rejectWithValue }) => {
        try {
            const response = await updateBooking(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeBooking = createAsyncThunk('booking/remove', async (id: number, { rejectWithValue }) => {
    try {
        const response = await deleteBooking(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Slice
const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        clearSelectedBooking: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchBookingById.fulfilled, (state, action: PayloadAction<Booking>) => {
                state.selected = action.payload;
            })

            .addCase(addBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
                state.items.push(action.payload);
            })

            .addCase(editBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
                const index = state.items.findIndex(b => b.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })

            .addCase(removeBooking.fulfilled, (state, action: PayloadAction<any>) => {
                state.items = state.items.filter(b => b.id !== action.payload.id);
            });
    },
});

export const { clearSelectedBooking } = bookingSlice.actions;

export default bookingSlice.reducer;
