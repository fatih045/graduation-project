import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllNotifications,
    getNotificationById,
    createNotification,
    deleteNotification
} from '../../services/notificationService';

export interface Notification {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
}

interface NotificationState {
    items: Notification[];
    selected: Notification | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: NotificationState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const data = await getAllNotifications();
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchNotificationById = createAsyncThunk('notification/fetchById', async (id: number, { rejectWithValue }) => {
    try {
        const data = await getNotificationById(id);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const addNotification = createAsyncThunk(
    'notification/add',
    async (data: Omit<Notification, 'id'>, { rejectWithValue }) => {
        try {
            const response = await createNotification(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeNotification = createAsyncThunk('notification/remove', async (id: number, { rejectWithValue }) => {
    try {
        const response = await deleteNotification(id);
        return response;
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        clearSelectedNotification: (state) => {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchNotificationById.fulfilled, (state, action: PayloadAction<Notification>) => {
                state.selected = action.payload;
            })
            .addCase(addNotification.fulfilled, (state, action: PayloadAction<Notification>) => {
                state.items.push(action.payload);
            })
            .addCase(removeNotification.fulfilled, (state, action: PayloadAction<any>) => {
                state.items = state.items.filter(n => n.id !== action.payload.id);
            });
    },
});

export const { clearSelectedNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
