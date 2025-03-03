import React, { useState } from 'react';
import "../../styles/Header.css";
import { Link } from 'react-router-dom';



interface HeaderProps {
    appName: string;
    logoUrl?: string;
    isLoggedIn?: boolean;
    userName?: string;
}

const Header: React.FC<HeaderProps> = ({
                                           appName,
                                           logoUrl = "/api/placeholder/48/48",
                                           isLoggedIn = false,
                                           userName = ""
                                       }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
                            <svg
                                className="hamburger-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Masaüstü Kullanıcı İşlemleri */}
                    <div className="desktop-nav">
                        <nav>
                            <ul className="nav-list">
                                {!isLoggedIn ? (
                                    // Kullanıcı giriş yapmamışsa
                                    <>
                                        <li>
                                            <Link to="/login" className="login-link">
                                                Giriş Yap
                                            </Link>
                                        </li>
                                        <li>
                                           <Link to="/register" className="register-button">
                                                Kayıt Ol
                                             </Link>
                                        </li>
                                    </>
                                ) : (
                                    // Kullanıcı giriş yapmışsa
                                    <li className="profile-dropdown-container">
                                        <button onClick={toggleProfileMenu} className="profile-button">
                                            <span className="user-name">{userName}</span>
                                            <svg
                                                className="dropdown-icon"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </button>

                                        {isProfileMenuOpen && (
                                            <div className="profile-dropdown">
                                                <ul className="profile-menu">
                                                    <li>
                                                        <Link to="/profile" className="profile-link">
                                                            Profil
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/settings" className="profile-link">
                                                            Ayarlar
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/logout" className="profile-link">
                                                            Çıkış Yap
                                                     </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                )}
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Mobil Menü */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <nav>
                            <ul className="mobile-nav-list">
                                {!isLoggedIn ? (
                                    // Kullanıcı giriş yapmamışsa
                                    <>
                                        <li>
                                            <Link to="/login" className="login-link">
                                                Giriş Yap
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/register" className="register-button">
                                                Kayıt Ol
                                            </Link>
                                        </li>
                                    </>
                                ) : (
                                    // Kullanıcı giriş yapmışsa
                                    <>
                                        <li>
                                            <span className="mobile-user-name">{userName}</span>
                                        </li>
                                        <li>
                                            <Link to="/profile" className="profile-link">
                                                Profil
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/settings" className="profile-link">
                                                Ayarlar
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/logout" className="profile-link">
                                                Çıkış Yap
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;