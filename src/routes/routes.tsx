import {Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage.tsx";
import ShippingMarketplace from "../pages/ShippingMarketplace.tsx";
import ConfirmEmail from "../pages/ConfirmEmail.tsx";
import Logout from "../pages/Logout.tsx";
import AddVehicle from  "../pages/CreateVehiclePage.tsx"
import MyVehicle from  "../pages/MyVehiclePage.tsx"
import CreateBooking from "../pages/CreateBookingPage.tsx"
import CreateCargo from  "../pages/CreateCargoPage.tsx"
import CargoList from "../pages/CargoListPage.tsx"
import MyCargoList from "../pages/MyCargoList.tsx"


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
            <Route  path="/createbooking" element={<CreateBooking/>} />
            <Route path="/createCargo" element={<CreateCargo/>} />
            <Route path="/cargoList" element={<CargoList/>} />
            <Route path="/mycargo" element={<MyCargoList/>} />


        </Routes>
    );
};

export default AppRoutes;
