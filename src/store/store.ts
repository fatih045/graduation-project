
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/user/authSlice';
import bookingReducer from '../features/booking/bookingSlice'; // bookingSlice import
import vehicleReducer from '../features/vehicle/vehicleSlice'; // vehicleSlice import
import carrierReducer from '../features/carrier/carrierSlice'; // carrierSlice import
import notificationReducer from '../features/notification/notificationSlice'; // notificationSlice import
import cargoReducer from '../features/cargo/cargoSlice';
import customerReducer from '../features/customer/customerSlice';
import locationReducer from '../features/location/locationSlice';
import vehicleTypeReducer from '../features/vehicleType/vehicleTypeSlice';
import paymentReducer from '../features/payment/paymentSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";


const store = configureStore({
    reducer: {
        auth: authReducer,  // authSlice'ı store'a ekliyoruz
        booking: bookingReducer,  // bookingSlice'ı store'a ekliyoruz
        vehicle: vehicleReducer,  // vehicleSlice'ı store'a ekliyoruz
        carrier: carrierReducer,  // carrierSlice'ı store'a ekliyoruz
        notification: notificationReducer,// notificationSlice'ı store'a ekliyoruz
        cargo: cargoReducer,
        customer: customerReducer,
        location: locationReducer,
        vehicleType: vehicleTypeReducer,
        payment: paymentReducer,
        feedback: feedbackReducer
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;