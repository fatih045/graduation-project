import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { confirmEmailAction } from "../features/user/authSlice";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserEmailConfirmDto } from "../models/dtos/UserEmailConfirmDto";

const ConfirmEmail = () => {
  const location = useLocation();
  const emailFromRegister = location.state?.email || "";
  
  const [form, setForm] = useState<UserEmailConfirmDto>({ 
    email: emailFromRegister, 
    token: "" 
  });
  
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Location state'inden gelen e-posta bilgisini form state'ine aktar
    if (emailFromRegister) {
      setForm(prev => ({ ...prev, email: emailFromRegister }));
    }
  }, [emailFromRegister]);

  const handleConfirm = async () => {
    setSuccess(false);
    // Sadece token ile slice'a gönderiyoruz, email backend'de zorunluysa slice ve thunk'ı güncelle
    const resultAction = await dispatch(confirmEmailAction({ email: form.email, token: form.token }));
    if (confirmEmailAction.fulfilled.match(resultAction)) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f5f7fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Sol taraf - Resim Alanı */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Burada resim olacak */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src="src/assets/truck-owner.png" alt="Email Confirmation" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      
      {/* Sağ taraf - Doğrulama Formu */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: '#fff',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#333'
          }}>E-posta Doğrulama</h1>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px'
          }}>Lütfen e-posta adresinize gönderilen doğrulama kodunu girin</p>
          
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#555'
            }}>
              E-posta
            </label>
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyPress={handleKeyPress}
              readOnly={!!emailFromRegister} // Register'dan geldiyse salt okunur yap
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                backgroundColor: emailFromRegister ? '#f0f0f0' : '#f9f9f9',
                transition: 'border-color 0.3s',
                outline: 'none',
                cursor: emailFromRegister ? 'not-allowed' : 'text'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#555'
            }}>
              Doğrulama Kodu
            </label>
            <input
              type="text"
              placeholder="Doğrulama kodunuzu girin"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '16px',
                backgroundColor: '#f9f9f9',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
            />
          </div>
          
          <button 
            onClick={handleConfirm} 
            disabled={status === "loading"}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '10px'
            }}
          >
            {status === "loading" ? "Doğrulanıyor..." : "Doğrula"}
          </button>
          
          {error && <div style={{ color: '#e53e3e', marginTop: '15px', fontSize: '14px' }}>{error}</div>}
          {success && <div style={{ color: '#38a169', marginTop: '15px', fontSize: '14px' }}>Doğrulama başarılı!</div>}
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
            Doğrulama kodu almadınız mı? <Link to="#" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Tekrar Gönder</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
