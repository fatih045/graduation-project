import { useState } from "react"
import { authService } from "../services/authService";
import { motion } from "framer-motion";
import { User } from "../models/User";


const  Register =() => {


    const [user,setUser] =useState<User>({email:"",password:"",username:""});


    const handleRegister = async () => {
        try {
            const response = await authService.register(user);
            console.log("Register successful:", response.data);
        } catch (error) {
            console.error("Register failed", error);
        }
    };

    return (
        <motion.div
            className="register-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2>Kayıt Ol</h2>
            <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
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
            <button onClick={handleRegister}>Kayıt Ol</button>
        </motion.div>
    );
};
export default Register





