import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCargo } from '../features/cargo/cargoSlice';
import { fetchCustomers } from '../features/customer/customerSlice';
import { fetchAllLocations } from '../features/location/locationSlice';
import { RootState, AppDispatch } from '../store/store'; // Store tiplerini ekleyin

const CreateCargo: React.FC = () => {
    // CSS sınıfını document head'e ekle
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .select-element {
        -webkit-appearance: menulist;
        -moz-appearance: menulist;
        appearance: menulist;
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const dispatch = useDispatch<AppDispatch>();

    // Redux store'dan müşteri ve lokasyon verilerini al
    const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customer);
    const { locations, loading: locationsLoading } = useSelector((state: RootState) => state.location);

    // Sayfa yüklendiğinde müşteri ve lokasyon verilerini getir
    useEffect(() => {
        dispatch(fetchCustomers());
        dispatch(fetchAllLocations());
    }, [dispatch]);

    interface FormData {
        customerId: string;
        description: string;
        weight: string;
        cargoType: string;
        pickupLocationId: string;
        dropoffLocationId: string;
    }

    interface FormErrors {
        customerId?: string;
        description?: string;
        weight?: string;
        cargoType?: string;
        pickupLocationId?: string;
        dropoffLocationId?: string;
        form?: string;
    }

    const [formData, setFormData] = useState<FormData>({
        customerId: '',
        description: '',
        weight: '',
        cargoType: '',
        pickupLocationId: '',
        dropoffLocationId: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [buttonHover, setButtonHover] = useState(false);

    const cargoTypes = [
        { id: 'STANDART', name: 'Standart Kargo' },
        { id: 'EXPRESS', name: 'Express Kargo' },
        { id: 'HEAVY', name: 'Ağır Yük' },
        { id: 'FRAGILE', name: 'Kırılgan Eşya' },
        { id: 'COLD_CHAIN', name: 'Soğuk Zincir' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Hata mesajını temizle
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name as keyof FormErrors];
                return newErrors;
            });
        }

        // Eğer pickup veya dropoff lokasyonu değiştiyse, aynı olmadıklarını kontrol et
        if (name === 'pickupLocationId' || name === 'dropoffLocationId') {
            const otherFieldName = name === 'pickupLocationId' ? 'dropoffLocationId' : 'pickupLocationId';
            const otherFieldValue = formData[otherFieldName as keyof FormData];

            // Eğer her iki lokasyon da seçili ve aynıysa hata ver
            if (value && otherFieldValue && value === otherFieldValue) {
                setErrors(prev => ({
                    ...prev,
                    [name]: 'Alım ve teslim lokasyonları aynı olamaz'
                }));
            }
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.customerId) newErrors.customerId = 'Müşteri seçimi zorunludur';
        if (!formData.description) newErrors.description = 'Kargo açıklaması zorunludur';
        if (!formData.cargoType) newErrors.cargoType = 'Kargo tipi zorunludur';
        if (!formData.weight) {
            newErrors.weight = 'Ağırlık zorunludur';
        } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
            newErrors.weight = 'Geçerli bir ağırlık giriniz';
        }
        if (!formData.pickupLocationId) newErrors.pickupLocationId = 'Alım lokasyonu zorunludur';
        if (!formData.dropoffLocationId) newErrors.dropoffLocationId = 'Teslim lokasyonu zorunludur';

        // Aynı lokasyon kontrolü
        if (formData.pickupLocationId && formData.dropoffLocationId &&
            formData.pickupLocationId === formData.dropoffLocationId) {
            newErrors.dropoffLocationId = 'Alım ve teslim lokasyonları aynı olamaz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Form verilerini sayısal değerlere dönüştürme
            const cargoData = {
                customerId: parseInt(formData.customerId),
                description: formData.description,
                weight: parseFloat(formData.weight),
                cargoType: formData.cargoType,
                pickupLocationId: parseInt(formData.pickupLocationId),
                dropoffLocationId: parseInt(formData.dropoffLocationId)
            };

            // Redux action'ını çağır
            await dispatch(createCargo(cargoData));

            // Add alert for successful cargo creation
            setSuccessMessage('Kargo kaydı başarıyla oluşturuldu!');
            alert('Kargo kaydı başarıyla oluşturuldu!');

            // Formu sıfırla
            setFormData({
                customerId: '',
                description: '',
                weight: '',
                cargoType: '',
                pickupLocationId: '',
                dropoffLocationId: ''
            });

            // 3 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Kargo oluşturulurken hata:', error);
            setErrors({ form: 'Kargo kaydı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Stil tanımlamaları
    const pageStyle: React.CSSProperties = {
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '5%',
        backgroundColor: '#f5f7fa',
        fontFamily: 'Arial, sans-serif'
    };

    const containerStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px'
    };

    const headerStyle: React.CSSProperties = {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '30px',
        textAlign: 'center'
    };

    const formStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
    };

    const formGroupStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333'
    };

    const inputStyle: React.CSSProperties = {
        padding: '15px',
        fontSize: '16px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        width: '100%',
        boxSizing: 'border-box'
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: '100px',
        resize: 'vertical'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '16px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginTop: '15px'
    };

    const buttonHoverStyle: React.CSSProperties = {
        backgroundColor: '#d90429'
    };

    const errorStyle: React.CSSProperties = {
        color: '#e63946',
        fontSize: '14px',
        marginTop: '5px'
    };

    const successStyle: React.CSSProperties = {
        backgroundColor: '#57cc99',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        marginBottom: '20px',
        fontWeight: 'bold'
    };

    const loadingStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '20px',
        color: '#666'
    };

    // Veriler yükleniyorsa loading göster
    if (customersLoading || locationsLoading) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <div style={loadingStyle}>
                        <h2>Veriler yükleniyor...</h2>
                        <p>Lütfen bekleyiniz</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h1 style={headerStyle}>Yeni Kargo Kaydı Oluştur</h1>

                {successMessage && (
                    <div style={successStyle}>
                        {successMessage}
                    </div>
                )}

                {errors.form && (
                    <div style={{...errorStyle, padding: '15px', backgroundColor: '#ffeeee', marginBottom: '20px'} as React.CSSProperties}>
                        {errors.form}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="customerId">Müşteri Adresi</label>
                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="">Müşteri Adresi Seçin</option>
                            {customers && customers.map(customer => (
                                <option key={customer.customerId} value={customer.customerId}>
                                    {customer.address}
                                </option>
                            ))}
                        </select>
                        {errors.customerId && <span style={errorStyle}>{errors.customerId}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="cargoType">Kargo Tipi</label>
                        <select
                            id="cargoType"
                            name="cargoType"
                            value={formData.cargoType}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="">Kargo Tipi Seçin</option>
                            {cargoTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.cargoType && <span style={errorStyle}>{errors.cargoType}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="description">Kargo Açıklaması</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={textareaStyle}
                            placeholder="Kargo içeriği hakkında detaylı bilgi giriniz"
                        />
                        {errors.description && <span style={errorStyle}>{errors.description}</span>}
                    </div>

                    <div style={{...formGroupStyle}}>
                        <label style={labelStyle} htmlFor="weight">Ağırlık (kg)</label>
                        <input
                            type="number"
                            id="weight"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            style={inputStyle}
                        />
                        {errors.weight && <span style={errorStyle}>{errors.weight}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="pickupLocationId">Alım Lokasyonu</label>
                        <select
                            id="pickupLocationId"
                            name="pickupLocationId"
                            value={formData.pickupLocationId}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="">Alım Lokasyonu Seçin</option>
                            {locations && locations.map(location => (
                                <option key={location.id} value={location.id}>
                                    {location.city} - {location.address}
                                </option>
                            ))}
                        </select>
                        {errors.pickupLocationId && <span style={errorStyle}>{errors.pickupLocationId}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="dropoffLocationId">Teslim Lokasyonu</label>
                        <select
                            id="dropoffLocationId"
                            name="dropoffLocationId"
                            value={formData.dropoffLocationId}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="">Teslim Lokasyonu Seçin</option>
                            {locations && locations.map(location => (
                                <option
                                    key={location.id}
                                    value={location.id}
                                    disabled={location.id === parseInt(formData.pickupLocationId)}
                                >
                                    {location.city} - {location.address}
                                    {location.id === parseInt(formData.pickupLocationId) ? ' (Alım lokasyonu ile aynı)' : ''}
                                </option>
                            ))}
                        </select>
                        {errors.dropoffLocationId && <span style={errorStyle}>{errors.dropoffLocationId}</span>}
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...buttonStyle,
                            ...(buttonHover ? buttonHoverStyle : {}),
                            ...(isSubmitting ? { opacity: 0.7, cursor: 'wait' } : {})
                        }}
                        onMouseEnter={() => setButtonHover(true)}
                        onMouseLeave={() => setButtonHover(false)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'İşleniyor...' : 'Kargo Kaydı Oluştur'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCargo;