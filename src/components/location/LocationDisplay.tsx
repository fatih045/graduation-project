import React from 'react';
import { useLocation } from '../../services/LocationService';

const LocationDisplay: React.FC = () => {
  // useLocation hook'unu kullanarak konum bilgilerini alalım
  const { location, city, loading, error, getUserLocation } = useLocation();

  return (
    <div className="location-display">
      <h3>Konum Bilgisi</h3>
      
      {loading && <p>Konum bilgisi alınıyor...</p>}
      
      {error && (
        <div className="error-message">
          <p>Hata: {error}</p>
          <button onClick={getUserLocation}>Tekrar Dene</button>
        </div>
      )}
      
      {location && (
        <div className="location-info">
          <p>Koordinatlar: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
          {city && <p>Şehir: {city}</p>}
        </div>
      )}
      
      {!loading && !location && !error && (
        <button onClick={getUserLocation}>Konumumu Bul</button>
      )}
    </div>
  );
};

export default LocationDisplay;
