

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllLocations,
    deleteLocation,
    createLocation,
    updateLocation,
    Location
} from '../features/location/locationSlice';
import { AppDispatch, RootState } from '../store/store';
import '../styles/location.css'; // CSS dosyasını içe aktarıyoruz

const LocationManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { locations, loading, error } = useSelector((state: RootState) => state.location);

    // Modal state
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

    // Form states
    const initialFormState = {
        address: '',
        city: '',
        state: '',
        postalCode: 0,
        coordinates: '0,0' // Default coordinates as mentioned
    };

    const [formData, setFormData] = useState(initialFormState);
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

    // Load locations on component mount
    useEffect(() => {
        dispatch(fetchAllLocations());
    }, [dispatch]);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'postalCode') {
            setFormData({ ...formData, postalCode: e.target.value === '' ? 0 : parseInt(e.target.value) })
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // postal_Code'un kesinlikle sayı olduğundan emin ol
        const submissionData = {
            ...formData,
            postal_Code: typeof formData.postalCode === 'string'
                ? parseInt(formData.postalCode) || 0
                : (formData.postalCode || 0)
        };

        console.log('Gönderilen veri:', submissionData); // Debug için

        dispatch(createLocation(submissionData))
            .unwrap()
            .then(() => {
                setShowAddModal(false);
                setFormData(initialFormState);
                alert('Lokasyon başarıyla eklendi!');
            })
            .catch((error) => {
                alert(`Hata: ${error}`);
            });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentLocation) {
            // postal_Code'un kesinlikle sayı olduğundan emin ol
            const submissionData = {
                ...formData,
                postal_Code: typeof formData.postalCode === 'string'
                    ? parseInt(formData.postalCode) || 0
                    : (formData.postalCode || 0)
            };

            console.log('Güncellenen veri:', submissionData); // Debug için

            dispatch(updateLocation({
                id: currentLocation.id,
                updatedData: submissionData
            }))
                .unwrap()
                .then(() => {
                    setShowUpdateModal(false);
                    setCurrentLocation(null);
                    setFormData(initialFormState);
                    alert('Lokasyon başarıyla güncellendi!');
                })
                .catch((error) => {
                    alert(`Hata: ${error}`);
                });
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Bu lokasyonu silmek istediğinizden emin misiniz?')) {
            dispatch(deleteLocation(id))
                .unwrap()
                .then(() => {
                    alert('Lokasyon başarıyla silindi!');
                })
                .catch((error) => {
                    alert(`Hata: ${error}`);
                });
        }
    };

    const handleUpdate = (location: Location) => {
        setCurrentLocation(location);
        setFormData({
            address: location.address,
            city: location.city,
            state: location.state,
            postalCode: location.postalCode,
            coordinates: location.coordinates
        });
        setShowUpdateModal(true);
    };

    return (
        <div className="location-container">
            <div className="location-header">
                <h1 className="location-header-title">Lokasyon Yönetimi</h1>
                <button className="location-add-button" onClick={() => setShowAddModal(true)}>
                    Lokasyon Ekle
                </button>
            </div>

            {loading && <div className="location-loading-indicator">Yükleniyor...</div>}

            {error && <div className="location-error-message">{error}</div>}

            {!loading && !error && (
                <>
                    {locations.length === 0 ? (
                        <div className="location-no-data">
                            Henüz lokasyon bulunmamaktadır. Yeni bir lokasyon eklemek için "Lokasyon Ekle" butonunu kullanabilirsiniz.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="location-table">
                                <thead>
                                <tr>
                                    <th>Adres</th>
                                    <th>Şehir</th>
                                    <th>İlçe/Eyalet</th>
                                    <th>Posta Kodu</th>
                                    <th>İşlemler</th>
                                </tr>
                                </thead>
                                <tbody>
                                {locations.map((location: Location) => (
                                    <tr key={location.id} className="location-row">
                                        <td>{location.address}</td>
                                        <td>{location.city}</td>
                                        <td>{location.state}</td>
                                        <td>{location.postalCode}</td>
                                        <td>
                                            <div className="location-action-buttons">
                                                <button
                                                    className="location-update-button"
                                                    onClick={() => handleUpdate(location)}
                                                >
                                                    Güncelle
                                                </button>
                                                <button
                                                    className="location-delete-button"
                                                    onClick={() => handleDelete(location.id)}
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Add Location Modal */}
            {showAddModal && (
                <div className="location-modal-overlay">
                    <div className="location-modal-content">
                        <div className="location-modal-header">
                            <h2 className="location-modal-title">Yeni Lokasyon Ekle</h2>
                            <button
                                className="location-close-button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setFormData(initialFormState);
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit}>
                            <div className="location-form-group">
                                <label className="location-form-label">Adres</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="location-form-control"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="location-form-group">
                                <label className="location-form-label">Şehir</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="location-form-control"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="location-form-group">
                                <label className="location-form-label">İlçe/Eyalet</label>
                                <input
                                    type="text"
                                    name="state"
                                    className="location-form-control"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="location-form-group">
                                <label className="location-form-label">Posta Kodu</label>
                                <input
                                    type="number"
                                    name="postalCode"
                                    className="location-form-control"
                                    value={formData.postalCode === 0 ? '' : formData.postalCode}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    placeholder="Posta kodu giriniz"
                                />
                            </div>

                            <div className="location-btn-container">
                                <button
                                    type="button"
                                    className="location-btn location-btn-secondary"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData(initialFormState);
                                    }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="location-btn location-btn-primary">Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Location Modal */}
            {showUpdateModal && currentLocation && (
                <div className="location-modal-overlay">
                    <div className="location-modal-content">
                        <div className="location-modal-header">
                            <h2 className="location-modal-title">Lokasyonu Güncelle</h2>
                            <button
                                className="location-close-button"
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setCurrentLocation(null);
                                    setFormData(initialFormState);
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit}>
                            <div className="location-form-group">
                                <label className="location-form-label">Adres</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="location-form-control"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="location-form-group">
                                <label className="location-form-label">Şehir</label>
                                <input
                                    type="text"
                                    name="city"
                                    className="location-form-control"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="location-form-group">
                                <label className="location-form-label">İlçe/Eyalet</label>
                                <input
                                    type="text"
                                    name="state"
                                    className="location-form-control"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="location-form-group">
                                <label className="location-form-label">Posta Kodu</label>
                                <input
                                    type="number"
                                    name="postalCode"
                                    className="location-form-control"
                                    value={formData.postalCode === 0 ? '' : formData.postalCode}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    placeholder="Posta kodu giriniz"
                                />
                            </div>

                            <div className="location-btn-container">
                                <button
                                    type="button"
                                    className="location-btn location-btn-secondary"
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setCurrentLocation(null);
                                        setFormData(initialFormState);
                                    }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="location-btn location-btn-primary">Güncelle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationManagement;