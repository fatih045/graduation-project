import React, { useState } from 'react';

import "../../styles/Header.css";

interface HeaderProps {
    appName: string;
    logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ appName, logoUrl  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                                <li>
                                    <a href="/login" className="login-link">
                                        Giriş Yap
                                    </a>
                                </li>
                                <li>
                                    <a href="/register" className="register-button">
                                        Kayıt Ol
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Mobil Menü */}
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <nav>
                            <ul className="mobile-nav-list">
                                <li>
                                    <a href="/login" className="mobile-login-link">
                                        Giriş Yap
                                    </a>
                                </li>
                                <li>
                                    <a href="/register" className="mobile-register-button">
                                        Kayıt Ol
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;