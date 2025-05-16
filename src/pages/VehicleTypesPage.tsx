

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchVehicleTypes,
    fetchVehicleTypeById,
    addVehicleType,
    editVehicleType,
    removeVehicleType,
    clearSelectedVehicleType,
    VehicleType
} from '../features/vehicleType/vehicleTypeSlice';
import { RootState, AppDispatch } from '../store/store';

const VehicleTypesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, selected, status, error } = useSelector((state: RootState) => state.vehicleType);

    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [formValues, setFormValues] = useState({
        name: '',
        description: ''
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Sayfa ilk yüklendiğinde verileri getir
    useEffect(() => {
        dispatch(fetchVehicleTypes());
    }, [dispatch]);

    // Seçili öğe değiştiğinde form verilerini güncelle
    useEffect(() => {
        if (selected) {
            setFormValues({
                name: selected.name,
                description: selected.description
            });
            setFormMode('edit');
        }
    }, [selected]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddNew = () => {
        setFormValues({ name: '', description: '' });
        setFormMode('add');
        dispatch(clearSelectedVehicleType());
    };

    const handleEdit = (id: number) => {
        // ID'nin tanımlı olduğundan emin olalım
        if (id !== undefined && id !== null) {
            dispatch(fetchVehicleTypeById(id));
        } else {
            console.error("Geçersiz ID:", id);
        }
    };

    const handleDelete = (id: number) => {
        // ID'nin tanımlı olduğundan emin olalım
        if (id !== undefined && id !== null) {
            setDeleteId(id);
            setShowConfirmDialog(true);
        } else {
            console.error("Geçersiz ID:", id);
        }
    };

    const confirmDelete = () => {
        if (deleteId !== null) {
            dispatch(removeVehicleType(deleteId))
                .unwrap()
                .then(() => {
                    setShowConfirmDialog(false);
                    setDeleteId(null);
                })
                .catch((error) => {
                    console.error("Silme işlemi başarısız:", error);
                    setShowConfirmDialog(false);
                    setDeleteId(null);
                });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formMode === 'add') {
            dispatch(addVehicleType(formValues))
                .unwrap()
                .then(() => {
                    // Başarılı olduğunda form temizlenir
                    setFormValues({ name: '', description: '' });
                    // Listeyi yenile
                    dispatch(fetchVehicleTypes());
                })
                .catch((error) => {
                    console.error("Ekleme işlemi başarısız:", error);
                });
        } else if (formMode === 'edit' && selected && selected.vehicleTypeId !== undefined) {
            dispatch(editVehicleType({ id: selected.vehicleTypeId, data: formValues }))
                .unwrap()
                .then(() => {
                    // Başarılı olduğunda form temizlenir ve mod değiştirilir
                    setFormValues({ name: '', description: '' });
                    setFormMode('add');
                    dispatch(clearSelectedVehicleType());
                    // Listeyi yenile
                    dispatch(fetchVehicleTypes());
                })
                .catch((error) => {
                    console.error("Güncelleme işlemi başarısız:", error);
                });
        }
    };

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            padding: '5%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    marginBottom: '30px',
                    color: '#333'
                }}>
                    Araç Tipleri Yönetimi
                </h1>

                {/* Form Bölümü */}
                <div style={{
                    backgroundColor: '#f9f9f9',
                    borderRadius: '15px',
                    padding: '30px',
                    marginBottom: '40px'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        marginBottom: '20px',
                        color: '#444'
                    }}>
                        {formMode === 'add' ? 'Yeni Araç Tipi Ekle' : 'Araç Tipi Düzenle'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="name" style={{ fontSize: '16px', fontWeight: 500 }}>Araç Tipi Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formValues.name}
                                onChange={handleInputChange}
                                required
                                style={{
                                    fontSize: '16px',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#f9f9f9',
                                    width: '100%'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="description" style={{ fontSize: '16px', fontWeight: 500 }}>Açıklama</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formValues.description}
                                onChange={handleInputChange}
                                required
                                style={{
                                    fontSize: '16px',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#f9f9f9',
                                    width: '100%',
                                    minHeight: '100px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#e63946',
                                    color: 'white',
                                    border: 'none',
                                    padding: '16px 25px',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32638'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e63946'}
                            >
                                {formMode === 'add' ? 'Ekle' : 'Güncelle'}
                            </button>

                            {formMode === 'edit' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormValues({ name: '', description: '' });
                                        setFormMode('add');
                                        dispatch(clearSelectedVehicleType());
                                    }}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px 25px',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                                >
                                    İptal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Liste Bölümü */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{
                            fontSize: '20px',
                            color: '#444'
                        }}>
                            Araç Tipleri
                        </h2>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => dispatch(fetchVehicleTypes())}
                                style={{
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                            >
                                Yenile
                            </button>

                            <button
                                onClick={handleAddNew}
                                style={{
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3e8e41'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                            >
                                Yeni Ekle
                            </button>
                        </div>
                    </div>

                    {status === 'loading' && (
                        <div style={{ textAlign: 'center', padding: '30px' }}>
                            <p style={{ fontSize: '16px', color: '#666' }}>Yükleniyor...</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div style={{
                            backgroundColor: '#ffeeee',
                            padding: '15px',
                            borderRadius: '10px',
                            color: '#d32f2f'
                        }}>
                            <p>Hata: {error}</p>
                        </div>
                    )}

                    {status === 'succeeded' && items.length === 0 && (
                        <div style={{
                            backgroundColor: '#f9f9f9',
                            padding: '25px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '16px', color: '#666' }}>Henüz araç tipi bulunmamaktadır.</p>
                        </div>
                    )}

                    {status === 'succeeded' && items.length > 0 && (
                        <div style={{
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid #eee'
                        }}>
                            {items.map((item: VehicleType, index: number) => (
                                <div
                                    key={item.vehicleTypeId}
                                    style={{
                                        padding: '20px',
                                        borderBottom: index < items.length - 1 ? '1px solid #eee' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{item.name}</h3>
                                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{item.description}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleEdit(item.vehicleTypeId)}
                                            style={{
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 15px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.vehicleTypeId)}
                                            style={{
                                                backgroundColor: '#e63946',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 15px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32638'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e63946'}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Silme Onay Dialog */}
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Silme İşlemi</h3>
                        <p style={{ fontSize: '16px', marginBottom: '25px' }}>
                            Bu araç tipini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                            >
                                İptal
                            </button>

                            <button
                                onClick={confirmDelete}
                                style={{
                                    backgroundColor: '#e63946',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32638'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e63946'}
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleTypesPage;