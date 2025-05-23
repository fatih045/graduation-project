import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createCargo } from '../features/cargo/cargoSlice';
import { AppDispatch } from '../store/store';

// Google Places API'yi yükle
declare global {
    interface Window {
        google: any;
        initGooglePlaces: () => void;
    }
}

// Avrupa ülkeleri listesi
const EUROPEAN_COUNTRIES = [
    'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
    'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
    'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
    'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
    'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway',
    'Poland', 'Portugal', 'Romania', 'San Marino', 'Serbia', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine',
    'United Kingdom', 'Vatican City', 'Kosovo', 'Gibraltar', 'Faroe Islands',
    'Greenland', 'Isle of Man', 'Jersey'
];

interface CargoFormData {
    userId: string;
    title: string;
    description: string;
    weight: number;
    cargoType: string;
    pickupCountry: string;
    pickupCity: string;
    dropoffCountry: string;
    dropoffCity: string;
    price: number;
    currency: 'TRY' | 'USD' | 'EUR';
}

const CreateCargoPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState<CargoFormData>({
        userId: '', // Bu normalde auth'dan gelecek
        title: '',
        description: '',
        weight: 0,
        cargoType: '',
        pickupCountry: '',
        pickupCity: '',
        dropoffCountry: '',
        dropoffCity: '',
        price: 0,
        currency: 'TRY'
    });

    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

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
                // Fallback olarak basit city listesi kullanabiliriz
                setIsGoogleLoaded(false);
            };

            document.head.appendChild(script);
        };

        loadGooglePlaces();

        return () => {
            // Cleanup - script'i kaldır
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
                const pickupOptions = {
                    types: ['(cities)'],
                    fields: ['name', 'place_id', 'geometry'],
                };

                if (formData.pickupCountry) {
                    pickupOptions.componentRestrictions = { country: getCountryCode(formData.pickupCountry) };
                }

                pickupAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    pickupInputRef.current,
                    pickupOptions
                );

                pickupAutocompleteRef.current.addListener('place_changed', () => {
                    const place = pickupAutocompleteRef.current.getPlace();
                    if (place && place.name) {
                        setFormData(prev => ({ ...prev, pickupCity: place.name }));
                    } else if (place && place.formatted_address) {
                        // Eğer name yoksa formatted_address'den şehir ismini çıkar
                        const cityName = place.formatted_address.split(',')[0];
                        setFormData(prev => ({ ...prev, pickupCity: cityName }));
                    }
                });
            }

            // Dropoff autocomplete
            if (dropoffInputRef.current && !dropoffAutocompleteRef.current) {
                const dropoffOptions = {
                    types: ['(cities)'],
                    fields: ['name', 'place_id', 'geometry'],
                };

                if (formData.dropoffCountry) {
                    dropoffOptions.componentRestrictions = { country: getCountryCode(formData.dropoffCountry) };
                }

                dropoffAutocompleteRef.current = new window.google.maps.places.Autocomplete(
                    dropoffInputRef.current,
                    dropoffOptions
                );

                dropoffAutocompleteRef.current.addListener('place_changed', () => {
                    const place = dropoffAutocompleteRef.current.getPlace();
                    if (place && place.name) {
                        setFormData(prev => ({ ...prev, dropoffCity: place.name }));
                    } else if (place && place.formatted_address) {
                        // Eğer name yoksa formatted_address'den şehir ismini çıkar
                        const cityName = place.formatted_address.split(',')[0];
                        setFormData(prev => ({ ...prev, dropoffCity: cityName }));
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
        if (isGoogleLoaded && pickupAutocompleteRef.current && formData.pickupCountry) {
            try {
                pickupAutocompleteRef.current.setComponentRestrictions({
                    country: getCountryCode(formData.pickupCountry)
                });
                // Input'u temizle ve yeniden focus et
                if (pickupInputRef.current) {
                    pickupInputRef.current.value = '';
                    setFormData(prev => ({ ...prev, pickupCity: '' }));
                }
            } catch (error) {
                console.error('Pickup autocomplete güncellenirken hata:', error);
            }
        }
    }, [formData.pickupCountry, isGoogleLoaded]);

    useEffect(() => {
        if (isGoogleLoaded && dropoffAutocompleteRef.current && formData.dropoffCountry) {
            try {
                dropoffAutocompleteRef.current.setComponentRestrictions({
                    country: getCountryCode(formData.dropoffCountry)
                });
                // Input'u temizle ve yeniden focus et
                if (dropoffInputRef.current) {
                    dropoffInputRef.current.value = '';
                    setFormData(prev => ({ ...prev, dropoffCity: '' }));
                }
            } catch (error) {
                console.error('Dropoff autocomplete güncellenirken hata:', error);
            }
        }
    }, [formData.dropoffCountry, isGoogleLoaded]);

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

    // Şehir input'larını handle et (Google Places API kullanırken manuel değişiklik için)
    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'dropoff') => {
        const value = e.target.value;

        if (type === 'pickup') {
            setFormData(prev => ({ ...prev, pickupCity: value }));
        } else {
            setFormData(prev => ({ ...prev, dropoffCity: value }));
        }
    };

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await dispatch(createCargo(formData)).unwrap();
            alert('Kargo başarıyla oluşturuldu!');

            // Form'u temizle
            setFormData({
                userId: '',
                title: '',
                description: '',
                weight: 0,
                cargoType: '',
                pickupCountry: '',
                pickupCity: '',
                dropoffCountry: '',
                dropoffCity: '',
                price: 0,
                currency: 'TRY'
            });
        } catch (error) {
            console.error('Kargo oluşturulurken hata:', error);
            alert('Kargo oluşturulurken bir hata oluştu!');
        }
    };

    // Dışarı tıklanınca önerileri kapat - artık gerekli değil
    useEffect(() => {
        // Google Places API kendi dropdown'ını yönetiyor
        // Bu kısım artık gerekli değil
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Yeni Kargo Oluştur</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* User ID - normalde auth'dan gelecek */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kullanıcı ID
                    </label>
                    <input
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlık
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Weight */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ağırlık (kg)
                    </label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Cargo Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kargo Türü
                    </label>
                    <input
                        type="text"
                        name="cargoType"
                        value={formData.cargoType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Pickup Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alım Ülkesi
                        </label>
                        <select
                            name="pickupCountry"
                            value={formData.pickupCountry}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Ülke Seçin</option>
                            {EUROPEAN_COUNTRIES.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alım Şehri
                        </label>
                        <input
                            ref={pickupInputRef}
                            type="text"
                            value={formData.pickupCity}
                            onChange={(e) => handleCityInputChange(e, 'pickup')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={isGoogleLoaded ? "Şehir yazın..." : "Google Places yükleniyor..."}
                            required
                            disabled={!formData.pickupCountry}
                        />
                        {!isGoogleLoaded && (
                            <p className="text-xs text-red-500 mt-1">
                                Google Places API yüklenemedi. Google Cloud Console'da Places API'yi etkinleştirin.
                            </p>
                        )}
                    </div>
                </div>

                {/* Dropoff Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teslim Ülkesi
                        </label>
                        <select
                            name="dropoffCountry"
                            value={formData.dropoffCountry}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Ülke Seçin</option>
                            {EUROPEAN_COUNTRIES.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teslim Şehri
                        </label>
                        <input
                            ref={dropoffInputRef}
                            type="text"
                            value={formData.dropoffCity}
                            onChange={(e) => handleCityInputChange(e, 'dropoff')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={isGoogleLoaded ? "Şehir yazın..." : "Google Places yükleniyor..."}
                            required
                            disabled={!formData.dropoffCountry}
                        />
                        {!isGoogleLoaded && (
                            <p className="text-xs text-red-500 mt-1">
                                Google Cloud Console'da Places API'yi etkinleştirin.
                            </p>
                        )}
                    </div>
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fiyat
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Para Birimi
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    Kargo Oluştur
                </button>
            </form>
        </div>
    );
};

export default CreateCargoPage;