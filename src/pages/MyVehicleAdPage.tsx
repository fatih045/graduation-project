import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllVehicleAds,
    updateVehicleAd,
    deleteVehicleAd,
    VehicleAd
} from '../features/vehicle/vehicleAdSlice';
import type { RootState, AppDispatch } from '../store/store.ts';

const MyVehicleAdsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vehicleAds, loading, error } = useSelector((state: RootState) => state.vehicleAd);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const [selectedVehicle, setSelectedVehicle] = useState<VehicleAd | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pickUpLocationId: '',
        vehicleType: '',
        capacity: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
        dispatch(fetchAllVehicleAds());
    }, [dispatch]);

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
            pickUpLocationId: vehicle.pickUpLocationId.toString(),
            vehicleType: vehicle.vehicleType,
            capacity: vehicle.capacity.toString()
        });
        setIsUpdateModalOpen(true);
    };

    const handleDeleteClick = (vehicle: VehicleAd) => {
        if (window.confirm('Bu araç ilanını silmek istediğinize emin misiniz?')) {
            setIsDeleting(true);
            dispatch(deleteVehicleAd(vehicle.id))
                .unwrap()
                .then(() => {
                    alert('Araç ilanı başarıyla silindi!');
                })
                .catch((error) => {
                    console.error('Araç ilanı silinirken hata oluştu:', error);
                    alert('Araç ilanı silinirken bir hata oluştu!');
                })
                .finally(() => {
                    setIsDeleting(false);
                });
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle) return;

        setIsUpdating(true);

        const updatedData = {
            title: formData.title,
            description: formData.description,
            pickUpLocationId: parseInt(formData.pickUpLocationId),
            vehicleType: formData.vehicleType,
            capacity: parseInt(formData.capacity)
        };

        dispatch(updateVehicleAd({
            id: selectedVehicle.id,
            updatedData
        }))
            .unwrap()
            .then(() => {
                setIsUpdateModalOpen(false);
                setSelectedVehicle(null);
                alert('Araç ilanı başarıyla güncellendi!');
            })
            .catch((error) => {
                console.error('Araç ilanı güncellenirken hata oluştu:', error);
                alert('Araç ilanı güncellenirken bir hata oluştu!');
            })
            .finally(() => {
                setIsUpdating(false);
            });
    };

    // Yükleme durumunda spinner göster
    if (loading) {
        return (
            <div className="main-content" style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5%'
            }}>
                <div style={{ fontSize: '24px', color: '#333' }}>Yükleniyor...</div>
            </div>
        );
    }

    // Hata durumunda hata mesajı göster
    if (error) {
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
                    padding: '20px',
                    backgroundColor: '#ffeeee',
                    color: '#e63946',
                    borderRadius: '10px'
                }}>
                    <h2>Hata!</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '5%'
        }}>
            <div className="vehicle-ads-container" style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>Araç İlanlarım</h1>

                {vehicleAds.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 0',
                        color: '#666'
                    }}>
                        <p style={{ fontSize: '18px' }}>Henüz araç ilanı eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="vehicle-ads-list" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        {vehicleAds.map((vehicle) => (
                            <div key={vehicle.id} className="vehicle-ad-card" style={{
                                backgroundColor: '#f9f9f9',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px',
                                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <h3 style={{
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        color: '#333',
                                        margin: '0'
                                    }}>
                                        {vehicle.title}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        gap: '15px'
                                    }}>
                                        {/* Güncelle butonu */}
                                        <button
                                            onClick={() => handleEdit(vehicle)}
                                            style={{
                                                backgroundColor: '#4a6fa5',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z"/>
                                            </svg>
                                            <span>Düzenle</span>
                                        </button>

                                        {/* Sil butonu */}
                                        <button
                                            onClick={() => handleDeleteClick(vehicle)}
                                            style={{
                                                backgroundColor: '#e63946',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                            <span>Sil</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Açıklama */}
                                <div style={{
                                    backgroundColor: '#fff',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '10px'
                                }}>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '14px',
                                        color: '#666',
                                        marginBottom: '5px'
                                    }}>Açıklama</p>
                                    <p style={{
                                        margin: '0',
                                        fontSize: '16px',
                                        color: '#333',
                                        lineHeight: '1.5'
                                    }}>
                                        {vehicle.description}
                                    </p>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Araç Tipi</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}>
                                            {vehicle.vehicleType}
                                        </p>
                                    </div>

                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Kapasite</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}>{vehicle.capacity.toLocaleString()} kg</p>
                                    </div>

                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Lokasyon ID</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}>#{vehicle.pickUpLocationId}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                                    Kapasite (kg)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    min="1"
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

                            {/* Lokasyon ID */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Lokasyon ID
                                </label>
                                <input
                                    type="number"
                                    name="pickUpLocationId"
                                    value={formData.pickUpLocationId}
                                    onChange={handleChange}
                                    required
                                    min="1"
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