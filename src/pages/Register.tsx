import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { register } from "../features/user/authSlice";
import { motion } from "framer-motion";
import "../styles/Register.css";
import { UserRegistrationDto } from "../models/dtos/UserRegistrationDto";
import { useNavigate } from "react-router-dom";

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
        navigate("/confirm-email");
      }, 1000);
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
        placeholder="Ad"
        value={user.firstName}
        onChange={(e) => setUser({ ...user, firstName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Soyad"
        value={user.lastName}
        onChange={(e) => setUser({ ...user, lastName: e.target.value })}
      />
      <input
        type="number"
        placeholder="Doğum Yılı"
        value={user.birthYear}
        onChange={(e) => setUser({ ...user, birthYear: Number(e.target.value) })}
      />
      <input
        type="email"
        placeholder="E-posta"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Telefon Numarası"
        value={user.phoneNumber}
        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
      />
      <input
        type="text"
        placeholder="Kullanıcı Adı"
        value={user.userName}
        onChange={(e) => setUser({ ...user, userName: e.target.value })}
      />
      <input
        type="password"
        placeholder="Şifre"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <input
        type="password"
        placeholder="Şifre Tekrar"
        value={user.confirmPassword}
        onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
      />
      <button className="login-button" onClick={handleRegister} disabled={status === "loading"}>
        {status === "loading" ? "Kaydediliyor..." : "Kayıt Ol"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Kayıt başarılı!</div>}
    </motion.div>
  );
};

export default Register;
