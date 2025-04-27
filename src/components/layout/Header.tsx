import React, { useState } from 'react';
import "../../styles/Header.css";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface HeaderProps {
    appName: string;
    logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({
    appName,
    logoUrl = "/api/placeholder/48/48",
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = !!user;
    const userName = user?.userName || user?.email || "";

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo ve Uygulama Adı */}
                    <div className="logo-container">
                        <a href="/" className="logo-link">
                            <img
                                src={logoUrl}
                                alt={`${appName} logo`}
                                className="logo"
                            />
                            <h1 className="app-name">{appName}</h1>
                        </a>
                    </div>

                    {/* Mobil Menü Butonu */}
                    <div className="mobile-menu-button">
                        <button
                            onClick={toggleMenu}
                            className="menu-toggle"
                        >
                            ☰
                        </button>
                    </div>

                    {/* Menü İçeriği */}
                    <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                        <ul>
                            <li><Link to="/">Anasayfa</Link></li>
                            {/* Login durumuna göre gösterilecek menüler */}
                            {isLoggedIn ? (
                                <>
                                    <li><Link to="/profile">Profil</Link></li>
                                    <li><Link to="/logout">Çıkış</Link></li>
                                    <li className="user-info">{userName}</li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login">Giriş Yap</Link></li>
                                    <li><Link to="/register">Kayıt Ol</Link></li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;