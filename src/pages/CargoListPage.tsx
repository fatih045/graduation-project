
import { useDispatch, useSelector } from 'react-redux';
import { Package, MapPin, Weight, Calendar, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { fetchAllCargos } from '../features/cargo/cargoSlice';
import {useEffect} from "react";

// CargoAdDto interface based on your backend model
interface CargoAdDto {
    id: number;
    userId: string;
    customerName: string;
    title: string;
    description: string;
    weight?: number;
    cargoType: string;
    pickupLocationId: number;
    pickupLocationAddress: string;
    dropoffLocationId: number;
    dropoffLocationAddress: string;
    price: number;
    isExpired: boolean;
    createdDate: string;
}

interface RootState {
    cargo: {
        cargos: CargoAdDto[];
        loading: boolean;
        error: string | null;
    };
}

const AllCargoAdPage = () => {
    const dispatch = useDispatch();
    const { cargos, loading, error } = useSelector((state: RootState) => state.cargo);

    useEffect(() => {
        dispatch(fetchAllCargos() as any);
    }, [dispatch]);



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-lg text-gray-600">Kargo ilanları yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Bir Hata Oluştu</h3>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Package className="w-10 h-10 text-blue-600 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-800">Tüm Kargo İlanları</h1>
                    </div>
                    <p className="text-gray-600">Mevcut kargo ilanlarını görüntüleyin</p>
                </div>

                {/* Cargo List */}
                {cargos.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Henüz Kargo İlanı Yok</h3>
                        <p className="text-gray-500">Sistemde kayıtlı kargo ilanı bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cargos.map((cargo) => (
                            <div
                                key={cargo.id}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                                                {cargo.title}
                                            </h3>

                                        </div>
                                        {cargo.isExpired && (
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Süresi Dolmuş
                      </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {cargo.description}
                                    </p>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 space-y-4">
                                    {/* Customer Name */}
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">
                        {cargo.customerName.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Müşteri</p>
                                            <p className="text-sm font-medium text-gray-800">{cargo.customerName}</p>
                                        </div>
                                    </div>

                                    {/* Weight and Cargo Type */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {cargo.weight && (
                                            <div className="flex items-center">
                                                <Weight className="w-4 h-4 text-gray-500 mr-2" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Ağırlık</p>
                                                    <p className="text-sm font-medium text-gray-800">{cargo.weight} kg</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <Truck className="w-4 h-4 text-gray-500 mr-2" />
                                            <div>
                                                <p className="text-xs text-gray-500">Kargo Tipi</p>
                                                <p className="text-sm font-medium text-gray-800">{cargo.cargoType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Locations */}
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Alış Yeri</p>
                                                <p className="text-sm font-medium text-gray-800 leading-tight">{cargo.pickupLocationAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPin className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Teslim Yeri</p>
                                                <p className="text-sm font-medium text-gray-800 leading-tight">{cargo.dropoffLocationAddress}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Created Date */}
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-xs text-gray-500">İlan Tarihi</p>
                                            <p className="text-sm font-medium text-gray-800">{formatDate(cargo.createdDate)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Fiyat</p>
                                            <p className="text-lg font-bold text-blue-600">{formatPrice(cargo.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">İlan No</p>
                                            <p className="text-sm font-medium text-gray-800">#{cargo.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Stats */}
                {cargos.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Toplam <span className="font-semibold text-blue-600">{cargos.length}</span> kargo ilanı listeleniyor
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllCargoAdPage;