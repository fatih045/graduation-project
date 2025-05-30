import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVehicleAdsByCarrier,
    updateVehicleAd,
    deleteVehicleAd,
    VehicleAd
} from '../features/vehicle/vehicleAdSlice';
import { VEHICLE_AD_STATUS } from '../services/vehicleAdService';
import type { RootState, AppDispatch } from '../store/store.ts';

const MyVehicleAdsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vehicleAds, loading, error } = useSelector((state: RootState) => state.vehicleAd);
    const { user } = useSelector((state: RootState) => state.auth);

    // Local state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleAd | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        country: '',
        city: '',
        vehicleType: '',
        capacity: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    // Notification state
    const [showNotification, setShowNotification] = useState(false);
    
    // Refs for Google Places API
    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityAutocompleteRef = useRef<any>(null);

    // Avrupa ülkeleri listesi
    const EUROPEAN_COUNTRIES = [
        { value: 'Turkey', label: 'Türkiye' },
        { value: 'Germany', label: 'Almanya' },
        { value: 'France', label: 'Fransa' },
        { value: 'Italy', label: 'İtalya' },
        { value: 'Spain', label: 'İspanya' },
        { value: 'United Kingdom', label: 'Birleşik Krallık' },
        { value: 'Netherlands', label: 'Hollanda' },
        { value: 'Belgium', label: 'Belçika' },
        { value: 'Austria', label: 'Avusturya' },
        { value: 'Switzerland', label: 'İsviçre' },
        { value: 'Poland', label: 'Polonya' },
        { value: 'Sweden', label: 'İsveç' },
        { value: 'Norway', label: 'Norveç' },
        { value: 'Denmark', label: 'Danimarka' },
        { value: 'Finland', label: 'Finlandiya' },
        { value: 'Portugal', label: 'Portekiz' },
        { value: 'Greece', label: 'Yunanistan' },
        { value: 'Czech Republic', label: 'Çek Cumhuriyeti' },
        { value: 'Hungary', label: 'Macaristan' },
        { value: 'Ireland', label: 'İrlanda' },
        { value: 'Romania', label: 'Romanya' },
        { value: 'Bulgaria', label: 'Bulgaristan' },
        { value: 'Croatia', label: 'Hırvatistan' },
        { value: 'Slovakia', label: 'Slovakya' },
        { value: 'Slovenia', label: 'Slovenya' },
        { value: 'Lithuania', label: 'Litvanya' },
        { value: 'Latvia', label: 'Letonya' },
        { value: 'Estonia', label: 'Estonya' },
        { value: 'Cyprus', label: 'Kıbrıs' },
        { value: 'Luxembourg', label: 'Lüksemburg' },
        { value: 'Malta', label: 'Malta' },
        { value: 'Iceland', label: 'İzlanda' },
        { value: 'Serbia', label: 'Sırbistan' },
        { value: 'Bosnia and Herzegovina', label: 'Bosna Hersek' },
        { value: 'Albania', label: 'Arnavutluk' },
        { value: 'North Macedonia', label: 'Kuzey Makedonya' },
        { value: 'Montenegro', label: 'Karadağ' },
        { value: 'Moldova', label: 'Moldova' },
        { value: 'Ukraine', label: 'Ukrayna' },
        { value: 'Belarus', label: 'Belarus' }
    ];

    useEffect(() => {
        if (user && user.uid) {
            dispatch(fetchVehicleAdsByCarrier({ carrierId: user.uid, status: statusFilter }));
        }
    }, [dispatch, user, statusFilter]);

    // Form verilerini güncelle
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (vehicle: VehicleAd) => {
        setSelectedVehicle(vehicle);
        setFormData({
            title: vehicle.title,
            description: vehicle.description,
            country: vehicle.country,
            city: vehicle.city,
            vehicleType: vehicle.vehicleType,
            capacity: vehicle.capacity.toString()
        });
        setIsUpdateModalOpen(true);
    };

    const handleDeleteClick = (vehicle: VehicleAd) => {
        if (window.confirm('Bu araç ilanını silmek istediğinize emin misiniz?')) {
            dispatch(deleteVehicleAd(vehicle.id))
                .unwrap()
                .then(() => {
                    alert('Araç ilanı başarıyla silindi!');
                })
                .catch((error) => {
                    console.error('Araç ilanı silinirken hata oluştu:', error);
                    alert('Araç ilanı silinirken bir hata oluştu!');
                });
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle) return;

        setIsUpdating(true);

        const updatedData = {
            id: selectedVehicle.id,
            title: formData.title,
            description: formData.description,
            country: formData.country,
            city: formData.city,
            vehicleType: formData.vehicleType,
            capacity: Number(formData.capacity)
        };

        dispatch(updateVehicleAd({ id: selectedVehicle.id, updatedData }))
            .unwrap()
            .then(() => {
                // Close modal
                setIsUpdateModalOpen(false);
                // Show notification instead of alert
                setShowNotification(true);
                // Hide notification after 5 seconds
                setTimeout(() => {
                    setShowNotification(false);
                }, 5000);
            })
            .catch((error) => {
                console.error('Araç ilanı güncellenirken hata oluştu:', error);
                alert('Araç ilanı güncellenirken bir hata oluştu!');
            })
            .finally(() => {
                setIsUpdating(false);
            });
    };

    // Google Places API'yi yükle
    useEffect(() => {
        const loadGooglePlaces = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsGoogleLoaded(true);
                return;
            }

            // Google Places API script'ini yükle
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setIsGoogleLoaded(true);
            };
            script.onerror = () => {
                console.error('Google Places API yüklenemedi');
                setIsGoogleLoaded(false);
            };

            document.head.appendChild(script);
        };

        loadGooglePlaces();

        return () => {
            const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, []);

    // Modal açıldığında autocomplete'i initialize et
    useEffect(() => {
        if (isUpdateModalOpen && isGoogleLoaded && cityInputRef.current) {
            initializeAutocomplete();
        }
    }, [isUpdateModalOpen, isGoogleLoaded]);

    // Autocomplete'i initialize et
    const initializeAutocomplete = () => {
        if (!window.google || !window.google.maps || !window.google.maps.places || !cityInputRef.current) {
            return;
        }

        try {
            // City autocomplete
            const cityOptions: google.maps.places.AutocompleteOptions = {
                types: ['(cities)'],
                fields: ['name', 'place_id', 'geometry'],
            };

            if (formData.country) {
                cityOptions.componentRestrictions = { country: getCountryCode(formData.country) };
            }

            cityAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                cityInputRef.current,
                cityOptions
            );

            cityAutocompleteRef.current.addListener('place_changed', () => {
                const place = cityAutocompleteRef.current.getPlace();
                if (place && place.name) {
                    setFormData(prev => ({ ...prev, city: place.name }));
                } else if (place && place.formatted_address) {
                    const cityName = place.formatted_address.split(',')[0];
                    setFormData(prev => ({ ...prev, city: cityName }));
                }
            });
        } catch (error) {
            console.error('Autocomplete initialize edilirken hata:', error);
        }
    };

    // Ülke değiştiğinde autocomplete'i güncelle
    useEffect(() => {
        if (isGoogleLoaded && cityAutocompleteRef.current && formData.country) {
            try {
                cityAutocompleteRef.current.setComponentRestrictions({
                    country: getCountryCode(formData.country)
                });
                if (cityInputRef.current) {
                    cityInputRef.current.value = '';
                    setFormData(prev => ({ ...prev, city: '' }));
                }
            } catch (error) {
                console.error('City autocomplete güncellenirken hata:', error);
            }
        }
    }, [formData.country, isGoogleLoaded]);

    // Ülke kodlarını döndür (Google Places API için)
    const getCountryCode = (country: string): string => {
        const countryCodes: { [key: string]: string } = {
            'Turkey': 'tr',
            'Germany': 'de',
            'France': 'fr',
            'Italy': 'it',
            'Spain': 'es',
            'United Kingdom': 'gb',
            'Netherlands': 'nl',
            'Belgium': 'be',
            'Austria': 'at',
            'Switzerland': 'ch',
            'Poland': 'pl',
            'Sweden': 'se',
            'Norway': 'no',
            'Denmark': 'dk',
            'Finland': 'fi',
            'Portugal': 'pt',
            'Greece': 'gr',
            'Czech Republic': 'cz',
            'Hungary': 'hu',
            'Ireland': 'ie',
            'Romania': 'ro',
            'Bulgaria': 'bg',
            'Croatia': 'hr',
            'Slovakia': 'sk',
            'Slovenia': 'si',
            'Lithuania': 'lt',
            'Latvia': 'lv',
            'Estonia': 'ee',
            'Cyprus': 'cy',
            'Luxembourg': 'lu',
            'Malta': 'mt',
            'Iceland': 'is',
            'Serbia': 'rs',
            'Bosnia and Herzegovina': 'ba',
            'Albania': 'al',
            'North Macedonia': 'mk',
            'Montenegro': 'me',
            'Moldova': 'md',
            'Ukraine': 'ua',
            'Belarus': 'by'
        };

        return countryCodes[country] || 'tr';
    };

    // Araç türü seçenekleri
    const vehicleTypeOptions = [
        'Van',
        'Truck',
        'Trailer',
        'Pickup',
        'TarpaulinTruck',
        'BoxTruck',
        'RefrigeratedTruck',
        'SemiTrailer',
        'LightTruck',
        'ContainerCarrier',
        'TankTruck',
        'LowbedTrailer',
        'DumpTruck',
        'PanelVan',
        'Others'
    ];

    // Filtering and sorting
    const filteredAndSortedVehicles = React.useMemo(() => {
        let result = [...vehicleAds];

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.title?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.description?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.vehicleType?.toLowerCase().includes(lowercasedSearch)
            );
        }

        // Filter by country
        if (countryFilter) {
            result = result.filter(vehicle =>
                vehicle.country?.includes(countryFilter)
            );
        }

        // Filter by city
        if (cityFilter) {
            const lowercasedCityFilter = cityFilter.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.city?.toLowerCase().includes(lowercasedCityFilter)
            );
        }

        // We don't need to filter by status here since we're already filtering in the API call
        // Keeping this commented for reference
        /*
        if (statusFilter !== undefined) {
            result = result.filter(vehicle => vehicle.status === statusFilter);
        }
        */

        // Sort
        result.sort((a, b) => {
            // Handle numeric fields
            if (sortBy === 'capacity') {
                return sortOrder === 'asc'
                    ? a.capacity - b.capacity
                    : b.capacity - a.capacity;
            }

            // Handle string fields
            if (sortBy === 'title' || sortBy === 'description' || sortBy === 'vehicleType') {
                const aValue = a[sortBy as keyof VehicleAd] as string || '';
                const bValue = b[sortBy as keyof VehicleAd] as string || '';
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // Default sort by id
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        });

        return result;
    }, [vehicleAds, searchTerm, sortBy, sortOrder, countryFilter, cityFilter]);

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

    const userInfoStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px'
    };

    const userNameStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
    };

    const inputStyle = {
        width: '100%',
        padding: '15px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
    };

    const filterContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '15px',
        marginBottom: '25px'
    };

    const selectStyle = {
        padding: '12px 15px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        minWidth: '180px'
    };

    // Grid and card styles
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
        cursor: 'pointer',
        border: '1px solid #eaeaea'
    };

    const cardHeaderStyle = {
        padding: '20px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#f9f9f9'
    };

    const cardBodyStyle = {
        padding: '20px'
    };

    const vehicleTypeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        marginBottom: '10px'
    };

    const capacityStyle = {
        fontSize: '18px',
        fontWeight: 'bold' as const,
        color: '#4a6cf7',
        marginBottom: '15px'
    };

    const locationStyle = {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        color: '#666',
        marginBottom: '15px'
    };

    const dateStyle = {
        fontSize: '14px',
        color: '#4a6cf7',
        fontWeight: 'bold' as const,
        marginBottom: '15px'
    };

    const actionButtonsStyle = {
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
    };

    const updateButtonStyle = {
        backgroundColor: '#4a6fa5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '14px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        flex: '1',
        transition: 'all 0.2s ease'
    };

    const deleteButtonStyle = {
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 15px',
        fontSize: '14px',
        fontWeight: 'bold' as const,
        cursor: 'pointer',
        flex: '1',
        transition: 'all 0.2s ease'
    };

    const loadingStyle = {
        textAlign: 'center' as const,
        padding: '40px',
        fontSize: '18px',
        color: '#666'
    };

    const errorStyle = {
        backgroundColor: '#ffeeee',
        color: '#e63946',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center' as const
    };

    const noDataStyle = {
        textAlign: 'center' as const,
        padding: '40px 0',
        color: '#666',
        fontSize: '16px'
    };

    // Add CSS for animation
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Yükleme durumunda spinner göster
    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>Araç İlanlarım</h1>
                        <p style={subtitleStyle}>Araç ilanlarınızı görüntüleyin, güncelleyin ve yönetin</p>
                    </div>
                    <div style={{ padding: '40px' }}>
                        <div style={loadingStyle}>Araç ilanları yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Hata durumunda hata mesajı göster
    if (error) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>Araç İlanlarım</h1>
                        <p style={subtitleStyle}>Araç ilanlarınızı görüntüleyin, güncelleyin ve yönetin</p>
                    </div>
                    <div style={{ padding: '40px' }}>
                        <div style={errorStyle}>
                            <h2>Hata!</h2>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* Header with gradient background */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Araç İlanlarım</h1>
                    <p style={subtitleStyle}>Araç ilanlarınızı görüntüleyin, güncelleyin ve yönetin</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {/* User info section */}
                    <div style={userInfoStyle}>
                        <div>
                            <span style={userNameStyle}>
                                Hoş geldiniz
                            </span>
                            <p style={{ margin: '5px 0 0', color: '#666' }}>{user?.email}</p>
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
                        placeholder="Arama yap... (Başlık, Açıklama, Araç Tipi)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />

                    <div style={filterContainerStyle}>
                        {/* Status filter */}
                        <div>
                            <select
                                value={statusFilter === undefined ? '' : statusFilter.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setStatusFilter(value === '' ? undefined : parseInt(value));
                                }}
                                style={{...selectStyle, backgroundColor: statusFilter !== undefined ? '#e3f2fd' : '#f9f9f9'}}
                                className="select-element"
                            >
                                <option value="">Tüm Durumlar</option>
                                <option value={VEHICLE_AD_STATUS.PENDING.toString()}>Beklemede</option>
                                <option value={VEHICLE_AD_STATUS.ACCEPTED.toString()}>Onaylandı</option>
                                <option value={VEHICLE_AD_STATUS.REJECTED.toString()}>Reddedildi</option>
                            </select>
                        </div>

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
                                <option value="capacity-asc">Kapasite (Artan)</option>
                                <option value="capacity-desc">Kapasite (Azalan)</option>
                                <option value="title-asc">Başlık (A-Z)</option>
                                <option value="title-desc">Başlık (Z-A)</option>
                            </select>
                        </div>

                        {/* Ülke filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Ülke filtresi"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                style={{ ...selectStyle, minWidth: '120px' }}
                            />
                        </div>

                        {/* Şehir filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Şehir filtresi"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                style={{ ...selectStyle, minWidth: '120px' }}
                            />
                        </div>
                    </div>

                    {filteredAndSortedVehicles.length === 0 ? (
                        <div style={noDataStyle}>
                            Uygun araç ilanı bulunamadı. Filtreleri değiştirerek tekrar deneyebilirsiniz.
                        </div>
                    ) : (
                        <div style={gridStyle}>
                            {filteredAndSortedVehicles.map((vehicle) => (
                                <div key={vehicle.id} style={cardStyle} className="vehicle-card">
                                    <div style={cardHeaderStyle}>
                                        <div style={vehicleTypeStyle}>
                                            {vehicle.vehicleType}
                                        </div>
                                        <h3 style={{ 
                                            fontSize: '18px', 
                                            fontWeight: 'bold', 
                                            margin: '10px 0',
                                            color: '#333'
                                        }}>
                                            {vehicle.title}
                                        </h3>
                                        <p style={{ 
                                            fontSize: '14px', 
                                            color: '#666', 
                                            margin: '0',
                                            height: '40px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {vehicle.description}
                                        </p>
                                    </div>
                                    <div style={cardBodyStyle}>
                                        <div style={capacityStyle}>
                                            <span style={{ marginRight: '5px' }}>📦</span>
                                            {(vehicle.capacity ).toFixed(1)} Ton
                                        </div>
                                        <div style={locationStyle}>
                                            <span style={{ marginRight: '5px' }}>📍</span>
                                            {vehicle.city}, {vehicle.country}
                                        </div>
                                        <div style={dateStyle}>
                                            <span style={{ marginRight: '5px' }}>🗓️</span>
                                            {vehicle.adDate ? formatDateToTurkish(vehicle.adDate) : '-'}
                                        </div>
                                        <div style={actionButtonsStyle}>
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                style={updateButtonStyle}
                                            >
                                                Güncelle
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(vehicle)}
                                                style={deleteButtonStyle}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Güncelleme Modal */}
            {isUpdateModalOpen && selectedVehicle && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5%',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '500px',
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        padding: '30px',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <button
                            onClick={() => setIsUpdateModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>

                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '25px',
                            color: '#333'
                        }}>
                            Araç İlanı Güncelle
                        </h2>

                        <form onSubmit={handleUpdate} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            {/* Başlık */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    İlan Başlığı
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Açıklama */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Açıklama
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Araç Tipi */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Araç Tipi
                                </label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Seçiniz</option>
                                    {vehicleTypeOptions.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Kapasite */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Kapasite (Ton)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    min="0.1"
                                    step="0.1"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Ülke */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Ülke
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                    required
                                >
                                    <option value="">Ülke Seçin</option>
                                    {EUROPEAN_COUNTRIES.map(country => (
                                        <option key={country.value} value={country.value}>{country.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Şehir */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Şehir
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    ref={cityInputRef}
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.country}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: !formData.country ? '#f0f0f0' : '#f9f9f9',
                                        outline: 'none'
                                    }}
                                />
                                {!formData.country && (
                                    <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                                        Şehir girmek için önce ülke seçin
                                    </p>
                                )}
                            </div>

                            {/* Planlanan Tarih */}
                            <div className="form-group" style={{ 
                                backgroundColor: '#f0f7ff', 
                                padding: '15px', 
                                borderRadius: '10px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }}>
                                    <label style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: '#4a6cf7'
                                    }}>
                                        Planlanan Tarih
                                    </label>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        backgroundColor: '#e0e9fa',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        Sadece Bilgi Amaçlı
                                    </span>
                                </div>
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: '#333'
                                }}>
                                    {selectedVehicle?.adDate ? formatDateToTurkish(selectedVehicle.adDate) : 'Tarih bilgisi yok'}
                                </div>
                                <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                                    İlan tarihi güncellenememektedir. Yeni bir ilan oluşturmanız gerekir.
                                </p>
                            </div>

                            {/* Butonlar */}
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                marginTop: '10px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    style={{
                                        backgroundColor: '#f1f1f1',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 20px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        flex: '1',
                                        transition: 'all 0.2s ease'
                                    }}
                                    disabled={isUpdating}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#4a6fa5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 20px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                        opacity: isUpdating ? 0.7 : 1
                                    }}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Notification Component */}
            {showNotification && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#4a6cf7',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ fontSize: '20px' }}>✓</div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        Güncelleme talebiniz işleme alınmıştır, kontrollerden sonra yayına alınacaktır.
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyVehicleAdsPage;