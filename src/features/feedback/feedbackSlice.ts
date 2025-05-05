import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    addFeedback,
    getAllFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
} from '../../services/feedbackService.ts';

// Feedback tipi
interface Feedback {
    id: number;
    booking_id: number;
    user_id: number;
    rating: number;
    comment: string;
    date: string;
}

interface FeedbackState {
    feedbacks: Feedback[];
    selectedFeedback: Feedback | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: FeedbackState = {
    feedbacks: [],
    selectedFeedback: null,
    status: 'idle',
    error: null,
};

// Async thunk işlemleri
export const createFeedback = createAsyncThunk(
    'feedback/create',
    async (feedbackData: Omit<Feedback, 'id'>, { rejectWithValue }) => {
        try {
            const response = await addFeedback(feedbackData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Feedback eklenemedi');
        }
    }
);

export const fetchAllFeedbacks = createAsyncThunk(
    'feedback/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllFeedbacks();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Feedbackler alınamadı');
        }
    }
);

export const fetchFeedbackById = createAsyncThunk(
    'feedback/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await getFeedbackById(id);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Feedback bulunamadı');
        }
    }
);

export const editFeedback = createAsyncThunk(
    'feedback/update',
    async ({ id, data }: { id: number; data: Omit<Feedback, 'id'> }, { rejectWithValue }) => {
        try {
            const response = await updateFeedback(id, data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Feedback güncellenemedi');
        }
    }
);

export const removeFeedback = createAsyncThunk(
    'feedback/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await deleteFeedback(id);
            return { id, message: response };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Feedback silinemedi');
        }
    }
);

// Slice
const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createFeedback.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
                state.status = 'succeeded';
                state.feedbacks.push(action.payload);
            })
            .addCase(createFeedback.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchAllFeedbacks.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllFeedbacks.fulfilled, (state, action: PayloadAction<Feedback[]>) => {
                state.status = 'succeeded';
                state.feedbacks = action.payload;
            })
            .addCase(fetchAllFeedbacks.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchFeedbackById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFeedbackById.fulfilled, (state, action: PayloadAction<Feedback>) => {
                state.status = 'succeeded';
                state.selectedFeedback = action.payload;
            })
            .addCase(fetchFeedbackById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(editFeedback.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(editFeedback.fulfilled, (state, action: PayloadAction<Feedback>) => {
                state.status = 'succeeded';
                const index = state.feedbacks.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.feedbacks[index] = action.payload;
                }
            })
            .addCase(editFeedback.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(removeFeedback.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(removeFeedback.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
                state.status = 'succeeded';
                state.feedbacks = state.feedbacks.filter(f => f.id !== action.payload.id);
            })
            .addCase(removeFeedback.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

export default feedbackSlice.reducer;
