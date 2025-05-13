import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addBooking } from '../features/booking/bookingSlice';

// Varsayılan müşteriler, taşıyıcılar, araçlar ve kargo türleri
const mockCustomers = [
    { id: 1, name: 'Ahmet Yılmaz' },
    { id: 2, name: 'Ayşe Demir' },
    { id: 3, name: 'Mehmet Kaya' }
];

const mockCarriers = [
    { id: 1, name: 'Hızlı Lojistik' },
    { id: 2, name: 'Global Taşıma' },
    { id: 3, name: 'Ekspres Kargo' }
];

const mockVehicles = [
    { id: 1, name: 'Kamyon (10 ton)', carrier_id: 1 },
    { id: 2, name: 'Kamyonet (3 ton)', carrier_id: 1 },
    { id: 3, name: 'TIR (20 ton)', carrier_id: 2 },
    { id: 4, name: 'Van (1 ton)', carrier_id: 3 }
];

const mockCargos = [
    { id: 1, name: 'Elektronik Eşya' },
    { id: 2, name: 'Gıda Malzemeleri' },
    { id: 3, name: 'İnşaat Malzemeleri' },
    { id: 4, name: 'Tekstil Ürünleri' }
];

const CreateBooking: React.FC = () => {
    // CSS sınıfını document head'e ekle
    React.useEffect(() => {
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
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        customer_id: '',
        carrier_id: '',
        vehicle_id: '',
        cargo_id: '',
        pickup_date: '',
        dropoff_data: '',
        totalPrice: '',
        status: 'Beklemede'
    });

    const [availableVehicles, setAvailableVehicles] = useState<typeof mockVehicles>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Taşıyıcı seçimine göre araç listesini filtreleme
    useEffect(() => {
        if (formData.carrier_id) {
            const filtered = mockVehicles.filter(v => v.carrier_id === parseInt(formData.carrier_id));
            setAvailableVehicles(filtered);

            // Eğer seçili araç bu taşıyıcıya ait değilse, araç seçimini sıfırla
            if (!filtered.some(v => v.id === parseInt(formData.vehicle_id))) {
                setFormData(prev => ({ ...prev, vehicle_id: '' }));
            }
        } else {
            setAvailableVehicles([]);
            setFormData(prev => ({ ...prev, vehicle_id: '' }));
        }
    }, [formData.carrier_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Hata mesajını temizle
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customer_id) newErrors.customer_id = 'Müşteri seçimi zorunludur';
        if (!formData.carrier_id) newErrors.carrier_id = 'Taşıyıcı seçimi zorunludur';
        if (!formData.vehicle_id) newErrors.vehicle_id = 'Araç seçimi zorunludur';
        if (!formData.cargo_id) newErrors.cargo_id = 'Kargo türü seçimi zorunludur';
        if (!formData.pickup_date) newErrors.pickup_date = 'Alım tarihi zorunludur';
        if (!formData.dropoff_data) newErrors.dropoff_data = 'Teslim tarihi zorunludur';
        if (!formData.totalPrice) {
            newErrors.totalPrice = 'Toplam fiyat zorunludur';
        } else if (isNaN(Number(formData.totalPrice)) || Number(formData.totalPrice) <= 0) {
            newErrors.totalPrice = 'Geçerli bir fiyat giriniz';
        }

        // Tarih kontrolü
        if (formData.pickup_date && formData.dropoff_data) {
            const pickupDate = new Date(formData.pickup_date);
            const dropoffDate = new Date(formData.dropoff_data);

            if (dropoffDate <= pickupDate) {
                newErrors.dropoff_data = 'Teslim tarihi, alım tarihinden sonra olmalıdır';
            }
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
            const bookingData = {
                customer_id: parseInt(formData.customer_id),
                carrier_id: parseInt(formData.carrier_id),
                vehicle_id: parseInt(formData.vehicle_id),
                cargo_id: parseInt(formData.cargo_id),
                pickup_date: formData.pickup_date,
                dropoff_data: formData.dropoff_data,
                totalPrice: parseFloat(formData.totalPrice),
                status: formData.status
            };

            // Redux action'ını çağır
            await dispatch(addBooking(bookingData) as any);

            // Başarılı mesajı göster
            setSuccessMessage('Rezervasyon başarıyla oluşturuldu!');

            // Formu sıfırla
            setFormData({
                customer_id: '',
                carrier_id: '',
                vehicle_id: '',
                cargo_id: '',
                pickup_date: '',
                dropoff_data: '',
                totalPrice: '',
                status: 'Beklemede'
            });

            // 3 saniye sonra başarı mesajını kaldır
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Rezervasyon oluşturulurken hata:', error);
            setErrors({ form: 'Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
        maxWidth: '800px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '40px'
    };

    const headerStyle = {
        fontSize: '28px',
        fontWeight: 'bold' as const,
        color: '#333',
        marginBottom: '30px',
        textAlign: 'center' as const
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '25px'
    };

    const formGroupStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px'
    };

    const labelStyle = {
        fontSize: '16px',
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
        boxSizing: 'border-box' as const
    };

    const selectStyle = {
        ...inputStyle
    };

    const buttonStyle = {
        padding: '16px',
        fontSize: '16px',
        fontWeight: 'bold' as const,
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginTop: '15px'
    };

    const buttonHoverStyle = {
        backgroundColor: '#d90429'
    };

    const errorStyle = {
        color: '#e63946',
        fontSize: '14px',
        marginTop: '5px'
    };

    const successStyle = {
        backgroundColor: '#57cc99',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center' as const,
        marginBottom: '20px',
        fontWeight: 'bold' as const
    };

    const [buttonHover, setButtonHover] = useState(false);

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h1 style={headerStyle}>Yeni Rezervasyon Oluştur</h1>

                {successMessage && (
                    <div style={successStyle}>
                        {successMessage}
                    </div>
                )}

                {errors.form && (
                    <div style={{...errorStyle, padding: '15px', backgroundColor: '#ffeeee', marginBottom: '20px'}}>
                        {errors.form}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="customer_id">Müşteri</label>
                        <select
                            id="customer_id"
                            name="customer_id"
                            value={formData.customer_id}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"

                        >
                            <option value="">Müşteri Seçin</option>
                            {mockCustomers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        {errors.customer_id && <span style={errorStyle}>{errors.customer_id}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="carrier_id">Taşıyıcı</label>
                        <select
                            id="carrier_id"
                            name="carrier_id"
                            value={formData.carrier_id}
                            onChange={handleChange}
                            style={selectStyle}
                        >
                            <option value="">Taşıyıcı Seçin</option>
                            {mockCarriers.map(carrier => (
                                <option key={carrier.id} value={carrier.id}>
                                    {carrier.name}
                                </option>
                            ))}
                        </select>
                        {errors.carrier_id && <span style={errorStyle}>{errors.carrier_id}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="vehicle_id">Araç</label>
                        <select
                            id="vehicle_id"
                            name="vehicle_id"
                            value={formData.vehicle_id}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"
                            disabled={!formData.carrier_id}
                        >
                            <option value="">Araç Seçin</option>
                            {availableVehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.name}
                                </option>
                            ))}
                        </select>
                        {errors.vehicle_id && <span style={errorStyle}>{errors.vehicle_id}</span>}
                        {!formData.carrier_id && <span style={{...errorStyle, color: '#666'}}>Önce taşıyıcı seçiniz</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="cargo_id">Kargo Türü</label>
                        <select
                            id="cargo_id"
                            name="cargo_id"
                            value={formData.cargo_id}
                            onChange={handleChange}
                            style={selectStyle}
                        >
                            <option value="">Kargo Türü Seçin</option>
                            {mockCargos.map(cargo => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.name}
                                </option>
                            ))}
                        </select>
                        {errors.cargo_id && <span style={errorStyle}>{errors.cargo_id}</span>}
                    </div>

                    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                        <div style={{...formGroupStyle, flex: '1', minWidth: '250px'}}>
                            <label style={labelStyle} htmlFor="pickup_date">Alım Tarihi</label>
                            <input
                                type="datetime-local"
                                id="pickup_date"
                                name="pickup_date"
                                value={formData.pickup_date}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                            {errors.pickup_date && <span style={errorStyle}>{errors.pickup_date}</span>}
                        </div>

                        <div style={{...formGroupStyle, flex: '1', minWidth: '250px'}}>
                            <label style={labelStyle} htmlFor="dropoff_data">Teslim Tarihi</label>
                            <input
                                type="datetime-local"
                                id="dropoff_data"
                                name="dropoff_data"
                                value={formData.dropoff_data}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                            {errors.dropoff_data && <span style={errorStyle}>{errors.dropoff_data}</span>}
                        </div>
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="totalPrice">Toplam Fiyat (₺)</label>
                        <input
                            type="number"
                            id="totalPrice"
                            name="totalPrice"
                            value={formData.totalPrice}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            style={inputStyle}
                        />
                        {errors.totalPrice && <span style={errorStyle}>{errors.totalPrice}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="status">Durum</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={selectStyle}
                        >
                            <option value="Beklemede">Beklemede</option>
                            <option value="Onaylandı">Onaylandı</option>
                            <option value="Yolda">Yolda</option>
                            <option value="Teslim Edildi">Teslim Edildi</option>
                            <option value="İptal Edildi">İptal Edildi</option>
                        </select>
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
                        {isSubmitting ? 'İşleniyor...' : 'Rezervasyon Oluştur'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateBooking;