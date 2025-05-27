import React, { useState, useEffect, useRef } from 'react';
import "../../styles/Header.css";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import NotificationPopup from '../notification/NotificationPopup';
import { fetchNotifications } from '../../features/notification/notificationSlice';

interface HeaderProps {
    appName: string;
    logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({
    appName,
    logoUrl = "/api/placeholder/48/48",
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    
    const user = useSelector((state: RootState) => state.auth.user);
    const { notifications } = useSelector((state: RootState) => state.notification);
    const isLoggedIn = !!user;
    const userName = user?.email || user?.userName || "";
    
    const unreadCount = notifications.filter(item => !item.isRead).length;

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchNotifications() as any);
        }
    }, [isLoggedIn, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
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
                        
                        {/* Bildirim ikonu */}
                        {isLoggedIn && (
                            <div className="notification-container" ref={notificationRef}>
                                <button 
                                    className="notification-icon" 
                                    onClick={toggleNotifications}
                                    aria-label="Bildirimleri Göster"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </button>
                                <NotificationPopup 
                                    isVisible={showNotifications} 
                                    onClose={() => setShowNotifications(false)} 
                                    position="dropdown"
                                />
                            </div>
                        )}
                        
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