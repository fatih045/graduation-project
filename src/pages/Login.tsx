import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { login } from "../features/user/authSlice";
import { motion } from "framer-motion";
import "../styles/Login.css";
import { UserLoginDto } from "../models/dtos/UserLoginDto";
import { useNavigate } from "react-router-dom";

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

    return (
        <motion.div
            className="login-container"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2>Giriş Yap</h2>
            <input
                type="email"
                placeholder="E-posta"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
                type="password"
                placeholder="Şifre"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button className="login-button" onClick={handleLogin} disabled={status === "loading"}>
                {status === "loading" ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Giriş başarılı!</div>}
        </motion.div>
    );
};

export default Login;
