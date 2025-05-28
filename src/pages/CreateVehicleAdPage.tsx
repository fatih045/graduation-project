import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createVehicleAd } from '../features/vehicle/vehicleAdSlice';
import { AppDispatch, useAppSelector } from '../store/store';

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

    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityAutocompleteRef = useRef<any>(null);

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
            // formData'ya carrierId'yi (userId) ekle ve createdDate ve carrierName için boş değerler gönder
            const vehicleAdData = {
                ...formData,
                carrierId: userId,
                createdDate: '',  // Bu değer backend tarafında oluşturulacak
                carrierName: ''   // Bu değer backend tarafında oluşturulacak
            };

            await dispatch(createVehicleAd(vehicleAdData)).unwrap();
            alert('Araç ilanı başarıyla oluşturuldu!');

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
                            Araç ilanı oluşturmak için giriş yapmanız gerekiyor!
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