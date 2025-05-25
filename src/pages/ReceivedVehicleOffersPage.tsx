import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, Clock, User, Check, X, AlertCircle, Loader, Phone, Mail } from 'lucide-react';
import { fetchVehicleOffersByReceiver, updateVehicleOfferStatus } from '../features/vehicleOffer/vehicleOfferSlice';
import { getUserById } from '../features/user/authSlice';
import { VehicleOfferResponse, OfferStatus } from '../services/vehicleOfferService';
import type { RootState, AppDispatch } from '../store/store';

const ReceivedVehicleOffersPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user: userData } = useSelector((state: RootState) => state.auth);
    const { offersByReceiver, loading, error } = useSelector((state: RootState) => state.vehicleOffer);
    
    const [updateLoading, setUpdateLoading] = useState<{ [key: number]: boolean }>({});
    const [statusMessages, setStatusMessages] = useState<{ [key: number]: { type: 'success' | 'error', message: string } }>({});
    const [userDetails, setUserDetails] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (userData && (userData.userId || userData.uid)) {
            const userId = userData.userId || userData.uid;
            dispatch(fetchVehicleOffersByReceiver(userId));
        }
    }, [dispatch, userData]);

    // Fetch user details for each sender - improved implementation
    useEffect(() => {
        if (!offersByReceiver || offersByReceiver.length === 0) return;
        
        const fetchSenderDetails = async () => {
            const newUserDetails = { ...userDetails };
            const uniqueSenderIds = [...new Set(offersByReceiver.map(offer => offer.senderId))];
            
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
    }, [dispatch, offersByReceiver]);

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
        
        dispatch(updateVehicleOfferStatus({ offerId, status }))
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
                        dispatch(fetchVehicleOffersByReceiver(userData.userId || userData.uid));
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

    if (!userData) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p>Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
                </div>
            </div>
        );
    }

    // Page styles
    const pageStyle = {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    const headerStyle = {
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e5e7eb',
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e5e7eb',
    };

    const cardHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e5e7eb',
    };

    const statusBadgeStyle = (status: OfferStatus) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '9999px',
        backgroundColor: `${getStatusColor(status)}20`,
        color: getStatusColor(status),
        fontWeight: 500,
        fontSize: '14px',
    });

    const buttonBaseStyle = {
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        gap: '8px',
        transition: 'background-color 0.2s',
    };

    const acceptButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#10b981',
        color: 'white',
    };

    const rejectButtonStyle = {
        ...buttonBaseStyle,
        backgroundColor: '#ef4444',
        color: 'white',
    };

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    Araçlarıma Gelen Teklifler
                </h1>
                <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}>
                    Araçlarınız için gelen teklifleri burada yönetebilirsiniz.
                </p>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader size={32} className="animate-spin mx-auto mb-4" />
                    <p>Teklifler yükleniyor...</p>
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                }}>
                    <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
                    {error}
                </div>
            )}

            {!loading && !error && offersByReceiver.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #d1d5db',
                }}>
                    <Truck size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Henüz Hiç Teklif Yok
                    </h3>
                    <p style={{ color: '#6b7280' }}>
                        Araçlarınız için henüz hiç teklif almadınız.
                    </p>
                </div>
            )}

            {!loading && offersByReceiver.length > 0 && (
                <div>
                    {offersByReceiver.map((offer) => (
                        <div key={offer.id} style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                                        {offer.vehicleAdTitle}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                                            <Clock size={16} />
                                            {formatDate(offer.createdDate)}
                                        </div>
                                    </div>
                                </div>
                                <div style={statusBadgeStyle(offer.status)}>
                                    {getStatusTranslation(offer.status)}
                                </div>
                            </div>

                            {/* Sender Information */}
                            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                                    Teklif Veren:
                                </p>
                                
                                {userDetails[offer.senderId] ? (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <User size={16} />
                                            <span style={{ fontSize: '15px', color: '#374151' }}>
                                                {userDetails[offer.senderId].name} {userDetails[offer.senderId].surname}
                                            </span>
                                        </div>
                                        
                                        {userDetails[offer.senderId].phoneNumber && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Phone size={16} />
                                                <span style={{ fontSize: '15px', color: '#374151' }}>
                                                    {userDetails[offer.senderId].phoneNumber}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {userDetails[offer.senderId].email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Mail size={16} />
                                                <span style={{ fontSize: '15px', color: '#374151' }}>
                                                    {userDetails[offer.senderId].email}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} />
                                        <span style={{ fontSize: '15px', color: '#6b7280' }}>
                                            #{offer.senderId}
                                        </span>
                                        <span style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                                            (Kullanıcı bilgileri yükleniyor...)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '16px', color: '#111827', marginBottom: '8px' }}>
                                    <strong>Mesaj:</strong>
                                </p>
                                <p style={{ fontSize: '16px', color: '#4b5563', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                                    {offer.message}
                                </p>
                            </div>

                            {statusMessages[offer.id] && (
                                <div style={{
                                    backgroundColor: statusMessages[offer.id].type === 'success' ? '#d1fae5' : '#fee2e2',
                                    color: statusMessages[offer.id].type === 'success' ? '#047857' : '#b91c1c',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    marginBottom: '16px',
                                }}>
                                    {statusMessages[offer.id].message}
                                </div>
                            )}

                            {offer.status === 'Pending' && (
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        style={acceptButtonStyle}
                                        onClick={() => handleUpdateStatus(offer.id, 'Accepted')}
                                        disabled={updateLoading[offer.id]}
                                    >
                                        {updateLoading[offer.id] ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        Kabul Et
                                    </button>
                                    <button
                                        style={rejectButtonStyle}
                                        onClick={() => handleUpdateStatus(offer.id, 'Rejected')}
                                        disabled={updateLoading[offer.id]}
                                    >
                                        {updateLoading[offer.id] ? (
                                            <Loader size={16} className="animate-spin" />
                                        ) : (
                                            <X size={16} />
                                        )}
                                        Reddet
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReceivedVehicleOffersPage;
