import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { startSignalRConnection, stopSignalRConnection } from '../../features/notification/notificationSlice';

/**
 * NotificationListener component
 * 
 * Bu bileşen uygulamanın herhangi bir yerinde (genellikle App.tsx veya bir layout içinde)
 * kullanılabilir ve kullanıcı oturum açtığında otomatik olarak SignalR bağlantısını başlatır.
 * Kullanıcı oturumu kapattığında bağlantıyı sonlandırır.
 */
const NotificationListener: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { signalRConnected } = useSelector((state: RootState) => state.notification);
  
  useEffect(() => {
    console.log('NotificationListener: useEffect çalıştı', { user, signalRConnected });
    
    // Kullanıcı giriş yapmışsa ve SignalR bağlantısı yoksa bağlantıyı başlat
    if (user && user.id && !signalRConnected) {
      console.log(`NotificationListener: SignalR bağlantısı başlatılıyor (Kullanıcı ID: ${user.id})`);
      dispatch(startSignalRConnection(user.id.toString()) as any);
    }
    
    // Kullanıcı çıkış yapmışsa ve SignalR bağlantısı varsa bağlantıyı sonlandır
    if (!user && signalRConnected) {
      console.log('NotificationListener: Kullanıcı çıkış yaptı, SignalR bağlantısı sonlandırılıyor');
      dispatch(stopSignalRConnection() as any);
    }
    
    // Component unmount olduğunda bağlantıyı kapat
    return () => {
      if (signalRConnected) {
        console.log('NotificationListener: Component unmount, SignalR bağlantısı sonlandırılıyor');
        dispatch(stopSignalRConnection() as any);
      }
    };
  }, [user, signalRConnected, dispatch]);
  
  // Bu bileşen herhangi bir UI render etmez, sadece SignalR bağlantısını yönetir
  return null;
};

export default NotificationListener;
