import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package,  Weight, Loader, AlertCircle, User, Eye, Filter, Search, Mail, Phone } from 'lucide-react';
import { fetchAllCargos } from '../features/cargo/cargoSlice';
import { getCarrierDetails } from '../features/user/authSlice';
import type { RootState, AppDispatch } from '../store/store';
import { createCargoOffer } from '../features/cargoOffer/cargoOfferSlice';

const CargoListPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);
    const { user: userData } = useSelector((state: RootState) => state.auth);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterByStatus, setFilterByStatus] = useState<string>('all');
    const [filterByType, setFilterByType] = useState<string>('all');

    // Modal state
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedCargo, setSelectedCargo] = useState<any>(null);
    const [customerDetails, setCustomerDetails] = useState<any>(null);
    
    // Offer form state
    const [showOfferForm, setShowOfferForm] = useState<boolean>(false);
    const [offerPrice, setOfferPrice] = useState<string>('');
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

      .cargo-card:hover {
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

      .route-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 15px;
        color: white;
        margin: 15px 0;
      }

      .route-point {
        text-align: center;
      }

      .route-arrow {
        font-size: 24px;
        margin: 0 15px;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        dispatch(fetchAllCargos());
    }, [dispatch]);

    const getCurrencySymbol = (currency: string) => {
        switch (currency?.toUpperCase()) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'TRY': return '₺';
            default: return currency || '';
        }
    };

    // Format date to Turkish format (DD.MM.YYYY HH:MM) with 3 hours subtracted
    const formatDateToTurkish = (dateString: string) => {
        if (!dateString) return 'Belirtilmemiş';
        
        const date = new Date(dateString);
        
        // Adjust for 3 hours time difference (subtract 3 hours)
        const adjustedDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
        
        // Format date as DD.MM.YYYY
        const day = adjustedDate.getDate().toString().padStart(2, '0');
        const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = adjustedDate.getFullYear();
        
        // Format time as HH:MM
        const hours = adjustedDate.getHours().toString().padStart(2, '0');
        const minutes = adjustedDate.getMinutes().toString().padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    // Get unique cargo types for filter
    const cargoTypes = React.useMemo(() => {
        const types = [...new Set(cargos?.map(cargo => cargo.cargoType).filter(Boolean))];
        return types;
    }, [cargos]);

    // Filtering and sorting
    const filteredAndSortedCargos = React.useMemo(() => {
        if (!cargos) return [];

        let result = [...cargos];

        // Search filter
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            const searchTermWithoutHash = searchTerm.startsWith('#') ? searchTerm.substring(1) : searchTerm;
            
            result = result.filter(cargo =>
                cargo.title?.toLowerCase().includes(lowercasedSearch) ||
                cargo.description?.toLowerCase().includes(lowercasedSearch) ||
                cargo.cargoType?.toLowerCase().includes(lowercasedSearch) ||
                cargo.customerName?.toLowerCase().includes(lowercasedSearch) ||
                cargo.pickCity?.toLowerCase().includes(lowercasedSearch) ||
                cargo.dropCity?.toLowerCase().includes(lowercasedSearch) ||
                cargo.id?.toString() === searchTermWithoutHash // Search by cargo ID
            );
        }

        // Status filter
        if (filterByStatus !== 'all') {
            result = result.filter(cargo => {
                if (filterByStatus === 'active') return !cargo.isExpired;
                if (filterByStatus === 'expired') return cargo.isExpired;
                return true;
            });
        }

        // Type filter
        if (filterByType !== 'all') {
            result = result.filter(cargo => cargo.cargoType === filterByType);
        }

        // Sort
        result.sort((a, b) => {
            if (['id', 'weight', 'price'].includes(sortBy)) {
                const aValue = a[sortBy as keyof typeof a] as number || 0;
                const bValue = b[sortBy as keyof typeof b] as number || 0;
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (['title', 'cargoType', 'customerName'].includes(sortBy)) {
                const aValue = String(a[sortBy as keyof typeof a] || '');
                const bValue = String(b[sortBy as keyof typeof b] || '');
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return result;
    }, [cargos, searchTerm, sortBy, sortOrder, filterByStatus, filterByType]);

    const handleViewDetails = (cargo: any) => {
        setSelectedCargo(cargo);
        setShowDetailModal(true);
        setShowOfferForm(false);
        setOfferSuccess(false);
        setOfferError(null);
        
        // If cargo has userId, fetch user details
        if (cargo.userId) {
            dispatch(getCarrierDetails(cargo.userId))
                .unwrap()
                .then((userData) => {
                    setCustomerDetails(userData);
                })
                .catch((error) => {
                    console.error('Failed to fetch user details:', error);
                });
        } else {
            setCustomerDetails(null);
        }
    };

    // const handleSort = (field: string) => {
    //     if (sortBy === field) {
    //         setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    //     } else {
    //         setSortBy(field);
    //         setSortOrder('asc');
    //     }
    // };



    // Handle offer submission
    const handleSubmitOffer = () => {
        if (!userData || !selectedCargo || !customerDetails) return;
        
        if (!offerPrice || parseFloat(offerPrice) <= 0) {
            setOfferError('Lütfen geçerli bir teklif fiyatı girin.');
            return;
        }

        if (!offerMessage || offerMessage.trim() === '') {
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
            receiverId: selectedCargo.userId,
            cargoAdId: selectedCargo.id,
            price: parseFloat(offerPrice),
            message: offerMessage,
            expiryDate: expiryDate.toISOString()
        };

        // Log the data for debugging
        console.log("Sending offer data:", offerData);

        dispatch(createCargoOffer(offerData))
            .unwrap()
            .then((result) => {
                console.log("Offer created successfully:", result);
                setOfferSuccess(true);
                setShowOfferForm(false);
                setOfferPrice('');
                setOfferMessage('');
            })
            .catch((error) => {
                console.error("Error creating offer:", error);
                setOfferError(error.message || 'Teklif gönderilirken bir hata oluştu.');
            })
            .finally(() => {
                setOfferSubmitting(false);
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

    const priceStyle = {
        fontSize: '24px',
        fontWeight: 'bold' as const,
        color: '#4a6cf7'
    };

    const statusBadgeStyle = (isExpired: boolean) => ({
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        backgroundColor: isExpired ? '#fee2e2' : '#d1fae5',
        color: isExpired ? '#dc2626' : '#059669'
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
                        <span className="text-lg font-medium">Kargo ilanları yükleniyor...</span>
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
                    <h1 style={titleStyle}>Kargo İlanları</h1>
                    <p style={subtitleStyle}>Mevcut kargo taşıma taleplerini inceleyin</p>
                    <div style={statsStyle}>
                        Toplam İlan: {filteredAndSortedCargos.length} / {cargos?.length || 0}
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
                            placeholder="Arama yap... (Başlık, Açıklama, Müşteri, Şehir)"
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
                            <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                            <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                            <option value="weight-desc">Ağırlık (Büyük-Küçük)</option>
                            <option value="weight-asc">Ağırlık (Küçük-Büyük)</option>
                            <option value="title-asc">Başlık (A-Z)</option>
                            <option value="title-desc">Başlık (Z-A)</option>
                        </select>

                        <select
                            value={filterByStatus}
                            onChange={(e) => setFilterByStatus(e.target.value)}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="active">Aktif İlanlar</option>
                            <option value="expired">Süresi Dolmuş</option>
                        </select>

                        <select
                            value={filterByType}
                            onChange={(e) => setFilterByType(e.target.value)}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="all">Tüm Tipler</option>
                            {cargoTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Cargo Grid */}
                    {filteredAndSortedCargos.length === 0 ? (
                        <div style={noDataStyle}>
                            <Package size={64} style={{ color: '#ccc', margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#666' }}>
                                İlan Bulunamadı
                            </h3>
                            <p style={{ color: '#999' }}>
                                Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {filteredAndSortedCargos.map((cargo) => (
                                <div
                                    key={cargo.id}
                                    className="cargo-card"
                                    style={cardStyle}
                                    onClick={() => handleViewDetails(cargo)}
                                >
                                    {/* Card Header */}
                                    <div style={cardHeaderStyle}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                color: '#333',
                                                margin: 0,
                                                lineHeight: '1.3'
                                            }}>
                                                {cargo.title || 'Başlıksız Kargo'}
                                            </h3>
                                            <div style={priceStyle}>
                                                {getCurrencySymbol(cargo.currency)}{cargo.price?.toLocaleString() || '0'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                                            <User size={14} style={{ color: '#666' }} />
                                            <span style={{ fontSize: '14px', color: '#666' }}>
                                                {cargo.customerName || 'Anonim Müşteri'}
                                            </span>
                                        </div>

                                        {/* Planlanan Tarih */}
                                        {cargo.adDate && (
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '5px', 
                                                marginBottom: '8px',
                                                backgroundColor: '#f0f4ff',
                                                padding: '5px 8px',
                                                borderRadius: '5px',
                                                fontSize: '13px'
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                <span style={{ color: '#4a6cf7', fontWeight: 'bold' }}>
                                                    Planlanan Tarih: {formatDateToTurkish(cargo.adDate)}
                                                </span>
                                            </div>
                                        )}

                                        {cargo.description && (
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#666',
                                                margin: '8px 0 0',
                                                lineHeight: '1.4'
                                            }}>
                                                {cargo.description.length > 80
                                                    ? `${cargo.description.substring(0, 80)}...`
                                                    : cargo.description
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div style={cardBodyStyle}>
                                        {/* Quick Info */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Weight size={14} style={{ color: '#4a6cf7' }} />
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a6cf7' }}>
                                                    {cargo.weight?.toLocaleString() || '0'} kg
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Package size={14} style={{ color: '#666' }} />
                                                <span style={{ fontSize: '14px', color: '#666' }}>
                                                    {cargo.cargoType || 'Genel'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Route */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#f8f9fa',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            marginBottom: '15px'
                                        }}>
                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Nereden</div>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                                    {cargo.pickCity || 'Belirtilmemiş'}
                                                </div>
                                            </div>
                                            <div style={{ margin: '0 10px', color: '#4a6cf7' }}>→</div>
                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Nereye</div>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                                    {cargo.dropCity || 'Belirtilmemiş'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status and Action */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={statusBadgeStyle(!!cargo.isExpired)}>
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: cargo.isExpired ? '#dc2626' : '#059669',
                                                    marginRight: '6px'
                                                }}></div>
                                                {cargo.isExpired ? 'Süresi Dolmuş' : 'Aktif'}
                                            </div>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedCargo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
                                Kargo Detayları
                            </h2>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedCargo(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ lineHeight: '1.6' }}>
                            {/* Title and Price */}
                            <div className="detail-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <span className="detail-label">Başlık</span>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                                            {selectedCargo.title || 'Başlıksız Kargo'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="detail-label">Fiyat</span>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4a6cf7' }}>
                                            {getCurrencySymbol(selectedCargo.currency)}{selectedCargo.price?.toLocaleString() || '0'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {selectedCargo.currency || 'TRY'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="detail-section">
                                <span className="detail-label">Müşteri Bilgileri</span>
                                <div className="detail-value">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <User size={16} />
                                        {selectedCargo.customerName || 'Anonim Müşteri'}
                                    </div>
                                    {customerDetails && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Phone size={16} />
                                                {customerDetails.phoneNumber || 'Telefon bilgisi yok'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Mail size={16} />
                                                {customerDetails.email || 'E-posta bilgisi yok'}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {selectedCargo.description && (
                                <div className="detail-section">
                                    <span className="detail-label">Açıklama</span>
                                    <div className="detail-value">{selectedCargo.description}</div>
                                </div>
                            )}

                            {/* Planlanan Tarih */}
                            {selectedCargo.adDate && (
                                <div className="detail-section">
                                    <span className="detail-label">Planlanan Tarih</span>
                                    <div className="detail-value" style={{ color: '#4a6cf7', fontWeight: 'bold' }}>
                                        {formatDateToTurkish(selectedCargo.adDate)}
                                    </div>
                                </div>
                            )}

                            {/* Route */}
                            <div className="detail-section">
                                <span className="detail-label">Güzergah</span>
                                <div className="route-container">
                                    <div className="route-point">
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>Başlangıç</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            {selectedCargo.pickCity || 'Belirtilmemiş'}
                                        </div>
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                            {selectedCargo.pickCountry || ''}
                                        </div>
                                    </div>
                                    <div className="route-arrow">→</div>
                                    <div className="route-point">
                                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}>Varış</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            {selectedCargo.dropCity || 'Belirtilmemiş'}
                                        </div>
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                            {selectedCargo.dropCountry || ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cargo Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="detail-section">
                                    <span className="detail-label">Ağırlık</span>
                                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Weight size={16} />
                                        {selectedCargo.weight?.toLocaleString() || '0'} kg
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <span className="detail-label">Kargo Tipi</span>
                                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={16} />
                                        {selectedCargo.cargoType || 'Genel'}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="detail-section">
                                <span className="detail-label">Durum</span>
                                <div style={statusBadgeStyle(!!selectedCargo.isExpired)}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: selectedCargo.isExpired ? '#dc2626' : '#059669',
                                        marginRight: '8px'
                                    }}></div>
                                    {selectedCargo.isExpired ? 'Süresi Dolmuş' : 'Aktif İlan'}
                                </div>
                            </div>

                            {/* Additional Info */}
                            {selectedCargo.id && (
                                <div className="detail-section">
                                    <span className="detail-label">İlan No</span>
                                    <div className="detail-value">#{selectedCargo.id}</div>
                                </div>
                            )}
                            
                            {/* Make Offer Button - only show for other users' cargo and if not expired */}
                            {userData && 
                             selectedCargo.userId && 
                             userData.userId !== selectedCargo.userId && 
                             userData.uid !== selectedCargo.userId && 
                             !selectedCargo.isExpired && (
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
                                            backgroundColor: '#d1fae5', 
                                            color: '#059669', 
                                            padding: '15px', 
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            textAlign: 'center'
                                        }}>
                                            Teklifiniz başarıyla gönderildi!
                                        </div>
                                    )}
                                    
                                    {showOfferForm && (
                                        <div style={{ marginTop: '15px' }}>
                                            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Teklif Bilgileri</h3>
                                            
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
                                            
                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ 
                                                    display: 'block', 
                                                    marginBottom: '5px', 
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#333'
                                                }}>
                                                    Teklif Fiyatı ({selectedCargo.currency || 'TRY'})
                                                </label>
                                                <input
                                                    type="number"
                                                    value={offerPrice}
                                                    onChange={(e) => setOfferPrice(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ddd',
                                                        fontSize: '16px'
                                                    }}
                                                    placeholder="Teklifinizi girin"
                                                    min="1"
                                                    disabled={offerSubmitting}
                                                />
                                            </div>
                                            
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ 
                                                    display: 'block', 
                                                    marginBottom: '5px', 
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: '#333'
                                                }}>
                                                    Mesaj (Zorunlu)
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
                                                    placeholder="İsterseniz teklifinizle ilgili bir mesaj yazabilirsiniz"
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

export default CargoListPage;
