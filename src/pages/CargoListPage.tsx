import React, { useEffect, useState } from 'react';

// Define cargo type interface
export interface Cargo {
    id: number;
    customer_id: number;
    desc: string;
    weight: number;
    pickUpLocation: string;
    dropOffLocation: string;
    status: string;
}

// Define customer type interface
interface CustomerMap {
    [key: number]: string;
}

// Mock customer data
const mockCustomers: CustomerMap = {
    1: 'Ahmet Yılmaz',
    2: 'Ayşe Demir',
    3: 'Mehmet Kaya',
    4: 'Fatma Öztürk',
    5: 'Hasan Şahin'
};

// Mock cargo data
const mockCargos: Cargo[] = [
    {
        id: 1,
        customer_id: 1,
        desc: 'Elektronik eşyalar, dikkatli taşınmalı',
        weight: 12.5,
        pickUpLocation: 'İstanbul, Kadıköy',
        dropOffLocation: 'Ankara, Çankaya',
        status: 'Yolda'
    },
    {
        id: 2,
        customer_id: 2,
        desc: 'Mobilya parçaları, 3 parça',
        weight: 45.2,
        pickUpLocation: 'İzmir, Karşıyaka',
        dropOffLocation: 'İstanbul, Beşiktaş',
        status: 'Beklemede'
    },
    {
        id: 3,
        customer_id: 3,
        desc: 'Kitap koleksiyonu, 5 koli',
        weight: 30.0,
        pickUpLocation: 'Ankara, Keçiören',
        dropOffLocation: 'İzmir, Bornova',
        status: 'Hazırlanıyor'
    },
    {
        id: 4,
        customer_id: 4,
        desc: 'Kırılabilir mutfak eşyaları',
        weight: 8.7,
        pickUpLocation: 'Bursa, Nilüfer',
        dropOffLocation: 'Antalya, Muratpaşa',
        status: 'Teslim Edildi'
    },
    {
        id: 5,
        customer_id: 5,
        desc: 'Spor ekipmanları',
        weight: 22.3,
        pickUpLocation: 'Antalya, Konyaaltı',
        dropOffLocation: 'Bursa, Osmangazi',
        status: 'İptal Edildi'
    },
    {
        id: 6,
        customer_id: 1,
        desc: 'Ofis malzemeleri, 2 koli',
        weight: 15.8,
        pickUpLocation: 'İstanbul, Şişli',
        dropOffLocation: 'İstanbul, Ümraniye',
        status: 'Yolda'
    },
    {
        id: 7,
        customer_id: 3,
        desc: 'Kış giysileri, vakumlu paket',
        weight: 5.2,
        pickUpLocation: 'Eskişehir, Tepebaşı',
        dropOffLocation: 'Kocaeli, İzmit',
        status: 'Beklemede'
    },
    {
        id: 8,
        customer_id: 2,
        desc: 'Sanat eserleri, özel paketleme',
        weight: 18.9,
        pickUpLocation: 'Ankara, Kızılay',
        dropOffLocation: 'İstanbul, Beyoğlu',
        status: 'Hazırlanıyor'
    }
];

