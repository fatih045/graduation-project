import ShippingMarketplace from './ShippingMarketplace';
import LandingPage from "./LandingPage.tsx";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const HomePage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = !!user;
    return isLoggedIn ? <ShippingMarketplace /> : <LandingPage />;
};

export default HomePage;