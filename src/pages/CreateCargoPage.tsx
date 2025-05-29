import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
// useAppSelector import edildi
import { createCargo } from '../features/cargo/cargoSlice';
import { AppDispatch,useAppSelector } from '../store/store';
import { calculatePrice, PriceCalculationRequest } from '../services/pricePredictionService';

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

// Kargo türleri
const CARGO_TYPES = [
    { value: 'Tarpaulin Truck', label: 'Tenteli Kamyon' },
    { value: 'Box Truck', label: 'Kapalı Kasa Kamyon' },
    { value: 'Refrigerated Truck', label: 'Soğutmalı Kamyon' },
    { value: 'Semi Trailer', label: 'Yarı Römork' },
    { value: 'Light-Truck', label: 'Hafif Kamyon' },
    { value: 'Container Carrier', label: 'Konteyner Taşıyıcı' },
    { value: 'Tank Truck', label: 'Tanker' },
    { value: 'Lowbed Trailer', label: 'Lowbed Römork' },
    { value: 'Dump Truck', label: 'Damperli Kamyon' },
    { value: 'Panel Van', label: 'Panel Van' },
    { value: 'Others', label: 'Diğer' }
];

interface CargoFormData {
    title: string;
    description: string;
    weight: number;
    cargoType: string;
    pickCountry: string;
    pickCity: string;
    dropCountry: string;
    dropCity: string;
    price: number;
    currency: 'TRY' | 'USD' | 'EUR';
    adDate: string;
}

const CreateCargoPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Redux store'dan userId'yi al
    const userId = useAppSelector(state => state.auth.user?.uid || "");

    // Bugünün tarihini YYYY-MM-DD formatında al
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<CargoFormData>({
        title: '',
        description: '',
        weight: 0,
        cargoType: '',
        pickCountry: '',
        pickCity: '',
        dropCountry: '',
        dropCity: '',
        price: 0,
        currency: 'TRY',
        adDate: today
    });

    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    
    // Fiyat tahmini için state
    const [priceEstimate, setPriceEstimate] = useState<{
        minPrice: number | null;
        maxPrice: number | null;
        loading: boolean;
        error: string | null;
    }>({
        minPrice: null,
        maxPrice: null,
        loading: false,
        error: null
    });

    const pickupInputRef = useRef<HTMLInputElement>(null);
    const dropoffInputRef = useRef<HTMLInputElement>(null);
    const pickupAutocompleteRef = useRef<any>(null);
    const dropoffAutocompleteRef = useRef<any>(null);

    // Google Places API'yi yükle ve initialize et
    useEffect(() => {
        const loadGooglePlaces = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsGoogleLoaded(true);
                initializeAutocomplete();
                return;
            }

            // Google Places API script'ini yükle (yeni API)
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

    // Autocomplete'leri initialize et
    const initializeAutocomplete = () => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error('Google Places API henüz yüklenmedi');
            return;
        }

        try {
            // Pickup autocomplete
            if (pickupInputRef.current && !pickupAutocompleteRef.current) {
                const pickupOptions: google.maps.places.AutocompleteOptions = {
                    types: ['(cities)'],
                    fields: ['name', 'place_id', 'geometry'],
                };

                if (formData.pickCountry) {
                    pickupOptions.componentRestrictions = { country: getCountryCode(formData.pickCountry) };
                }

                pickupAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    pickupInputRef.current,
                    pickupOptions
                );

                pickupAutocompleteRef.current.addListener('place_changed', () => {
                    const place = pickupAutocompleteRef.current.getPlace();
                    if (place && place.name) {
                        setFormData(prev => ({ ...prev, pickCity: place.name }));
                    } else if (place && place.formatted_address) {
                        const cityName = place.formatted_address.split(',')[0];
                        setFormData(prev => ({ ...prev, pickCity: cityName }));
                    }
                });
            }

            // Dropoff autocomplete
            if (dropoffInputRef.current && !dropoffAutocompleteRef.current) {
                const dropoffOptions: google.maps.places.AutocompleteOptions = {
                    types: ['(cities)'],
                    fields: ['name', 'place_id', 'geometry'],
                };

                if (formData.dropCountry) {
                    dropoffOptions.componentRestrictions = { country: getCountryCode(formData.dropCountry) };
                }

                dropoffAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    dropoffInputRef.current,
                    dropoffOptions
                );

                dropoffAutocompleteRef.current.addListener('place_changed', () => {
                    const place = dropoffAutocompleteRef.current.getPlace();
                    if (place && place.name) {
                        setFormData(prev => ({ ...prev, dropCity: place.name }));
                    } else if (place && place.formatted_address) {
                        const cityName = place.formatted_address.split(',')[0];
                        setFormData(prev => ({ ...prev, dropCity: cityName }));
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
        if (isGoogleLoaded && pickupAutocompleteRef.current && formData.pickCountry) {
            try {
                pickupAutocompleteRef.current.setComponentRestrictions({
                    country: getCountryCode(formData.pickCountry)
                } as google.maps.places.ComponentRestrictions);
                if (pickupInputRef.current) {
                    pickupInputRef.current.value = '';
                    setFormData(prev => ({ ...prev, pickCity: '' }));
                }
            } catch (error) {
                console.error('Pickup autocomplete güncellenirken hata:', error);
            }
        }
    }, [formData.pickCountry, isGoogleLoaded]);

    useEffect(() => {
        if (isGoogleLoaded && dropoffAutocompleteRef.current && formData.dropCountry) {
            try {
                dropoffAutocompleteRef.current.setComponentRestrictions({
                    country: getCountryCode(formData.dropCountry)
                } as google.maps.places.ComponentRestrictions);
                if (dropoffInputRef.current) {
                    dropoffInputRef.current.value = '';
                    setFormData(prev => ({ ...prev, dropCity: '' }));
                }
            } catch (error) {
                console.error('Dropoff autocomplete güncellenirken hata:', error);
            }
        }
    }, [formData.dropCountry, isGoogleLoaded]);

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
            [name]: name === 'weight' || name === 'price' ? Number(value) : value
        }));
    };

    // Şehir input'larını handle et
    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'dropoff') => {
        const value = e.target.value;

        if (type === 'pickup') {
            setFormData(prev => ({ ...prev, pickCity: value }));
        } else {
            setFormData(prev => ({ ...prev, dropCity: value }));
        }
    };
    
    // Fiyat tahmini hesapla
    const calculatePriceEstimate = async () => {
        // Gerekli alanların dolu olup olmadığını kontrol et
        if (!formData.cargoType || !formData.pickCountry || !formData.pickCity || 
            !formData.dropCountry || !formData.dropCity || formData.weight <= 0) {
            return;
        }
        
        setPriceEstimate(prev => ({ ...prev, loading: true, error: null }));
        
        try {
            const requestData: PriceCalculationRequest = {
                cargoType: formData.cargoType,
                pickCity: formData.pickCity,
                pickCountry: formData.pickCountry,
                deliveryCity: formData.dropCity,
                deliveryCountry: formData.dropCountry,
                weight: formData.weight
            };
            
            const response = await calculatePrice(requestData);
            
            setPriceEstimate({
                minPrice: response.price.minPrice,
                maxPrice: response.price.maxPrice,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Fiyat tahmini alınırken hata:', error);
            setPriceEstimate(prev => ({
                ...prev,
                loading: false,
                error: 'Fiyat tahmini alınamadı'
            }));
        }
    };
    
    // Gerekli alanlar değiştiğinde fiyat tahmini hesapla
    useEffect(() => {
        // Daha önce hesaplanan bir fiyat varsa ve alanlar değiştiyse, fiyat tahminini sıfırla
        if (priceEstimate.minPrice !== null || priceEstimate.maxPrice !== null) {
            setPriceEstimate({
                minPrice: null,
                maxPrice: null,
                loading: false,
                error: null
            });
        }
        
        // Debounce için timeout oluştur
        const timeoutId = setTimeout(() => {
            calculatePriceEstimate();
        }, 1000); // 1 saniye bekle
        
        return () => clearTimeout(timeoutId);
    }, [formData.cargoType, formData.pickCountry, formData.pickCity, formData.dropCountry, formData.dropCity, formData.weight]);

    // Fiyat yuvarlamak için yardımcı fonksiyon
    // const roundPrice = (price: number): number => {
    //     if (price >= 100 && price < 1000) {
    //         // 3 haneli sayılar için en yakın onluğa yuvarlama
    //         return Math.round(price / 10) * 10;
    //     } else if (price >= 1000) {
    //         // 4 haneli ve üzeri sayılar için en yakın yüzlüğe yuvarlama
    //         return Math.round(price / 100) * 100;
    //     }
    //     return price;
    // };

    const roundPrice = (price: number): number => {
        if (price >= 100 && price < 1000) {
            // 3 haneli sayılar için en yakın 50'ye yuvarlama
            const remainder = price % 100;
            if (remainder < 25) {
                return Math.floor(price / 100) * 100;
            } else if (remainder < 75) {
                return Math.floor(price / 100) * 100 + 50;
            } else {
                return Math.ceil(price / 100) * 100;
            }
        } else if (price >= 1000) {
            // 4 haneli ve üzeri sayılar için en yakın yüzlüğe yuvarlama
            return Math.round(price / 100) * 100;
        }
        return price;
    };


    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // userId kontrolü
        if (!userId) {
            setError('Giriş yapmış bir kullanıcı bulunamadı!');
            return;
        }

        // Form validasyonu
        if (!formData.title || !formData.description || !formData.cargoType || 
            !formData.pickCountry || !formData.pickCity || 
            !formData.dropCountry || !formData.dropCity || 
            !formData.currency || !formData.adDate) {
            setError('Lütfen tüm alanları doldurun!');
            return;
        }

        // Ağırlık ve fiyat kontrolü
        if (formData.weight <= 0) {
            setError('Ağırlık 0\'dan büyük olmalıdır!');
            return;
        }

        if (formData.price <= 0) {
            setError('Fiyat 0\'dan büyük olmalıdır!');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // formData'ya userId'yi ekle ve adDate'i ISO formatına çevir
            const adDateWithTime = new Date(formData.adDate);
            adDateWithTime.setHours(new Date().getHours());
            adDateWithTime.setMinutes(new Date().getMinutes());
            adDateWithTime.setSeconds(new Date().getSeconds());

            const cargoData = {
                ...formData,
                userId: userId,
                adDate: adDateWithTime.toISOString()
            };

            await dispatch(createCargo(cargoData)).unwrap();
            // Show success popup instead of alert
            setShowSuccessPopup(true);

            // Form'u temizle
            setFormData({
                title: '',
                description: '',
                weight: 0,
                cargoType: '',
                pickCountry: '',
                pickCity: '',
                dropCountry: '',
                dropCity: '',
                price: 0,
                currency: 'TRY',
                adDate: today
            });
        } catch (error) {
            console.error('Kargo oluşturulurken hata:', error);
            setError('Kargo oluşturulurken bir hata oluştu!');
        } finally {
            setIsLoading(false);
        }
    };

    // Kullanıcı giriş yapmamışsa uyarı göster
    if (!userId) {
        return (
            <div className="main-content" style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5%'
            }}>
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '18px'
                }}>
                    Kargo oluşturmak için giriş yapmanız gerekiyor!
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
                    }}>Yeni Kargo Oluştur</h1>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        marginBottom: '20px'
                    }}>Kargo ilanınızı oluşturmak için aşağıdaki formu doldurun</p>
                </div>

                {/* Content */}
                <div style={{
                    padding: '40px'
                }}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '15px',
                            borderRadius: '10px',
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
                                placeholder="Kargo başlığı"
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
                                placeholder="Kargo hakkında detaylı bilgi"
                                required
                            />
                        </div>

                        {/* Ağırlık ve Kargo Türü */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Ağırlık (ton)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
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
                                    placeholder="0.1"
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
                                    name="cargoType"
                                    value={formData.cargoType}
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
                                    {CARGO_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Alım Lokasyonu */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Alım Ülkesi</label>
                                <select
                                    name="pickCountry"
                                    value={formData.pickCountry}
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
                                }}>Alım Şehri</label>
                                <input
                                    ref={pickupInputRef}
                                    type="text"
                                    value={formData.pickCity}
                                    onChange={(e) => handleCityInputChange(e, 'pickup')}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: formData.pickCountry ? '#f9f9f9' : '#f0f0f0',
                                        outline: 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.3s'
                                    }}
                                    placeholder={isGoogleLoaded ? "Şehir yazın..." : "Google Places yükleniyor..."}
                                    required
                                    disabled={!formData.pickCountry}
                                />
                            </div>
                        </div>

                        {/* Teslim Lokasyonu */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Teslim Ülkesi</label>
                                <select
                                    name="dropCountry"
                                    value={formData.dropCountry}
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
                                }}>Teslim Şehri</label>
                                <input
                                    ref={dropoffInputRef}
                                    type="text"
                                    value={formData.dropCity}
                                    onChange={(e) => handleCityInputChange(e, 'dropoff')}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: formData.dropCountry ? '#f9f9f9' : '#f0f0f0',
                                        outline: 'none',
                                        transition: 'border-color 0.3s, box-shadow 0.3s'
                                    }}
                                    placeholder={isGoogleLoaded ? "Şehir yazın..." : "Google Places yükleniyor..."}
                                    required
                                    disabled={!formData.dropCountry}
                                />
                            </div>
                        </div>

                        {/* Fiyat ve Para Birimi */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Fiyat</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0.01"
                                    step="0.01"
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
                                    placeholder="0.01"
                                    required
                                />
                                
                                {/* Fiyat tahmini gösterimi */}
                                {priceEstimate.loading && (
                                    <div style={{
                                        marginTop: '10px',
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>
                                        Fiyat tahmini hesaplanıyor...
                                    </div>
                                )}
                                
                                {priceEstimate.error && (
                                    <div style={{
                                        marginTop: '10px',
                                        fontSize: '14px',
                                        color: '#e63946'
                                    }}>
                                        {priceEstimate.error}
                                    </div>
                                )}
                                
                                {!priceEstimate.loading && !priceEstimate.error && priceEstimate.minPrice !== null && priceEstimate.maxPrice !== null && (
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '10px 15px',
                                        backgroundColor: '#f0f9ff',
                                        border: '1px solid #bae6fd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        color: '#0369a1'
                                    }}>
                                        <span style={{ fontWeight: 'bold' }}>Önerilen fiyat aralığı:</span> {priceEstimate.minPrice !== null ? roundPrice(priceEstimate.minPrice).toFixed(2) : '0.00'} - {priceEstimate.maxPrice !== null ? roundPrice(priceEstimate.maxPrice).toFixed(2) : '0.00'} EUR
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Para Birimi</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
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
                                    <option value="TRY">TRY</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>

                        {/* İlan Tarihi */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px'
                            }}>İlan Tarihi</label>
                            <input
                                type="date"
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
                        </div>

                        {/* Google Places API Uyarısı */}
                        {!isGoogleLoaded && (
                            <div style={{
                                backgroundColor: '#fff3cd',
                                color: '#856404',
                                padding: '12px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>Google Places API yüklenemedi. Şehir isimlerini manuel olarak girebilirsiniz.
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                backgroundColor: isLoading ? '#ccc' : '#e63946',
                                color: 'white',
                                padding: '16px',
                                fontSize: '18px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                marginTop: '15px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#d62838';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#e63946';
                                }
                            }}
                        >
                            {isLoading ? 'Oluşturuluyor...' : 'Kargo Oluştur'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="modal-overlay" style={{
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
                        borderRadius: '15px',
                        maxWidth: '500px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            color: '#e63946',
                            fontSize: '24px',
                            marginBottom: '15px'
                        }}>İlanınız Gönderildi</h2>
                        <p style={{
                            color: '#e63946',
                            fontSize: '16px',
                            marginBottom: '20px',
                            lineHeight: '1.5'
                        }}>
                            İlanınız moderatör onayına yönlendirildi. Gerekli koşulları sağlaması halinde yayına alınacaktır.
                        </p>
                        <button
                            onClick={() => setShowSuccessPopup(false)}
                            style={{
                                backgroundColor: '#e63946',
                                color: 'white',
                                padding: '12px 25px',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#d62838';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#e63946';
                            }}
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateCargoPage;
