import React, { useState } from 'react';
import { useAppDispatch } from '../store/store.ts';
import { addVehicle } from '../features/vehicle/vehicleSlice.ts';

interface VehicleType {
    id: number;
    name: string;
}

const dummyVehicleTypes: VehicleType[] = [
    { id: 1, name: 'Tır' },
    { id: 2, name: 'Kamyon' },
];

const CreateVehiclePage = () => {
    const dispatch = useAppDispatch();

    const [vehicleTypeId, setVehicleTypeId] = useState<number | 'new' | null>(null);
    const [newVehicleType, setNewVehicleType] = useState('');
    const [capacity, setCapacity] = useState('');
    const [licensePalete, setLicensePalete] = useState('');
    const [availabilityStatus, setAvailabilityStatus] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedVehicleTypeId =
            vehicleTypeId === 'new'
                ? Math.floor(Math.random() * 1000) + 100
                : vehicleTypeId;

        dispatch(addVehicle({
            carrier_id: 1,
            vehicleType_id: selectedVehicleTypeId as number,
            capacity: parseFloat(capacity),
            license_palete: licensePalete,
            availability_status: availabilityStatus
        }));
    };

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

                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                }}>
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
                            value={vehicleTypeId ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'new') {
                                    setVehicleTypeId('new');
                                } else if (value === '') {
                                    setVehicleTypeId(null);
                                } else {
                                    setVehicleTypeId(Number(value));
                                }
                            }}
                            required
                        >
                            <option value="">Seçiniz</option>
                            {dummyVehicleTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                            <option value="new">+ Yeni Tür Ekle</option>
                        </select>

                        {vehicleTypeId === 'new' && (
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
                                    marginTop: '15px',
                                    transition: 'border-color 0.3s, box-shadow 0.3s'
                                }}
                                placeholder="Yeni araç türü girin"
                                value={newVehicleType}
                                onChange={(e) => setNewVehicleType(e.target.value)}
                                required
                            />
                        )}
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
                            value={licensePalete}
                            onChange={(e) => setLicensePalete(e.target.value)}
                            required
                        />
                    </div>

                    {/* Müsaitlik */}
                    <div className="form-group checkbox" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <input
                            type="checkbox"
                            style={{
                                width: '24px',
                                height: '24px',
                                accentColor: '#e63946',
                                cursor: 'pointer'
                            }}
                            checked={availabilityStatus}
                            onChange={(e) => setAvailabilityStatus(e.target.checked)}
                            id="availability"
                        />
                        <label
                            htmlFor="availability"
                            style={{
                                fontSize: '18px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Müsait
                        </label>
                    </div>

                    {/* Submit Buton */}
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#e63946',
                            color: 'white',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            marginTop: '15px',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d62838'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e63946'}
                    >
                        Araç Ekle
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateVehiclePage;