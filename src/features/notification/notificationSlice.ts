import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NotificationService, { NotificationResponse } from '../../services/notificationService';

interface NotificationState {
    notifications: NotificationResponse[];
    loading: boolean;
    error: string | null;
    signalRConnected: boolean;
}

const initialState: NotificationState = {
    notifications: [],
    loading: false,
    error: null,
    signalRConnected: false
};

// Bildirimleri getir
export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (_, thunkAPI) => {
        try {
            return await NotificationService.fetchNotifications();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = createAsyncThunk(
    'notification/markNotificationAsRead',
    async (notificationId: number, thunkAPI) => {
        try {
            return await NotificationService.markNotificationAsRead(notificationId);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// SignalR bağlantısını başlat
export const startSignalRConnection = createAsyncThunk(
    'notification/startSignalRConnection',
    async (userId: string, thunkAPI) => {
        try {
            return NotificationService.startSignalRConnection(userId);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// SignalR bağlantısını durdur
export const stopSignalRConnection = createAsyncThunk(
    'notification/stopSignalRConnection',
    async (_, thunkAPI) => {
        try {
            await NotificationService.stopSignalRConnection();
            return true;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        // Yeni bildirim eklemek için (SignalR tarafından tetiklenir)
        addNotification: (state, action: PayloadAction<NotificationResponse>) => {
            // Eğer bildirim zaten varsa ekleme
            const exists = state.notifications.some(n => n.id === action.payload.id);
            if (!exists) {
                state.notifications.unshift(action.payload); // Yeni bildirimi en üste ekle
            }
        },
        // Bildirimi güncelle (okundu durumu değiştiğinde)
        updateNotification: (state, action: PayloadAction<NotificationResponse>) => {
            const index = state.notifications.findIndex(n => n.id === action.payload.id);
            if (index !== -1) {
                state.notifications[index] = action.payload;
            }
        },
        // SignalR bağlantı durumunu güncelle
        setSignalRConnected: (state, action: PayloadAction<boolean>) => {
            state.signalRConnected = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const updated = action.payload;
                const index = state.notifications.findIndex(n => n.id === updated.id);
                if (index !== -1) {
                    state.notifications[index] = updated;
                }
            })
            .addCase(startSignalRConnection.fulfilled, (state) => {
                state.signalRConnected = true;
            })
            .addCase(startSignalRConnection.rejected, (state) => {
                state.signalRConnected = false;
            })
            .addCase(stopSignalRConnection.fulfilled, (state) => {
                state.signalRConnected = false;
            });
    }
});

export const { addNotification, updateNotification, setSignalRConnected } = notificationSlice.actions;

export default notificationSlice.reducer;
