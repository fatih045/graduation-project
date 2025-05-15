// src/store/slices/customerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer, getCustomerByUserIdFromStore,
} from '../../services/customerService';

// Müşteri tipi
interface Customer {
    userId: string;
    address: string;
    customerId: number;
}

interface CustomerState {
    customers: Customer[];
    selectedCustomer: Customer | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    loading: boolean;   ///
}

const initialState: CustomerState = {
    customers: [],
    selectedCustomer: null,
    status: 'idle',
    error: null,
    loading: false   //
};

// Thunk: Yeni müşteri oluşturma
export const createCustomerThunk = createAsyncThunk(
    'customer/create',
    async (customerData: Customer, { rejectWithValue }) => {
        try {
            const response = await createCustomer(customerData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Müşteri oluşturulurken hata oluştu');
        }
    }
);

// Thunk: Tüm müşterileri getirme
export const fetchCustomers = createAsyncThunk(
    'customer/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllCustomers();
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Müşteriler getirilirken hata oluştu');
        }
    }
);

// Thunk: Belirli müşteriyi getirme
export const fetchCustomerById = createAsyncThunk(
    'customer/fetchById',
    async (customer_id: number, { rejectWithValue }) => {
        try {
            const response = await getCustomerById(customer_id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Müşteri getirilemedi');
        }
    }
);

export const updateCustomerThunk = createAsyncThunk(
    'customer/update',
    async (data: Partial<Customer>, { rejectWithValue }) => {
        try {
            const response = await updateCustomer(data); // sadece data gönderiyoruz
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Müşteri güncellenemedi');
        }
    }
);


// Thunk: Müşteri silme
export const deleteCustomerThunk = createAsyncThunk(
    'customer/delete',
    async (customer_id: number, { rejectWithValue }) => {
        try {
            const response = await deleteCustomer(customer_id);
            return { customer_id, result: response };
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Müşteri silinemedi');
        }
    }
);



export const fetchCustomerByUserIdThunk = createAsyncThunk(
    'customer/fetchByUserId',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCustomerByUserIdFromStore();
            return response;
            console.log(response)
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Kullanıcıya ait müşteri getirilemedi');
        }
    }
);


const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE
            .addCase(createCustomerThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createCustomerThunk.fulfilled, (state, action: PayloadAction<Customer>) => {
                state.status = 'succeeded';
                state.customers.push(action.payload);
            })
            .addCase(createCustomerThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // FETCH ALL
            .addCase(fetchCustomers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
                state.status = 'succeeded';
                state.customers = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // FETCH ONE
            .addCase(fetchCustomerById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
                state.status = 'succeeded';
                state.selectedCustomer = action.payload;
            })
            .addCase(fetchCustomerById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // UPDATE
            .addCase(updateCustomerThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateCustomerThunk.fulfilled, (state, action: PayloadAction<Customer>) => {
                state.status = 'succeeded';
                const index = state.customers.findIndex(c => c.customerId === action.payload.customerId);
                if (index !== -1) state.customers[index] = action.payload;
            })
            .addCase(updateCustomerThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // DELETE
            .addCase(deleteCustomerThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.customers = state.customers.filter(
                    (c) => c.customerId !== action.payload.customer_id
                );
            })
            .addCase(deleteCustomerThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // FETCH BY USER ID
            // builder içine ekle
            .addCase(fetchCustomerByUserIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCustomerByUserIdThunk.fulfilled, (state, action: PayloadAction<Customer>) => {
                state.status = 'succeeded';
                state.selectedCustomer = action.payload;
            })
            .addCase(fetchCustomerByUserIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


    },
});

export const { clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
