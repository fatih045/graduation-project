import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
    fetchVehiclesByCarrier,
    removeVehicle,
    editVehicle,
    Vehicle
} from '../features/vehicle/vehicleSlice';

const MyVehiclesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: vehicles, status, error } = useAppSelector((state) => state.vehicle);
    const carrierId = useAppSelector(state => state.auth.user?.uid || "");
    const user = useAppSelector(state => state.auth.user);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        vehicleType: '',
        capacity: '',
        licensePlate: '',
        model: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);

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

    // UUID format kontrolü (basit regex)
    const isValidUUID = (uuid: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    // carrierId'nin geçerli olup olmadığını kontrol et
    const isValidCarrierId = (id: string): boolean => {
        // Boş string kontrolü
        if (!id || id.trim() === "") return false;

        // UUID formatında mı kontrol et
        if (isValidUUID(id)) return true;

        // Sayı formatında mı kontrol et (eski sistemler için)
        if (!isNaN(Number(id)) && Number(id) > 0) return true;

        return false;
    };

    // Sayfa yüklendiğinde carrier ID'ye göre araçları getir
    useEffect(() => {
        if (isValidCarrierId(carrierId)) {
            // UUID ise string olarak gönder, sayı ise number olarak gönder
            if (isValidUUID(carrierId)) {
                dispatch(fetchVehiclesByCarrier(carrierId)); // String olarak gönder
            } else {
                dispatch(fetchVehiclesByCarrier(Number(carrierId))); // Number olarak gönder
            }
        } else {
            console.error('Geçersiz carrierId:', carrierId);
        }
    }, [dispatch, carrierId]);

    // Form verilerini güncelle
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Aracı silme işlemi
    const handleDelete = (id: number) => {
        if (window.confirm('Bu aracı silmek istediğinize emin misiniz?')) {
            dispatch(removeVehicle(id))
                .unwrap()
                .then(() => {
                    // Silme işlemi başarılı olduğunda araçları yeniden çek
                    if (isValidCarrierId(carrierId)) {
                        if (isValidUUID(carrierId)) {
                            dispatch(fetchVehiclesByCarrier(carrierId));
                        } else {
                            dispatch(fetchVehiclesByCarrier(Number(carrierId)));
                        }
                    }
                    alert('Araç başarıyla silindi!');
                })
                .catch((error) => {
                    console.error('Araç silinirken hata oluştu:', error);
                    alert('Araç silinirken bir hata oluştu!');
                });
        }
    };

    // Güncelleme modalını aç
    const openUpdateModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            title: vehicle.title,
            vehicleType: vehicle.vehicleType,
            capacity: vehicle.capacity.toString(),
            licensePlate: vehicle.licensePlate,
            model: vehicle.model
        });
        setIsModalOpen(true);
    };

    // Güncelleme formunu gönder
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        if (selectedVehicle) {
            const updatedData = {
                id: selectedVehicle.id,
                data: {
                    carrierId: carrierId, // UUID string olarak gönder
                    title: formData.title,
                    vehicleType: formData.vehicleType,
                    capacity: parseFloat(formData.capacity),
                    licensePlate: formData.licensePlate,
                    model: formData.model
                }
            };

            dispatch(editVehicle(updatedData))
                .unwrap()
                .then(() => {
                    // İşlem başarılı oldu, araçları yeniden çek
                    if (isValidCarrierId(carrierId)) {
                        if (isValidUUID(carrierId)) {
                            dispatch(fetchVehiclesByCarrier(carrierId));
                        } else {
                            dispatch(fetchVehiclesByCarrier(Number(carrierId)));
                        }
                    }
                    setIsModalOpen(false);
                    alert('Araç başarıyla güncellendi!');
                })
                .catch((error) => {
                    console.error('Araç güncellenirken hata oluştu:', error);
                    alert('Araç güncellenirken bir hata oluştu!');
                })
                .finally(() => {
                    setIsUpdating(false);
                });
        }
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
        let result = [...vehicles];

        // Search filter
        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(vehicle =>
                vehicle.title?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.model?.toLowerCase().includes(lowercasedSearch) ||
                vehicle.licensePlate?.toLowerCase().includes(lowercasedSearch)
            );
        }

        // Vehicle type filter
        if (vehicleTypeFilter) {
            result = result.filter(vehicle => 
                vehicle.vehicleType === vehicleTypeFilter
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
            if (sortBy === 'title' || sortBy === 'model' || sortBy === 'vehicleType' || sortBy === 'licensePlate') {
                const aValue = a[sortBy as keyof Vehicle] as string || '';
                const bValue = b[sortBy as keyof Vehicle] as string || '';
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            // Default sort by id
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        });

        return result;
    }, [vehicles, searchTerm, sortBy, sortOrder, vehicleTypeFilter]);

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
        backgroundColor: '#f9f9f9',
        outline: 'none'
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

    // carrierId yoksa veya geçersizse hata mesajı göster
    if (!isValidCarrierId(carrierId)) {
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
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h2>Hata!</h2>
                    <p>Kullanıcı kimliği bulunamadı veya geçersiz. Lütfen giriş yapın.</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>carrierId: {String(carrierId)}</p>
                    <p style={{ fontSize: '12px', color: '#888' }}>
                        Desteklenen formatlar: UUID (örn: 4a7f976c-96a0-45a6-8ea0-0c335b0c4ab1) veya sayı
                    </p>
                </div>
            </div>
        );
    }

    // Yükleniyor durumunda yükleniyor mesajı göster
    if (status === 'loading') {
        return (
            <div style={pageStyle}>
                <div style={loadingStyle}>
                    <p>Araçlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Hata durumunda hata mesajı göster
    if (status === 'failed' && error) {
        return (
            <div style={pageStyle}>
                <div style={errorStyle}>
                    <h2>Hata!</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* Gradient Header */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Araçlarım</h1>
                    <p style={subtitleStyle}>Araçlarınızı görüntüleyin, düzenleyin veya silin</p>
                </div>

                <div style={{ padding: '30px' }}>
                    {/* User Info */}
                    {user && (
                        <div style={userInfoStyle}>
                            <div>
                                <p style={userNameStyle}>
                                    {user.displayName || 'Kullanıcı'}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px' }}>
                                    {user.email || ''}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Araç adı, plaka veya model ara..."
                            style={inputStyle}
                        />

                        <div style={filterContainerStyle}>
                            <select
                                value={vehicleTypeFilter}
                                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">Tüm Araç Tipleri</option>
                                {vehicleTypeOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Vehicle Table */}
                    {filteredAndSortedVehicles.length === 0 ? (
                        <div style={noDataStyle}>
                            <p>Araç bulunamadı.</p>
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
                                            Araç Adı
                                            {sortBy === 'title' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
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
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th 
                                            style={thStyle} 
                                            onClick={() => handleSort('model')}
                                        >
                                            Model
                                            {sortBy === 'model' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th 
                                            style={thStyle} 
                                            onClick={() => handleSort('licensePlate')}
                                        >
                                            Plaka
                                            {sortBy === 'licensePlate' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th 
                                            style={thStyle} 
                                            onClick={() => handleSort('capacity')}
                                        >
                                            Kapasite
                                            {sortBy === 'capacity' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th style={thStyle}>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedVehicles.map((vehicle) => (
                                        <tr key={vehicle.id}>
                                            <td style={tdFirstStyle}>{vehicle.title}</td>
                                            <td style={tdStyle}>{vehicle.vehicleType}</td>
                                            <td style={tdStyle}>{vehicle.model}</td>
                                            <td style={tdStyle}>{vehicle.licensePlate}</td>
                                            <td style={tdStyle}>{vehicle.capacity} ton</td>
                                            <td style={tdLastStyle}>
                                                <button
                                                    onClick={() => openUpdateModal(vehicle)}
                                                    style={updateButtonStyle}
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vehicle.id)}
                                                    style={deleteButtonStyle}
                                                >
                                                    Sil
                                                </button>
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
            {isModalOpen && selectedVehicle && (
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
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
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
                            Araç Güncelle
                        </h2>

                        <form onSubmit={handleUpdate} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            {/* Araç Başlığı */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Araç Başlığı
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

                            {/* Model */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Model
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
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

                            {/* Kapasite */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Kapasite (ton)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    step="0.1"
                                    min="0"
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

                            {/* Plaka */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Plaka
                                </label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
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
                                    onClick={() => setIsModalOpen(false)}
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

export default MyVehiclesPage;