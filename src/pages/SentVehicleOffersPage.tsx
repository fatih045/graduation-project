import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, Clock, User, X, AlertCircle, Loader, Phone, Mail } from 'lucide-react';
import { fetchVehicleOffersBySender, updateVehicleOfferStatus } from '../features/vehicleOffer/vehicleOfferSlice';
import { getUserById } from '../features/user/authSlice';
import { VehicleOfferResponse, OfferStatus } from '../services/vehicleOfferService';
import type { RootState, AppDispatch } from '../store/store';

const SentVehicleOffersPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: userData } = useSelector((state: RootState) => state.auth);
    const { offersBySender, loading, error } = useSelector((state: RootState) => state.vehicleOffer);
    
    const [updateLoading, setUpdateLoading] = useState<{ [key: number]: boolean }>({});
    const [statusMessages, setStatusMessages] = useState<{ [key: number]: { type: 'success' | 'error', message: string } }>({});
    const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({});

    // Add CSS styles for the component
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .select-element {
        -webkit-appearance: menulist;
        -moz-appearance: menulist;
        appearance: menulist;
      }

      .vehicle-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      }
      
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .modal-content {
        background-color: white;
        padding: 30px;
        border-radius: 20px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        position: relative;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #666;
        padding: 5px;
        border-radius: 50%;
        transition: all 0.2s;
      }
      
      .close-button:hover {
        background-color: #f0f0f0;
        color: #333;
      }
      
      .detail-section {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 10px;
      }
      
      .detail-label {
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
        display: block;
      }
      
      .detail-value {
        color: #666;
        font-size: 15px;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        if (userData && (userData.userId || userData.uid)) {
            const userId = userData.userId || userData.uid;
            dispatch(fetchVehicleOffersBySender(userId));
        }
    }, [dispatch, userData]);

    // Fetch user details for each receiver - improved implementation
    useEffect(() => {
        if (!offersBySender || offersBySender.length === 0) return;
        
        const fetchReceiverDetails = async () => {
            const newUserDetails = { ...userDetails };
            const uniqueReceiverIds = [...new Set(offersBySender.map(offer => offer.receiverId))];
            
            const unfetchedIds = uniqueReceiverIds.filter(id => !userDetails[id]);
            if (unfetchedIds.length === 0) return; // Skip if all IDs already fetched
            
            for (const receiverId of unfetchedIds) {
                try {
                    const result = await dispatch(getUserById(receiverId)).unwrap();
                    newUserDetails[receiverId] = result;
                } catch (error) {
                    console.error(`Failed to fetch details for user ${receiverId}:`, error);
                }
            }
            
            setUserDetails(newUserDetails);
        };

        fetchReceiverDetails();
    }, [dispatch, offersBySender]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusTranslation = (status: OfferStatus): string => {
        switch (status) {
            case 'Pending': return 'Beklemede';
            case 'Accepted': return 'Kabul Edildi';
            case 'Rejected': return 'Reddedildi';
            case 'Cancelled': return 'İptal Edildi';
            case 'Expired': return 'Süresi Doldu';
            case 'Completed': return 'Tamamlandı';
            default: return status;
        }
    };

    const getStatusColor = (status: OfferStatus): string => {
        switch (status) {
            case 'Pending': return '#f59e0b'; // Amber
            case 'Accepted': return '#10b981'; // Green
            case 'Rejected': return '#ef4444'; // Red
            case 'Cancelled': return '#6b7280'; // Gray
            case 'Expired': return '#6b7280'; // Gray
            case 'Completed': return '#3b82f6'; // Blue
            default: return '#6b7280'; // Gray
        }
    };

    const handleCancelOffer = (offerId: number) => {
        if (!userData) return;
        
        setUpdateLoading(prev => ({ ...prev, [offerId]: true }));
        setStatusMessages(prev => ({ ...prev, [offerId]: { type: 'success', message: '' } }));
        
        dispatch(updateVehicleOfferStatus({ offerId, status: 'Cancelled' }))
            .unwrap()
            .then(() => {
                setStatusMessages(prev => ({
                    ...prev,
                    [offerId]: {
                        type: 'success',
                        message: 'Teklifiniz iptal edildi!'
                    }
                }));
                // Refresh the list after 1.5 seconds
                setTimeout(() => {
                    if (userData.userId || userData.uid) {
                        dispatch(fetchVehicleOffersBySender(userData.userId || userData.uid));
                        setStatusMessages(prev => {
                            const newMessages = { ...prev };
                            delete newMessages[offerId];
                            return newMessages;
                        });
                    }
                }, 1500);
            })
            .catch((error) => {
                setStatusMessages(prev => ({
                    ...prev,
                    [offerId]: {
                        type: 'error',
                        message: `İşlem sırasında hata oluştu: ${error.message || 'Bilinmeyen hata'}`
                    }
                }));
            })
            .finally(() => {
                setUpdateLoading(prev => ({ ...prev, [offerId]: false }));
            });
    };

    // Component styles
    const pageStyle = {
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '3%',
        backgroundColor: '#f5f7fa',
        fontFamily: 'Arial, sans-serif'
    };

    const containerStyle = {
        width: '100%',
        maxWidth: '1200px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        color: 'white',
        textAlign: 'center' as const
    };

    const titleStyle = {
        fontSize: '32px',
        fontWeight: 'bold' as const,
        marginBottom: '10px'
    };

    const subtitleStyle = {
        fontSize: '16px',
        opacity: 0.9,
        marginBottom: '20px'
    };

    const statsStyle = {
        fontSize: '14px',
        opacity: 0.8
    };

    const contentStyle = {
        padding: '40px'
    };

    const statusBadgeStyle = (status: OfferStatus) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        backgroundColor: `${getStatusColor(status)}20`,
        color: getStatusColor(status)
    });

    const cardStyle = {
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        marginBottom: '25px'
    };

    const cardHeaderStyle = {
        padding: '20px',
        borderBottom: '1px solid #f0f0f0'
    };

    const cardBodyStyle = {
        padding: '20px'
    };

    const buttonBaseStyle = {
        padding: '12px 20px',
        borderRadius: '10px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        gap: '8px',
        transition: 'all 0.3s ease',
        fontSize: '16px'
    };

    const cancelButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#ef4444',
        color: 'white',
    };

    const loadingStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#666'
    };

    const noDataStyle = {
        textAlign: 'center' as const,
        padding: '60px 20px',
        color: '#999'
    };

    if (!userData) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={{...contentStyle, textAlign: 'center'}}>
                        <AlertCircle size={48} style={{color: '#f59e0b', margin: '0 auto 20px'}} />
                        <h2 style={{fontSize: '24px', color: '#333', marginBottom: '10px'}}>
                            Erişim Engellendi
                        </h2>
                        <p style={{color: '#666', marginBottom: '20px'}}>
                            Bu sayfayı görüntülemek için giriş yapmalısınız.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Araç Tekliflerim</h1>
                    <p style={subtitleStyle}>Araçlar için yaptığınız teklifleri ve durumlarını burada görebilirsiniz.</p>
                    <div style={statsStyle}>
                        Toplam Teklif: {offersBySender?.length || 0}
                    </div>
                </div>

                {/* Content */}
                <div style={contentStyle}>
                    {error && (
                        <div style={{
                            padding: '15px',
                            marginBottom: '20px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '10px',
                            color: '#dc2626'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={20} />
                                <span>Teklifler yüklenirken hata oluştu: {error}</span>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div style={loadingStyle}>
                            <Loader className="w-8 h-8 animate-spin mr-3" />
                            <span className="text-lg font-medium">Teklifler yükleniyor...</span>
                        </div>
                    )}

                    {!loading && !error && offersBySender.length === 0 && (
                        <div style={noDataStyle}>
                            <Truck size={64} style={{ color: '#ccc', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#666' }}>
                                Henüz Hiç Teklif Yapmadınız
                            </h3>
                            <p style={{ color: '#999' }}>
                                Araçlar için henüz hiç teklif yapmadınız.
                            </p>
                        </div>
                    )}

                    {!loading && offersBySender.length > 0 && (
                        <div>
                            {offersBySender.map((offer) => (
                                <div key={offer.id} className="vehicle-card" style={cardStyle}>
                                    <div style={cardHeaderStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <div>
                                                <h3 style={{
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    color: '#333',
                                                    margin: 0,
                                                    lineHeight: '1.3'
                                                }}>
                                                    {offer.vehicleAdTitle}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                                                    <Clock size={14} />
                                                    {formatDate(offer.createdDate)}
                                                </div>
                                            </div>
                                            <div style={statusBadgeStyle(offer.status)}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: getStatusColor(offer.status),
                                                    marginRight: '6px'
                                                }}></div>
                                                {getStatusTranslation(offer.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={cardBodyStyle}>
                                        {/* Receiver Information */}
                                        <div className="detail-section">
                                            <span className="detail-label">Teklif Alıcısı</span>
                                            <div className="detail-value">
                                                {userDetails[offer.receiverId] ? (
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                            <User size={16} />
                                                            <span style={{ fontSize: '15px', color: '#374151' }}>
                                                                {userDetails[offer.receiverId].name} {userDetails[offer.receiverId].surname}
                                                            </span>
                                                        </div>
                                                        
                                                        {userDetails[offer.receiverId].phoneNumber && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                                <Phone size={16} />
                                                                <span style={{ fontSize: '15px', color: '#374151' }}>
                                                                    {userDetails[offer.receiverId].phoneNumber}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {userDetails[offer.receiverId].email && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Mail size={16} />
                                                                <span style={{ fontSize: '15px', color: '#374151' }}>
                                                                    {userDetails[offer.receiverId].email}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <User size={16} />
                                                        <span style={{ fontSize: '15px', color: '#6b7280' }}>
                                                            #{offer.receiverId}
                                                        </span>
                                                        <span style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                                                            (Kullanıcı bilgileri yükleniyor...)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="detail-section">
                                            <span className="detail-label">Mesaj</span>
                                            <div className="detail-value">
                                                {offer.message}
                                            </div>
                                        </div>

                                        {statusMessages[offer.id] && (
                                            <div style={{
                                                backgroundColor: statusMessages[offer.id].type === 'success' ? '#d1fae5' : '#fee2e2',
                                                color: statusMessages[offer.id].type === 'success' ? '#047857' : '#b91c1c',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                marginBottom: '16px',
                                                textAlign: 'center' as const,
                                                fontWeight: 'bold' as const
                                            }}>
                                                {statusMessages[offer.id].message}
                                            </div>
                                        )}

                                        {offer.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                                                <button
                                                    style={cancelButtonStyle}
                                                    onClick={() => handleCancelOffer(offer.id)}
                                                    disabled={updateLoading[offer.id]}
                                                >
                                                    {updateLoading[offer.id] ? (
                                                        <Loader size={16} className="animate-spin" />
                                                    ) : (
                                                        <X size={16} />
                                                    )}
                                                    İptal Et
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SentVehicleOffersPage;
