import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import NotificationService, { NotificationResponse } from '../../services/notificationService';

interface NotificationState {
    notifications: NotificationResponse[];
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    loading: false,
    error: null
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

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {},
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
            });
    }
});

export default notificationSlice.reducer;
