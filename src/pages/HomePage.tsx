
import LandingPage from "./LandingPage.tsx";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

import LocationDisplay from "../components/location/LocationDisplay.tsx";

const HomePage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = !!user;
    return isLoggedIn ? <LocationDisplay></LocationDisplay> : <LandingPage />;
};

export default HomePage;