import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Truck, Users, MapPin, Loader, AlertCircle, User, Eye, Filter, Search, Mail, Phone } from 'lucide-react';
import { fetchAllVehicleAds, VehicleAd } from '../features/vehicle/vehicleAdSlice';
import { getCarrierDetails } from '../features/user/authSlice';
import type { RootState, AppDispatch } from '../store/store';
import { createVehicleOffer } from '../features/vehicleOffer/vehicleOfferSlice';
import { VEHICLE_AD_STATUS } from '../services/vehicleAdService';

const VehicleAdsList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vehicleAds, loading, error } = useSelector((state: RootState) => state.vehicleAd);
    const { user: userData } = useSelector((state: RootState) => state.auth);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterByType, setFilterByType] = useState<string>('all');
    const [filterByAvailability, setFilterByAvailability] = useState<string>('all');

    // Modal state
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [carrierDetails, setCarrierDetails] = useState<any>(null);
    
    // Offer form state
    const [showOfferForm, setShowOfferForm] = useState<boolean>(false);
    const [offerMessage, setOfferMessage] = useState<string>('');
    const [offerSubmitting, setOfferSubmitting] = useState<boolean>(false);
    const [offerSuccess, setOfferSuccess] = useState<boolean>(false);
    const [offerError, setOfferError] = useState<string | null>(null);

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
        // Sadece status değeri 1 (onaylanmış) olan araç ilanlarını getir
        dispatch(fetchAllVehicleAds(VEHICLE_AD_STATUS.ACCEPTED));
    }, [dispatch]);
    const getVehicleIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'truck':
            case 'trailer':
                return <Truck className="w-6 h-6 text-blue-600" />;
            default:
                return <Truck className="w-6 h-6 text-green-600" />;
        }
    };

    const getAvailabilityStatus = (vehicleId: number) => {
        // Mock availability based on vehicle ID for consistency
        return vehicleId % 3 !== 0; // 2/3 will be available
    };

    // Get unique vehicle types for filter
    const vehicleTypes = React.useMemo(() => {
        const types = [...new Set(vehicleAds?.map(vehicle => vehicle.vehicleType).filter(Boolean))];
        return types;
    }, [vehicleAds]);

    // Filtering and sorting
    const filteredAndSortedVehicles = React.useMemo(() => {
        if (!vehicleAds) return [];

        let result = [...vehicleAds];

        // Search filter
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.title?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.description?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.vehicleType?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.carrierId?.toString().includes(lowercasedSearch)

            );
        }

        // Availability filter
        if (filterByAvailability !== 'all') {
            result = result.filter(vehicle => {
                const isAvailable = getAvailabilityStatus(vehicle.id);
                if (filterByAvailability === 'available') return isAvailable;
                if (filterByAvailability === 'unavailable') return !isAvailable;
                return true;
            });
        }

        // Type filter
        if (filterByType !== 'all') {
            result = result.filter(vehicle => vehicle.vehicleType === filterByType);
        }

        // Sort
        result.sort((a, b) => {
            if (['id', 'capacity', 'carrierId', 'pickUpLocationId'].includes(sortBy)) {
                const aValue = a[sortBy as keyof typeof a] as number || 0;
                const bValue = b[sortBy as keyof typeof b] as number || 0;
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (['title', 'vehicleType', 'description'].includes(sortBy)) {
                const aValue = String(a[sortBy as keyof typeof a] || '');
                const bValue = String(b[sortBy as keyof typeof b] || '');
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return result;
    }, [vehicleAds, searchTerm, sortBy, sortOrder, filterByAvailability, filterByType]);

    const handleViewDetails = (vehicle: VehicleAd) => {
        setSelectedVehicle(vehicle);
        setShowDetailModal(true);
        setShowOfferForm(false);
        setOfferSuccess(false);
        setOfferError(null);

        // If vehicle has carrierId, fetch carrier details
        if (vehicle.carrierId) {
            dispatch(getCarrierDetails(vehicle.carrierId.toString()))
                .unwrap()
                .then((userData) => {
                    setCarrierDetails(userData);
                })
                .catch((error) => {
                    console.error('Failed to fetch carrier details:', error);
                });
        } else {
            setCarrierDetails(null);
        }
    };

    // Handle offer submission
    const handleSubmitOffer = () => {
        if (!userData || !selectedVehicle || !carrierDetails) return;
        
        if (!offerMessage) {
            setOfferError('Lütfen bir mesaj girin.');
            return;
        }

        setOfferSubmitting(true);
        setOfferError(null);

        // Create expiry date (14 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14);

        // Debugging
        console.log("Current user:", userData);

        const offerData = {
            senderId: userData.userId || userData.uid, // Try both possible locations for the user ID
            receiverId: selectedVehicle.carrierId,
            vehicleAdId: selectedVehicle.id,
            message: offerMessage,
            expiryDate: expiryDate.toISOString()
        };

        // Log the data for debugging
        console.log("Sending vehicle offer data:", offerData);

        dispatch(createVehicleOffer(offerData))
            .unwrap()
            .then((result) => {
                console.log("Vehicle offer created successfully:", result);
                setOfferSuccess(true);
                setShowOfferForm(false);
                setOfferMessage('');
            })
            .catch((error) => {
                console.error("Error creating vehicle offer:", error);
                setOfferError(error.message || 'Teklif gönderilirken bir hata oluştu.');
            })
            .finally(() => {
                setOfferSubmitting(false);
            });
    };

    // Format date for Turkish time (UTC+3)
    const formatDateToTurkish = (dateString: string) => {
        if (!dateString) return '';
        
        // Parse the date string
        const date = new Date(dateString);
        
        // Adjust for Turkish time (UTC+3)
        const turkishDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
        
        // Format the date
        return turkishDate.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const inputStyle = {
        padding: '15px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        width: '100%',
        boxSizing: 'border-box' as const,
        marginBottom: '20px'
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap' as const,
        alignItems: 'center'
    };

    const selectStyle = {
        padding: '12px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        minWidth: '150px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px',
        marginTop: '20px'
    };

    const cardStyle = {
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    };

    const cardHeaderStyle = {
        padding: '20px',
        borderBottom: '1px solid #f0f0f0'
    };

    const cardBodyStyle = {
        padding: '20px'
    };

    const statusBadgeStyle = (isAvailable: boolean) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        backgroundColor: isAvailable ? '#d1fae5' : '#fee2e2',
        color: isAvailable ? '#059669' : '#dc2626'
    });

    const noDataStyle = {
        textAlign: 'center' as const,
        padding: '60px 20px',
        color: '#999'
    };

    const loadingStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#666'
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={loadingStyle}>
                        <Loader className="w-8 h-8 animate-spin mr-3" />
                        <span className="text-lg font-medium">Araç ilanları yükleniyor...</span>
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
                    <h1 style={titleStyle}>Araç İlanları</h1>
                    <p style={subtitleStyle}>Mevcut araç ilanlarını inceleyin</p>
                    <div style={statsStyle}>
                        Toplam İlan: {filteredAndSortedVehicles.length} / {vehicleAds?.length || 0}
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
                                <span>İlanlar yüklenirken hata oluştu: {error}</span>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <Search size={20} style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#999'
                        }} />
                        <input
                            type="text"
                            placeholder="Arama yap... (Başlık, Açıklama, Tip, Taşıyıcı ID)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{...inputStyle, paddingLeft: '45px'}}
                        />
                    </div>

                    {/* Filters */}
                    <div style={filterContainerStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} />
                            <span style={{ fontSize: '14px', color: '#666' }}>Filtreler:</span>
                        </div>

                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder as 'asc' | 'desc');
                            }}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="id-desc">En Yeni</option>
                            <option value="id-asc">En Eski</option>
                            <option value="capacity-desc">Kapasite (Büyük-Küçük)</option>
                            <option value="capacity-asc">Kapasite (Küçük-Büyük)</option>
                            <option value="title-asc">Başlık (A-Z)</option>
                            <option value="title-desc">Başlık (Z-A)</option>

                        </select>

                        <select
                            value={filterByAvailability}
                            onChange={(e) => setFilterByAvailability(e.target.value)}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="available">Müsait Araçlar</option>
                            <option value="unavailable">Müsait Olmayan</option>
                        </select>

                        <select
                            value={filterByType}
                            onChange={(e) => setFilterByType(e.target.value)}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="all">Tüm Tipler</option>
                            {vehicleTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Grid */}
                    {filteredAndSortedVehicles.length === 0 ? (
                        <div style={noDataStyle}>
                            <Truck size={64} style={{ color: '#ccc', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#666' }}>
                                Araç İlanı Bulunamadı
                            </h3>
                            <p style={{ color: '#999' }}>
                                Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {filteredAndSortedVehicles.map((vehicle) => {
                                const isAvailable = getAvailabilityStatus(vehicle.id);
                                return (
                                    <div
                                        key={vehicle.id}
                                        className="vehicle-card"
                                        style={cardStyle}
                                        onClick={() => handleViewDetails(vehicle)}
                                    >
                                        {/* Card Header */}
                                        <div style={cardHeaderStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {getVehicleIcon(vehicle.vehicleType)}
                                                    <div>
                                                        <h3 style={{
                                                            fontSize: '18px',
                                                            fontWeight: 'bold',
                                                            color: '#333',
                                                            margin: 0,
                                                            lineHeight: '1.3'
                                                        }}>
                                                            {vehicle.title}
                                                        </h3>
                                                        <div style={statusBadgeStyle(isAvailable)}>
                                                            <div style={{
                                                                width: '6px',
                                                                height: '6px',
                                                                borderRadius: '50%',
                                                                backgroundColor: isAvailable ? '#059669' : '#dc2626',
                                                                marginRight: '6px'
                                                            }}></div>
                                                            {isAvailable ? 'Müsait' : 'Müsait Değil'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {vehicle.description && (
                                                <p style={{
                                                    fontSize: '14px',
                                                    color: '#666',
                                                    margin: '8px 0 0',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {vehicle.description.length > 80
                                                        ? `${vehicle.description.substring(0, 80)}...`
                                                        : vehicle.description
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div style={cardBodyStyle}>
                                            {/* Vehicle Info */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Users size={14} style={{ color: '#4a6cf7' }} />
                                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a6cf7' }}>
                                                        {vehicle.capacity?.toLocaleString() || '0'} Ton
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Truck size={14} style={{ color: '#666' }} />
                                                    <span style={{ fontSize: '14px', color: '#666' }}>
                                                        {vehicle.vehicleType}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Planlanan Tarih */}
                                            {vehicle.adDate && (
                                                <div style={{ 
                                                    marginBottom: '15px',
                                                    padding: '8px',
                                                    backgroundColor: '#f0f7ff',
                                                    borderRadius: '6px',
                                                    fontSize: '13px'
                                                }}>
                                                    <div style={{ fontWeight: 'bold', color: '#4a6cf7', marginBottom: '3px' }}>
                                                        Planlanan Tarih
                                                    </div>
                                                    <div style={{ color: '#333' }}>
                                                        {formatDateToTurkish(vehicle.adDate)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* IDs */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: '#f8f9fa',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                marginBottom: '15px'
                                            }}>

                                                <div style={{ margin: '0 10px', color: '#4a6cf7' }}>|</div>
                                                <div style={{ textAlign: 'center', flex: 1 }}>
                                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Lokasyon </div>
                                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                                        {vehicle.city}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    color: '#4a6cf7',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    <Eye size={14} />
                                                    Detayları Gör
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedVehicle && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
                                Araç Detayları
                            </h2>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedVehicle(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ lineHeight: '1.6' }}>
                            {/* Title and Type */}
                            <div className="detail-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <span className="detail-label">Araç Başlığı</span>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                                            {selectedVehicle.title}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="detail-label">Araç Tipi</span>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4a6cf7' }}>
                                            {selectedVehicle.vehicleType}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedVehicle.description && (
                                <div className="detail-section">
                                    <span className="detail-label">Açıklama</span>
                                    <div className="detail-value">{selectedVehicle.description}</div>
                                </div>
                            )}

                            {/* Capacity */}
                            <div className="detail-section">
                                <span className="detail-label">Taşıma Kapasitesi</span>
                                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} />
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4a6cf7' }}>
                                        {selectedVehicle.capacity?.toLocaleString() || '0'} Ton
                                    </span>
                                </div>
                            </div>

                            {/* Planlanan Tarih */}
                            {selectedVehicle.adDate && (
                                <div className="detail-section">
                                    <span className="detail-label" style={{ color: '#4a6cf7' }}>Planlanan Tarih</span>
                                    <div className="detail-value" style={{ 
                                        fontSize: '16px', 
                                        fontWeight: 'bold',
                                        color: '#333',
                                        backgroundColor: '#f0f7ff',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        display: 'inline-block'
                                    }}>
                                        {formatDateToTurkish(selectedVehicle.adDate)}
                                    </div>
                                </div>
                            )}

                            {/* IDs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="detail-section">
                                    <span className="detail-label">Lokasyon </span>
                                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} />
                                        {selectedVehicle.city}
                                    </div>
                                </div>


                            </div>

                            {/* Carrier Details */}
                            <div className="detail-section">
                                <span className="detail-label">Taşıyıcı Bilgileri</span>
                                <div className="detail-value">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <User size={16} />
                                        {carrierDetails?.name ? `${carrierDetails.name} ${carrierDetails.surname}` : `#${selectedVehicle.carrierId}`}
                                    </div>
                                    {carrierDetails && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Phone size={16} />
                                                {carrierDetails.phoneNumber || 'Telefon bilgisi yok'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Mail size={16} />
                                                {carrierDetails.email || 'E-posta bilgisi yok'}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Availability Status */}
                            <div className="detail-section">
                                <span className="detail-label">Müsaitlik Durumu</span>
                                <div style={statusBadgeStyle(getAvailabilityStatus(selectedVehicle.id))}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: getAvailabilityStatus(selectedVehicle.id) ? '#059669' : '#dc2626',
                                        marginRight: '8px'
                                    }}></div>
                                    {getAvailabilityStatus(selectedVehicle.id) ? 'Şu anda müsait' : 'Şu anda müsait değil'}
                                </div>
                            </div>
                            
                            {/* Make Offer Button - only show for other users' vehicles and if available */}
                            {userData && 
                             selectedVehicle.carrierId && 
                             userData.userId !== selectedVehicle.carrierId && 
                             userData.uid !== selectedVehicle.carrierId && 
                             getAvailabilityStatus(selectedVehicle.id) && (
                                <div className="detail-section" style={{ marginTop: '20px' }}>
                                    {!showOfferForm && !offerSuccess && (
                                        <button
                                            onClick={() => setShowOfferForm(true)}
                                            style={{
                                                backgroundColor: '#4a6cf7',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '12px 20px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                width: '100%',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3451b2'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a6cf7'}
                                        >
                                            Teklif Ver
                                        </button>
                                    )}
                                    
                                    {offerSuccess && (
                                        <div style={{ 
                                            backgroundColor: 'white', 
                                            color: 'red', 
                                            padding: '15px', 
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            border: '1px solid #ddd'
                                        }}>
                                            <p>Araç teklifiniz moderatör onayına gönderildi.</p>
                                            <p>İncelendikten sonra yayınlanacaktır.</p>
                                            <p>İlanınızın durumunu "Araç tekliflerim" sayfasından takip edebilirsiniz.</p>
                                        </div>
                                    )}
                                    
                                    {showOfferForm && (
                                        <div style={{ marginTop: '15px' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Teklif Detayları</h3>
                                            
                                            {offerError && (
                                                <div style={{ 
                                                    backgroundColor: '#fee2e2', 
                                                    color: '#dc2626', 
                                                    padding: '10px', 
                                                    borderRadius: '8px',
                                                    marginBottom: '15px',
                                                    fontSize: '14px'
                                                }}>
                                                    {offerError}
                                                </div>
                                            )}
                                            
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ 
                                                    display: 'block', 
                                                    marginBottom: '5px', 
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#333'
                                                }}>
                                                    Mesaj
                                                </label>
                                                <textarea
                                                    value={offerMessage}
                                                    onChange={(e) => setOfferMessage(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ddd',
                                                        fontSize: '16px',
                                                        minHeight: '100px',
                                                        resize: 'vertical'
                                                    }}
                                                    placeholder="Taşıyıcıya iletmek istediğiniz mesajı yazınız"
                                                    disabled={offerSubmitting}
                                                />
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={handleSubmitOffer}
                                                    style={{
                                                        backgroundColor: '#4a6cf7',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '12px 20px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        cursor: offerSubmitting ? 'default' : 'pointer',
                                                        flex: 1,
                                                        opacity: offerSubmitting ? 0.7 : 1,
                                                    }}
                                                    disabled={offerSubmitting}
                                                >
                                                    {offerSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}
                                                </button>
                                                
                                                <button
                                                    onClick={() => setShowOfferForm(false)}
                                                    style={{
                                                        backgroundColor: '#f3f4f6',
                                                        color: '#666',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '12px 20px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        cursor: offerSubmitting ? 'default' : 'pointer',
                                                        opacity: offerSubmitting ? 0.7 : 1,
                                                    }}
                                                    disabled={offerSubmitting}
                                                >
                                                    İptal
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleAdsList;