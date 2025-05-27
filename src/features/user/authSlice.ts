// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {registerUser, loginUser, confirmEmail, getUser} from '../../services/AuthService';
import { decodeToken } from '../../utils/jwt';

// State tipi
export interface AuthState {
    user: any | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    carrierDetails: any | null; 
}

// localStorage'dan token'ı al
const storedToken = localStorage.getItem('token');
let decodedUser = null;

// Token varsa kullanıcı bilgisini çöz
if (storedToken) {
    try {
        decodedUser = decodeToken(storedToken);
    } catch (error) {
        // Token geçersizse localStorage'dan temizle
        localStorage.removeItem('token');
    }
}

const initialState: AuthState = {
    user: decodedUser,
    token: storedToken,
    status: storedToken ? 'succeeded' : 'idle',
    error: null,
    carrierDetails: null, 
};

// Async thunk işlemleri
export const register = createAsyncThunk(
    'auth/register',
    async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        userName: string;
        password: string;
        confirmPassword: string;
    }, { rejectWithValue }) => {
        try {
            const response = await registerUser(userData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Kayıt sırasında hata oluştu');
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (loginData: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await loginUser(loginData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Giriş sırasında hata oluştu');
        }
    }
);
export const getUserById = createAsyncThunk(
    'auth/getUserById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await getUser(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Kullanıcı alınamadı');
        }
    }
);

export const getCarrierDetails = createAsyncThunk(
    'auth/getCarrierDetails',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await getUser(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Taşıyıcı bilgileri alınamadı');
        }
    }
);

export const confirmEmailAction = createAsyncThunk(
    'auth/confirmEmail',
    async ({ email, token }: { email: string; token: string }, { rejectWithValue }) => {
        try {
            const response = await confirmEmail(email, token);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Email doğrulama sırasında hata oluştu');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            state.error = null;
            // Logout olunca localStorage'dan token'ı temizle
            localStorage.removeItem('token');
        },
        clearCarrierDetails: (state) => {
            state.carrierDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register işlemi
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Login işlemi
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded';
                state.token = action.payload.jwToken;
                state.user = decodeToken(action.payload.jwToken); // JWT'den user bilgisini al
                state.error = null;
                if (action.payload.jwToken) {
                    localStorage.setItem('token', action.payload.jwToken);
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // extraReducers bloğunun sonuna ekle
            .addCase(getUserById.pending, (state) => {
                // Don't change the main status or user for getUserById operations
                state.error = null;
            })
            // .addCase(getUserById.fulfilled, (state, action: PayloadAction<any>) => {
            //     // Don't overwrite current user information
            //     state.error = null;
            //     // This action should not modify the current user state
            // })    old but ok


            .addCase(getUserById.fulfilled, (state) => {
                // Don't overwrite current user information
                state.error = null;
                // This action should not modify the current user state
            })



            .addCase(getUserById.rejected, (state, action) => {
                // Don't mark the whole auth state as failed
                state.error = action.payload as string;
            })
            .addCase(getCarrierDetails.pending, (state) => {
                // Don't change the main status since this is a secondary operation
                state.error = null;
            })
            .addCase(getCarrierDetails.fulfilled, (state, action: PayloadAction<any>) => {
                // Store carrier details separately from the current user
                state.carrierDetails = action.payload;
                state.error = null;
            })
            .addCase(getCarrierDetails.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Email doğrulama işlemi
            .addCase(confirmEmailAction.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(confirmEmailAction.fulfilled, (state, action: PayloadAction<any>) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(confirmEmailAction.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearCarrierDetails } = authSlice.actions;

// Sadece bir default export olmalı
export default authSlice.reducer;
