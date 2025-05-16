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
                    <Link to="/cargo/active" className="side-bar__item">
                        <i className="fas fa-truck-loading"></i> Aktif Yüklerim
                    </Link>
                    <Link to="/cargo/history" className="side-bar__item">
                        <i className="fas fa-history"></i> Geçmiş Yüklerim
                    </Link>
                    <Link to="/mylocations" className="side-bar__item">
                        <i className="fas fa-history"></i> Lokasyon Yönetimi
                    </Link>
                    <Link to="/customer-management" className="side-bar__item">
                        <i className="fas fa-history"></i> Customer Yönetimi
                    </Link>


                </div>

                <div className="side-bar__section">
                    <div className="side-bar__heading">Araç İşlemleri</div>
                    <Link to="/vehicle/create" className="side-bar__item">
                        <i className="fas fa-plus"></i> İlan Oluştur
                    </Link>
                    <Link to="/vehicle/my" className="side-bar__item">
                        <i className="fas fa-truck"></i> İlanlarım
                    </Link>
                    <Link to="/vehicle/all" className="side-bar__item">
                        <i className="fas fa-warehouse"></i> Tüm İlanlar
                    </Link>
                    <Link to="/addVehicle" className="side-bar__item">
                        <i className="fas fa-plus-circle"></i> Araç Ekle
                    </Link>
                    <Link to="/myvehicle" className="side-bar__item">
                        <i className="fas fa-car"></i> Araçlarım
                    </Link>
                    <Link to="/transport/active" className="side-bar__item">
                        <i className="fas fa-shipping-fast"></i> Aktif Taşımalarım
                    </Link>
                    <Link to="/transport/history" className="side-bar__item">
                        <i className="fas fa-archive"></i> Geçmiş Taşımalarım
                    </Link>
                    <Link to="/carrierManagement" className="side-bar__item">
                        <i className="fas fa-archive"></i>Araç Yönetimi
                    </Link>
                    <Link to="/vehicleTypeManagement" className="side-bar__item">
                        <i className="fas fa-archive"></i>Araç  Türü Yönetimi
                    </Link>

                </div>

                <div className="side-bar__section">
                    <div className="side-bar__heading">Diğer</div>
                    <Link to="/feedback" className="side-bar__item">
                        <i className="fas fa-comment-dots"></i> Geri Bildirim
                    </Link>

                </div>
            </aside>
        </>
    );
};

export default Sidebar;
