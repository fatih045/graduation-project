import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { confirmEmailAction } from "../features/user/authSlice";
import { motion } from "framer-motion";
import "../styles/Login.css";
import { UserEmailConfirmDto } from "../models/dtos/UserEmailConfirmDto";
import { useNavigate } from "react-router-dom";

const ConfirmEmail = () => {
  const [form, setForm] = useState<UserEmailConfirmDto>({ email: "", token: "" });
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

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

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Email Doğrulama</h2>
      <input
        type="email"
        placeholder="E-posta"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="text"
        placeholder="Doğrulama Kodu / Token"
        value={form.token}
        onChange={(e) => setForm({ ...form, token: e.target.value })}
      />
      <button className="login-button" onClick={handleConfirm} disabled={status === "loading"}>
        {status === "loading" ? "Doğrulanıyor..." : "Doğrula"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Doğrulama başarılı!</div>}
    </motion.div>
  );
};

export default ConfirmEmail;
