import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/store';
import { getUserById } from '../features/user/authSlice';

const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    
    // Redux store'dan kullanıcı bilgilerini al
    const user = useAppSelector(state => state.auth.user);
    const token = useAppSelector(state => state.auth.token);
    const error = useAppSelector(state => state.auth.error);
    
    // Kullanıcı bilgileri için state
    const [userDetails, setUserDetails] = useState({
        name: user?.firstName || '',
        surname: user?.lastName || '',
        birthYear: user?.birthYear || 0,
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || ''
    });
    
    // Sayfa yüklendiğinde kullanıcı bilgilerini getir
    useEffect(() => {
        if (user?.uid) {
            dispatch(getUserById(user.uid));
        }
    }, [dispatch, user?.uid]);
    
    // Kullanıcı bilgileri güncellendiğinde state'i güncelle
    useEffect(() => {
        if (user) {
            setUserDetails({
                name: user.firstName || user.name || '',
                surname: user.lastName || user.surname || '',
                birthYear: user.birthYear || 2001,
                email: user.email || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);
    
    // İsmin ilk harfini al (profil simgesi için)
    const getInitial = () => {
        return userDetails.name ? userDetails.name.charAt(0).toUpperCase() : '?';
    };
    
    // Rastgele bir arka plan rengi seç
    const getRandomColor = () => {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];
        
        // İsmin ilk harfine göre sabit bir renk seç (aynı harf hep aynı renk olsun)
        const charCode = getInitial().charCodeAt(0);
        return colors[charCode % colors.length];
    };
    
    // Kullanıcı giriş yapmamışsa uyarı göster
    if (!user || !token) {
        return (
            <div style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                padding: '3%',
                backgroundColor: '#f5f7fa',
                fontFamily: 'Arial, sans-serif'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '40px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            marginBottom: '10px'
                        }}>Profil Sayfası</h1>
                        <p style={{
                            fontSize: '16px',
                            opacity: 0.9,
                            marginBottom: '20px'
                        }}>Profil bilgilerinizi görüntülemek için giriş yapın</p>
                    </div>

                    <div style={{ padding: '40px' }}>
                        <div style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            Profil bilgilerinizi görüntülemek için giriş yapmanız gerekiyor!
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            padding: '3%',
            backgroundColor: '#f5f7fa',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {/* Header with gradient background */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '40px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}>Profil Bilgilerim</h1>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        marginBottom: '20px'
                    }}>Kişisel bilgilerinizi görüntüleyin</p>
                </div>
                
                <div style={{ 
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            Hata: {error}
                        </div>
                    )}
                    
                    {/* Profil Avatar */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        background: getRandomColor(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '30px',
                        fontSize: '60px',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                    }}>
                        {getInitial()}
                    </div>
                    
                    {/* Profil Bilgileri */}
                    <div style={{
                        width: '100%',
                        maxWidth: '600px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '15px',
                        padding: '30px',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '25px',
                            color: '#333',
                            textAlign: 'center'
                        }}>Kişisel Bilgiler</h2>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '20px'
                        }}>
                            {/* Ad */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}>
                                <label style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#666'
                                }}>Ad</label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    fontSize: '18px',
                                    color: '#333'
                                }}>
                                    {userDetails.name || 'Fatih'}
                                </div>
                            </div>
                            
                            {/* Soyad */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}>
                                <label style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#666'
                                }}>Soyad</label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    fontSize: '18px',
                                    color: '#333'
                                }}>
                                    {userDetails.surname || 'Çınar'}
                                </div>
                            </div>
                            
                            {/* Doğum Yılı */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}>
                                <label style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#666'
                                }}>Doğum Yılı</label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    fontSize: '18px',
                                    color: '#333'
                                }}>
                                    {userDetails.birthYear || '2001'}
                                </div>
                            </div>
                            
                            {/* E-posta */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}>
                                <label style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#666'
                                }}>E-posta</label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    fontSize: '18px',
                                    color: '#333'
                                }}>
                                    {userDetails.email || 'fatih@example.com'}
                                </div>
                            </div>
                            
                            {/* Telefon Numarası */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}>
                                <label style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#666'
                                }}>Telefon Numarası</label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    fontSize: '18px',
                                    color: '#333'
                                }}>
                                    {userDetails.phoneNumber || '5074270704'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
