import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  startSignalRConnection,
  stopSignalRConnection
} from '../../features/notification/notificationSlice';
import '../../styles/notificationPopup.css';

interface NotificationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  position?: 'dropdown' | 'sidebar';
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ 
  isVisible, 
  onClose, 
  position = 'dropdown' 
}) => {
  const dispatch = useDispatch();
  const { notifications, loading, error, signalRConnected } = useSelector((state: RootState) => state.notification);
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Sayfa yüklendiğinde SignalR bağlantısını başlat
  useEffect(() => {
    console.log('NotificationPopup: SignalR bağlantı kontrolü', { user, signalRConnected });
    if (user && user.id && !signalRConnected) {
      console.log(`NotificationPopup: SignalR bağlantısı başlatılıyor (Kullanıcı ID: ${user.id})`);
      dispatch(startSignalRConnection(user.id.toString()) as any);
    }
    
    // Component unmount olduğunda bağlantıyı kapat
    return () => {
      if (signalRConnected) {
        console.log('NotificationPopup: Component unmount, SignalR bağlantısı sonlandırılıyor');
        dispatch(stopSignalRConnection() as any);
      }
    };
  }, [user, signalRConnected, dispatch]);
  
  // Popup açıldığında bildirimleri getir
  useEffect(() => {
    if (isVisible) {
      console.log('NotificationPopup: Popup açıldı, bildirimler getiriliyor');
      dispatch(fetchNotifications() as any);
      
      // 1.5 saniyede bir bildirimleri güncelle
      const intervalId = setInterval(() => {
        console.log('NotificationPopup: Bildirimler periyodik olarak güncelleniyor (1.5 saniye)');
        dispatch(fetchNotifications() as any);
      }, 10000); // 1.5 saniye = 1500 ms
      
      // Component unmount olduğunda veya popup kapandığında interval'i temizle
      return () => {
        console.log('NotificationPopup: Periyodik güncelleme durduruldu');
        clearInterval(intervalId);
      };
    }
  }, [isVisible, dispatch]);

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`NotificationPopup: Bildirim okundu olarak işaretleniyor (ID: ${id})`);
    dispatch(markNotificationAsRead(id) as any);
  };

  if (!isVisible) return null;

  const getNotificationTypeClass = (type: number) => {
    switch (type) {
      case 1: return 'notification-info';
      case 2: return 'notification-success';
      case 3: return 'notification-warning';
      case 4: return 'notification-error';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const unreadCount = notifications.filter(item => !item.isRead).length;
  const status = loading ? 'loading' : error ? 'failed' : 'succeeded';

  return (
    <div className={`notification-popup ${position}`}>
      <div className="notification-popup-header">
        <h3>
          Bildirimler {unreadCount > 0 && <span className="unread-count">({unreadCount})</span>}
          {!signalRConnected && <span className="connection-status offline" title="Canlı bildirimler kapalı">⚠️</span>}
          {signalRConnected && <span className="connection-status online" title="Canlı bildirimler açık">●</span>}
        </h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="notification-popup-content">
        {status === 'loading' && <p className="notification-loading">Yükleniyor...</p>}
        {status === 'failed' && <p className="notification-error-message">Bildirimler yüklenirken bir hata oluştu</p>}
        {status === 'succeeded' && notifications.length === 0 && <p className="notification-empty">Bildirim bulunmamaktadır</p>}
        {status === 'succeeded' && notifications.length > 0 && (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getNotificationTypeClass(notification.type)}`}
                onClick={(e) => handleMarkAsRead(notification.id, e)}
              >
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-date">
                    {formatDate(notification.createdDate)}
                  </div>
                </div>
                {!notification.isRead && (
                  <button 
                    className="mark-read-button"
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    title="Okundu olarak işaretle"
                  >
                    ✓
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="notification-popup-footer">
          <button className="view-all-button" onClick={onClose}>
            Tümünü Görüntüle
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;
