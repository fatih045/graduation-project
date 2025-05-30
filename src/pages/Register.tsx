import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { register } from "../features/user/authSlice";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { UserRegistrationDto } from "../models/dtos/UserRegistrationDto";
import { useMediaQuery } from "react-responsive";
import truckOwner from '../assets/truck-owner.png';

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
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // Form validation states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showDisclaimerPopup, setShowDisclaimerPopup] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!user.firstName.trim()) errors.firstName = "Ad alanı zorunludur";
    if (!user.lastName.trim()) errors.lastName = "Soyad alanı zorunludur";
    if (!user.email.trim()) errors.email = "E-posta alanı zorunludur";
    else if (!/\S+@\S+\.\S+/.test(user.email)) errors.email = "Geçerli bir e-posta adresi giriniz";
    
    if (!user.phoneNumber.trim()) errors.phoneNumber = "Telefon numarası zorunludur";
    if (!user.userName.trim()) errors.userName = "Kullanıcı adı zorunludur";
    
    if (!user.password) errors.password = "Şifre zorunludur";
    else if (user.password.length < 6) errors.password = "Şifre en az 6 karakter olmalıdır";
    
    if (!user.confirmPassword) errors.confirmPassword = "Şifre tekrarı zorunludur";
    else if (user.password !== user.confirmPassword) errors.confirmPassword = "Şifreler eşleşmiyor";
    
    if (!disclaimerAccepted) errors.disclaimer = "Sorumluluk reddi beyanını kabul etmelisiniz";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }
    
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

  const DisclaimerPopup = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#333', textAlign: 'center' }}>
          SORUMLULUK REDDİ BEYANI
        </h2>
        
        <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
          <p style={{ marginBottom: '15px' }}>
            Firmamız, yalnızca yük sahibi ile taşıyıcıyı bir araya getiren bir aracılık hizmeti sunmaktadır. 
            Taraflar arasında gerçekleşen taşıma işlemleri, teslimatlar, ürün güvenliği, zamanlama ve benzeri 
            konularda herhangi bir sorumluluğumuz bulunmamaktadır.
          </p>
          
          <p style={{ marginBottom: '15px' }}>
            Yük ve mal taşımacılığı süreçlerinde oluşabilecek gecikmeler, hasarlar, kayıplar, hukuki ihtilaflar 
            ve diğer tüm riskler tamamen yük sahibi ile taşıyıcı firma arasındadır. Bu süreçlerde firmamızın 
            hiçbir şekilde taraf olmadığını ve herhangi bir garanti vermediğini açıkça beyan ederiz.
          </p>
          
          <p style={{ marginBottom: '15px' }}>
            Platformumuzu kullanan tüm taraflar, bu beyanı kabul etmiş sayılır.
          </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setShowDisclaimerPopup(false)}
            style={{
              padding: '12px 25px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#f5f7fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Sol taraf - Resim Alanı */}
      {!isMobile && (
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

              <img src={truckOwner} alt="Truck owner finding cargo"
                   style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}  />
          </div>
        </div>
      )}
      
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
                  Ad <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.firstName ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.firstName && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.firstName}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Doğum Yılı <span style={{ color: 'red' }}>*</span>
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
                  required
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
                  Telefon Numarası <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.phoneNumber ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.phoneNumber && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.phoneNumber}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Şifre <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.password ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.password && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.password}
                  </div>
                )}
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
                  Soyad <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.lastName ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.lastName && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.lastName}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  E-posta <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.email ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.email && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.email}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Kullanıcı Adı <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.userName ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.userName && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.userName}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  Şifre Tekrar <span style={{ color: 'red' }}>*</span>
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
                    border: formErrors.confirmPassword ? '1px solid #e53e3e' : '1px solid #ddd',
                    borderRadius: '10px',
                    fontSize: '16px',
                    backgroundColor: '#f9f9f9',
                    transition: 'border-color 0.3s',
                    outline: 'none'
                  }}
                  required
                />
                {formErrors.confirmPassword && (
                  <div style={{ color: '#e53e3e', fontSize: '12px', marginTop: '5px' }}>
                    {formErrors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Disclaimer Checkbox */}
          <div style={{ 
            marginTop: '10px', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'flex-start',
            textAlign: 'left'
          }}>
            <input 
              type="checkbox" 
              id="disclaimerCheckbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              style={{ marginRight: '10px', marginTop: '5px' }}
            />
            <label htmlFor="disclaimerCheckbox" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
              <span style={{ color: 'red' }}>*</span> <span style={{ fontWeight: 'bold' }}>Sorumluluk Reddi Beyanı</span>'nı okudum ve kabul ediyorum. 
              <span 
                style={{ color: '#667eea', marginLeft: '5px', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowDisclaimerPopup(true)}
              >
                (Metni Görüntüle)
              </span>
            </label>
          </div>
          
          {formErrors.disclaimer && (
            <div style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '15px', textAlign: 'left' }}>
              {formErrors.disclaimer}
            </div>
          )}
          
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
      
      {/* Disclaimer Popup */}
      {showDisclaimerPopup && <DisclaimerPopup />}
    </div>
  );
};

export default Register;
