
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/user/authSlice';

import vehicleReducer from '../features/vehicle/vehicleSlice'; // vehicleSlice import

import notificationReducer from '../features/notification/notificationSlice'; // notificationSlice import
import cargoReducer from '../features/cargo/cargoSlice';



import cargoOfferReducer from '../features/cargoOffer/cargoOfferSlice';

import vehicleOfferReducer from '../features/vehicleOffer/vehicleOfferSlice';


import vehicleAdReducer from '../features/vehicle/vehicleAdSlice';
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";


const store = configureStore({
    reducer: {
        auth: authReducer,  // authSlice'ı store'a ekliyoruz

        vehicle: vehicleReducer,  // vehicleSlice'ı store'a ekliyoruz

        notification: notificationReducer,// notificationSlice'ı store'a ekliyoruz
        cargo: cargoReducer,



        cargoOffer:cargoOfferReducer,

        vehicleOffer:vehicleOfferReducer,





        vehicleAd:vehicleAdReducer
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;