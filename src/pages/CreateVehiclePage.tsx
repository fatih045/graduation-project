import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store.ts';
import { addVehicle } from '../features/vehicle/vehicleSlice.ts';

const CreateVehiclePage = () => {
    const dispatch = useAppDispatch();

    // Get state from vehicle slice
    const carrierId = useAppSelector(state => state.auth.user?.carrierId || "1");
    const vehicleStatus = useAppSelector(state => state.vehicle.status);
    const vehicleError = useAppSelector(state => state.vehicle.error);

    // Local state - slice'daki Vehicle interface'ine tam uygun
    const [title, setTitle] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [capacity, setCapacity] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [model, setModel] = useState('');

    // Araç türü seçenekleri (hardcoded string array)
    const vehicleTypeOptions = [
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!vehicleType || !title || !capacity || !licensePlate || !model) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }

        // Slice'daki Vehicle interface'ine tam uygun veri gönder
        dispatch(addVehicle({
            carrierId: carrierId,
            title: title,
            vehicleType: vehicleType,
            capacity: parseFloat(capacity),
            licensePlate: licensePlate,
            model: model
        }));
    };

    // Success durumunda form temizle
    useEffect(() => {
        if (vehicleStatus === 'succeeded') {
            setTitle('');
            setVehicleType('');
            setCapacity('');
            setLicensePlate('');
            setModel('');
            alert('Araç başarıyla eklendi!');
        }
    }, [vehicleStatus]);

    return (
        <div className="main-content" style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5%'
        }}>
            <div className="form-container" style={{
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
                }}>Araç Oluştur</h1>

                {vehicleError && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#c33',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        Hata: {vehicleError}
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
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Örn: Kamyon 1"
                            required
                        />
                    </div>

                    {/* Araç Türü */}
                    <div className="form-group">
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            fontWeight: '500',
                            marginBottom: '10px'
                        }}>Araç Türü</label>
                        <select
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
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            required
                        >
                            <option value="">Seçiniz</option>
                            {vehicleTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Model */}
                    <div className="form-group">
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            fontWeight: '500',
                            marginBottom: '10px'
                        }}>Model</label>
                        <input
                            type="text"
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
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Örn: Mercedes Actros"
                            required
                        />
                    </div>

                    {/* Kapasite */}
                    <div className="form-group">
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            fontWeight: '500',
                            marginBottom: '10px'
                        }}>Kapasite (ton)</label>
                        <input
                            type="number"
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
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            required
                            step="0.1"
                            min="0"
                            placeholder="25.5"
                        />
                    </div>

                    {/* Plaka */}
                    <div className="form-group">
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            fontWeight: '500',
                            marginBottom: '10px'
                        }}>Plaka</label>
                        <input
                            type="text"
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
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                            placeholder="34 ABC 123"
                            required
                        />
                    </div>

                    {/* Submit Buton */}
                    <button
                        type="submit"
                        disabled={vehicleStatus === 'loading'}
                        style={{
                            backgroundColor: vehicleStatus === 'loading' ? '#ccc' : '#e63946',
                            color: 'white',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: vehicleStatus === 'loading' ? 'not-allowed' : 'pointer',
                            marginTop: '15px',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => {
                            if (vehicleStatus !== 'loading') {
                                e.currentTarget.style.backgroundColor = '#d62838';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (vehicleStatus !== 'loading') {
                                e.currentTarget.style.backgroundColor = '#e63946';
                            }
                        }}
                    >
                        {vehicleStatus === 'loading' ? 'Ekleniyor...' : 'Araç Ekle'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateVehiclePage;