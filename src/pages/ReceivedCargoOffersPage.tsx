import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  Clock, User, Check, X, AlertCircle, Loader, Phone, Mail, Package } from 'lucide-react';
import { fetchOffersByReceiver, updateCargoOfferStatus } from '../features/cargoOffer/cargoOfferSlice';
import { getUserById } from '../features/user/authSlice';
import { OfferStatus } from '../services/cargoOfferService';
import type { RootState, AppDispatch } from '../store/store';

const ReceivedCargoOffersPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user: userData } = useSelector((state: RootState) => state.auth);
    const { offers, loading, error } = useSelector((state: RootState) => state.cargoOffer);
    
    const [updateLoading, setUpdateLoading] = useState<{ [key: number]: boolean }>({});
    const [statusMessages, setStatusMessages] = useState<{ [key: number]: { type: 'success' | 'error', message: string } }>({});
    const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({});
    const [expandedOffer, setExpandedOffer] = useState<number | null>(null);

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
            dispatch(fetchOffersByReceiver({
                receiverId: userId,
                adminStatus: 1 // Sadece kabul edilmiş teklifleri getir (adminStatus=1)
            }));
        }
    }, [dispatch, userData]);

    useEffect(() => {
        if (!offers || offers.length === 0) return;
        
        const fetchSenderDetails = async () => {
            const newUserDetails = { ...userDetails };
            const uniqueSenderIds = [...new Set(offers.map(offer => offer.senderId))];
            
            const unfetchedIds = uniqueSenderIds.filter(id => !userDetails[id]);
            if (unfetchedIds.length === 0) return; // Skip if all IDs already fetched
            
            for (const senderId of unfetchedIds) {
                try {
                    const result = await dispatch(getUserById(senderId)).unwrap();
                    newUserDetails[senderId] = result;
                } catch (error) {
                    console.error(`Failed to fetch details for user ${senderId}:`, error);
                }
            }
            
            setUserDetails(newUserDetails);
        };

        fetchSenderDetails();
    }, [dispatch, offers]);

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

    const handleUpdateStatus = (offerId: number, status: OfferStatus) => {
        if (!userData) return;
        
        setUpdateLoading(prev => ({ ...prev, [offerId]: true }));
        setStatusMessages(prev => ({ ...prev, [offerId]: { type: 'success', message: '' } }));
        
        dispatch(updateCargoOfferStatus({ offerId, status }))
            .unwrap()
            .then(() => {
                setStatusMessages(prev => ({
                    ...prev,
                    [offerId]: {
                        type: 'success',
                        message: status === 'Accepted' ? 'Teklif kabul edildi!' : 'Teklif reddedildi!'
                    }
                }));
                // Refresh the list after 1.5 seconds
                setTimeout(() => {
                    if (userData.userId || userData.uid) {
                        dispatch(fetchOffersByReceiver(userData.userId || userData.uid));
                        setStatusMessages(prev => {
                            const newMessages = { ...prev };
                            delete newMessages[offerId];
                            return newMessages;
                        });
                    }
                }, 1500);
            })
            .catch(err => {
                console.error('Error updating offer status:', err);
                setStatusMessages(prev => ({
                    ...prev,
                    [offerId]: {
                        type: 'error',
                        message: 'İşlem sırasında bir hata oluştu.'
                    }
                }));
            })
            .finally(() => {
                setUpdateLoading(prev => {
                    const newLoading = { ...prev };
                    delete newLoading[offerId];
                    return newLoading;
                });
            });
    };
    
    const toggleOfferDetails = (offerId: number) => {
        setExpandedOffer(current => current === offerId ? null : offerId);
    };

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
        marginBottom: '25px',
        border: '1px solid #eee'
    };

    const cardHeaderStyle = {
        padding: '20px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#f8fafc'
    };

    const cardBodyStyle = {
        padding: '20px'
    };

    const buttonBaseStyle = {
        padding: '8px 16px',
        borderRadius: '10px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        gap: '8px',
        transition: 'all 0.3s ease',
    };

    const acceptButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#10b981',
        color: 'white',
        padding: '12px 20px',
        fontSize: '16px',
    };

    const rejectButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '12px 20px',
        fontSize: '16px',
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

    const cargoDetailsStyle = {
        backgroundColor: '#f0f9ff',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '20px',
        borderLeft: '4px solid #0284c7'
    };

    const userInfoStyle = {
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '20px'
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
                    <h1 style={titleStyle}>Yüklerime Gelen Teklifler</h1>
                    <p style={subtitleStyle}>Yükleriniz için gelen teklifleri burada yönetebilirsiniz.</p>
                    <div style={statsStyle}>
                        Toplam Teklif: {offers?.length || 0}
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
                            <Loader size={32} className="animate-spin mr-3" />
                            <span style={{fontSize: '18px', fontWeight: 500}}>Teklifler yükleniyor...</span>
                        </div>
                    )}

                    {!loading && !error && (!offers || offers.length === 0) && (
                        <div style={noDataStyle}>
                            <Package size={64} style={{ color: '#ccc', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#666' }}>
                                Henüz Hiç Teklif Yok
                            </h3>
                            <p style={{ color: '#999' }}>
                                Henüz gelen yük teklifiniz bulunmamaktadır. İlanlara göz atarak yük sahibi olarak teklifler alabilirsiniz.
                            </p>
                        </div>
                    )}

                    {/* List of offers */}
                    {!loading && offers && offers.length > 0 && (
                        <div>
                            {offers.map((offer) => {
                                const sender = userDetails[offer.senderId];
                                const isExpanded = expandedOffer === offer.id;
                                
                                return (
                                    <div 
                                        key={offer.id} 
                                        className="vehicle-card"
                                        style={{
                                            ...cardStyle,
                                            borderLeft: `5px solid ${getStatusColor(offer.status)}`
                                        }}
                                    >
                                        <div style={cardHeaderStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <span style={statusBadgeStyle(offer.status)}>
                                                        {offer.status === 'Pending' && <Clock size={14} style={{ marginRight: '5px' }} />}
                                                        {offer.status === 'Accepted' && <Check size={14} style={{ marginRight: '5px' }} />}
                                                        {offer.status === 'Rejected' && <X size={14} style={{ marginRight: '5px' }} />}
                                                        {getStatusTranslation(offer.status)}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                                        {offer.price.toLocaleString('tr-TR')} ₺
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                                                        <Clock size={14} style={{ display: 'inline-block', marginRight: '5px', verticalAlign: 'middle' }} />
                                                        Teklif Tarihi: {formatDate(offer.createdDate)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={cardBodyStyle}>
                                            {/* Cargo Ad Details */}
                                            <div style={cargoDetailsStyle}>
                                                <div style={{ fontWeight: 'bold', color: '#0284c7', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                                    <Package size={18} style={{ marginRight: '8px' }} />
                                                    <span>Yük İlanı: {offer.cargoAdTitle}</span>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#6b7280' }}>İlan #: {offer.cargoAdId}</p>
                                            </div>
                                            
                                            {/* Offer sender info */}
                                            <div style={userInfoStyle}>
                                                <h3 style={{ fontWeight: 'bold', color: '#4b5563', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                                    <User size={18} style={{ marginRight: '8px' }} />
                                                    Teklif Veren
                                                </h3>
                                                {sender ? (
                                                    <div style={{ fontSize: '14px' }}>
                                                        <p style={{ fontWeight: '500', marginBottom: '8px' }}>{sender.firstName} {sender.lastName}</p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                            <a 
                                                                href={`tel:${sender.phoneNumber}`} 
                                                                style={{ color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                                            >
                                                                <Phone size={14} style={{ marginRight: '5px' }} />
                                                                {sender.phoneNumber}
                                                            </a>
                                                            <a 
                                                                href={`mailto:${sender.email}`} 
                                                                style={{ color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                                                            >
                                                                <Mail size={14} style={{ marginRight: '5px' }} />
                                                                {sender.email}
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Yükleniyor...</p>
                                                )}
                                            </div>
                                            
                                            {/* Message section */}
                                            {offer.message && (
                                                <div style={{ marginBottom: '20px' }}>
                                                    <button 
                                                        onClick={() => toggleOfferDetails(offer.id)}
                                                        style={{ color: '#2563eb', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                                                    >
                                                        {isExpanded ? 'Mesajı Gizle' : 'Mesajı Göster'}
                                                    </button>
                                                    
                                                    {isExpanded && (
                                                        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '10px' }}>
                                                            <p style={{ color: '#4b5563', whiteSpace: 'pre-line' }}>{offer.message}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Action buttons */}
                                            {offer.status === 'Pending' && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                                    {statusMessages[offer.id] && (
                                                        <div 
                                                            style={{
                                                                marginRight: 'auto',
                                                                fontSize: '14px',
                                                                color: statusMessages[offer.id].type === 'success' ? '#059669' : '#dc2626'
                                                            }}
                                                        >
                                                            {statusMessages[offer.id].message}
                                                        </div>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleUpdateStatus(offer.id, 'Rejected')}
                                                        disabled={!!updateLoading[offer.id]}
                                                        style={rejectButtonStyle}
                                                    >
                                                        {updateLoading[offer.id] ? (
                                                            <Loader size={16} className="animate-spin mr-2" />
                                                        ) : (
                                                            <X size={16} style={{ marginRight: '5px' }} />
                                                        )}
                                                        Reddet
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleUpdateStatus(offer.id, 'Accepted')}
                                                        disabled={!!updateLoading[offer.id]}
                                                        style={acceptButtonStyle}
                                                    >
                                                        {updateLoading[offer.id] ? (
                                                            <Loader size={16} className="animate-spin mr-2" />
                                                        ) : (
                                                            <Check size={16} style={{ marginRight: '5px' }} />
                                                        )}
                                                        Kabul Et
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceivedCargoOffersPage;
