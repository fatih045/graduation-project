import {Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage.tsx";
import ShippingMarketplace from "../pages/ShippingMarketplace.tsx";
import ConfirmEmail from "../pages/ConfirmEmail.tsx";
import Logout from "../pages/Logout.tsx";
import AddVehicle from  "../pages/CreateVehiclePage.tsx"
import MyVehicle from  "../pages/MyVehiclePage.tsx"

import CreateCargo from  "../pages/CreateCargoPage.tsx"
import CargoList from "../pages/CargoListPage.tsx"
import MyCargoList from "../pages/MyCargoList.tsx"

import AllVehicleAdPage from "../pages/AllVehicleAdPage.tsx";
import MyVehicleAdPage from "../pages/MyVehicleAdPage.tsx";
import AddVehicleAd from "../pages/CreateVehicleAdPage.tsx";
import ReceivedVehicleOffersPage from "../pages/ReceivedVehicleOffersPage.tsx";
import SentVehicleOffersPage from "../pages/SentVehicleOffersPage.tsx";
import ReceivedCargoOffersPage from "../pages/ReceivedCargoOffersPage.tsx";
import SentCargoOffersPage from "../pages/SentCargoOffersPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";




const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="confirm-email" element={<ConfirmEmail />} />
            <Route path="/list" element={<ShippingMarketplace />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/addVehicle" element={<AddVehicle/>} />
            <Route  path="/myvehicle" element={<MyVehicle/>} />

            <Route path="/addVehicleAd" element={<AddVehicleAd/>} />

            <Route path="/createCargo" element={<CreateCargo/>} />
            <Route path="/cargoList" element={<CargoList/>} />
            <Route path="/mycargo" element={<MyCargoList/>} />
            <Route path="/profile" element={<ProfilePage/>} />



            <Route path="/allVehicleAd" element={<AllVehicleAdPage/>} />
            <Route path="/myVehicleAd" element={<MyVehicleAdPage/>} />
            <Route path="/receivedVehicleOffers" element={<ReceivedVehicleOffersPage/>} />
            <Route path="/sentVehicleOffers" element={<SentVehicleOffersPage/>} />
            <Route path="/receivedCargoOffers" element={<ReceivedCargoOffersPage/>} />
            <Route path="/sentCargoOffers" element={<SentCargoOffersPage/>} />





        </Routes>
    );
};

export default AppRoutes;
