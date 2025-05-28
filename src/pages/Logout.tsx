import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../features/user/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout());
    localStorage.removeItem("token");
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 2000);
    return () => clearTimeout(timeout);
  }, [dispatch, navigate]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      padding: '3%',
      backgroundColor: '#f5f7fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header with gradient background */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>Çıkış Yapıldı</h1>
          <p style={{
            fontSize: '16px',
            opacity: 0.9
          }}>Hesabınızdan güvenli bir şekilde çıkış yaptınız</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: '60px 40px',
            color: "#333",
            textAlign: "center"
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#f0f4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            fontSize: '40px'
          }}>
            👋
          </div>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333'
          }}>Görüşmek üzere!</h2>
          
          <p style={{
            fontSize: '18px',
            color: '#555',
            marginBottom: '20px'
          }}>Başarıyla çıkış yaptınız. Sizi tekrar bekleriz.</p>
          
          <div style={{
            backgroundColor: '#f0f4ff',
            padding: '15px 25px',
            borderRadius: '10px',
            marginTop: '10px'
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: '#4f46e5'
            }}>2 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Logout;
