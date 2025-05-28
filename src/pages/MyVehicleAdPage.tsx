import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVehicleAdsByCarrier,
    updateVehicleAd,
    deleteVehicleAd,
    VehicleAd
} from '../features/vehicle/vehicleAdSlice';
import type { RootState, AppDispatch } from '../store/store.ts';

const MyVehicleAdsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vehicleAds, loading, error } = useSelector((state: RootState) => state.vehicleAd);
    const { user } = useSelector((state: RootState) => state.auth);

    // Local state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');

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
        if (user && user.uid) {
            dispatch(fetchVehicleAdsByCarrier(user.uid));
        }
    }, [dispatch, user]);

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
            pickUpLocationId: vehicle.city,
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

    // Sorting handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Filtering and sorting
    const filteredAndSortedVehicles = React.useMemo(() => {
        let result = [...vehicleAds];

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.title?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.description?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.vehicleType?.toLowerCase().includes(lowercasedSearch)
            );
        }

        // Filter by country
        if (countryFilter) {
            result = result.filter(vehicle =>
                vehicle.country?.includes(countryFilter)
            );
        }

        // Filter by city
        if (cityFilter) {
            const lowercasedCityFilter = cityFilter.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.city?.toLowerCase().includes(lowercasedCityFilter)
            );
        }

        // Sort
        result.sort((a, b) => {
            // Handle numeric fields
            if (sortBy === 'capacity') {
                return sortOrder === 'asc'
                    ? a.capacity - b.capacity
                    : b.capacity - a.capacity;
            }

            // Handle string fields
            if (sortBy === 'title' || sortBy === 'description' || sortBy === 'vehicleType') {
                const aValue = a[sortBy as keyof VehicleAd] as string || '';
                const bValue = b[sortBy as keyof VehicleAd] as string || '';
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // Default sort by id
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        });

        return result;
    }, [vehicleAds, searchTerm, sortBy, sortOrder, countryFilter, cityFilter]);

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

    const userInfoStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px'
    };

    const userNameStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
    };

    const inputStyle = {
        width: '100%',
        padding: '15px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
    };

    const filterContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '15px',
        marginBottom: '25px'
    };

    const selectStyle = {
        padding: '12px 15px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        minWidth: '180px'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginTop: '10px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        overflow: 'hidden'
    };

    const thStyle = {
        backgroundColor: '#f2f2f2',
        padding: '15px',
        textAlign: 'left' as const,
        fontSize: '14px',
        fontWeight: 'bold' as const,
        color: '#333',
        cursor: 'pointer' as const,
        userSelect: 'none' as const,
        borderBottom: '1px solid #ddd'
    };

    const tdStyle = {
        padding: '15px',
        borderBottom: '1px solid #eee',
        fontSize: '14px',
        color: '#333'
    };

    const tdFirstStyle = {
        ...tdStyle,
        fontWeight: '500' as const
    };

    const tdLastStyle = {
        ...tdStyle,
        textAlign: 'center' as const
    };

    const updateButtonStyle = {
        backgroundColor: '#4a6fa5',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        fontSize: '13px',
        cursor: 'pointer',
        marginRight: '10px'
    };

    const deleteButtonStyle = {
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        fontSize: '13px',
        cursor: 'pointer'
    };

    const loadingStyle = {
        textAlign: 'center' as const,
        padding: '40px',
        fontSize: '18px',
        color: '#666'
    };

    const errorStyle = {
        backgroundColor: '#ffeeee',
        color: '#e63946',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center' as const
    };

    const noDataStyle = {
        textAlign: 'center' as const,
        padding: '40px 0',
        color: '#666',
        fontSize: '16px'
    };

    const sortIndicatorStyle = {
        marginLeft: '5px'
    };

    // Yükleme durumunda spinner göster
    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>Araç İlanlarım</h1>
                        <p style={subtitleStyle}>Araç ilanlarınızı görüntüleyin, güncelleyin ve yönetin</p>
                    </div>
                    <div style={{ padding: '40px' }}>
                        <div style={loadingStyle}>Araç ilanları yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Hata durumunda hata mesajı göster
    if (error) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>Araç İlanlarım</h1>
                        <p style={subtitleStyle}>Araç ilanlarınızı görüntüleyin, güncelleyin ve yönetin</p>
                    </div>
                    <div style={{ padding: '40px' }}>
                        <div style={errorStyle}>
                            <h2>Hata!</h2>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* Header with gradient background */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Araç İlanlarım</h1>
                    <p style={subtitleStyle}>Araç ilanlarınızı görüntüleyin, güncelleyin ve yönetin</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {/* User info section */}
                    <div style={userInfoStyle}>
                        <div>
                            <span style={userNameStyle}>
                                Hoş geldiniz, {user?.displayName || 'Fatih'}
                            </span>
                            <p style={{ margin: '5px 0 0', color: '#666' }}>{user?.email}</p>
                        </div>
                        <div>
                            <span style={{
                                backgroundColor: '#e3f2fd',
                                color: '#0d47a1',
                                padding: '8px 12px',
                                borderRadius: '15px',
                                fontWeight: 'bold'
                            }}>
                                Kullanıcı
                            </span>
                        </div>
                    </div>

                    {/* Search and filter */}
                    <input
                        type="text"
                        placeholder="Arama yap... (Başlık, Açıklama, Araç Tipi)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />

                    <div style={filterContainerStyle}>
                        <div>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSortBy(newSortBy);
                                    setSortOrder(newSortOrder as 'asc' | 'desc');
                                }}
                                style={selectStyle}
                                className="select-element"
                            >
                                <option value="id-desc">ID (Yeni-Eski)</option>
                                <option value="id-asc">ID (Eski-Yeni)</option>
                                <option value="capacity-asc">Kapasite (Artan)</option>
                                <option value="capacity-desc">Kapasite (Azalan)</option>
                                <option value="title-asc">Başlık (A-Z)</option>
                                <option value="title-desc">Başlık (Z-A)</option>
                            </select>
                        </div>

                        {/* Ülke filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Ülke filtresi"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                style={{ ...selectStyle, minWidth: '120px' }}
                            />
                        </div>

                        {/* Şehir filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Şehir filtresi"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                style={{ ...selectStyle, minWidth: '120px' }}
                            />
                        </div>
                    </div>

                    {filteredAndSortedVehicles.length === 0 ? (
                        <div style={noDataStyle}>
                            Uygun araç ilanı bulunamadı. Filtreleri değiştirerek tekrar deneyebilirsiniz.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' as const }}>
                            <table style={tableStyle}>
                                <thead>
                                <tr>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('title')}
                                    >
                                        Başlık
                                        {sortBy === 'title' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('description')}
                                    >
                                        Açıklama
                                        {sortBy === 'description' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('capacity')}
                                    >
                                        Kapasite (Ton)
                                        {sortBy === 'capacity' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th
                                        style={thStyle}
                                        onClick={() => handleSort('vehicleType')}
                                    >
                                        Araç Tipi
                                        {sortBy === 'vehicleType' && (
                                            <span style={sortIndicatorStyle}>
                                                {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                            </span>
                                        )}
                                    </th>
                                    <th style={thStyle}>
                                        Konum
                                    </th>
                                    <th style={{ ...thStyle, textAlign: 'center' as const }}>
                                        İşlemler
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAndSortedVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="vehicle-row" style={{ transition: 'all 0.2s ease' }}>
                                        <td style={tdFirstStyle}>
                                            {vehicle.title && vehicle.title.length > 30
                                                ? `${vehicle.title.substring(0, 30)}...`
                                                : vehicle.title}
                                        </td>
                                        <td style={tdStyle}>
                                            {vehicle.description && vehicle.description.length > 30
                                                ? `${vehicle.description.substring(0, 30)}...`
                                                : vehicle.description}
                                        </td>
                                        <td style={tdStyle}>{(vehicle.capacity / 1000).toFixed(1)} Ton</td>
                                        <td style={tdStyle}>{vehicle.vehicleType}</td>
                                        <td style={tdStyle}>{vehicle.city}, {vehicle.country}</td>
                                        <td style={tdLastStyle}>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleEdit(vehicle)}
                                                    style={updateButtonStyle}
                                                >
                                                    Güncelle
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(vehicle)}
                                                    style={deleteButtonStyle}
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
                </div>
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
                                    Kapasite (Ton)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    min="0.1"
                                    step="0.1"
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
                                    Şehir
                                </label>
                                <input
                                    type="text"
                                    name="pickUpLocationId"
                                    value={formData.pickUpLocationId}
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