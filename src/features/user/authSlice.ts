// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { registerUser, loginUser, confirmEmail } from '../../services/AuthService';
import { decodeToken } from '../../utils/jwt';

// State tipi
export interface AuthState {
    user: any | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
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

export const { logout } = authSlice.actions;

// Sadece bir default export olmalı
export default authSlice.reducer;
