import {Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage.tsx";
import ShippingMarketplace from "../pages/ShippingMarketplace.tsx";
import ConfirmEmail from "../pages/ConfirmEmail.tsx";
import Logout from "../pages/Logout.tsx";


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="confirm-email" element={<ConfirmEmail />} />
            <Route path="/list" element={<ShippingMarketplace />} />
            <Route path="/logout" element={<Logout />} />


        </Routes>
    );
};

export default AppRoutes;
