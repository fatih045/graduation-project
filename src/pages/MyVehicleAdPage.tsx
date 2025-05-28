import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVehicleAdsByCarrier,
    updateVehicleAd,
    deleteVehicleAd,
    VehicleAd
} from '../features/vehicle/vehicleAdSlice';
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
            'Czech Republic': 'cz',
            'Hungary': 'hu',
            'Romania': 'ro',
            'Bulgaria': 'bg',
            'Croatia': 'hr',
            'Serbia': 'rs',
            'Bosnia and Herzegovina': 'ba',
            'Slovenia': 'si',
            'Slovakia': 'sk',
            'Portugal': 'pt',
            'Greece': 'gr',
            'Albania': 'al',
            'Montenegro': 'me',
            'North Macedonia': 'mk',
            'Moldova': 'md',
            'Ukraine': 'ua',
            'Belarus': 'by',
            'Lithuania': 'lt',
            'Latvia': 'lv',
            'Estonia': 'ee',
            'Finland': 'fi',
            'Sweden': 'se',
            'Norway': 'no',
            'Denmark': 'dk',
            'Iceland': 'is',
            'Ireland': 'ie',
            'Cyprus': 'cy',
            'Malta': 'mt',
            'Luxembourg': 'lu',
            'Liechtenstein': 'li',
            'Monaco': 'mc',
            'Andorra': 'ad',
            'San Marino': 'sm',
            'Vatican City': 'va',
            'Kosovo': 'xk'
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

    useEffect(() => {
        if (user && user.uid) {
            dispatch(fetchVehicleAdsByCarrier(user.uid));
        }
    }, [dispatch, user]);

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
                alert('Araç ilanı başarıyla güncellendi!');
                setIsUpdateModalOpen(false);
            })
            .catch((error) => {
                console.error('Araç ilanı güncellenirken hata oluştu:', error);
                alert('Araç ilanı güncellenirken bir hata oluştu!');
            })
            .finally(() => {
                setIsUpdating(false);
            });
    };

    // Sorting handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

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

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginTop: '10px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        overflow: 'hidden'
    };

    const thStyle = {
        backgroundColor: '#f2f2f2',
        padding: '15px',
        textAlign: 'left' as const,
        fontSize: '14px',
        fontWeight: 'bold' as const,
        color: '#333',
        cursor: 'pointer' as const,
        userSelect: 'none' as const,
        borderBottom: '1px solid #ddd'
    };

    const tdStyle = {
        padding: '15px',
        borderBottom: '1px solid #eee',
        fontSize: '14px',
        color: '#333'
    };

    const tdFirstStyle = {
        ...tdStyle,
        fontWeight: '500' as const
    };

    const tdLastStyle = {
        ...tdStyle,
        textAlign: 'center' as const
    };

    const updateButtonStyle = {
        backgroundColor: '#4a6fa5',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        fontSize: '13px',
        cursor: 'pointer',
        marginRight: '10px'
    };

    const deleteButtonStyle = {
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        fontSize: '13px',
        cursor: 'pointer'
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

    const sortIndicatorStyle = {
        marginLeft: '5px'
    };

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
                        <div style={{ overflowX: 'auto' as const }}>
                            <table style={tableStyle}>
                                <thead>
                                <tr>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('title')}
                                    >
                                        Başlık
                                        {sortBy === 'title' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('description')}
                                    >
                                        Açıklama
                                        {sortBy === 'description' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('capacity')}
                                    >
                                        Kapasite (Ton)
                                        {sortBy === 'capacity' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('vehicleType')}
                                    >
                                        Araç Tipi
                                        {sortBy === 'vehicleType' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th style={thStyle}>
                                        Konum
                                    </th>
                                    <th style={{ ...thStyle, color: '#4a6cf7' }}>
                                        Planlanan Tarih
                                    </th>
                                    <th style={{ ...thStyle, textAlign: 'center' as const }}>
                                        İşlemler
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAndSortedVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="vehicle-row" style={{ transition: 'all 0.2s ease' }}>
                                        <td style={tdFirstStyle}>
                                            {vehicle.title && vehicle.title.length > 30
                                                ? `${vehicle.title.substring(0, 30)}...`
                                                : vehicle.title}
                                        </td>
                                        <td style={tdStyle}>
                                            {vehicle.description && vehicle.description.length > 30
                                                ? `${vehicle.description.substring(0, 30)}...`
                                                : vehicle.description}
                                        </td>
                                        <td style={tdStyle}>{(vehicle.capacity / 1000).toFixed(1)} Ton</td>
                                        <td style={tdStyle}>{vehicle.vehicleType}</td>
                                        <td style={tdStyle}>{vehicle.city}, {vehicle.country}</td>
                                        <td style={{...tdStyle, color: '#4a6cf7', fontWeight: 'bold'}}>
                                            {vehicle.adDate ? formatDateToTurkish(vehicle.adDate) : '-'}
                                        </td>
                                        <td style={tdLastStyle}>
                                            <div className="action-buttons">
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
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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
                                        cursor: 'pointer'
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
        </div>
    );
};

export default MyVehicleAdsPage;