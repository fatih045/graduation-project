
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/user/authSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,  // authSlice'ı store'a ekliyoruz
    },
});

export default store;
 export type RootState = ReturnType<typeof store.getState>;
 export type AppDispatch = typeof store.dispatch;