import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createCargo } from '../features/cargo/cargoSlice';

// Varsayılan müşteri listesi
const mockCustomers = [
    { id: 1, name: 'Ahmet Yılmaz' },
    { id: 2, name: 'Ayşe Demir' },
    { id: 3, name: 'Mehmet Kaya' }
];

const CreateCargo: React.FC = () => {
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
        desc: '',
        weight: '',
        dimensions: '',
        pickUpLocation: '',
        dropOffLocation: '',
        status: 'Beklemede'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [buttonHover, setButtonHover] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        if (!formData.desc) newErrors.desc = 'Kargo açıklaması zorunludur';
        if (!formData.weight) {
            newErrors.weight = 'Ağırlık zorunludur';
        } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
            newErrors.weight = 'Geçerli bir ağırlık giriniz';
        }
        if (!formData.dimensions) newErrors.dimensions = 'Boyutlar zorunludur';
        if (!formData.pickUpLocation) newErrors.pickUpLocation = 'Alım lokasyonu zorunludur';
        if (!formData.dropOffLocation) newErrors.dropOffLocation = 'Teslim lokasyonu zorunludur';

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
                customer_id: parseInt(formData.customer_id),
                desc: formData.desc,
                weight: parseFloat(formData.weight),
                dimensions: formData.dimensions,
                pickUpLocation: formData.pickUpLocation,
                dropOffLocation: formData.dropOffLocation,
                status: formData.status
            };

            // Redux action'ını çağır
            await dispatch(createCargo(cargoData) as any);

            // Başarılı mesajı göster
            setSuccessMessage('Kargo kaydı başarıyla oluşturuldu!');

            // Formu sıfırla
            setFormData({
                customer_id: '',
                desc: '',
                weight: '',
                dimensions: '',
                pickUpLocation: '',
                dropOffLocation: '',
                status: 'Beklemede'
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

    const textareaStyle = {
        ...inputStyle,
        minHeight: '100px',
        resize: 'vertical' as const
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
                        <label style={labelStyle} htmlFor="desc">Kargo Açıklaması</label>
                        <textarea
                            id="desc"
                            name="desc"
                            value={formData.desc}
                            onChange={handleChange}
                            style={textareaStyle}
                            placeholder="Kargo içeriği hakkında detaylı bilgi giriniz"
                        />
                        {errors.desc && <span style={errorStyle}>{errors.desc}</span>}
                    </div>

                    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                        <div style={{...formGroupStyle, flex: '1', minWidth: '200px'}}>
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

                        <div style={{...formGroupStyle, flex: '1', minWidth: '200px'}}>
                            <label style={labelStyle} htmlFor="dimensions">Boyutlar (En x Boy x Yükseklik)</label>
                            <input
                                type="text"
                                id="dimensions"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="Örn: 30cm x 20cm x 15cm"
                                style={inputStyle}
                            />
                            {errors.dimensions && <span style={errorStyle}>{errors.dimensions}</span>}
                        </div>
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="pickUpLocation">Alım Lokasyonu</label>
                        <input
                            type="text"
                            id="pickUpLocation"
                            name="pickUpLocation"
                            value={formData.pickUpLocation}
                            onChange={handleChange}
                            placeholder="Tam adres giriniz"
                            style={inputStyle}
                        />
                        {errors.pickUpLocation && <span style={errorStyle}>{errors.pickUpLocation}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="dropOffLocation">Teslim Lokasyonu</label>
                        <input
                            type="text"
                            id="dropOffLocation"
                            name="dropOffLocation"
                            value={formData.dropOffLocation}
                            onChange={handleChange}
                            placeholder="Tam adres giriniz"
                            style={inputStyle}
                        />
                        {errors.dropOffLocation && <span style={errorStyle}>{errors.dropOffLocation}</span>}
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle} htmlFor="status">Durum</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={selectStyle}
                            className="select-element"
                        >
                            <option value="Beklemede">Beklemede</option>
                            <option value="Hazırlanıyor">Hazırlanıyor</option>
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
                        {isSubmitting ? 'İşleniyor...' : 'Kargo Kaydı Oluştur'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCargo;