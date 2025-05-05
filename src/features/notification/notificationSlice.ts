import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getAllNotifications,
    getNotificationById,
    addNotification,
  //  updateNotification,
    deleteNotification
} from '../../services/notificationService';

// Notification tipi
export interface Notification {
    id: number;
    user_id: number;
    message: string;
    created_at: string;
}

// Slice state tipi
interface NotificationState {
    items: Notification[];
    selectedNotification: Notification | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: NotificationState = {
    items: [],
    selectedNotification: null,
    status: 'idle',
    error: null,
};

// Async thunk işlemleri
export const fetchNotifications = createAsyncThunk(
    'notification/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await getAllNotifications();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchNotificationById = createAsyncThunk(
    'notification/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await getNotificationById(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNotification = createAsyncThunk(
    'notification/create',
    async (data: { user_id: number; message: string; created_at: Date }, { rejectWithValue }) => {
        try {
            return await addNotification(data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// export const updateNotificationThunk = createAsyncThunk(
//     'notification/update',
//     async ({ id, data }: { id: number; data: { user_id: number; message: string; created_at: Date } }, { rejectWithValue }) => {
//         try {
//             return await updateNotification(id, data);
//         } catch (error: any) {
//             return rejectWithValue(error.message);
//         }
//     }
// );

export const deleteNotificationThunk = createAsyncThunk(
    'notification/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await deleteNotification(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice
const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        clearSelectedNotification: (state) => {
            state.selectedNotification = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchNotificationById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNotificationById.fulfilled, (state, action: PayloadAction<Notification>) => {
                state.status = 'succeeded';
                state.selectedNotification = action.payload;
                state.error = null;
            })
            .addCase(fetchNotificationById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(createNotification.fulfilled, (state, action: PayloadAction<Notification>) => {
                state.items.push(action.payload);
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // .addCase(updateNotificationThunk.fulfilled, (state, action: PayloadAction<Notification>) => {
            //     const index = state.items.findIndex(n => n.id === action.payload.id);
            //     if (index !== -1) {
            //         state.items[index] = action.payload;
            //     }
            // })
            // .addCase(updateNotificationThunk.rejected, (state, action) => {
            //     state.status = 'failed';
            //     state.error = action.payload as string;
            // })

            .addCase(deleteNotificationThunk.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(n => n.id !== action.payload);
            })
            .addCase(deleteNotificationThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
