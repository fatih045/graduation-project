import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createVehicleAd } from '../features/vehicle/vehicleAdSlice';
import { AppDispatch, useAppSelector } from '../store/store';
import { fetchVehiclesByCarrier } from '../features/vehicle/vehicleSlice';


// Google Places API'yi yükle
declare global {
    interface Window {
        google: any;
        initGooglePlaces: () => void;
    }
}

// Avrupa ülkeleri listesi (value: İngilizce, label: Türkçe)
const EUROPEAN_COUNTRIES = [
    { value: 'Albania', label: 'Arnavutluk' },
    { value: 'Andorra', label: 'Andorra' },
    { value: 'Austria', label: 'Avusturya' },
    { value: 'Belarus', label: 'Belarus' },
    { value: 'Belgium', label: 'Belçika' },
    { value: 'Bosnia and Herzegovina', label: 'Bosna Hersek' },
    { value: 'Bulgaria', label: 'Bulgaristan' },
    { value: 'Croatia', label: 'Hırvatistan' },
    { value: 'Cyprus', label: 'Kıbrıs' },
    { value: 'Czech Republic', label: 'Çek Cumhuriyeti' },
    { value: 'Denmark', label: 'Danimarka' },
    { value: 'Estonia', label: 'Estonya' },
    { value: 'Finland', label: 'Finlandiya' },
    { value: 'France', label: 'Fransa' },
    { value: 'Germany', label: 'Almanya' },
    { value: 'Greece', label: 'Yunanistan' },
    { value: 'Hungary', label: 'Macaristan' },
    { value: 'Iceland', label: 'İzlanda' },
    { value: 'Ireland', label: 'İrlanda' },
    { value: 'Italy', label: 'İtalya' },
    { value: 'Latvia', label: 'Letonya' },
    { value: 'Liechtenstein', label: 'Lihtenştayn' },
    { value: 'Lithuania', label: 'Litvanya' },
    { value: 'Luxembourg', label: 'Lüksemburg' },
    { value: 'Malta', label: 'Malta' },
    { value: 'Moldova', label: 'Moldova' },
    { value: 'Monaco', label: 'Monako' },
    { value: 'Montenegro', label: 'Karadağ' },
    { value: 'Netherlands', label: 'Hollanda' },
    { value: 'North Macedonia', label: 'Kuzey Makedonya' },
    { value: 'Norway', label: 'Norveç' },
    { value: 'Poland', label: 'Polonya' },
    { value: 'Portugal', label: 'Portekiz' },
    { value: 'Romania', label: 'Romanya' },
    { value: 'San Marino', label: 'San Marino' },
    { value: 'Serbia', label: 'Sırbistan' },
    { value: 'Slovakia', label: 'Slovakya' },
    { value: 'Slovenia', label: 'Slovenya' },
    { value: 'Spain', label: 'İspanya' },
    { value: 'Sweden', label: 'İsveç' },
    { value: 'Switzerland', label: 'İsviçre' },
    { value: 'Turkey', label: 'Türkiye' },
    { value: 'Ukraine', label: 'Ukrayna' },
    { value: 'United Kingdom', label: 'Birleşik Krallık' },
    { value: 'Vatican City', label: 'Vatikan' },
    { value: 'Kosovo', label: 'Kosova' },
    { value: 'Gibraltar', label: 'Cebelitarık' },
    { value: 'Faroe Islands', label: 'Faroe Adaları' },
    { value: 'Greenland', label: 'Grönland' },
    { value: 'Isle of Man', label: 'Man Adası' },
    { value: 'Jersey', label: 'Jersey' }
];

