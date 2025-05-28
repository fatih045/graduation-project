import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Adjust this import as needed for your store structure
import {
    fetchMyCargos,
    updateCargo,
    deleteCargo,

} from '../features/cargo/cargoSlice';
import {Cargo} from "../services/cargoService.ts"; // Adjust path as needed

const UserCargoManagement: React.FC = () => {
    // Redux hooks
    const dispatch = useDispatch();
    const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);
    const auth = useSelector((state: RootState) => state.auth); // Get auth state

    // Local state
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');

    // Modal state
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [currentCargo, setCurrentCargo] = useState<Cargo | null>(null);

    // Debug state
    // const [debug, setDebug] = useState<string>('');

    // Add CSS styles for the component
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

    // Load cargo data when component mounts
    useEffect(() => {
        if (auth?.user?.uid) {
            dispatch(fetchMyCargos(auth.user.uid) as any);
            // setDebug(`Fetching cargos for user ID: ${auth.user.uid}`);
        }
    }, [dispatch, auth?.user?.uid]);

    // Filtering and sorting
    const filteredAndSortedCargos = React.useMemo(() => {
        let result = [...cargos];

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(cargo =>
                cargo.description?.toLowerCase().includes(lowercasedSearch) ||
                cargo.cargoType?.toLowerCase().includes(lowercasedSearch)
            );
        }

        // Filter by country
        if (countryFilter) {
            result = result.filter(cargo => 
                cargo.pickCountry?.includes(countryFilter) || 
                cargo.dropCountry?.includes(countryFilter)
            );
        }

        // Filter by city
        if (cityFilter) {
            const lowercasedCityFilter = cityFilter.toLowerCase();
            result = result.filter(cargo => 
                cargo.pickCity?.toLowerCase().includes(lowercasedCityFilter) || 
                cargo.dropCity?.toLowerCase().includes(lowercasedCityFilter)
            );
        }

        // Sort
        result.sort((a, b) => {
            // Handle numeric fields
            if (['id', 'weight'].includes(sortBy)) {
                const aValue = a[sortBy as keyof Cargo] as number || 0;
                const bValue = b[sortBy as keyof Cargo] as number || 0;
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle text fields
            if (['description', 'cargoType'].includes(sortBy)) {
                const aValue = String(a[sortBy as keyof Cargo] || '');
                const bValue = String(b[sortBy as keyof Cargo] || '');
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return result;
    }, [cargos, searchTerm, sortBy, sortOrder, countryFilter, cityFilter]);

    // Update cargo handler
    const handleUpdateCargo = (cargo: Cargo) => {
        setCurrentCargo(cargo);
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
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (currentCargo) {
            setCurrentCargo({
                ...currentCargo,
                [name]: name === 'weight' || name === 'status' ?
                    (value === '' ? 0 : Number(value)) : value
            });
        }
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentCargo) {
            dispatch(updateCargo(currentCargo) as any)
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

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                {/* Header with gradient background */}
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Kargo Yönetimim</h1>
                    <p style={subtitleStyle}>Kargolarınızı görüntüleyin, güncelleyin ve yönetin</p>
                </div>

                <div style={{ padding: '40px' }}>
                    {/* User info section */}
                    <div style={userInfoStyle}>
                        <div>
                            <span style={userNameStyle}>
                                Hoş geldiniz, {auth?.user?.displayName || 'Fatih'}
                            </span>
                            <p style={{ margin: '5px 0 0', color: '#666' }}>{auth?.user?.email}</p>
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
                        placeholder="Arama yap... (Açıklama, Araç Tipi)"
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
                                <option value="weight-asc">Ağırlık (Artan)</option>
                                <option value="weight-desc">Ağırlık (Azalan)</option>
                                <option value="description-asc">Açıklama (A-Z)</option>
                                <option value="description-desc">Açıklama (Z-A)</option>
                            </select>
                        </div>
                        
                        {/* Ülke filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Ülke filtresi"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                style={{...selectStyle, minWidth: '120px'}}
                            />
                        </div>
                        
                        {/* Şehir filtresi */}
                        <div>
                            <input
                                type="text"
                                placeholder="Şehir filtresi"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                style={{...selectStyle, minWidth: '120px'}}
                            />
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
                                                Ağırlık (Ton)
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
                                                Araç Tipi
                                                {sortBy === 'cargoType' && (
                                                    <span style={sortIndicatorStyle}>
                                                        {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                                                    </span>
                                                )}
                                            </th>
                                            <th style={thStyle}>
                                                Kalkış Şehri
                                            </th>
                                            <th style={thStyle}>
                                                Varış Şehri
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
                                                <td style={tdStyle}>{cargo.weight} Ton</td>
                                                <td style={tdStyle}>{cargo.cargoType}</td>
                                                <td style={tdStyle}>{cargo.pickCity}, {cargo.pickCountry}</td>
                                                <td style={tdStyle}>{cargo.dropCity}, {cargo.dropCountry}</td>
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
                            <div className="form-group">
                                <label className="form-label">Açıklama</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    value={currentCargo.description || ''}
                                    onChange={handleFormChange}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ağırlık (Ton)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    name="weight"
                                    className="form-control"
                                    value={currentCargo.weight || ''}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Araç Tipi</label>
                                <input
                                    type="text"
                                    name="cargoType"
                                    className="form-control"
                                    value={currentCargo.cargoType || ''}
                                    onChange={handleFormChange}
                                    required
                                />
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