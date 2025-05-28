import React, { useEffect, useState } from 'react';
import { useLocation } from '../../services/LocationService';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicleAdsByCity } from '../../features/vehicle/vehicleAdSlice';
import { fetchCargosByPickCity } from '../../features/cargo/cargoSlice';
import { RootState, AppDispatch } from '../../store/store';
import { Package, Truck, MapPin, RefreshCw, AlertCircle, Shield } from 'lucide-react';

const LocationDisplay: React.FC = () => {
  // useLocation hook'unu kullanarak konum bilgilerini alalım
  const { city, loading: locationLoading, error: locationError, getUserLocation } = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Modal state
  const [showPermissionInfo, setShowPermissionInfo] = useState<boolean>(false);
  
  // Redux store'dan verileri alalım
  const { vehicleAds, loading: vehicleLoading, error: vehicleError } = useSelector((state: RootState) => state.vehicleAd);
  const { cargos, loading: cargoLoading, error: cargoError } = useSelector((state: RootState) => state.cargo);
  
  // Şehir değiştiğinde ilanları getir
  useEffect(() => {
    if (city) {
      dispatch(fetchVehicleAdsByCity(city));
      dispatch(fetchCargosByPickCity(city));
    }
  }, [city, dispatch]);

  // Konum izni reddedildiğinde bilgi modalını göster
  useEffect(() => {
    if (locationError && locationError.includes('permission')) {
      setShowPermissionInfo(true);
    }
  }, [locationError]);

  // Para birimi sembolünü döndüren yardımcı fonksiyon
  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'TRY': return '₺';
      default: return currency || '';
    }
  };

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Belirtilmemiş';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
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

  const contentStyle = {
    padding: '40px'
  };

  const locationBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
  };

  const twoColumnLayoutStyle = {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap' as const
  };

  const columnStyle = {
    flex: '1 1 calc(50% - 15px)',
    minWidth: '300px'
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease'
  };

  const cardHeaderStyle = {
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  };

  const cardBodyStyle = {
    padding: '15px'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  };

  // Add CSS styles for the component
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .vehicle-card:hover, .cargo-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      }

      .spin-animation {
        animation: spin 1.5s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .location-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background-color: #f0f4ff;
        color: #667eea;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
      }

      .id-badge {
        display: inline-block;
        background-color: #f0f0f0;
        color: #666;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 10px;
      }

      .label {
        font-weight: bold;
        color: #555;
        margin-right: 5px;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        background-color: #f8f9fa;
        border-radius: 10px;
        color: #666;
        text-align: center;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
      
      .permission-modal {
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
      }
      
      .permission-content {
        background-color: white;
        padding: 30px;
        border-radius: 20px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        text-align: center;
      }
      
      .permission-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        background-color: #f0f4ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #667eea;
      }
      
      .permission-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
      }
      
      .permission-text {
        color: #666;
        margin-bottom: 25px;
        line-height: 1.6;
      }
      
      .permission-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 12px 25px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .permission-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      @media (max-width: 768px) {
        .two-column-layout {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Yakınımda Ne Var?</h1>
          <p style={subtitleStyle}>Bulunduğunuz bölgedeki araç ve kargo ilanları</p>
          
          {city && (
            <div className="location-badge">
              <MapPin size={16} />
              <span>{city}</span>
              <button 
                onClick={getUserLocation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0 5px'
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>
        
        <div style={contentStyle}>
          {/* Konum Bilgisi */}
          {!city && !showPermissionInfo && (
            <div style={locationBoxStyle}>
              {locationLoading ? (
                <div className="loading-container">
                  <RefreshCw className="spin-animation" size={24} />
                  <span style={{ marginLeft: '10px' }}>Konum bilgisi alınıyor...</span>
                </div>
              ) : locationError ? (
                <div style={{ color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={24} />
                  <div>
                    <p>Hata: {locationError}</p>
                    <button 
                      onClick={getUserLocation}
                      style={buttonStyle}
                    >
                      Tekrar Dene
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <p style={{ marginBottom: '15px' }}>Yakınınızdaki ilanları görmek için konum bilginizi paylaşın</p>
                  <button 
                    onClick={getUserLocation}
                    style={buttonStyle}
                  >
                    <MapPin size={16} style={{ marginRight: '5px' }} />
                    Konumumu Bul
                  </button>
                </div>
              )}
            </div>
          )}
          
          {city && (
            <div style={twoColumnLayoutStyle} className="two-column-layout">
              {/* Sol Sütun - Araç İlanları */}
              <div style={columnStyle}>
                <div className="section-title">
                  <Truck size={24} />
                  <h2>Araç İlanları</h2>
                  {vehicleLoading && <RefreshCw className="spin-animation" size={18} />}
                </div>
                
                {vehicleError ? (
                  <div style={{ color: '#e53e3e', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
                    <AlertCircle size={18} style={{ marginRight: '10px' }} />
                    <span>Araç ilanları yüklenirken hata oluştu</span>
                  </div>
                ) : vehicleLoading ? (
                  <div className="loading-container">
                    <RefreshCw className="spin-animation" size={24} />
                  </div>
                ) : vehicleAds && vehicleAds.length === 0 ? (
                  <div className="empty-state">
                    <Truck size={40} style={{ opacity: 0.5, marginBottom: '15px' }} />
                    <p>Bu bölgede araç ilanı bulunamadı</p>
                  </div>
                ) : (
                  <div style={gridContainerStyle}>
                    {vehicleAds && vehicleAds.map(vehicle => (
                      <div key={vehicle.id} className="vehicle-card" style={cardStyle}>
                        <div style={cardHeaderStyle}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                            {vehicle.title}
                            <span className="id-badge">#{vehicle.id}</span>
                          </h3>
                        </div>
                        <div style={cardBodyStyle}>
                          <p>
                            <span className="label">Araç Tipi:</span> 
                            {vehicle.vehicleType}
                          </p>
                          <p>
                            <span className="label">Kapasite:</span> 
                            {vehicle.capacity} ton
                          </p>
                          <p>
                            <span className="label">Konum:</span> 
                            {vehicle.city}, {vehicle.country}
                          </p>
                          <p>
                            <span className="label">Taşıyıcı:</span> 
                            {vehicle.carrierName}
                          </p>
                          <p>
                            <span className="label">İlan Tarihi:</span> 
                            {formatDate(vehicle.adDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Sağ Sütun - Kargo İlanları */}
              <div style={columnStyle}>
                <div className="section-title">
                  <Package size={24} />
                  <h2>Yük İlanları</h2>
                  {cargoLoading && <RefreshCw className="spin-animation" size={18} />}
                </div>
                
                {cargoError ? (
                  <div style={{ color: '#e53e3e', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '8px' }}>
                    <AlertCircle size={18} style={{ marginRight: '10px' }} />
                    <span>Kargo ilanları yüklenirken hata oluştu</span>
                  </div>
                ) : cargoLoading ? (
                  <div className="loading-container">
                    <RefreshCw className="spin-animation" size={24} />
                  </div>
                ) : cargos && cargos.length === 0 ? (
                  <div className="empty-state">
                    <Package size={40} style={{ opacity: 0.5, marginBottom: '15px' }} />
                    <p>Bu bölgede yük ilanı bulunamadı</p>
                  </div>
                ) : (
                  <div style={gridContainerStyle}>
                    {cargos && cargos.map(cargo => (
                      <div key={cargo.id} className="cargo-card" style={cardStyle}>
                        <div style={cardHeaderStyle}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                            {cargo.title}
                            <span className="id-badge">#{cargo.id}</span>
                          </h3>
                        </div>
                        <div style={cardBodyStyle}>
                          <p>
                            <span className="label">Kargo Tipi:</span> 
                            {cargo.cargoType}
                          </p>
                          <p>
                            <span className="label">Ağırlık:</span> 
                            {cargo.weight} ton
                          </p>
                          <p>
                            <span className="label">Güzergah:</span> 
                            {cargo.pickCity} → {cargo.dropCity}
                          </p>
                          <p>
                            <span className="label">Fiyat:</span> 
                            {cargo.price} {getCurrencySymbol(cargo.currency)}
                          </p>
                          <p>
                            <span className="label">İlan Tarihi:</span> 
                            {formatDate(cargo.adDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Konum İzni Bilgi Modalı */}
      {showPermissionInfo && (
        <div className="permission-modal">
          <div className="permission-content">
            <div className="permission-icon">
              <Shield size={40} />
            </div>
            <h2 className="permission-title">Konum İzni Gerekli</h2>
            <p className="permission-text">
              Yakınınızdaki araç ve yük ilanlarını görebilmek için lütfen konumunuzu aktif hale getirin.
              Tarayıcınızın adres çubuğundaki kilit simgesine tıklayarak konum izinlerini yönetebilirsiniz.
            </p>
            <button 
              className="permission-button"
              onClick={() => {
                setShowPermissionInfo(false);
                getUserLocation();
              }}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
