// Sidebar.tsx
import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Link } from 'react-router-dom';
import '../../styles/sidebar.css';
//  baştan 3.

const Sidebar: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = !!user;
    const [isOpen, setIsOpen] = useState(false);

    if (!isLoggedIn) return null;

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button className="side-bar__toggle" onClick={toggleSidebar}>
                ☰
            </button>
            <aside className={`side-bar ${isOpen ? 'open' : ''}`}>

                <div className="side-bar__section">
                    <div className="side-bar__heading">Yük İşlemleri</div>
                    <Link to="/createCargo" className="side-bar__item">
                        <i className="fas fa-plus"></i> Yük  İlani Oluştur
                    </Link>
                    <Link to="/mycargo" className="side-bar__item">
                        <i className="fas fa-list"></i> İlanlarım
                    </Link>
                    <Link to="/cargoList" className="side-bar__item">
                        <i className="fas fa-box"></i> Tüm İlanlar
                    </Link>




                </div>

                <div className="side-bar__section">
                    <div className="side-bar__heading">Araç İşlemleri</div>
                    <Link to="/addVehicleAd" className="side-bar__item">
                        <i className="fas fa-plus"></i> İlan Oluştur
                    </Link>
                    <Link to="/myVehicleAd" className="side-bar__item">
                        <i className="fas fa-truck"></i> İlanlarım
                    </Link>
                    <Link to="/allVehicleAd" className="side-bar__item">
                        <i className="fas fa-warehouse"></i> Tüm İlanlar
                    </Link>
                    <Link to="/addVehicle" className="side-bar__item">
                        <i className="fas fa-plus-circle"></i> Araç Ekle
                    </Link>
                    <Link to="/myvehicle" className="side-bar__item">
                        <i className="fas fa-car"></i> Araçlarım
                    </Link>


                </div>

                <div className="side-bar__section">
                    <div className="side-bar__heading">Teklifler</div>
                    <div className="side-bar__subheading">Araç Teklifleri</div>
                    <Link to="/receivedVehicleOffers" className="side-bar__item">
                        <i className="fas fa-inbox"></i> Gelen Teklifler
                    </Link>
                    <Link to="/sentVehicleOffers" className="side-bar__item">
                        <i className="fas fa-paper-plane"></i> Gönderilen Teklifler
                    </Link>
                    
                    <div className="side-bar__subheading">Yük Teklifleri</div>
                    <Link to="/receivedCargoOffers" className="side-bar__item">
                        <i className="fas fa-inbox"></i> Gelen Teklifler
                    </Link>
                    <Link to="/sentCargoOffers" className="side-bar__item">
                        <i className="fas fa-paper-plane"></i> Gönderilen Teklifler
                    </Link>
                </div>


            </aside>
        </>
    );
};

export default Sidebar;
