import { useState, useEffect,  MutableRefObject } from 'react';

// Avrupa ülkeleri listesi (value: İngilizce, label: Türkçe)
export const EUROPEAN_COUNTRIES = [
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

// Google Places API için tip tanımlamaları
declare global {
    interface Window {
        google: any;
        initGooglePlaces: () => void;
    }
}

// Ülke kodları
const COUNTRY_CODES: { [key: string]: string } = {
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

interface AutocompleteOptions {
    apiKey?: string; // Google Places API anahtarı (opsiyonel, import.meta.env'den de alınabilir)
    types?: string[]; // Autocomplete tipi, örn: ['(cities)']
    fields?: string[]; // Dönecek alanlar, örn: ['name', 'place_id', 'geometry']
}

interface AutocompleteHookResult {
    isGoogleLoaded: boolean;
    initializeAutocomplete: (
        inputRef: MutableRefObject<HTMLInputElement | null>,
        autocompleteRef: MutableRefObject<any>,
        country: string,
        onPlaceChanged: (place: any) => void
    ) => void;
    updateAutocompleteRestrictions: (
        autocompleteRef: MutableRefObject<any>,
        country: string,
        inputRef: MutableRefObject<HTMLInputElement | null>,
        onClear: () => void
    ) => void;
    getCountryCode: (country: string) => string;
}

/**
 * Google Places API kullanarak ülke bazlı şehir autocomplete işlevselliği sağlayan hook
 * @param options Autocomplete seçenekleri
 * @returns {AutocompleteHookResult} Autocomplete işlevleri ve durumları
 */
const useAutocomplete = (options: AutocompleteOptions = {}): AutocompleteHookResult => {
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    
    const defaultOptions = {
        types: ['(cities)'],
        fields: ['name', 'place_id', 'geometry', 'formatted_address']
    };
    
    const mergedOptions = { ...defaultOptions, ...options };

    // Google Places API'yi yükle
    useEffect(() => {
        const loadGooglePlaces = () => {
            // Eğer zaten yüklendiyse tekrar yükleme
            if (window.google && window.google.maps && window.google.maps.places) {
                setIsGoogleLoaded(true);
                return;
            }

            // Google Places API script'ini yükle
            const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
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

        // Temizleme işlemi
        return () => {
            const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript && existingScript.parentNode) {
                existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, [options.apiKey]);

    // Ülke kodunu döndür
    const getCountryCode = (country: string): string => {
        return COUNTRY_CODES[country] || 'tr'; // Varsayılan olarak Türkiye
    };

    // Autocomplete'i başlat
    const initializeAutocomplete = (
        inputRef: MutableRefObject<HTMLInputElement | null>,
        autocompleteRef: MutableRefObject<any>,
        country: string,
        onPlaceChanged: (place: any) => void
    ) => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error('Google Places API henüz yüklenmedi');
            return;
        }

        if (!inputRef.current || autocompleteRef.current) {
            return;
        }

        try {
            const autocompleteOptions: google.maps.places.AutocompleteOptions = {
                types: mergedOptions.types,
                fields: mergedOptions.fields,
            };

            if (country) {
                autocompleteOptions.componentRestrictions = { 
                    country: getCountryCode(country) 
                };
            }

            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                inputRef.current,
                autocompleteOptions
            );

            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current.getPlace();
                onPlaceChanged(place);
            });
        } catch (error) {
            console.error('Autocomplete initialize edilirken hata:', error);
        }
    };

    // Autocomplete kısıtlamalarını güncelle
    const updateAutocompleteRestrictions = (
        autocompleteRef: MutableRefObject<any>,
        country: string,
        inputRef: MutableRefObject<HTMLInputElement | null>,
        onClear: () => void
    ) => {
        if (isGoogleLoaded && autocompleteRef.current && country) {
            try {
                autocompleteRef.current.setComponentRestrictions({
                    country: getCountryCode(country)
                } as google.maps.places.ComponentRestrictions);
                
                // Input değerini temizle
                if (inputRef.current) {
                    inputRef.current.value = '';
                    onClear();
                }
            } catch (error) {
                console.error('Autocomplete güncellenirken hata:', error);
            }
        }
    };

    return {
        isGoogleLoaded,
        initializeAutocomplete,
        updateAutocompleteRestrictions,
        getCountryCode
    };
};

export default useAutocomplete;
