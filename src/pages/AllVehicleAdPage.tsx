import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Truck, Users, MapPin, Loader } from 'lucide-react';
import { fetchAllVehicleAds, VehicleAd } from '../features/vehicle/vehicleAdSlice';
import type { RootState, AppDispatch } from '../store/store';

const VehicleAdsList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vehicleAds, loading, error } = useSelector((state: RootState) => state.vehicleAd);

    useEffect(() => {
        dispatch(fetchAllVehicleAds());
    }, [dispatch]);

    const getVehicleIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'truck':
            case 'trailer':
                return <Truck className="w-6 h-6 text-blue-600" />;
            default:
                return <Truck className="w-6 h-6 text-green-600" />;
        }
    };

    const getAvailabilityStatus = () => {
        // Mock availability - in real app this would come from the data
        return Math.random() > 0.5;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-blue-600">
                    <Loader className="w-8 h-8 animate-spin" />
                    <span className="text-lg font-medium">Loading vehicle ads...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {/* Main Container */}
            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ margin: '5%', maxWidth: '800px' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Vehicle Ads</h1>
                    <p className="text-blue-100">Browse available vehicle advertisements</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <p className="font-medium">Error loading vehicle ads</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    )}

                    {vehicleAds.length === 0 ? (
                        <div className="text-center py-16">
                            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vehicle Ads Found</h3>
                            <p className="text-gray-500">There are currently no vehicle advertisements available.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {vehicleAds.map((vehicle: VehicleAd) => {
                                const isAvailable = getAvailabilityStatus();
                                return (
                                    <div
                                        key={vehicle.id}
                                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getVehicleIcon(vehicle.vehicleType)}
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800 leading-tight">
                                                            {vehicle.title}
                                                        </h3>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <div
                                                                className={`w-2 h-2 rounded-full ${
                                                                    isAvailable ? 'bg-green-400' : 'bg-red-400'
                                                                }`}
                                                            />
                                                            <span
                                                                className={`text-xs font-medium ${
                                                                    isAvailable ? 'text-green-600' : 'text-red-600'
                                                                }`}
                                                            >
                                {isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                                {vehicle.description}
                                            </p>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <Truck className="w-4 h-4" />
                                                    <span>Type:</span>
                                                </div>
                                                <span className="font-semibold text-gray-800 bg-blue-50 px-2 py-1 rounded-lg">
                          {vehicle.vehicleType}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span>Capacity:</span>
                                                </div>
                                                <span className="font-semibold text-gray-800 bg-green-50 px-2 py-1 rounded-lg">
                          {vehicle.capacity.toLocaleString()} kg
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>Location ID:</span>
                                                </div>
                                                <span className="font-semibold text-gray-800 bg-purple-50 px-2 py-1 rounded-lg">
                          #{vehicle.pickUpLocationId}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <span>Carrier ID:</span>
                                                </div>
                                                <span className="font-semibold text-gray-800 bg-orange-50 px-2 py-1 rounded-lg">
                          {vehicle.carrierId}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleAdsList;