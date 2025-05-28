import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { register } from "../features/user/authSlice";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { UserRegistrationDto } from "../models/dtos/UserRegistrationDto";

const Register = () => {
  const [user, setUser] = useState<UserRegistrationDto>({
    firstName: "",
    lastName: "",
    birthYear: new Date().getFullYear(),
    email: "",
    phoneNumber: "",
    userName: "",
    password: "",
    confirmPassword: ""
  });
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setSuccess(false);
    const resultAction = await dispatch(register(user));
    if (register.fulfilled.match(resultAction)) {
      setSuccess(true);
      // Token'ı consola bas
      console.log("Register response:", resultAction.payload);
      setTimeout(() => {
        // E-posta bilgisini state olarak ConfirmEmail sayfasına gönder
        navigate("/confirm-email", { state: { email: user.email } });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
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
        {/* Burada resim olacak - Kullanıcı tarafından eklenecek */}
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
          <img src="src/assets/truck-owner.png" alt="Register" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      
      {/* Sağ taraf - Register Formu */}
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
            maxWidth: '550px',
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
          }}>Kayıt Ol</h1>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px'
          }}>Yeni hesap oluşturun</p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between',
            gap: '15px'
          }}>
            {/* Sol Sütun */}
            <div style={{ 
              flex: '1', 
              minWidth: '200px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Ad
                </label>
                <input
                  type="text"
                  placeholder="Adınız"
                  value={user.firstName}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Doğum Yılı
                </label>
                <input
                  type="number"
                  placeholder="Doğum Yılınız"
                  value={user.birthYear}
                  onChange={(e) => setUser({ ...user, birthYear: Number(e.target.value) })}
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  placeholder="Telefon numaranız"
                  value={user.phoneNumber}
                  onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Şifre
                </label>
                <input
                  type="password"
                  placeholder="Şifreniz"
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
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
            </div>
            
            {/* Sağ Sütun */}
            <div style={{ 
              flex: '1', 
              minWidth: '200px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Soyad
                </label>
                <input
                  type="text"
                  placeholder="Soyadınız"
                  value={user.lastName}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
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
              
              <div style={{ marginBottom: '20px' }}>
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
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  placeholder="Kullanıcı adınız"
                  value={user.userName}
                  onChange={(e) => setUser({ ...user, userName: e.target.value })}
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
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Şifre Tekrar
                </label>
                <input
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={user.confirmPassword}
                  onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
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
            </div>
          </div>
          
          <button 
            onClick={handleRegister} 
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
              marginTop: '20px'
            }}
          >
            {status === "loading" ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
          
          {error && <div style={{ color: '#e53e3e', marginTop: '15px', fontSize: '14px' }}>{error}</div>}
          {success && <div style={{ color: '#38a169', marginTop: '15px', fontSize: '14px' }}>Kayıt başarılı!</div>}
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
            Zaten bir hesabınız var mı? <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Giriş Yap</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
