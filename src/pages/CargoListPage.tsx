// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Package, MapPin, Weight, Loader, AlertCircle, User } from 'lucide-react';
// import { fetchAllCargos } from '../features/cargo/cargoSlice';
// import type { RootState, AppDispatch } from '../store/store';
//
// const CargoListPage: React.FC = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);
//
//     useEffect(() => {
//         dispatch(fetchAllCargos());
//     }, [dispatch]);
//
//     const getCurrencySymbol = (currency: string) => {
//         switch (currency?.toUpperCase()) {
//             case 'USD': return '$';
//             case 'EUR': return '€';
//             case 'TRY': return '₺';
//             default: return currency || '';
//         }
//     };
//
//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
//                 <div className="flex items-center space-x-3 text-blue-600">
//                     <Loader className="w-8 h-8 animate-spin" />
//                     <span className="text-lg font-medium">Kargo ilanları yükleniyor...</span>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//             <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
//                 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
//                     <h1 className="text-3xl font-bold mb-2">Kargo İlanları</h1>
//                     <p className="text-blue-100">Mevcut kargo taşıma taleplerini inceleyin</p>
//                     <div className="mt-4 text-blue-100">
//                         <span className="text-sm">Toplam İlan: {cargos?.length || 0}</span>
//                     </div>
//                 </div>
//
//                 <div className="p-8">
//                     {error && (
//                         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
//                             <div className="flex items-center space-x-2">
//                                 <AlertCircle className="w-5 h-5" />
//                                 <p className="font-medium">İlanlar yüklenirken hata oluştu</p>
//                             </div>
//                             <p className="text-sm mt-1">{error}</p>
//                         </div>
//                     )}
//
//                     {!cargos || cargos.length === 0 ? (
//                         <div className="text-center py-16">
//                             <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                             <h3 className="text-xl font-semibold text-gray-600 mb-2">Henüz İlan Bulunamadı</h3>
//                             <p className="text-gray-500">Şu anda gösterilecek kargo ilanı bulunmamaktadır.</p>
//                         </div>
//                     ) : (
//                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                             {cargos.map((cargo) => (
//                                 <div
//                                     key={cargo.id}
//                                     className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
//                                 >
//                                     {/* Header - Title & Price */}
//                                     <div className="p-6 border-b border-gray-100">
//                                         <div className="flex items-start justify-between mb-4">
//                                             <div className="flex-1">
//                                                 <h3 className="font-bold text-lg text-gray-800 leading-tight mb-2">
//                                                     {cargo.title || 'Başlıksız Kargo'}
//                                                 </h3>
//                                                 <div className="flex items-center space-x-2">
//                                                     <User className="w-4 h-4 text-gray-500" />
//                                                     <span className="text-sm text-gray-600">
//                                                         {cargo.customerName || 'Anonim Müşteri'}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                             <div className="text-right ml-4">
//                                                 <div className="text-2xl font-bold text-green-600">
//                                                     {getCurrencySymbol(cargo.currency)}{cargo.price?.toLocaleString() || '0'}
//                                                 </div>
//                                                 <div className="text-xs text-gray-500 uppercase">
//                                                     {cargo.currency || 'TRY'}
//                                                 </div>
//                                             </div>
//                                         </div>
//
//                                         {cargo.description && (
//                                             <p className="text-gray-600 text-sm leading-relaxed">
//                                                 {cargo.description}
//                                             </p>
//                                         )}
//                                     </div>
//
//                                     {/* Body - Details */}
//                                     <div className="p-6 space-y-4">
//                                         {/* Weight */}
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex items-center space-x-2 text-gray-600">
//                                                 <Weight className="w-4 h-4" />
//                                                 <span className="text-sm">Ağırlık:</span>
//                                             </div>
//                                             <span className="font-semibold text-gray-800 bg-green-50 px-3 py-1 rounded-lg">
//                                                 {cargo.weight?.toLocaleString() || '0'} kg
//                                             </span>
//                                         </div>
//
//                                         {/* Cargo Type */}
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex items-center space-x-2 text-gray-600">
//                                                 <Package className="w-4 h-4" />
//                                                 <span className="text-sm">Tip:</span>
//                                             </div>
//                                             <span className="font-semibold text-gray-800 bg-blue-50 px-3 py-1 rounded-lg capitalize">
//                                                 {cargo.cargoType || 'Genel'}
//                                             </span>
//                                         </div>
//
//                                         {/* Route */}
//                                         <div className="space-y-2">
//                                             <div className="flex items-center space-x-2 text-gray-600">
//                                                 <MapPin className="w-4 h-4" />
//                                                 <span className="text-sm">Güzergah:</span>
//                                             </div>
//                                             <div className="bg-purple-50 p-3 rounded-lg">
//                                                 <div className="flex items-center justify-between">
//                                                     <div className="text-center">
//                                                         <div className="text-xs text-gray-500 mb-1">Başlangıç</div>
//                                                         <div className="font-medium text-gray-800">
//                                                             {cargo.pickCity || 'Belirtilmemiş'}
//                                                         </div>
//                                                         <div className="text-xs text-gray-600">
//                                                             {cargo.pickCountry || ''}
//                                                         </div>
//                                                     </div>
//                                                     <div className="mx-4">
//                                                         <div className="w-8 h-0.5 bg-purple-300"></div>
//                                                         <div className="text-center text-purple-600 text-xs mt-1">→</div>
//                                                     </div>
//                                                     <div className="text-center">
//                                                         <div className="text-xs text-gray-500 mb-1">Varış</div>
//                                                         <div className="font-medium text-gray-800">
//                                                             {cargo.dropCity || 'Belirtilmemiş'}
//                                                         </div>
//                                                         <div className="text-xs text-gray-600">
//                                                             {cargo.dropCountry || ''}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//
//                                         {/* Status */}
//                                         {cargo.isExpired !== undefined && (
//                                             <div className="pt-2 border-t border-gray-100">
//                                                 <div className="flex items-center justify-center">
//                                                     <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
//                                                         cargo.isExpired
//                                                             ? 'bg-red-100 text-red-700'
//                                                             : 'bg-green-100 text-green-700'
//                                                     }`}>
//                                                         <div className={`w-2 h-2 rounded-full ${
//                                                             cargo.isExpired ? 'bg-red-400' : 'bg-green-400'
//                                                         }`}></div>
//                                                         <span>{cargo.isExpired ? 'Süresi Dolmuş' : 'Aktif'}</span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default CargoListPage;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package,  Weight, Loader, AlertCircle, User, Eye, Filter, Search } from 'lucide-react';
import { fetchAllCargos } from '../features/cargo/cargoSlice';
import type { RootState, AppDispatch } from '../store/store';

const CargoListPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterByStatus, setFilterByStatus] = useState<string>('all');
    const [filterByType, setFilterByType] = useState<string>('all');

    // Modal state
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedCargo, setSelectedCargo] = useState<any>(null);

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
            result = result.filter(cargo =>
                cargo.title?.toLowerCase().includes(lowercasedSearch) ||
                cargo.description?.toLowerCase().includes(lowercasedSearch) ||
                cargo.cargoType?.toLowerCase().includes(lowercasedSearch) ||
                cargo.customerName?.toLowerCase().includes(lowercasedSearch) ||
                cargo.pickCity?.toLowerCase().includes(lowercasedSearch) ||
                cargo.dropCity?.toLowerCase().includes(lowercasedSearch)
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
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
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
                                            <div style={statusBadgeStyle(cargo.isExpired)}>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} />
                                        {selectedCargo.customerName || 'Anonim Müşteri'}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedCargo.description && (
                                <div className="detail-section">
                                    <span className="detail-label">Açıklama</span>
                                    <div className="detail-value">{selectedCargo.description}</div>
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
                                <div style={statusBadgeStyle(selectedCargo.isExpired)}>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CargoListPage;