const CargoListings: React.FC = () => {
    // State for component
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('pickUpLocation');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // CSS sınıfları için useEffect
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
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Simulate API fetch with mock data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 800));
                setCargos(mockCargos);
                setLoading(false);
            } catch (err) {
                setError('Veri yüklenirken bir hata oluştu.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtreleme ve sıralama
    const filteredAndSortedCargos = React.useMemo(() => {
        // Önce filtreleme yap
        let result = [...cargos];

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            result = result.filter(cargo =>
                cargo.desc.toLowerCase().includes(lowercasedSearch) ||
                cargo.pickUpLocation.toLowerCase().includes(lowercasedSearch) ||
                cargo.dropOffLocation.toLowerCase().includes(lowercasedSearch) ||
                (mockCustomers[cargo.customer_id] &&
                    mockCustomers[cargo.customer_id].toLowerCase().includes(lowercasedSearch))
            );
        }

        if (filterStatus) {
            result = result.filter(cargo => cargo.status === filterStatus);
        }

        // Sonra sıralama yap
        result.sort((a, b) => {
            // Özel String alanlar için kontrol
            if (sortBy === 'customer') {
                const nameA = mockCustomers[a.customer_id] || '';
                const nameB = mockCustomers[b.customer_id] || '';
                return sortOrder === 'asc'
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            }

            // Sayısal alanlar için
            if (sortBy === 'weight') {
                return sortOrder === 'asc'
                    ? a[sortBy] - b[sortBy]
                    : b[sortBy] - a[sortBy];
            }

            // Diğer string alanlar için
            if (sortBy in a && sortBy in b) {
                const valueA = String(a[sortBy as keyof Cargo]);
                const valueB = String(b[sortBy as keyof Cargo]);
                return sortOrder === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }
            return 0;
        });

        return result;
    }, [cargos, searchTerm, filterStatus, sortBy, sortOrder]);

    // Sıralama değiştirme fonksiyonu
    const handleSort = (field: string) => {
        if (sortBy === field) {
            // Aynı alana tekrar tıklandığında sıralama düzenini değiştir
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Farklı bir alana tıklandığında sıralama alanını değiştir ve artan olarak sırala
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Durum gösterimini renklendirme
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Beklemede':
                return { backgroundColor: '#ffeeba', color: '#856404', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
            case 'Hazırlanıyor':
                return { backgroundColor: '#b8daff', color: '#004085', padding: '5px 10px', borderRadius: '15px', fontSize: '14px' };
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

    // Stil tanımlamaları
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
        maxWidth: '900px',
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
                <h1 style={headerStyle}>Kargo İlanları</h1>
                <p style={subHeaderStyle}>Mevcut kargo ilanlarını görüntüleyin ve yönetin</p>

                {/* Arama ve filtreleme */}
                <input
                    type="text"
                    placeholder="Arama yap... (Açıklama, Lokasyon, Müşteri)"
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
                            <option value="Beklemede">Beklemede</option>
                            <option value="Hazırlanıyor">Hazırlanıyor</option>
                            <option value="Yolda">Yolda</option>
                            <option value="Teslim Edildi">Teslim Edildi</option>
                            <option value="İptal Edildi">İptal Edildi</option>
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
                            <option value="customer-asc">Müşteri (A-Z)</option>
                            <option value="customer-desc">Müşteri (Z-A)</option>
                            <option value="weight-asc">Ağırlık (Artan)</option>
                            <option value="weight-desc">Ağırlık (Azalan)</option>
                            <option value="pickUpLocation-asc">Alım Lokasyonu (A-Z)</option>
                            <option value="pickUpLocation-desc">Alım Lokasyonu (Z-A)</option>
                            <option value="dropOffLocation-asc">Teslim Lokasyonu (A-Z)</option>
                            <option value="dropOffLocation-desc">Teslim Lokasyonu (Z-A)</option>
                            <option value="status-asc">Durum (A-Z)</option>
                            <option value="status-desc">Durum (Z-A)</option>
                        </select>
                    </div>
                </div>

                {loading && <div style={loadingStyle}>Yükleniyor...</div>}

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
                                            onClick={() => handleSort('customer')}
                                        >
                                            Müşteri
                                            {sortBy === 'customer' && (
                                                <span style={sortIndicatorStyle}>
                            {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                          </span>
                                            )}
                                        </th>
                                        <th
                                            style={thStyle}
                                            onClick={() => handleSort('desc')}
                                        >
                                            Açıklama
                                            {sortBy === 'desc' && (
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
                                            onClick={() => handleSort('pickUpLocation')}
                                        >
                                            Alım Yeri
                                            {sortBy === 'pickUpLocation' && (
                                                <span style={sortIndicatorStyle}>
                            {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                          </span>
                                            )}
                                        </th>
                                        <th
                                            style={thStyle}
                                            onClick={() => handleSort('dropOffLocation')}
                                        >
                                            Teslim Yeri
                                            {sortBy === 'dropOffLocation' && (
                                                <span style={sortIndicatorStyle}>
                            {sortOrder === 'asc' ? ' ▲' : ' ▼'}
                          </span>
                                            )}
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
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredAndSortedCargos.map((cargo: Cargo) => (
                                        <tr key={cargo.id} className="cargo-row" style={{ transition: 'all 0.2s ease' }}>
                                            <td style={tdFirstStyle}>{mockCustomers[cargo.customer_id] || 'Bilinmeyen Müşteri'}</td>
                                            <td style={tdStyle}>
                                                {cargo.desc.length > 30 ? `${cargo.desc.substring(0, 30)}...` : cargo.desc}
                                            </td>
                                            <td style={tdStyle}>{cargo.weight} kg</td>
                                            <td style={tdStyle}>
                                                {cargo.pickUpLocation.length > 20 ? `${cargo.pickUpLocation.substring(0, 20)}...` : cargo.pickUpLocation}
                                            </td>
                                            <td style={tdStyle}>
                                                {cargo.dropOffLocation.length > 20 ? `${cargo.dropOffLocation.substring(0, 20)}...` : cargo.dropOffLocation}
                                            </td>
                                            <td style={tdLastStyle}>
                          <span style={getStatusStyle(cargo.status)}>
                            {cargo.status}
                          </span>
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
    );
};

export default CargoListings;