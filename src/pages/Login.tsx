import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { login } from "../features/user/authSlice";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { UserLoginDto } from "../models/dtos/UserLoginDto";

const Login = () => {
    const [user, setUser] = useState<UserLoginDto>({ email: "", password: "" });
    const dispatch = useDispatch<AppDispatch>();
    const { status, error, user: loggedInUser } = useSelector((state: RootState) => state.auth);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedInUser) {
            // Login başarılıysa anasayfaya yönlendir
            navigate("/");
        }
    }, [loggedInUser, navigate]);

    const handleLogin = async () => {
        setSuccess(false);
        const resultAction = await dispatch(login(user));
        if (login.fulfilled.match(resultAction)) {
            setSuccess(true);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
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
                    
                     <img src="src/assets/truck-owner.png" alt="Login" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />

                </div>
            </div>
            
            {/* Sağ taraf - Login Formu */}
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
                    }}>Hoş Geldiniz</h1>
                    
                    <p style={{
                        fontSize: '16px',
                        color: '#666',
                        marginBottom: '30px'
                    }}>Hesabınıza giriş yapın</p>
                    
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
                    
                    <div style={{ marginBottom: '25px', textAlign: 'left' }}>
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
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '25px',
                        fontSize: '14px'
                    }}>
                        <div>
                            <input 
                                type="checkbox" 
                                id="remember" 
                                style={{ marginRight: '5px' }}
                            />
                            <label htmlFor="remember" style={{ color: '#555' }}>Beni hatırla</label>
                        </div>
                        <Link to="/forgot-password" style={{ 
                            color: '#667eea', 
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}>
                            Şifremi unuttum
                        </Link>
                    </div>
                    
                    <button 
                        onClick={handleLogin} 
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
                            transition: 'background-color 0.3s',
                            marginBottom: '20px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6edb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
                    >
                        {status === "loading" ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>
                    
                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '15px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div style={{
                            backgroundColor: '#e6f7e6',
                            color: '#2e7d32',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '15px',
                            fontSize: '14px'
                        }}>
                            Giriş başarılı!
                        </div>
                    )}
                    
                    <p style={{ 
                        marginTop: '20px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        Hesabınız yok mu? <Link to="/register" style={{ 
                            color: '#667eea', 
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}>Kayıt Ol</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
