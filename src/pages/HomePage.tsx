
import LandingPage from "./LandingPage.tsx";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import AllVehicleAdPage from "./AllVehicleAdPage.tsx";

const HomePage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = !!user;
    return isLoggedIn ? <AllVehicleAdPage></AllVehicleAdPage> : <LandingPage />;
};

export default HomePage;