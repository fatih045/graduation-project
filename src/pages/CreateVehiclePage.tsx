import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store.ts';
import { addVehicle } from '../features/vehicle/vehicleSlice.ts';

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
    vehicleType: string;
    capacity: string;
    licensePlate: string;
    model: string;
}

const CreateVehiclePage = () => {
    const dispatch = useAppDispatch();

    // Redux store'dan userId'yi al
    const carrierId = useAppSelector(state => state.auth.user?.uid || "");
    const vehicleStatus = useAppSelector(state => state.vehicle.status);
    const vehicleError = useAppSelector(state => state.vehicle.error);

    // Form verisi için state
    const [formData, setFormData] = useState<VehicleFormData>({
        title: '',
        vehicleType: '',
        capacity: '',
        licensePlate: '',
        model: ''
    });

    // Hata mesajı için state
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Input değişikliklerini handle et
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Tüm alanların doldurulduğunu kontrol et
        if (!formData.title || !formData.vehicleType || !formData.capacity || !formData.licensePlate || !formData.model) {
            setError('Lütfen tüm alanları doldurun!');
            return;
        }

        // Kapasite kontrolü
        if (parseFloat(formData.capacity) <= 0) {
            setError('Kapasite değeri 0\'dan büyük olmalıdır!');
            return;
        }

        // userId kontrolü
        if (!carrierId) {
            setError('Giriş yapmış bir kullanıcı bulunamadı!');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Slice'daki Vehicle interface'ine tam uygun veri gönder
            await dispatch(addVehicle({
                carrierId: carrierId,
                title: formData.title,
                vehicleType: formData.vehicleType,
                capacity: parseFloat(formData.capacity),
                licensePlate: formData.licensePlate,
                model: formData.model
            })).unwrap();

            // Başarılı olduğunda form temizle
            setFormData({
                title: '',
                vehicleType: '',
                capacity: '',
                licensePlate: '',
                model: ''
            });

            alert('Araç başarıyla eklendi!');
        } catch (error) {
            console.error('Araç eklenirken hata:', error);
            setError('Araç eklenirken bir hata oluştu!');
        } finally {
            setIsLoading(false);
        }
    };

    // Kullanıcı giriş yapmamışsa uyarı göster
    if (!carrierId) {
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
                        }}>Yeni Araç Oluştur</h1>
                        <p style={{
                            fontSize: '16px',
                            opacity: 0.9,
                            marginBottom: '20px'
                        }}>Araç bilgilerinizi girerek yeni bir araç oluşturun</p>
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
                            Araç oluşturmak için giriş yapmanız gerekiyor!
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
                    }}>Yeni Araç Oluştur</h1>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.9,
                        marginBottom: '20px'
                    }}>Araç bilgilerinizi girerek yeni bir araç oluşturun</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {(error || vehicleError) && (
                        <div style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            Hata: {error || vehicleError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '25px'
                    }}>
                        {/* Araç Başlığı */}
                        <div className="form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '18px',
                                fontWeight: '500',
                                marginBottom: '10px'
                            }}>Araç Başlığı</label>
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
                                placeholder="Örn: Kamyon 1"
                                required
                            />
                        </div>

                        {/* Model ve Araç Türü */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
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
                                    placeholder="Örn: Mercedes Actros"
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

                        {/* Kapasite ve Plaka */}
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
                                    step="0.1"
                                    min="0.1"
                                    placeholder="25.5"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    marginBottom: '10px'
                                }}>Plaka</label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
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
                                    placeholder="34 ABC 123"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || vehicleStatus === 'loading'}
                            style={{
                                backgroundColor: (isLoading || vehicleStatus === 'loading') ? '#ccc' : '#e63946',
                                color: 'white',
                                padding: '16px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: (isLoading || vehicleStatus === 'loading') ? 'not-allowed' : 'pointer',
                                marginTop: '15px',
                                transition: 'background-color 0.3s'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading && vehicleStatus !== 'loading') {
                                    e.currentTarget.style.backgroundColor = '#d62838';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading && vehicleStatus !== 'loading') {
                                    e.currentTarget.style.backgroundColor = '#e63946';
                                }
                            }}
                        >
                            {(isLoading || vehicleStatus === 'loading') ? 'Araç Oluşturuluyor...' : 'Araç Oluştur'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateVehiclePage;