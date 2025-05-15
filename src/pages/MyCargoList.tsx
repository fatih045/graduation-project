

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Adjust this import as needed for your store structure
import {
    fetchMyCargos,
    updateCargo,
    deleteCargo,
    Cargo
} from '../features/cargo/cargoSlice'; // Adjust path as needed
import {
    fetchCustomerByUserIdThunk,
    clearSelectedCustomer
} from '../features/customer/customerSlice'; // Add this import

// Status mapping for display purposes
const STATUS_MAP = {
    0: 'Beklemede',     // Pending
    1: 'Yolda',         // InTransit
    2: 'Teslim Edildi', // Delivered
    3: 'İptal Edildi'   // Cancelled
};

// Updated Cargo interface - adding status field
interface CargoWithStatus extends Cargo {
    status: number;
}

// Type for the cargo form data
interface CargoFormData {
    id: number;
    description: string;
    weight: number;
    pickupLocationId: number;
    dropoffLocationId: number;
    status: number;
}

const UserCargoManagement: React.FC = () => {
    // Redux hooks
    const dispatch = useDispatch();
    const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);
    const auth = useSelector((state: RootState) => state.auth); // Get auth state
    const { selectedCustomer, status: customerStatus } = useSelector((state: RootState) => state.customer); // Get customer state

    // Local state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal state
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [currentCargo, setCurrentCargo] = useState<CargoFormData | null>(null);

    // Debug state
    const [debug, setDebug] = useState<string>('');

    // CSS styles (same as before)
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .select-element {
        -webkit-appearance: menulist;
        -moz-appearance: menulist;
        appearance: menulist;
      }

      .cargo-row:hover {
        background-color: #f8f9fa;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      }
      
      .modal-overlay {
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
      
      .modal-content {
        background-color: white;
        padding: 25px;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        position: relative;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
      }
      
      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
      }
      
      .btn-container {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background-color: #4a6cf7;
        color: white;
      }
      
      .btn-danger {
        background-color: #e74c3c;
        color: white;
      }
      
      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }
      
      .btn-primary:hover {
        background-color: #3151d3;
      }
      
      .btn-danger:hover {
        background-color: #c0392b;
      }
      
      .btn-secondary:hover {
        background-color: #5a6268;
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Fetch customer data when component mounts
    useEffect(() => {
        // If user is logged in, fetch customer data
        if (auth?.user?.uid) {
            dispatch(fetchCustomerByUserIdThunk() as any);
        }

        // Cleanup function
        return () => {
            dispatch(clearSelectedCustomer() as any);
        };
    }, [dispatch, auth?.user]);

    // Load cargo data when customer data is available
    useEffect(() => {
        if (selectedCustomer?.customerId) {
            // Fix: Use the correct id property from selectedCustomer
            dispatch(fetchMyCargos(selectedCustomer.customerId) as any);
            setDebug(`Fetching cargos for customer ID: ${selectedCustomer.customerId}`);
        } else if (selectedCustomer?.customerId) {
            // Fallback to customerId if id is not available
            dispatch(fetchMyCargos(selectedCustomer.customerId) as any);
            setDebug(`Fetching cargos for customer ID (fallback): ${selectedCustomer.customerId}`);
        }
    }, [dispatch, selectedCustomer]);

    // Filtering and sorting
    const filteredAndSortedCargos = React.useMemo(() => {
        // Filter first
        let result = [...cargos];
        //
        // if (searchTerm) {
        //     const lowercasedSearch = searchTerm.toLowerCase();
        //     result = result.filter(cargo =>
        //         cargo.description.toLowerCase().includes(lowercasedSearch) ||
        //         (cargo.status !== undefined && STATUS_MAP[cargo.status as keyof typeof STATUS_MAP]?.toLowerCase().includes(lowercasedSearch))
        //     );
        // }

        // if (filterStatus !== '') {
        //     const statusNumber = parseInt(filterStatus);
        //     result = result.filter(cargo => cargo.status === statusNumber);
        // }

        // Then sort
        result.sort((a, b) => {
            // Handle numerical fields
            if (['id', 'weight', 'status'].includes(sortBy)) {
                return sortOrder === 'asc'
                    ? (a[sortBy as keyof Cargo] as number) - (b[sortBy as keyof Cargo] as number)
                    : (b[sortBy as keyof Cargo] as number) - (a[sortBy as keyof Cargo] as number);
            }

            // Handle string fields
            if (['description', 'cargoType'].includes(sortBy)) {
                const valueA = String(a[sortBy as keyof Cargo] || '');
                const valueB = String(b[sortBy as keyof Cargo] || '');
                return sortOrder === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            return 0;
        });

        return result as CargoWithStatus[];
    }, [cargos, searchTerm, filterStatus, sortBy, sortOrder]);

    // Update cargo handler
    const handleUpdateCargo = (cargo: CargoWithStatus) => {
        setCurrentCargo({
            id: cargo.id,
            description: cargo.description,
            weight: cargo.weight,
            pickupLocationId: cargo.pickupLocationId,
            dropoffLocationId: cargo.dropoffLocationId,
            status: cargo.status
        });
        setShowUpdateModal(true);
    };

    // Delete cargo handler
    const handleDeleteCargo = (id: number) => {
        if (window.confirm('Bu kargoyu silmek istediğinizden emin misiniz?')) {
            dispatch(deleteCargo(id) as any)
                .then(() => {
                    alert('Kargo başarıyla silindi!');
                })
                .catch((err: any) => {
                    alert(`Silme işlemi başarısız: ${err.message}`);
                });
        }
    };

    // Form change handler
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (currentCargo) {
            setCurrentCargo({
                ...currentCargo,
                [name]: name === 'weight' ? parseFloat(value) :
                    name === 'status' ? parseInt(value) :
                        name === 'pickupLocationId' || name === 'dropoffLocationId' ? parseInt(value) :
                            value
            });
        }
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCargo) {
            const { id, ...updatedData } = currentCargo;

            dispatch(updateCargo({ id, updatedData }) as any)
                .then(() => {
                    setShowUpdateModal(false);
                    setCurrentCargo(null);
                    alert('Kargo bilgileri başarıyla güncellendi!');
                })
                .catch((err: any) => {
                    alert(`Güncelleme işlemi başarısız: ${err.message}`);
                });
        }
    };

    // Sort handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Status style handler
    const getStatusStyle = (statusCode: number) => {
        const status = STATUS_MAP[statusCode as keyof typeof STATUS_MAP];
        switch (status) {
            case 'Beklemede':
                return { backgroundColor: '#ffeeba', color: '#856404', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
            case 'Yolda':
                return { backgroundColor: '#c3e6cb', color: '#155724', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
            case 'Teslim Edildi':
                return { backgroundColor: '#d4edda', color: '#155724', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
            case 'İptal Edildi':
                return { backgroundColor: '#f5c6cb', color: '#721c24', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
            default:
                return { backgroundColor: '#e2e3e5', color: '#383d41', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
        }
    };

    // Component styles
    const pageStyle = {
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '5%',
        backgroundColor: '#f5f7fa',
        fontFamily: 'Arial, sans-serif'
    };

    const containerStyle = {
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px'
    };

    const headerStyle = {
        fontSize: '28px',
        fontWeight: 'bold' as const,
        color: '#333',
        marginBottom: '10px',
        textAlign: 'center' as const
    };

    const subHeaderStyle = {
        fontSize: '16px',
        color: '#666',
        marginBottom: '30px',
        textAlign: 'center' as const
    };

    const userInfoStyle = {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    };

    const userNameStyle = {
        fontSize: '18px',
        fontWeight: 'bold' as const,
        color: '#333'
    };

    const inputStyle = {
        padding: '15px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        width: '100%',
        boxSizing: 'border-box' as const,
        marginBottom: '20px'
    };

    const filterContainerStyle = {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        flexWrap: 'wrap' as const,
        alignItems: 'center'
    };

    const selectStyle = {
        padding: '12px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        minWidth: '150px'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'separate' as const,
        borderSpacing: '0 12px',
        marginTop: '20px'
    };

    const thStyle = {
        textAlign: 'left' as const,
        fontSize: '14px',
        color: '#666',
        fontWeight: 'bold' as const,
        padding: '10px 15px',
        borderBottom: '1px solid #eee',
        cursor: 'pointer' as const
    };

    const tdStyle = {
        padding: '15px',
        fontSize: '15px',
        color: '#333',
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee'
    };

    const tdFirstStyle = {
        ...tdStyle,
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px'
    };

    const tdLastStyle = {
        ...tdStyle,
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px'
    };

    const buttonStyle = {
        padding: '8px 12px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
        fontSize: '14px',
        transition: 'all 0.2s'
    };

    const updateButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#4a6cf7',
        color: 'white',
        marginRight: '8px'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#e74c3c',
        color: 'white'
    };

    const noDataStyle = {
        textAlign: 'center' as const,
        padding: '30px',
        color: '#999',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        marginTop: '20px'
    };

    const loadingStyle = {
        textAlign: 'center' as const,
        padding: '30px',
        color: '#666'
    };

    const errorStyle = {
        textAlign: 'center' as const,
        padding: '15px',
        color: '#e63946',
        backgroundColor: '#ffeeee',
        borderRadius: '10px',
        marginTop: '20px'
    };

    const sortIndicatorStyle = {
        fontSize: '12px',
        marginLeft: '5px'
    };

    // Display loading state when customer data is being fetched
    if (customerStatus === 'loading') {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <h1 style={headerStyle}>Kargo Yönetimim</h1>
                    <div style={loadingStyle}>Kullanıcı bilgileri yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h1 style={headerStyle}>Kargo Yönetimim</h1>
                <p style={subHeaderStyle}>Kargolarınızı görüntüleyin, güncelleyin ve yönetin</p>

                {/* User info section */}
                <div style={userInfoStyle}>
                    <div>
                        <span style={userNameStyle}>Hoş geldiniz, {selectedCustomer?.customerId || auth?.user?.displayName || 'Kullanıcı'}</span>
                        <p style={{ margin: '5px 0 0', color: '#666' }}>{auth?.user?.email}</p>
                        {selectedCustomer && (
                            <p style={{ margin: '5px 0 0', color: '#666' }}>Müşteri ID: {selectedCustomer.customerId || selectedCustomer.customerId}</p>
                        )}
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

                {/* Debug info (can remove in production) */}
                {debug && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '15px',
                        backgroundColor: '#e8f4fd',
                        borderRadius: '5px',
                        fontSize: '12px',
                        color: '#444'
                    }}>
                        {debug}
                    </div>
                )}

                {/* Search and filter */}
                <input
                    type="text"
                    placeholder="Arama yap... (Açıklama, Durum)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={inputStyle}
                />

                <div style={filterContainerStyle}>
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="0">Beklemede</option>
                            <option value="1">Yolda</option>
                            <option value="2">Teslim Edildi</option>
                            <option value="3">İptal Edildi</option>
                        </select>
                    </div>

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
                            <option value="weight-asc">Ağırlık (Artan)</option>
                            <option value="weight-desc">Ağırlık (Azalan)</option>
                            <option value="description-asc">Açıklama (A-Z)</option>
                            <option value="description-desc">Açıklama (Z-A)</option>
                            <option value="status-asc">Durum (A-Z)</option>
                            <option value="status-desc">Durum (Z-A)</option>
                        </select>
                    </div>
                </div>

                {loading && <div style={loadingStyle}>Kargolar yükleniyor...</div>}

                {error && <div style={errorStyle}>{error}</div>}

                {!loading && !error && (
                    <>
                        {filteredAndSortedCargos.length === 0 ? (
                            <div style={noDataStyle}>
                                Uygun kargo bulunamadı. Filtreleri değiştirerek tekrar deneyebilirsiniz.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' as const }}>
                                <table style={tableStyle}>
                                    <thead>
                                    <tr>
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
                                            onClick={() => handleSort('weight')}
                                        >
                                            Ağırlık (kg)
                                            {sortBy === 'weight' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th
                                            style={thStyle}
                                            onClick={() => handleSort('cargoType')}
                                        >
                                            Kargo Tipi
                                            {sortBy === 'cargoType' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th style={thStyle}>
                                            Alım Lokasyonu ID
                                        </th>
                                        <th style={thStyle}>
                                            Teslim Lokasyonu ID
                                        </th>
                                        <th
                                            style={thStyle}
                                            onClick={() => handleSort('status')}
                                        >
                                            Durum
                                            {sortBy === 'status' && (
                                                <span style={sortIndicatorStyle}>
                                                    {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                                </span>
                                            )}
                                        </th>
                                        <th style={{...thStyle, textAlign: 'center' as const}}>
                                            İşlemler
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredAndSortedCargos.map((cargo) => (
                                        <tr key={cargo.id} className="cargo-row" style={{ transition: 'all 0.2s ease' }}>
                                            <td style={tdFirstStyle}>
                                                {cargo.description && cargo.description.length > 30
                                                    ? `${cargo.description.substring(0, 30)}...`
                                                    : cargo.description}
                                            </td>
                                            <td style={tdStyle}>{cargo.weight} kg</td>
                                            <td style={tdStyle}>{cargo.cargoType}</td>
                                            <td style={tdStyle}>{cargo.pickupLocationId}</td>
                                            <td style={tdStyle}>{cargo.dropoffLocationId}</td>
                                            <td style={tdStyle}>
                                                <span style={getStatusStyle(cargo.status)}>
                                                    {STATUS_MAP[cargo.status as keyof typeof STATUS_MAP]}
                                                </span>
                                            </td>
                                            <td style={tdLastStyle}>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleUpdateCargo(cargo)}
                                                        style={updateButtonStyle}
                                                    >
                                                        Güncelle
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCargo(cargo.id)}
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
                    </>
                )}
            </div>

            {/* Update Modal */}
            {showUpdateModal && currentCargo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 style={{ margin: 0, fontSize: '24px' }}>Kargo Güncelle</h2>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setCurrentCargo(null);
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Hidden ID field - automatically filled */}
                            <input
                                type="hidden"
                                name="id"
                                value={currentCargo.id}
                            />

                            <div className="form-group">
                                <label className="form-label">Açıklama</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-control"
                                    value={currentCargo.description}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ağırlık (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    name="weight"
                                    className="form-control"
                                    value={currentCargo.weight}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Alım Lokasyonu ID</label>
                                <input
                                    type="number"
                                    name="pickupLocationId"
                                    className="form-control"
                                    value={currentCargo.pickupLocationId}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Teslim Lokasyonu ID</label>
                                <input
                                    type="number"
                                    name="dropoffLocationId"
                                    className="form-control"
                                    value={currentCargo.dropoffLocationId}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Durum</label>
                                <select
                                    name="status"
                                    className="form-control"
                                    value={currentCargo.status}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value={0}>Beklemede</option>
                                    <option value={1}>Yolda</option>
                                    <option value={2}>Teslim Edildi</option>
                                    <option value={3}>İptal Edildi</option>
                                </select>
                            </div>

                            <div className="btn-container">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setCurrentCargo(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">Güncelle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCargoManagement;