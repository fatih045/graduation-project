import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit2, Trash2, Truck, Users, MapPin, X, Save, Loader, AlertTriangle } from 'lucide-react';
import {
    fetchAllVehicleAds,
    updateVehicleAd,
    deleteVehicleAd,
    VehicleAd
} from '../features/vehicle/vehicleAdSlice';
import type { RootState, AppDispatch } from '../store/store.ts';

const MyVehicleAdsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { vehicleAds, loading, error } = useSelector((state: RootState) => state.vehicleAd);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleAd | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pickUpLocationId: '',
        vehicleType: '',
        capacity: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        dispatch(fetchAllVehicleAds());
    }, [dispatch]);

    const handleEdit = (vehicle: VehicleAd) => {
        setSelectedVehicle(vehicle);
        setFormData({
            title: vehicle.title,
            description: vehicle.description,
            pickUpLocationId: vehicle.pickUpLocationId.toString(),
            vehicleType: vehicle.vehicleType,
            capacity: vehicle.capacity.toString()
        });
        setIsUpdateModalOpen(true);
    };

    const handleDeleteClick = (vehicle: VehicleAd) => {
        setSelectedVehicle(vehicle);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedVehicle) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteVehicleAd(selectedVehicle.id));
            setIsDeleteModalOpen(false);
            setSelectedVehicle(null);
        } catch (error) {
            console.error('Failed to delete vehicle ad:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedVehicle) return;

        setIsUpdating(true);

        try {
            const updatedData = {
                title: formData.title,
                description: formData.description,
                pickUpLocationId: parseInt(formData.pickUpLocationId),
                vehicleType: formData.vehicleType,
                capacity: parseInt(formData.capacity)
            };

            await dispatch(updateVehicleAd({
                id: selectedVehicle.id,
                updatedData
            }));

            closeUpdateModal();
        } catch (error) {
            console.error('Failed to update vehicle ad:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedVehicle(null);
        setFormData({
            title: '',
            description: '',
            pickUpLocationId: '',
            vehicleType: '',
            capacity: ''
        });
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedVehicle(null);
    };

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
        return Math.random() > 0.5;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
                <div className="flex items-center space-x-3 text-blue-600">
                    <Loader className="w-8 h-8 animate-spin" />
                    <span className="text-lg font-medium">Loading your vehicle ads...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {/* Main Container */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ margin: '5%', maxWidth: '800px' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">My Vehicle Ads</h1>
                    <p className="text-blue-100">Manage your vehicle advertisements</p>
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
                            <p className="text-gray-500">You haven't created any vehicle advertisements yet.</p>
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
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="p-6 bg-gray-50 flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                <span className="font-medium">Edit</span>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(vehicle)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="font-medium">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Update Modal */}
            {isUpdateModalOpen && selectedVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Update Vehicle Ad</h2>
                                <button
                                    onClick={closeUpdateModal}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Vehicle Type
                                </label>
                                <select
                                    value={formData.vehicleType}
                                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="">Select vehicle type</option>
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Trailer">Trailer</option>
                                    <option value="Pickup">Pickup</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Capacity (kg)
                                </label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Pickup Location ID
                                </label>
                                <input
                                    type="number"
                                    value={formData.pickUpLocationId}
                                    onChange={(e) => setFormData({ ...formData, pickUpLocationId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeUpdateModal}
                                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>{isUpdating ? 'Updating...' : 'Update'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className="w-6 h-6" />
                                    <h2 className="text-xl font-bold">Delete Vehicle Ad</h2>
                                </div>
                                <button
                                    onClick={closeDeleteModal}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete "<span className="font-semibold">{selectedVehicle.title}</span>"?
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                This action cannot be undone. The vehicle ad will be permanently removed from your listings.
                            </p>

                            {/* Modal Actions */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyVehicleAdsPage;