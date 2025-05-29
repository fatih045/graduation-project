import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Adjust this import as needed for your store structure
import {
    fetchMyCargos,
    updateCargo,
    deleteCargo,

} from '../features/cargo/cargoSlice';
import {Cargo} from "../services/cargoService.ts"; // Adjust path as needed
import useAutocomplete, { EUROPEAN_COUNTRIES } from '../hooks/useAutocomplete';

const UserCargoManagement: React.FC = () => {
    // Redux hooks
    const dispatch = useDispatch();
    const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);
    const auth = useSelector((state: RootState) => state.auth); // Get auth state

    // Local state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');

    // Modal state
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [currentCargo, setCurrentCargo] = useState<Cargo | null>(null);

    // Autocomplete refs
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const dropoffInputRef = useRef<HTMLInputElement>(null);
    const pickupAutocompleteRef = useRef<any>(null);
    const dropoffAutocompleteRef = useRef<any>(null);

    // Google Places API hook
    const { isGoogleLoaded, initializeAutocomplete, updateAutocompleteRestrictions } = useAutocomplete();

    // Kargo tipleri
    const CARGO_TYPES = [
        { value: 'TarpaulinTruck', label: 'Tenteli Kamyon' },
        { value: 'BoxTruck', label: 'Kapalı Kasa Kamyon' },
        { value: 'RefrigeratedTruck', label: 'Soğutmalı Kamyon' },
        { value: 'SemiTrailer', label: 'Yarı Römork' },
        { value: 'LightTruck', label: 'Hafif Kamyon' },
        { value: 'ContainerCarrier', label: 'Konteyner Taşıyıcı' },
        { value: 'TankTruck', label: 'Tanker' },
        { value: 'LowbedTrailer', label: 'Lowbed Römork' },
        { value: 'DumpTruck', label: 'Damperli Kamyon' },
        { value: 'PanelVan', label: 'Panel Van' },
        { value: 'Others', label: 'Diğer' }
    ];

    // Add CSS styles for the component
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .select-element {
        -webkit-appearance: menulist;
        -moz-appearance: menulist;
        appearance: menulist;
      }

      .cargo-card {
        transition: all 0.3s ease;
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
        overflow-y: auto;
        padding: 20px 0;
      }
      
      .modal-content {
        background-color: white;
        padding: 25px;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        position: relative;
        margin: auto;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
      }
      
      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
      }
      
      .btn-container {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background-color: #4a6cf7;
        color: white;
      }
      
      .btn-danger {
        background-color: #e74c3c;
        color: white;
      }
      
      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }
      
      .btn-primary:hover {
        background-color: #3151d3;
      }
      
      .btn-danger:hover {
        background-color: #c0392b;
      }
      
      .btn-secondary:hover {
        background-color: #5a6268;
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
      }

      .status-active {
        background-color: #d1fae5;
        color: #059669;
      }

      .status-expired {
        background-color: #fee2e2;
        color: #dc2626;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

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

    // Initialize autocomplete when Google Places is loaded and country is selected
    useEffect(() => {
        if (isGoogleLoaded && currentCargo?.pickCountry) {
            initializeAutocomplete(
                pickupInputRef,
                pickupAutocompleteRef,
                currentCargo.pickCountry,
                (place) => {
                    if (place && place.name) {
                        setCurrentCargo(prev => prev ? { ...prev, pickCity: place.name } : null);
                    } else if (place && place.formatted_address) {
                        const cityName = place.formatted_address.split(',')[0];
                        setCurrentCargo(prev => prev ? { ...prev, pickCity: cityName } : null);
                    }
                }
            );
        }
    }, [isGoogleLoaded, currentCargo?.pickCountry]);

    useEffect(() => {
        if (isGoogleLoaded && currentCargo?.dropCountry) {
            initializeAutocomplete(
                dropoffInputRef,
                dropoffAutocompleteRef,
                currentCargo.dropCountry,
                (place) => {
                    if (place && place.name) {
                        setCurrentCargo(prev => prev ? { ...prev, dropCity: place.name } : null);
                    } else if (place && place.formatted_address) {
                        const cityName = place.formatted_address.split(',')[0];
                        setCurrentCargo(prev => prev ? { ...prev, dropCity: cityName } : null);
                    }
                }
            );
        }
    }, [isGoogleLoaded, currentCargo?.dropCountry]);

    // Update autocomplete restrictions when country changes
    useEffect(() => {
        if (isGoogleLoaded && pickupAutocompleteRef.current && currentCargo?.pickCountry) {
            updateAutocompleteRestrictions(
                pickupAutocompleteRef,
                currentCargo.pickCountry,
                pickupInputRef,
                () => setCurrentCargo(prev => prev ? { ...prev, pickCity: '' } : null)
            );
        }
    }, [currentCargo?.pickCountry, isGoogleLoaded]);

    useEffect(() => {
        if (isGoogleLoaded && dropoffAutocompleteRef.current && currentCargo?.dropCountry) {
            updateAutocompleteRestrictions(
                dropoffAutocompleteRef,
                currentCargo.dropCountry,
                dropoffInputRef,
                () => setCurrentCargo(prev => prev ? { ...prev, dropCity: '' } : null)
            );
        }
    }, [currentCargo?.dropCountry, isGoogleLoaded]);

    // Update cargo handler
    const handleUpdateCargo = (cargo: Cargo) => {
        setCurrentCargo(cargo);
        setShowUpdateModal(true);
    };

    // Delete cargo handler
    const handleDeleteCargo = (id: number) => {
        if (window.confirm('Bu kargoyu silmek istediğinizden emin misiniz?')) {
            dispatch(deleteCargo(id) as any)
                .then(() => {
                    alert('Kargo başarıyla silindi!');
                })
                .catch((err: any) => {
                    alert(`Silme işlemi başarısız: ${err.message}`);
                });
        }
    };

    // Form change handler
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (currentCargo) {
            setCurrentCargo({
                ...currentCargo,
                [name]: name === 'weight' || name === 'status' || name === 'price' ?
                    (value === '' ? 0 : Number(value)) : value
            });
        }
    };

    // City input change handler
    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'dropoff') => {
        const value = e.target.value;
        
        if (currentCargo) {
            if (type === 'pickup') {
                setCurrentCargo({
                    ...currentCargo,
                    pickCity: value
                });
            } else {
                setCurrentCargo({
                    ...currentCargo,
                    dropCity: value
                });
            }
        }
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCargo) {
            // Tarih alanını mevcut kargo nesnesinden alıyoruz, kullanıcının değiştirmesine izin vermiyoruz
            const updatedCargo = {
                ...currentCargo,
                adDate: currentCargo.adDate // Mevcut tarihi koruyoruz
            };
            
            dispatch(updateCargo(updatedCargo) as any)
                .then(() => {
                    setShowUpdateModal(false);
                    setCurrentCargo(null);
                    alert('Kargo bilgileri başarıyla güncellendi!');
                })
                .catch((err: any) => {
                    alert(`Güncelleme işlemi başarısız: ${err.message}`);
                });
        }
    };

    // Load cargo data when component mounts
    useEffect(() => {
        if (auth?.user?.uid) {
            dispatch(fetchMyCargos(auth.user.uid) as any);
            // setDebug(`Fetching cargos for user ID: ${auth.user.uid}`);
        }
    }, [dispatch, auth?.user?.uid]);

    // Filtering and sorting
    const filteredAndSortedCargos = React.useMemo(() => {
        let result = [...cargos];

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(cargo =>
                cargo.description?.toLowerCase().includes(lowercasedSearch) ||
                cargo.cargoType?.toLowerCase().includes(lowercasedSearch)
            );
        }

        // Filter by country
        if (countryFilter) {
            result = result.filter(cargo =>
                cargo.pickCountry?.includes(countryFilter) ||
                cargo.dropCountry?.includes(countryFilter)
            );
        }

        // Filter by city
        if (cityFilter) {
            const lowercasedCityFilter = cityFilter.toLowerCase();
            result = result.filter(cargo =>
                cargo.pickCity?.toLowerCase().includes(lowercasedCityFilter) ||
                cargo.dropCity?.toLowerCase().includes(lowercasedCityFilter)
            );
        }

        // Sort
        result.sort((a, b) => {
            // Handle numeric fields
            if (['id', 'weight'].includes(sortBy)) {
                const aValue = a[sortBy as keyof Cargo] as number || 0;
                const bValue = b[sortBy as keyof Cargo] as number || 0;
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle text fields
            if (['description', 'cargoType'].includes(sortBy)) {
                const aValue = String(a[sortBy as keyof Cargo] || '');
                const bValue = String(b[sortBy as keyof Cargo] || '');
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return result;
    }, [cargos, searchTerm, sortBy, sortOrder, countryFilter, cityFilter]);

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

    const userInfoStyle = {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const userNameStyle = {
        fontSize: '18px',
        fontWeight: 'bold' as const,
        color: '#333'
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
        marginBottom: '25px',
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
        padding: '30px',
        color: '#999',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        marginTop: '20px'
    };

    const loadingStyle = {
        textAlign: 'center' as const,
        padding: '30px',
        color: '#666'
    };

    const errorStyle = {
        textAlign: 'center' as const,
        padding: '15px',
        color: '#e63946',
        backgroundColor: '#ffeeee',
        borderRadius: '10px',
        marginTop: '20px'
    };

    const buttonStyle = {
        padding: '8px 12px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '14px',
        transition: 'all 0.2s'
    };

    const updateButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#4a6cf7',
        color: 'white',
        marginRight: '8px'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#e74c3c',
        color: 'white'
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* Header with gradient background */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Kargo Yönetimim</h1>
                    <p style={subtitleStyle}>Kargolarınızı görüntüleyin, güncelleyin ve yönetin</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {/* User info section */}
                    <div style={userInfoStyle}>
                        <div>
                            <span style={userNameStyle}>
                                Hoş geldiniz
                                {/*<span style={{ color: '#4a6cf7' }}> {auth?.user?.firstName}</span>*/}
                            </span>
                            <p style={{ margin: '5px 0 0', color: '#666' }}>{auth?.user?.email}</p>
                        </div>
                        <div>
                            <span style={{
                                backgroundColor: '#e3f2fd',
                                color: '#0d47a1',
                                padding: '8px 12px',
                                borderRadius: '15px',
                                fontWeight: 'bold'
                            }}>
                                Kullanıcı
                            </span>
                        </div>
                    </div>

                    {/* Search and filter */}
                    <input
                        type="text"
                        placeholder="Arama yap... (Açıklama, Araç Tipi)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />

                    <div style={filterContainerStyle}>
                        <div>
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
                                <option value="id-desc">ID (Yeni-Eski)</option>
                                <option value="id-asc">ID (Eski-Yeni)</option>
                                <option value="weight-asc">Ağırlık (Artan)</option>
                                <option value="weight-desc">Ağırlık (Azalan)</option>
                                <option value="description-asc">Açıklama (A-Z)</option>
                                <option value="description-desc">Açıklama (Z-A)</option>
                            </select>
                        </div>

                        {/* Ülke filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Ülke filtresi"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                style={{...selectStyle, minWidth: '120px'}}
                            />
                        </div>

                        {/* Şehir filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Şehir filtresi"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                style={{...selectStyle, minWidth: '120px'}}
                            />
                        </div>
                    </div>

                    {loading && <div style={loadingStyle}>Kargolar yükleniyor...</div>}

                    {error && <div style={errorStyle}>{error}</div>}

                    {!loading && !error && (
                        <>
                            {filteredAndSortedCargos.length === 0 ? (
                                <div style={noDataStyle}>
                                    Uygun kargo bulunamadı. Filtreleri değiştirerek tekrar deneyebilirsiniz.
                                </div>
                            ) : (
                                <div style={gridStyle}>
                                    {filteredAndSortedCargos.map((cargo) => (
                                        <div
                                            key={cargo.id}
                                            className="cargo-card"
                                            style={cardStyle}
                                            onClick={() => handleUpdateCargo(cargo)}
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
                                                        {cargo.title || cargo.description || 'Başlıksız Kargo'}
                                                    </h3>
                                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4a6cf7' }}>
                                                        {cargo.weight} Ton
                                                    </div>
                                                </div>

                                                {/* Fiyat ve Para Birimi */}
                                                {cargo.price > 0 && (
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '5px', 
                                                        marginBottom: '8px',
                                                        backgroundColor: '#f0fff4',
                                                        padding: '5px 8px',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        color: '#059669',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                                        </svg>
                                                        <span>
                                                            {cargo.price} {cargo.currency || 'TRY'}
                                                        </span>
                                                    </div>
                                                )}

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

                                                {cargo.cargoType && (
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '5px', 
                                                        marginBottom: '8px',
                                                        fontSize: '14px',
                                                        color: '#666'
                                                    }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="1" y="3" width="15" height="13"></rect>
                                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                                        </svg>
                                                        <span>{cargo.cargoType}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Body */}
                                            <div style={cardBodyStyle}>
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
                                                            {cargo.pickCity || 'Belirtilmemiş'}{cargo.pickCountry ? `, ${cargo.pickCountry}` : ''}
                                                        </div>
                                                    </div>
                                                    <div style={{ margin: '0 10px', color: '#4a6cf7' }}>→</div>
                                                    <div style={{ textAlign: 'center', flex: 1 }}>
                                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Nereye</div>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                                            {cargo.dropCity || 'Belirtilmemiş'}{cargo.dropCountry ? `, ${cargo.dropCountry}` : ''}
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
                                                    <div className="action-buttons">
                                                        <button
                                                            style={updateButtonStyle}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateCargo(cargo);
                                                            }}
                                                        >
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            style={deleteButtonStyle}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteCargo(cargo.id);
                                                            }}
                                                        >
                                                            Sil
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Update Modal */}
            {showUpdateModal && currentCargo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Kargo Düzenle</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setCurrentCargo(null);
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Başlık</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={currentCargo.title || ''}
                                    onChange={handleFormChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Açıklama</label>
                                <textarea
                                    name="description"
                                    value={currentCargo.description || ''}
                                    onChange={handleFormChange}
                                    className="form-control"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ağırlık (Ton)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={currentCargo.weight || ''}
                                    onChange={handleFormChange}
                                    className="form-control"
                                    min="0.1"
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Araç Tipi</label>
                                <select
                                    name="cargoType"
                                    value={currentCargo.cargoType || ''}
                                    onChange={handleFormChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Araç Tipi Seçin</option>
                                    {CARGO_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Alım Lokasyonu */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Alım Ülkesi</label>
                                    <select
                                        name="pickCountry"
                                        value={currentCargo.pickCountry || ''}
                                        onChange={handleFormChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Ülke Seçin</option>
                                        {EUROPEAN_COUNTRIES.map(country => (
                                            <option key={country.value} value={country.value}>{country.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Alım Şehri</label>
                                    <input
                                        ref={pickupInputRef}
                                        type="text"
                                        name="pickCity"
                                        value={currentCargo.pickCity || ''}
                                        onChange={(e) => handleCityInputChange(e, 'pickup')}
                                        className="form-control"
                                        placeholder={isGoogleLoaded ? "Şehir yazın..." : "Google Places yükleniyor..."}
                                        disabled={!currentCargo.pickCountry}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Teslim Lokasyonu */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Teslim Ülkesi</label>
                                    <select
                                        name="dropCountry"
                                        value={currentCargo.dropCountry || ''}
                                        onChange={handleFormChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Ülke Seçin</option>
                                        {EUROPEAN_COUNTRIES.map(country => (
                                            <option key={country.value} value={country.value}>{country.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Teslim Şehri</label>
                                    <input
                                        ref={dropoffInputRef}
                                        type="text"
                                        name="dropCity"
                                        value={currentCargo.dropCity || ''}
                                        onChange={(e) => handleCityInputChange(e, 'dropoff')}
                                        className="form-control"
                                        placeholder={isGoogleLoaded ? "Şehir yazın..." : "Google Places yükleniyor..."}
                                        disabled={!currentCargo.dropCountry}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fiyat ve Para Birimi */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Fiyat</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={currentCargo.price || ''}
                                        onChange={handleFormChange}
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Para Birimi</label>
                                    <select
                                        name="currency"
                                        value={currentCargo.currency || 'TRY'}
                                        onChange={handleFormChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="btn-container">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setCurrentCargo(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">Güncelle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCargoManagement;