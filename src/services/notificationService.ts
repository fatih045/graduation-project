
import axiosInstance from './axios.ts';
import * as signalR from '@microsoft/signalr';

import {addNotification, updateNotification} from "../features/notification/notificationSlice.ts";
import store from "../store/store.ts";


export interface NotificationResponse {
    id: number;
    title: string;
    message: string;
    type: number;
    isRead: boolean;
    createdDate: string;
    relatedEntityId: number;
}

// SignalR bağlantısı
let connection: signalR.HubConnection | null = null;

// SignalR bağlantısını başlat
const startSignalRConnection = (userId: string) => {
    if (connection) {
        console.log('SignalR bağlantısı zaten var, mevcut bağlantı kullanılıyor.');
        return connection;
    }

    // SignalR hub URL'i - sabit URL kullanılıyor
    const hubUrl = 'https://evrenblackbird.com/notificationHub';
    console.log(`SignalR hub URL: ${hubUrl}`);

    connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            accessTokenFactory: () => {
                // localStorage'dan token alınması
                const token = localStorage.getItem('token') || '';
                console.log(`SignalR için token kullanılıyor: ${token ? 'Token var' : 'Token yok'}`);
                // Make sure we're using the token with Bearer prefix if needed
                return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            }
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Debug) // Change to Debug for more detailed logs
        .build();

    // Yeni bildirim geldiğinde
    connection.on('ReceiveNotification', (notification: NotificationResponse) => {
        console.log('Yeni bildirim alındı:', notification);
        store.dispatch(addNotification(notification));
    });

    // Bildirim güncellendiğinde (örneğin okundu olarak işaretlendiğinde)
    connection.on('NotificationUpdated', (notification: NotificationResponse) => {
        console.log('Bildirim güncellendi:', notification);
        store.dispatch(updateNotification(notification));
    });

    // Kullanıcıya özel grup bağlantısı
    connection.onreconnected((connectionId) => {
        if (connectionId) {
            connection?.invoke('JoinUserGroup', userId).catch(err => {
                console.error('Kullanıcı grubuna katılırken hata oluştu:', err);
            });
        }
    });

    // Bağlantıyı başlat
    connection.start()
        .then(() => {
            console.log('SignalR bağlantısı başarıyla kuruldu.');
            // Kullanıcı grubuna katıl
            return connection?.invoke('JoinUserGroup', userId);
        })
        .then(() => {
            console.log(`Kullanıcı ${userId} grubu başarıyla katıldı.`);
        })
        .catch(err => {
            console.error('SignalR bağlantısı kurulamadı:', err);
            // Log more detailed error information
            if (err.statusCode) {
                console.error(`Status Code: ${err.statusCode}`);
            }
            if (err.message) {
                console.error(`Error Message: ${err.message}`);
            }
        });

    return connection;
};

// SignalR bağlantısını durdur
const stopSignalRConnection = async () => {
    if (connection) {
        try {
            await connection.stop();
            console.log('SignalR bağlantısı başarıyla kapatıldı.');
            connection = null;
        } catch (err) {
            console.error('SignalR bağlantısı kapatılırken hata oluştu:', err);
        }
    } else {
        console.log('Kapatılacak SignalR bağlantısı bulunamadı.');
    }
};

// Tüm bildirimleri getir (opsiyonel: userId gibi filtreler eklenebilir)
const fetchNotifications = async () => {
    const response = await axiosInstance.get<NotificationResponse[]>('api/Notification');
    return response.data;
};

// Bildirimi okundu olarak işaretle
const markNotificationAsRead = async (notificationId: number) => {
    const response = await axiosInstance.put<NotificationResponse>(
        `api/Notification/${notificationId}/mark-as-read`,
        {}
    );
    return response.data;
};

export default {
    fetchNotifications,
    markNotificationAsRead,
    startSignalRConnection,
    stopSignalRConnection
};
