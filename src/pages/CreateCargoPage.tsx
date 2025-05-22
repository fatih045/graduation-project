import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { createCargo } from '../features/cargo/cargoSlice';
import { fetchAllLocations } from '../features/location/locationSlice';
import { Package, MapPin, Calendar, Weight, DollarSign, FileText, Plus } from 'lucide-react';

const AddMyCargo: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.cargo);
    const { locations } = useSelector((state: RootState) => state.location);
    const { user } = useSelector((state: RootState) => state.auth); // Auth'dan user bilgisi

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        weight: '',
        origin: '',
        destination: '',
        price: '',
        departureDate: '',
        arrivalDate: '',
        cargoType: 'General',
        isUrgent: false,
        userId: user?.id || '',
        pickupLocationId: '',
        dropoffLocationId: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);

    // Component mount olduğunda location'ları getir
    useEffect(() => {
        dispatch(fetchAllLocations());
    }, [dispatch]);

    const cargoTypes = [
        { value: 'General', label: 'Genel Kargo' },
        { value: 'Fragile', label: 'Kırılabilir' },
        { value: 'Refrigerated', label: 'Soğutmalı' },
        { value: 'Oversized', label: 'Büyük Boy' },
        { value: 'LightFreight', label: 'Hafif Yük' },
        { value: 'Containerized', label: 'Konteynerli' },
        { value: 'Liquid', label: 'Sıvı' },
        { value: 'HeavyMachinery', label: 'Ağır Makine' },
        { value: 'Construction', label: 'İnşaat' },
        { value: 'Parcel', label: 'Koli' },
        { value: 'Others', label: 'Diğer' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // Form validasyonu
        if (!formData.title || !formData.origin || !formData.destination || !formData.weight || !formData.price || !formData.pickupLocationId || !formData.dropoffLocationId) {
            alert('Lütfen zorunlu alanları doldurun.');
            return;
        }

        if (!user?.id) {
            alert('Kargo eklemek için giriş yapmanız gerekiyor.');
            return;
        }

        try {
            const cargoData = {
                title: formData.title,
                description: formData.description,
                weight: Number(formData.weight),
                origin: formData.origin,
                destination: formData.destination,
                price: Number(formData.price),
                departureDate: formData.departureDate,
                arrivalDate: formData.arrivalDate,
                cargoType: formData.cargoType,
                isUrgent: formData.isUrgent,
                userId: Number(formData.userId),
                pickupLocationId: Number(formData.pickupLocationId),
                dropoffLocationId: Number(formData.dropoffLocationId)
            };

            await dispatch(createCargo(cargoData)).unwrap();

            // Başarılı mesaj göster
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            // Formu temizle
            setFormData({
                title: '',
                description: '',
                weight: '',
                origin: '',
                destination: '',
                price: '',
                departureDate: '',
                arrivalDate: '',
                cargoType: 'General',
                isUrgent: false,
                userId: user?.id || '',
                pickupLocationId: '',
                dropoffLocationId: ''
            });

        } catch (error: any) {
            console.error('Kargo oluşturma hatası:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Kargo Ekle</h1>
                    <p className="text-gray-600">Taşımak istediğiniz kargo bilgilerini girin</p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-2xl mb-6 animate-pulse">
                        <div className="flex items-center">
                            <Plus className="h-5 w-5 mr-2" />
                            Kargo başarıyla eklendi!
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6">
                        <p>Hata: {error}</p>
                    </div>
                )}

                {/* Main Form Container */}
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mx-auto" style={{margin: '0 5%', maxWidth: '800px'}}>
                    <div className="space-y-6">
                        {/* Başlık ve Açıklama */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Package className="h-4 w-4 mr-2 text-blue-500" />
                                    Kargo Başlığı *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Örnek: Elektronik eşyalar"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Weight className="h-4 w-4 mr-2 text-green-500" />
                                    Ağırlık (kg) *
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="25"
                                    min="0.1"
                                    step="0.1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4 mr-2 text-purple-500" />
                                Açıklama
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="Kargo hakkında detaylı bilgi..."
                            />
                        </div>

                        {/* Lokasyon Bilgileri */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                    Alım Lokasyonu *
                                </label>
                                <select
                                    name="pickupLocationId"
                                    value={formData.pickupLocationId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Alım lokasyonu seçin</option>
                                    {locations?.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.city} - {location.city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                                    Teslim Lokasyonu *
                                </label>
                                <select
                                    name="dropoffLocationId"
                                    value={formData.dropoffLocationId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Teslim lokasyonu seçin</option>
                                    {locations?.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.city} - {location.city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Adres Bilgileri (Opsiyonel - Detay için) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                    Nereden *
                                </label>
                                <input
                                    type="text"
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="İstanbul, Kadıköy"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                                    Nereye *
                                </label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Ankara, Çankaya"
                                    required
                                />
                            </div>
                        </div>

                        {/* Tarih ve Fiyat */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                    Çıkış Tarihi *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="departureDate"
                                    value={formData.departureDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                    Varış Tarihi *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="arrivalDate"
                                    value={formData.arrivalDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                                    Fiyat (₺) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="500"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        {/* Kargo Tipi ve Acil Durum */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kargo Tipi
                                </label>
                                <select
                                    name="cargoType"
                                    value={formData.cargoType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    {cargoTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-center">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isUrgent"
                                        checked={formData.isUrgent}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Acil Kargo
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Ekleniyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-5 w-5" />
                                        <span>Kargo Ekle</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 İpucu</h3>
                    <p className="text-blue-700">
                        Kargo bilgilerinizi mümkün olduğunca detaylı girin. Bu, taşıyıcıların size daha uygun teklifler vermesine yardımcı olur.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddMyCargo;