import { useState } from "react";
import { authService } from "../services/authService";
import { motion } from "framer-motion";
import "../styles/Login.css";

const Login = () => {
    const [user, setUser] = useState({ email: "", password: "" });

    const handleLogin = async () => {
        try {
            const response = await authService.login(user);
            console.log("Login successful:", response.data);
        } catch (error) {
            console.error("Login failed", error);
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
            <button onClick={handleLogin}>Giriş Yap</button>
        </motion.div>
    );
};

export default Login;
