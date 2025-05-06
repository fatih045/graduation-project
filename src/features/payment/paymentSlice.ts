// src/store/slices/paymentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
} from '../../services/paymentService';

interface Payment {
    id: number;
    booking_id: number;
    amount: number;
    payment_method: string;
    payment_date: string;
    status: string;
}

interface PaymentState {
    payments: Payment[];
    selectedPayment: Payment | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: PaymentState = {
    payments: [],
    selectedPayment: null,
    status: 'idle',
    error: null,
};

// Thunks
export const fetchPayments = createAsyncThunk('payment/fetchAll',
    async (_, { rejectWithValue }) => {
    try {
        return await getPayments();
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const fetchPaymentById = createAsyncThunk('payment/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        return await getPaymentById(id);
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const addPayment = createAsyncThunk('payment/add', async (paymentData: Omit<Payment, 'id'>, { rejectWithValue }) => {
    try {
        return await createPayment(paymentData);
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const editPayment = createAsyncThunk('payment/edit', async ({ id, data }: { id: number; data: Omit<Payment, 'id'> }, { rejectWithValue }) => {
    try {
        return await updatePayment(id, data);
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const removePayment = createAsyncThunk('payment/delete', async (id: number, { rejectWithValue }) => {
    try {
        await deletePayment(id);
        return id;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

// Slice
const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayments.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
                state.status = 'succeeded';
                state.payments = action.payload;
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchPaymentById.fulfilled, (state, action: PayloadAction<Payment>) => {
                state.selectedPayment = action.payload;
            })
            .addCase(addPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
                state.payments.push(action.payload);
            })
            .addCase(editPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
                const index = state.payments.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.payments[index] = action.payload;
            })
            .addCase(removePayment.fulfilled, (state, action: PayloadAction<number>) => {
                state.payments = state.payments.filter(p => p.id !== action.payload);
            });
    },
});

export default paymentSlice.reducer;
