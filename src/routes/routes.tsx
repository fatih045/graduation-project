import {Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import HomePage from "../pages/HomePage.tsx";
import ShippingMarketplace from "../pages/ShippingMarketplace.tsx";
import ConfirmEmail from "../pages/ConfirmEmail.tsx";


const AppRoutes = ({ isLoggedIn } : {isLoggedIn: boolean}) => {
    return (
        <Routes>
            <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="confirm-email" element={<ConfirmEmail />} />
            <Route path="/list" element={<ShippingMarketplace />} />
        </Routes>
    );
};

export default AppRoutes;