// Araç türleri
const VEHICLE_TYPES = [
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

interface VehicleFormData {
    title: string;
    description: string;
    country: string;
    city: string;
    vehicleType: string;
    capacity: number;
    adDate: string;
    createdDate: string;
    carrierName: string;
}

const CreateVehicleAdPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Redux store'dan userId'yi al
    const userId = useAppSelector(state => state.auth.user?.uid || "");

    // Kullanıcının araçlarını al
    const userVehicles = useAppSelector(state => state.vehicle.items);
    const vehicleStatus = useAppSelector(state => state.vehicle.status);

    const [formData, setFormData] = useState<VehicleFormData>({
        title: '',
        description: '',
        country: '',
        city: '',
        vehicleType: '',
        capacity: 0,
        adDate: new Date().toISOString().slice(0, 16),
        createdDate: '',
        carrierName: ''
    });

    const [selectedVehicleId, setSelectedVehicleId] = useState<number | ''>('');
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityAutocompleteRef = useRef<any>(null);

    // Kullanıcının araçlarını yükle
    useEffect(() => {
        if (userId) {
            dispatch(fetchVehiclesByCarrier(userId));
        }
    }, [dispatch, userId]);

    // Google Places API'yi yükle ve initialize et
    useEffect(() => {
        const loadGooglePlaces = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsGoogleLoaded(true);
                initializeAutocomplete();
                return;
            }

            // Google Places API script'ini yükle
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setIsGoogleLoaded(true);
                initializeAutocomplete();
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

    // Autocomplete'i initialize et
    const initializeAutocomplete = () => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error('Google Places API henüz yüklenmedi');
            return;
        }

        try {
            // City autocomplete
            if (cityInputRef.current && !cityAutocompleteRef.current) {
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
            }
        } catch (error) {
            console.error('Autocomplete initialize edilirken hata:', error);
            setIsGoogleLoaded(false);
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

    // Input değişikliklerini handle et
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' ? Number(value) : value
        }));
    };

    // Şehir input'unu handle et
    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, city: value }));
    };

    // Araç seçildiğinde form verilerini güncelle
    const handleVehicleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vehicleId = e.target.value;
        setSelectedVehicleId(vehicleId === '' ? '' : Number(vehicleId));
        
        if (vehicleId === '') {
            // Araç seçimi temizlendiğinde, kapasite ve araç türünü sıfırla
            setFormData(prev => ({
                ...prev,
                vehicleType: '',
                capacity: 0
            }));
        } else {
            // Seçilen aracın bilgilerini bul
            const selectedVehicle = userVehicles.find(v => v.id === Number(vehicleId));
            if (selectedVehicle) {
                // Form verilerini güncelle
                setFormData(prev => ({
                    ...prev,
                    vehicleType: selectedVehicle.vehicleType,
                    capacity: selectedVehicle.capacity
                }));
            }
        }
    };

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // userId kontrolü
        if (!userId) {
            setError('Giriş yapmış bir kullanıcı bulunamadı!');
            return;
        }

        // Kapasite kontrolü
        if (!formData.capacity || formData.capacity <= 0) {
            setError('Kapasite değeri 0\'dan büyük olmalıdır!');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // formData'ya carrierId'yi (userId) ekle
            const vehicleAdData = {
                ...formData,
                carrierId: userId
            };

            await dispatch(createVehicleAd(vehicleAdData)).unwrap();
            setShowSuccessPopup(true);

            // Form'u temizle
            setFormData({
                title: '',
                description: '',
                country: '',
                city: '',
                vehicleType: '',
                capacity: 0,
                adDate: new Date().toISOString().slice(0, 16),
                createdDate: '',
                carrierName: ''
            });
        } catch (error) {
            console.error('Araç ilanı oluşturulurken hata:', error);
            setError('Araç ilanı oluşturulurken bir hata oluştu!');
        } finally {
            setIsLoading(false);
        }
    };

    // Kullanıcı giriş yapmamışsa uyarı göster
    if (!userId) {
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
                        }}>Yeni Araç İlanı Oluştur</h1>
                        <p style={{
                            fontSize: '16px',
                            opacity: 0.9,
                            marginBottom: '20px'
                        }}>Araç bilgilerinizi girerek yeni bir ilan oluşturun</p>
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
                            Araç ilanı oluşturmak için giriş yapmış bir kullanıcı bulunamadı!
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
            {/* Success Popup */}
            {showSuccessPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '500px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h2 style={{ color: '#e63946', marginBottom: '15px', fontSize: '24px' }}>
                            İlanınız Başarıyla Oluşturuldu!
                        </h2>
                        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
                            Araç ilanınız moderatör onayına gönderildi. İncelendikten sonra yayınlanacaktır.
                            İlanınızın durumunu "Araç İlanlarım" sayfasından takip edebilirsiniz.
                        </p>
                        <button
                            onClick={() => setShowSuccessPopup(false)}
                            style={{
                                backgroundColor: '#e63946',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}

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
                    }}>Yeni Araç İlanı Oluştur</h1>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        marginBottom: '20px'
                    }}>Araç bilgilerinizi girerek yeni bir ilan oluşturun</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            Hata: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '25px'
                    }}>
                        {/* Başlık */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px'
                            }}>Başlık</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '10px',
                                    backgroundColor: '#f9f9f9',
                                    outline: 'none',
                                    transition: 'border-color 0.3s, box-shadow 0.3s'
                                }}
                                placeholder="Araç ilanı başlığı"
                                required
                            />
                        </div>

                        {/* Açıklama */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px'
                            }}>Açıklama</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '10px',
                                    backgroundColor: '#f9f9f9',
                                    outline: 'none',
                                    transition: 'border-color 0.3s, box-shadow 0.3s',
                                    resize: 'vertical'
                                }}
                                placeholder="Araç hakkında detaylı bilgi"
                                required
                            />
                        </div>

                        {/* Araç Seçimi */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px'
                            }}>Araçlarım</label>
                            <select
                                value={selectedVehicleId}
                                onChange={handleVehicleSelect}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '10px',
                                    backgroundColor: '#f9f9f9',
                                    outline: 'none',
                                    transition: 'border-color 0.3s, box-shadow 0.3s'
                                }}
                            >
                                <option value="">Araç Seçin (Opsiyonel)</option>
                                {userVehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.title} - {vehicle.model} ({vehicle.licensePlate})
                                    </option>
                                ))}
                            </select>
                            <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                                Kayıtlı araçlarınızdan birini seçerek kapasite ve araç türü bilgilerini otomatik doldurabilirsiniz
                            </p>
                            {vehicleStatus === 'loading' && (
                                <p style={{ color: '#4a6cf7', fontSize: '12px', marginTop: '5px' }}>
                                    Araçlarınız yükleniyor...
                                </p>
                            )}
                            {vehicleStatus === 'failed' && (
                                <p style={{ color: '#c33', fontSize: '12px', marginTop: '5px' }}>
                                    Araçlarınız yüklenirken bir hata oluştu
                                </p>
                            )}
                            {vehicleStatus === 'succeeded' && userVehicles.length === 0 && (
                                <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                                    Henüz kayıtlı aracınız bulunmuyor
                                </p>
                            )}
                        </div>

                        {/* Kapasite ve Araç Türü */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Kapasite (ton)</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    min="0.1"
                                    step="0.1"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.3s'
                                    }}
                                    placeholder="0.0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Araç Türü</label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.3s'
                                    }}
                                    required
                                >
                                    <option value="">Araç Türü Seçin</option>
                                    {VEHICLE_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Lokasyon */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Ülke</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.3s'
                                    }}
                                    required
                                >
                                    <option value="">Ülke Seçin</option>
                                    {EUROPEAN_COUNTRIES.map(country => (
                                        <option key={country.value} value={country.value}>{country.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Şehir</label>
                                <input
                                    type="text"
                                    name="city"
                                    ref={cityInputRef}
                                    value={formData.city}
                                    onChange={handleCityInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.3s'
                                    }}
                                    placeholder="Şehir adı"
                                    required
                                    disabled={!formData.country}
                                />
                                {!formData.country && (
                                    <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                                        Şehir girmek için önce ülke seçin
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Planlanan Tarih */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px',
                                color: '#4a6cf7'
                            }}>Planlanan Tarih</label>
                            <input
                                type="datetime-local"
                                name="adDate"
                                value={formData.adDate}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '10px',
                                    backgroundColor: '#f9f9f9',
                                    outline: 'none',
                                    transition: 'border-color 0.3s, box-shadow 0.3s'
                                }}
                                required
                            />
                            <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                                İlanın aktif olacağı tarihi seçin (Türkiye saati)
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                backgroundColor: isLoading ? '#ccc' : '#e63946',
                                color: 'white',
                                padding: '16px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                marginTop: '15px',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            {isLoading ? 'İlan Oluşturuluyor...' : 'Araç İlanı Oluştur'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateVehicleAdPage;