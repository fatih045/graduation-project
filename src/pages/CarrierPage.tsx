import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
    fetchCarrierByUserId,
    editCarrier,
    removeCarrier,
    clearSelectedCarrier,
    addCarrier
} from '../features/carrier/carrierSlice';

const CarrierPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedCarrier, loading, error } = useSelector((state: RootState) => state.carrier);
    const auth = useSelector((state: RootState) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        carrierId: 0,
        licenseNumber: '',
        availabilityStatus: false
    });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        // Fetch carrier info if user is logged in
        if (auth.user?.uid) {
            dispatch(fetchCarrierByUserId(auth.user.uid));
        }

        // Cleanup function
        return () => {
            dispatch(clearSelectedCarrier());
        };
    }, [dispatch, auth.user]);

    useEffect(() => {
        // Set form data when carrier data is loaded
        if (selectedCarrier) {
            setFormData({
                // API yanıt olarak id kullanıyor, formda carrierID kullanılıyor
                carrierId: selectedCarrier.id ? Number(selectedCarrier.id) : 0,
                licenseNumber: selectedCarrier.licenseNumber || '',
                availabilityStatus: selectedCarrier.availabilityStatus || false
            });
        }
    }, [selectedCarrier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if we have a valid ID
        if (!formData.carrierId) {
            console.error("Carrier ID is missing");
            return;
        }

        try {
            // Make sure we're passing exactly what the backend expects
            const updateData = {
                carrierId: formData.carrierId, // Using carrierId for the request
                licenseNumber: formData.licenseNumber,
                availabilityStatus: formData.availabilityStatus
            };

            console.log("Sending update with data:", updateData);

            // Use await to properly handle the promise
            await dispatch(editCarrier(updateData)).unwrap();

            setIsEditing(false);

            // Refresh carrier data after successful update
            if (auth.user?.uid) {
                dispatch(fetchCarrierByUserId(auth.user.uid));
            }
        } catch (error) {
            console.error("Error updating carrier:", error);
            alert("Güncelleme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const userId = auth.user?.uid;

        if (!userId) {
            console.error("User ID not found!");
            return;
        }

        try {
            const carrierData = {
                userId: userId,
                licenseNumber: formData.licenseNumber,
                availabilityStatus: formData.availabilityStatus
            };

            await dispatch(addCarrier(carrierData)).unwrap();
            setIsCreating(false);
            dispatch(fetchCarrierByUserId(userId));
        } catch (error) {
            console.error("Error creating carrier:", error);
            alert("Oluşturma işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
        }
    };

    const handleDelete = async () => {
        // API yanıtta id kullanıyor
        const carrierId = selectedCarrier?.id;

        if (carrierId) {
            try {
                await dispatch(removeCarrier(carrierId)).unwrap();
                setIsDeleteConfirmOpen(false);

                if (auth.user?.uid) {
                    dispatch(fetchCarrierByUserId(auth.user.uid));
                }
            } catch (error) {
                console.error("Error deleting carrier:", error);
                alert("Silme işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    const renderForm = (submitHandler: (e: React.FormEvent) => void, isEdit: boolean = false) => (
        <form onSubmit={submitHandler} style={{ width: '100%' }}>
            {isEdit && (
                <>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            marginBottom: '10px',
                            fontWeight: '500'
                        }}>
                            Taşıyıcı ID
                        </label>
                        <input
                            type="text"
                            name="carrierId"
                            value={formData.carrierId}
                            readOnly
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '16px',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                backgroundColor: '#f9f9f9',
                                opacity: '0.7'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            marginBottom: '10px',
                            fontWeight: '500'
                        }}>
                            Kullanıcı ID
                        </label>
                        <input
                            type="text"
                            value={selectedCarrier?.userId || ''}
                            disabled
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '16px',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                backgroundColor: '#f9f9f9',
                                opacity: '0.7'
                            }}
                        />
                    </div>
                </>
            )}

            <div style={{ marginBottom: '25px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '18px',
                    marginBottom: '10px',
                    fontWeight: '500'
                }}>
                    Lisans Numarası
                </label>
                <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid #ddd',
                        backgroundColor: '#f9f9f9'
                    }}
                />
            </div>

            <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    id="availabilityStatus"
                    name="availabilityStatus"
                    checked={formData.availabilityStatus}
                    onChange={handleChange}
                    style={{
                        marginRight: '10px',
                        width: '20px',
                        height: '20px'
                    }}
                />
                <label
                    htmlFor="availabilityStatus"
                    style={{
                        fontSize: '18px',
                        fontWeight: '500'
                    }}
                >
                    Uygunluk Durumu
                </label>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '30px'
            }}>
                <button
                    type="button"
                    onClick={() => isEdit ? setIsEditing(false) : setIsCreating(false)}
                    style={{
                        padding: '16px 30px',
                        fontSize: '16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                >
                    İptal
                </button>
                <button
                    type="submit"
                    style={{
                        padding: '16px 30px',
                        fontSize: '16px',
                        backgroundColor: isEdit ? '#28a745' : '#0d6efd',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = isEdit ? '#218838' : '#0b5ed7'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = isEdit ? '#28a745' : '#0d6efd'}
                >
                    {isEdit ? 'Güncelle' : 'Oluştur'}
                </button>
            </div>
        </form>
    );

    // Redirect to login if user is not logged in
    if (!auth.user?.uid) {
        return (
            <div style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 5%'
            }}>
                <div style={{
                    maxWidth: '800px',
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '18px', marginBottom: '20px' }}>Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        style={{
                            padding: '16px 30px',
                            fontSize: '16px',
                            backgroundColor: '#0d6efd',
                            color: 'white',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b5ed7'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d6efd'}
                    >
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 5%'
            }}>
                <div style={{
                    maxWidth: '800px',
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '18px' }}>Taşıyıcı bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 5%'
            }}>
                <div style={{
                    maxWidth: '800px',
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '18px', color: '#dc3545' }}>
                        Taşıyıcı bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
                    </p>
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
            alignItems: 'center',
            padding: '0 5%'
        }}>
            <div style={{
                maxWidth: '800px',
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                padding: '40px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    marginBottom: '30px',
                    color: '#333',
                    textAlign: 'center'
                }}>
                    Taşıyıcı Bilgilerim
                </h1>

                {/* Show info if no carrier record or error */}
                {(!selectedCarrier && !isCreating && auth.user?.uid) && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        padding: '20px',
                        borderRadius: '10px',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '16px', color: '#721c24' }}>
                            Henüz taşıyıcı kaydınız bulunmamaktadır. Aşağıdaki butonu kullanarak taşıyıcı kaydı oluşturabilirsiniz.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            style={{
                                padding: '16px 30px',
                                fontSize: '16px',
                                backgroundColor: '#0d6efd',
                                color: 'white',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s',
                                marginTop: '20px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b5ed7'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d6efd'}
                        >
                            Taşıyıcı Kaydı Oluştur
                        </button>
                    </div>
                )}

                {isCreating ? (
                    renderForm(handleCreate)
                ) : isEditing ? (
                    renderForm(handleUpdate, true)
                ) : selectedCarrier ? (
                    <div>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '10px',
                            marginBottom: '30px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Taşıyıcı ID:</p>
                                    <p style={{ fontSize: '18px' }}>{selectedCarrier.id}</p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Kullanıcı ID:</p>
                                    <p style={{ fontSize: '18px' }}>{selectedCarrier.userId}</p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Email Adresi:</p>
                                    <p style={{ fontSize: '18px' }}>{auth.user?.email || 'Bilgi bulunamadı'}</p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Kullanıcı Adı:</p>
                                    <p style={{ fontSize: '18px' }}>{auth.user?.sub || 'Bilgi bulunamadı'}</p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Lisans Numarası:</p>
                                    <p style={{ fontSize: '18px' }}>{selectedCarrier.licenseNumber}</p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Uygunluk Durumu:</p>
                                    <p
                                        style={{
                                            fontSize: '18px',
                                            color: selectedCarrier.availabilityStatus ? '#28a745' : '#dc3545',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {selectedCarrier.availabilityStatus ? 'Müsait' : 'Müsait Değil'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '30px'
                        }}>
                            <button
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                style={{
                                    padding: '16px 30px',
                                    fontSize: '16px',
                                    backgroundColor: '#e63946',
                                    color: 'white',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32535'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e63946'}
                            >
                                Sil
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '16px 30px',
                                    fontSize: '16px',
                                    backgroundColor: '#0d6efd',
                                    color: 'white',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b5ed7'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0d6efd'}
                            >
                                Düzenle
                            </button>
                        </div>
                    </div>
                ) : null}

                {/* Delete Confirmation Modal */}
                {isDeleteConfirmOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            width: '90%',
                            maxWidth: '500px',
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        }}>
                            <h3 style={{ fontSize: '22px', marginBottom: '20px', textAlign: 'center' }}>
                                Taşıyıcı Kaydını Silme Onayı
                            </h3>
                            <p style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>
                                Bu taşıyıcı kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    style={{
                                        padding: '16px 30px',
                                        fontSize: '16px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        padding: '16px 30px',
                                        fontSize: '16px',
                                        backgroundColor: '#e63946',
                                        color: 'white',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32535'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e63946'}
                                >
                                    Evet, Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarrierPage;