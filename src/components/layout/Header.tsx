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
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoggedIn = !!user;
    const userName = user?.email || user?.userName || "";

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo-container">
                        <Link to="/" className="logo-link">
                            <img src={logoUrl} alt={`${appName} logo`} className="logo" />
                            <h1 className="app-name">{appName}</h1>
                        </Link>
                    </div>
                    <div className="header-right">
                        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                            <ul>
                                <li><Link to="/">Anasayfa</Link></li>
                                {isLoggedIn ? (
                                    <>
                                        <li><Link to="/profile">Profil</Link></li>
                                        <li><Link to="/logout">Çıkış</Link></li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to="/login">Giriş Yap</Link></li>
                                        <li><Link to="/register">Kayıt Ol</Link></li>
                                    </>
                                )}
                            </ul>
                        </nav>
                        {/* Kullanıcı adı sadece login ise göster */}
                        {isLoggedIn && <span className="user-info">{userName}</span>}
                        {/* Mobil menü butonu */}
                        <button
                            onClick={toggleMenu}
                            className="menu-toggle"
                            aria-label="Menüyü Aç/Kapat"
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;