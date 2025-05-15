
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
    fetchCustomerByUserIdThunk,
    updateCustomerThunk,
    deleteCustomerThunk,
    clearSelectedCustomer,
    createCustomerThunk
} from '../features/customer/customerSlice';

const CustomerManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedCustomer, status, error } = useSelector((state: RootState) => state.customer);
    const auth = useSelector((state: RootState) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
    });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        // Kullanıcı giriş yapmışsa müşteri bilgilerini çekmeyi dene
        if (auth.user?.uid) {
            dispatch(fetchCustomerByUserIdThunk());
        }

        // Cleanup function
        return () => {
            dispatch(clearSelectedCustomer());
        };
    }, [dispatch, auth.user]);

    useEffect(() => {
        // Müşteri verisi yüklendiğinde form verilerini ayarla
        if (selectedCustomer) {
            setFormData({
                address: selectedCustomer.address || '',
            });
        }
    }, [selectedCustomer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCustomer?.customerId) {
            dispatch(updateCustomerThunk({
                customerId: selectedCustomer.customerId,
                address: formData.address
            })).then(() => {
                setIsEditing(false);
                dispatch(fetchCustomerByUserIdThunk());
            });
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        // uid değerini auth store'dan al (JWT'deki uid alanı)
        const userId = auth.user?.uid;

        if (!userId) {
            console.error("Kullanıcı kimliği bulunamadı!");
            return;
        }

        const customerData = {
            userId: userId,
            address: formData.address,
            // customerId alanını göndermiyoruz, backend tarafından otomatik atanacak
        };

        dispatch(createCustomerThunk(customerData as any)).then(() => {
            setIsCreating(false);
            dispatch(fetchCustomerByUserIdThunk());
        });
    };

    const handleDelete = () => {
        if (selectedCustomer?.customerId) {
            dispatch(deleteCustomerThunk(selectedCustomer.customerId)).then(() => {
                setIsDeleteConfirmOpen(false);
                dispatch(fetchCustomerByUserIdThunk());
            });
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
                            Müşteri ID
                        </label>
                        <input
                            type="text"
                            value={selectedCustomer?.customerId || ''}
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
                            value={selectedCustomer?.userId || ''}
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
                    Adres
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '16px',
                        borderRadius: '10px',
                        border: '1px solid #ddd',
                        backgroundColor: '#f9f9f9',
                        minHeight: '100px',
                        resize: 'vertical'
                    }}
                />
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

    // Kullanıcı giriş yapmamışsa, login ekranına yönlendir
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

    if (status === 'loading') {
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
                    <p style={{ fontSize: '18px' }}>Müşteri bilgileri yükleniyor...</p>
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
                    Müşteri Bilgilerim
                </h1>

                {/* Müşteri kaydı yoksa veya hata varsa bilgi göster */}
                {(!selectedCustomer && !isCreating && auth.user?.uid) && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        padding: '20px',
                        borderRadius: '10px',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '16px', color: '#721c24' }}>
                            Henüz müşteri kaydınız bulunmamaktadır. Aşağıdaki butonu kullanarak müşteri kaydı oluşturabilirsiniz.
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
                            Müşteri Kaydı Oluştur
                        </button>
                    </div>
                )}

                {isCreating ? (
                    renderForm(handleCreate)
                ) : isEditing ? (
                    renderForm(handleUpdate, true)
                ) : selectedCustomer ? (
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
                                    }}>Müşteri ID:</p>
                                    <p style={{ fontSize: '18px' }}>{selectedCustomer.customerId}</p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Kullanıcı ID:</p>
                                    <p style={{ fontSize: '18px' }}>{selectedCustomer.userId}</p>
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
                                    }}>Kullanıcı Adı :</p>
                                    <p style={{ fontSize: '18px' }}>{auth.user?.sub || 'Bilgi bulunamadı'}</p>
                                </div>

                                <div>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6c757d',
                                        marginBottom: '5px'
                                    }}>Adres:</p>
                                    <p style={{ fontSize: '18px' }}>{selectedCustomer.address}</p>
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
                                Müşteri Kaydını Silme Onayı
                            </h3>
                            <p style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>
                                Bu müşteri kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default CustomerManagement