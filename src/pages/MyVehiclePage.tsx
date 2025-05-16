// import React, { useEffect, useState } from 'react';
// import { useAppDispatch, useAppSelector } from '../store/store';
// import {
//     fetchVehiclesByCarrier,
//     removeVehicle,
//     editVehicle,
//     Vehicle
// } from '../features/vehicle/vehicleSlice';
// import { fetchVehicleTypes } from '../features/vehicleType/vehicleTypeSlice';
//
// const MyVehiclesPage: React.FC = () => {
//     const dispatch = useAppDispatch();
//     const { items: vehicles, status, error } = useAppSelector((state) => state.vehicle);
//     const vehicleTypes = useAppSelector(state => state.vehicleType.items);
//     const carrierId = useAppSelector(state => state.auth.user?.carrierId || 1); // Varsayılan olarak 1 kullanıyoruz
//
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
//     const [formData, setFormData] = useState({
//         vehicleTypeId: 1,
//         capacity: '',
//         licensePlate: '',
//         availabilityStatus: true,
//         model: ''
//     });
//
//     // Sayfa yüklendiğinde carrier ID'ye göre araçları ve araç tiplerini getir
//     useEffect(() => {
//         dispatch(fetchVehiclesByCarrier(carrierId));
//         dispatch(fetchVehicleTypes());
//     }, [dispatch, carrierId]);
//
//     // Form verilerini güncelle
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value, type } = e.target;
//
//         if (type === 'checkbox') {
//             const checkbox = e.target as HTMLInputElement;
//             setFormData({ ...formData, [name]: checkbox.checked });
//         } else if (type === 'number') {
//             setFormData({ ...formData, [name]: value });
//         } else {
//             setFormData({ ...formData, [name]: value });
//         }
//     };
//
//     // Aracı silme işlemi
//     const handleDelete = (id: number) => {
//         if (window.confirm('Bu aracı silmek istediğinize emin misiniz?')) {
//             dispatch(removeVehicle(id));
//         }
//     };
//
//     // Güncelleme modalını aç
//     const openUpdateModal = (vehicle: Vehicle) => {
//         setSelectedVehicle(vehicle);
//         setFormData({
//             vehicleTypeId: vehicle.vehicleTypeId,
//             capacity: vehicle.capacity.toString(),
//             licensePlate: vehicle.licensePlate,
//             availabilityStatus: vehicle.availabilityStatus,
//             model: vehicle.model
//         });
//         setIsModalOpen(true);
//     };
//
//     // Güncelleme formunu gönder
//     const handleUpdate = (e: React.FormEvent) => {
//         e.preventDefault();
//
//         if (selectedVehicle) {
//             const updatedData = {
//                 id: selectedVehicle.id,
//                 data: {
//                     carrierId: carrierId,
//                     vehicleTypeId: Number(formData.vehicleTypeId),
//                     capacity: parseFloat(formData.capacity),
//                     licensePlate: formData.licensePlate,
//                     availabilityStatus: formData.availabilityStatus,
//                     model: formData.model
//                 }
//             };
//
//             dispatch(editVehicle(updatedData));
//             setIsModalOpen(false);
//         }
//     };
//
//     // Yükleme durumunda spinner göster
//     if (status === 'loading') {
//         return (
//             <div className="main-content" style={{
//                 width: '100%',
//                 minHeight: '100vh',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 padding: '5%'
//             }}>
//                 <div style={{ fontSize: '24px', color: '#333' }}>Yükleniyor...</div>
//             </div>
//         );
//     }
//
//     // Hata durumunda hata mesajı göster
//     if (status === 'failed' && error) {
//         return (
//             <div className="main-content" style={{
//                 width: '100%',
//                 minHeight: '100vh',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 padding: '5%'
//             }}>
//                 <div style={{
//                     padding: '20px',
//                     backgroundColor: '#ffeeee',
//                     color: '#e63946',
//                     borderRadius: '10px'
//                 }}>
//                     <h2>Hata!</h2>
//                     <p>{error}</p>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="main-content" style={{
//             width: '100%',
//             minHeight: '100vh',
//             display: 'flex',
//             alignItems: 'flex-start',
//             justifyContent: 'center',
//             padding: '5%'
//         }}>
//             <div className="vehicles-container" style={{
//                 width: '100%',
//                 maxWidth: '800px',
//                 backgroundColor: '#fff',
//                 borderRadius: '20px',
//                 boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
//                 padding: '40px',
//                 margin: '0 auto'
//             }}>
//                 <h1 style={{
//                     fontSize: '32px',
//                     fontWeight: 'bold',
//                     color: '#333',
//                     marginBottom: '30px',
//                     textAlign: 'center'
//                 }}>Araçlarım</h1>
//
//                 {vehicles.length === 0 ? (
//                     <div style={{
//                         textAlign: 'center',
//                         padding: '40px 0',
//                         color: '#666'
//                     }}>
//                         <p style={{ fontSize: '18px' }}>Henüz araç eklenmemiş.</p>
//                     </div>
//                 ) : (
//                     <div className="vehicle-list" style={{
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '20px'
//                     }}>
//                         {vehicles.map((vehicle) => (
//                             <div key={vehicle.id} className="vehicle-card" style={{
//                                 backgroundColor: '#f9f9f9',
//                                 borderRadius: '12px',
//                                 padding: '20px',
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                                 gap: '15px',
//                                 boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
//                             }}>
//                                 <div style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     alignItems: 'center'
//                                 }}>
//                                     <h3 style={{
//                                         fontSize: '22px',
//                                         fontWeight: '600',
//                                         color: '#333',
//                                         margin: '0'
//                                     }}>
//                                         {vehicle.licensePlate}
//                                     </h3>
//                                     <div style={{
//                                         display: 'flex',
//                                         gap: '15px'
//                                     }}>
//                                         {/* Güncelle butonu */}
//                                         <button
//                                             onClick={() => openUpdateModal(vehicle)}
//                                             style={{
//                                                 backgroundColor: '#4a6fa5',
//                                                 color: 'white',
//                                                 border: 'none',
//                                                 borderRadius: '8px',
//                                                 padding: '8px 12px',
//                                                 cursor: 'pointer',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '5px'
//                                             }}
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//                                                 <path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z"/>
//                                             </svg>
//                                             <span>Düzenle</span>
//                                         </button>
//
//                                         {/* Sil butonu */}
//                                         <button
//                                             onClick={() => handleDelete(vehicle.id)}
//                                             style={{
//                                                 backgroundColor: '#e63946',
//                                                 color: 'white',
//                                                 border: 'none',
//                                                 borderRadius: '8px',
//                                                 padding: '8px 12px',
//                                                 cursor: 'pointer',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '5px'
//                                             }}
//                                         >
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//                                                 <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
//                                                 <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
//                                             </svg>
//                                             <span>Sil</span>
//                                         </button>
//                                     </div>
//                                 </div>
//
//                                 <div style={{
//                                     display: 'grid',
//                                     gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//                                     gap: '15px'
//                                 }}>
//                                     <div className="info-item">
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '14px',
//                                             color: '#666',
//                                             marginBottom: '3px'
//                                         }}>Araç Tipi</p>
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '16px',
//                                             fontWeight: '500'
//                                         }}>
//                                             {vehicleTypes.find(type => type.vehicleTypeId === vehicle.vehicleTypeId)?.name || 'Bilinmiyor'}
//                                         </p>
//                                     </div>
//
//                                     <div className="info-item">
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '14px',
//                                             color: '#666',
//                                             marginBottom: '3px'
//                                         }}>Model</p>
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '16px',
//                                             fontWeight: '500'
//                                         }}>{vehicle.model}</p>
//                                     </div>
//
//                                     <div className="info-item">
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '14px',
//                                             color: '#666',
//                                             marginBottom: '3px'
//                                         }}>Kapasite</p>
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '16px',
//                                             fontWeight: '500'
//                                         }}>{vehicle.capacity} ton</p>
//                                     </div>
//
//                                     <div className="info-item">
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '14px',
//                                             color: '#666',
//                                             marginBottom: '3px'
//                                         }}>Durum</p>
//                                         <p style={{
//                                             margin: '0',
//                                             fontSize: '16px',
//                                             fontWeight: '500',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '5px'
//                                         }}>
//                                             <span style={{
//                                                 display: 'inline-block',
//                                                 width: '12px',
//                                                 height: '12px',
//                                                 borderRadius: '50%',
//                                                 backgroundColor: vehicle.availabilityStatus ? '#4caf50' : '#f44336'
//                                             }}></span>
//                                             {vehicle.availabilityStatus ? 'Müsait' : 'Müsait Değil'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//
//             {/* Güncelleme Modal */}
//             {isModalOpen && selectedVehicle && (
//                 <div style={{
//                     position: 'fixed',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     padding: '5%',
//                     zIndex: 1000
//                 }}>
//                     <div style={{
//                         width: '100%',
//                         maxWidth: '500px',
//                         backgroundColor: '#fff',
//                         borderRadius: '15px',
//                         padding: '30px',
//                         position: 'relative'
//                     }}>
//                         <button
//                             onClick={() => setIsModalOpen(false)}
//                             style={{
//                                 position: 'absolute',
//                                 top: '15px',
//                                 right: '15px',
//                                 backgroundColor: 'transparent',
//                                 border: 'none',
//                                 fontSize: '20px',
//                                 cursor: 'pointer'
//                             }}
//                         >
//                             ✕
//                         </button>
//
//                         <h2 style={{
//                             fontSize: '24px',
//                             fontWeight: 'bold',
//                             marginBottom: '25px',
//                             color: '#333'
//                         }}>
//                             Araç Güncelle
//                         </h2>
//
//                         <form onSubmit={handleUpdate} style={{
//                             display: 'flex',
//                             flexDirection: 'column',
//                             gap: '20px'
//                         }}>
//                             {/* Araç Tipi */}
//                             <div className="form-group">
//                                 <label style={{
//                                     display: 'block',
//                                     fontSize: '16px',
//                                     fontWeight: '500',
//                                     marginBottom: '8px'
//                                 }}>
//                                     Araç Tipi
//                                 </label>
//                                 <select
//                                     name="vehicleTypeId"
//                                     value={formData.vehicleTypeId}
//                                     onChange={handleChange}
//                                     style={{
//                                         width: '100%',
//                                         padding: '15px',
//                                         fontSize: '16px',
//                                         border: '1px solid #ddd',
//                                         borderRadius: '10px',
//                                         backgroundColor: '#f9f9f9',
//                                         outline: 'none'
//                                     }}
//                                 >
//                                     {vehicleTypes.map((type) => (
//                                         <option key={type.vehicleTypeId} value={type.vehicleTypeId}>
//                                             {type.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//
//                             {/* Model */}
//                             <div className="form-group">
//                                 <label style={{
//                                     display: 'block',
//                                     fontSize: '16px',
//                                     fontWeight: '500',
//                                     marginBottom: '8px'
//                                 }}>
//                                     Model
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="model"
//                                     value={formData.model}
//                                     onChange={handleChange}
//                                     required
//                                     style={{
//                                         width: '100%',
//                                         padding: '15px',
//                                         fontSize: '16px',
//                                         border: '1px solid #ddd',
//                                         borderRadius: '10px',
//                                         backgroundColor: '#f9f9f9',
//                                         outline: 'none'
//                                     }}
//                                 />
//                             </div>
//
//                             {/* Kapasite */}
//                             <div className="form-group">
//                                 <label style={{
//                                     display: 'block',
//                                     fontSize: '16px',
//                                     fontWeight: '500',
//                                     marginBottom: '8px'
//                                 }}>
//                                     Kapasite (ton)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     name="capacity"
//                                     value={formData.capacity}
//                                     onChange={handleChange}
//                                     required
//                                     step="0.1"
//                                     min="0"
//                                     style={{
//                                         width: '100%',
//                                         padding: '15px',
//                                         fontSize: '16px',
//                                         border: '1px solid #ddd',
//                                         borderRadius: '10px',
//                                         backgroundColor: '#f9f9f9',
//                                         outline: 'none'
//                                     }}
//                                 />
//                             </div>
//
//                             {/* Plaka */}
//                             <div className="form-group">
//                                 <label style={{
//                                     display: 'block',
//                                     fontSize: '16px',
//                                     fontWeight: '500',
//                                     marginBottom: '8px'
//                                 }}>
//                                     Plaka
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="licensePlate"
//                                     value={formData.licensePlate}
//                                     onChange={handleChange}
//                                     required
//                                     style={{
//                                         width: '100%',
//                                         padding: '15px',
//                                         fontSize: '16px',
//                                         border: '1px solid #ddd',
//                                         borderRadius: '10px',
//                                         backgroundColor: '#f9f9f9',
//                                         outline: 'none'
//                                     }}
//                                 />
//                             </div>
//
//                             {/* Müsaitlik */}
//                             <div className="form-group" style={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '10px'
//                             }}>
//                                 <input
//                                     type="checkbox"
//                                     name="availabilityStatus"
//                                     checked={formData.availabilityStatus}
//                                     onChange={handleChange}
//                                     id="update_availability"
//                                     style={{
//                                         width: '20px',
//                                         height: '20px',
//                                         accentColor: '#4a6fa5',
//                                         cursor: 'pointer'
//                                     }}
//                                 />
//                                 <label
//                                     htmlFor="update_availability"
//                                     style={{
//                                         fontSize: '16px',
//                                         fontWeight: '500',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     Müsait
//                                 </label>
//                             </div>
//
//                             {/* Butonlar */}
//                             <div style={{
//                                 display: 'flex',
//                                 gap: '15px',
//                                 marginTop: '10px',
//                                 justifyContent: 'flex-end'
//                             }}>
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsModalOpen(false)}
//                                     style={{
//                                         backgroundColor: '#f1f1f1',
//                                         color: '#333',
//                                         border: 'none',
//                                         borderRadius: '10px',
//                                         padding: '12px 20px',
//                                         fontSize: '16px',
//                                         fontWeight: '500',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     İptal
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     style={{
//                                         backgroundColor: '#4a6fa5',
//                                         color: 'white',
//                                         border: 'none',
//                                         borderRadius: '10px',
//                                         padding: '12px 20px',
//                                         fontSize: '16px',
//                                         fontWeight: '500',
//                                         cursor: 'pointer'
//                                     }}
//                                 >
//                                     Güncelle
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default MyVehiclesPage;

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
    fetchVehiclesByCarrier,
    removeVehicle,
    editVehicle,
    Vehicle
} from '../features/vehicle/vehicleSlice';
import { fetchVehicleTypes } from '../features/vehicleType/vehicleTypeSlice';

const MyVehiclesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: vehicles, status, error } = useAppSelector((state) => state.vehicle);
    const vehicleTypes = useAppSelector(state => state.vehicleType.items);
    const carrierId = useAppSelector(state => state.auth.user?.carrierId || 1); // Varsayılan olarak 1 kullanıyoruz

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        vehicleTypeId: 1,
        capacity: '',
        licensePlate: '',
        availabilityStatus: true,
        model: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Sayfa yüklendiğinde carrier ID'ye göre araçları ve araç tiplerini getir
    useEffect(() => {
        dispatch(fetchVehiclesByCarrier(carrierId));
        dispatch(fetchVehicleTypes());
    }, [dispatch, carrierId]);

    // Form verilerini güncelle
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checkbox.checked });
        } else if (type === 'number') {
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Aracı silme işlemi
    const handleDelete = (id: number) => {
        if (window.confirm('Bu aracı silmek istediğinize emin misiniz?')) {
            dispatch(removeVehicle(id))
                .unwrap()
                .then(() => {
                    // Silme işlemi başarılı olduğunda araçları yeniden çek
                    dispatch(fetchVehiclesByCarrier(carrierId));
                })
                .catch((error) => {
                    console.error('Araç silinirken hata oluştu:', error);
                    alert('Araç silinirken bir hata oluştu!');
                });
        }
    };

    // Güncelleme modalını aç
    const openUpdateModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            vehicleTypeId: vehicle.vehicleTypeId,
            capacity: vehicle.capacity.toString(),
            licensePlate: vehicle.licensePlate,
            availabilityStatus: vehicle.availabilityStatus,
            model: vehicle.model
        });
        setIsModalOpen(true);
    };

    // Güncelleme formunu gönder
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        if (selectedVehicle) {
            const updatedData = {
                id: selectedVehicle.id,
                data: {
                    carrierId: carrierId,
                    vehicleTypeId: Number(formData.vehicleTypeId),
                    capacity: parseFloat(formData.capacity),
                    licensePlate: formData.licensePlate,
                    availabilityStatus: formData.availabilityStatus,
                    model: formData.model
                }
            };

            dispatch(editVehicle(updatedData))
                .unwrap()
                .then(() => {
                    // İşlem başarılı oldu, araçları yeniden çek
                    dispatch(fetchVehiclesByCarrier(carrierId));
                    setIsModalOpen(false);
                    // Kullanıcıya başarılı mesajı göster
                    alert('Araç başarıyla güncellendi!');
                })
                .catch((error) => {
                    console.error('Araç güncellenirken hata oluştu:', error);
                    alert('Araç güncellenirken bir hata oluştu!');
                })
                .finally(() => {
                    setIsUpdating(false);
                });
        }
    };

    // Yükleme durumunda spinner göster
    if (status === 'loading') {
        return (
            <div className="main-content" style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5%'
            }}>
                <div style={{ fontSize: '24px', color: '#333' }}>Yükleniyor...</div>
            </div>
        );
    }

    // Hata durumunda hata mesajı göster
    if (status === 'failed' && error) {
        return (
            <div className="main-content" style={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5%'
            }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#ffeeee',
                    color: '#e63946',
                    borderRadius: '10px'
                }}>
                    <h2>Hata!</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '5%'
        }}>
            <div className="vehicles-container" style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>Araçlarım</h1>

                {vehicles.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 0',
                        color: '#666'
                    }}>
                        <p style={{ fontSize: '18px' }}>Henüz araç eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="vehicle-list" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="vehicle-card" style={{
                                backgroundColor: '#f9f9f9',
                                borderRadius: '12px',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px',
                                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <h3 style={{
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        color: '#333',
                                        margin: '0'
                                    }}>
                                        {vehicle.licensePlate}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        gap: '15px'
                                    }}>
                                        {/* Güncelle butonu */}
                                        <button
                                            onClick={() => openUpdateModal(vehicle)}
                                            style={{
                                                backgroundColor: '#4a6fa5',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z"/>
                                            </svg>
                                            <span>Düzenle</span>
                                        </button>

                                        {/* Sil butonu */}
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            style={{
                                                backgroundColor: '#e63946',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                            <span>Sil</span>
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Araç Tipi</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}>
                                            {vehicleTypes.find(type => type.vehicleTypeId === vehicle.vehicleTypeId)?.name || 'Bilinmiyor'}
                                        </p>
                                    </div>

                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Model</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}>{vehicle.model}</p>
                                    </div>

                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Kapasite</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}>{vehicle.capacity} ton</p>
                                    </div>

                                    <div className="info-item">
                                        <p style={{
                                            margin: '0',
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '3px'
                                        }}>Durum</p>
                                        <p style={{
                                            margin: '0',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: vehicle.availabilityStatus ? '#4caf50' : '#f44336'
                                            }}></span>
                                            {vehicle.availabilityStatus ? 'Müsait' : 'Müsait Değil'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Güncelleme Modal */}
            {isModalOpen && selectedVehicle && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5%',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '500px',
                        backgroundColor: '#fff',
                        borderRadius: '15px',
                        padding: '30px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>

                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '25px',
                            color: '#333'
                        }}>
                            Araç Güncelle
                        </h2>

                        <form onSubmit={handleUpdate} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            {/* Araç Tipi */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Araç Tipi
                                </label>
                                <select
                                    name="vehicleTypeId"
                                    value={formData.vehicleTypeId}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                >
                                    {vehicleTypes.map((type) => (
                                        <option key={type.vehicleTypeId} value={type.vehicleTypeId}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Model */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Model
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Kapasite */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Kapasite (ton)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                    step="0.1"
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Plaka */}
                            <div className="form-group">
                                <label style={{
                                    display: 'block',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>
                                    Plaka
                                </label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Müsaitlik */}
                            <div className="form-group" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <input
                                    type="checkbox"
                                    name="availabilityStatus"
                                    checked={formData.availabilityStatus}
                                    onChange={handleChange}
                                    id="update_availability"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        accentColor: '#4a6fa5',
                                        cursor: 'pointer'
                                    }}
                                />
                                <label
                                    htmlFor="update_availability"
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Müsait
                                </label>
                            </div>

                            {/* Butonlar */}
                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                marginTop: '10px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        backgroundColor: '#f1f1f1',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 20px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                    disabled={isUpdating}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#4a6fa5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 20px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                                        opacity: isUpdating ? 0.7 : 1
                                    }}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyVehiclesPage;