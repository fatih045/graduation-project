// LocationService.ts
import { useState, useEffect } from 'react';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface LocationState {
  location: LocationCoords | null;
  city: string;
  loading: boolean;
  error: string;
  getUserLocation: () => void;
}

// useLocation hook olarak değiştirdik
export const useLocation = (): LocationState => {
    const [location, setLocation] = useState<LocationCoords | null>(null);
    const [city, setCity] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Kullanıcının konumunu al
    const getUserLocation = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Tarayıcınız konum bilgisini desteklemiyor');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const userLocation = { lat: latitude, lng: longitude };
                setLocation(userLocation);
                console.log('🌍 Kullanıcı Konumu:', userLocation);
                console.log('Yükleniyor:', loading);
                getCityFromCoordinates(latitude, longitude);
            },
            (geoError) => {
                setLoading(false);
                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        setError('Konum erişimi reddedildi');
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        setError('Konum bilgisi alınamadı');
                        break;
                    case geoError.TIMEOUT:
                        setError('Konum alma işlemi zaman aşımına uğradı');
                        break;
                    default:
                        setError('Bilinmeyen bir hata oluştu');
                        break;
                }
                console.log('Hata:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 dakika cache
            }
        );
    };

    // Google Geocoding API ile şehir adını al
    const getCityFromCoordinates = async (lat: number, lng: number) => {
        try {
            // API anahtarını kontrol et
            const apiKey = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY;
            console.log('API anahtarı var mı:', !!apiKey);

            if (!apiKey) {
                throw new Error('Google API anahtarı bulunamadı. .env dosyasında VITE_GOOGLE_PLACES_API_KEY tanımlandığından emin olun.');
            }

            // API URL'sini oluştur ve konsola yazdır (anahtarı gizleyerek)
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=tr`;
            console.log('API URL (anahtarsız):', url.replace(apiKey, 'API_KEY_HIDDEN'));

            // API isteği yap
            console.log('API isteği yapılıyor...');
            const response = await fetch(url);
            console.log('API yanıtı alındı, durum:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
            }

            // JSON yanıtını al
            const data = await response.json();
            console.log('API yanıtı durumu:', data.status);
            
            if (data.error_message) {
                console.error('API hata mesajı:', data.error_message);
            }

            if (data.status !== 'OK') {
                throw new Error(`API Hatası: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`);
            }

            // Sonuçlardan şehir bilgisini çıkar
            const result = data.results[0];
            let cityName = '';

            // Address components'tan şehir bilgisini bul
            for (const component of result.address_components) {
                if (component.types.includes('administrative_area_level_1')) {
                    cityName = component.long_name;
                    break;
                }
                if (component.types.includes('locality')) {
                    cityName = component.long_name;
                    break;
                }
            }

            if (!cityName && result.address_components.length > 0) {
                // Eğer şehir bulunamazsa, formatted_address'ten çıkarmaya çalış
                const addressParts = result.formatted_address.split(', ');
                cityName = addressParts[addressParts.length - 2] || 'Bilinmeyen Şehir';
            }

            setCity(cityName);
            console.log('🏙️ Şehir Bulundu:', cityName);
            console.log('📍 Tam Adres:', result.formatted_address);
            setLoading(false);

        } catch (catchError) {
            const errorMessage = catchError instanceof Error ? catchError.message : 'Bilinmeyen hata';
            console.error('❌ Şehir bilgisi alınırken hata:', errorMessage);
            setError(`Şehir bilgisi alınamadı: ${errorMessage}`);
            setLoading(false);
            
            // API anahtarı ile ilgili ipuçları göster
            console.log('🔑 API anahtarı ipuçları:');
            console.log('1. .env dosyasında VITE_GOOGLE_PLACES_API_KEY değişkeni tanımlı olmalıdır');
            console.log('2. Google Cloud Console\'da Geocoding API etkinleştirilmelidir');
            console.log('3. API anahtarınızın kısıtlamaları olabilir, kontrol edin');
            console.log('4. API kotanız dolmuş olabilir');
        }
    };

    // Component mount olduğunda otomatik konum al
    useEffect(() => {
        getUserLocation();
    }, []);

    // Hook'un döndürdüğü değerler
    return { location, city, loading, error, getUserLocation };
};

// Geriye uyumluluk için eski export'u da koruyalım
export default useLocation;