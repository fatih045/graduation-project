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
    <motion.div
      className="logout-message"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "#232837",
        fontFamily: "inherit",
      }}
    >
      <h2>Görüşmek üzere! 👋</h2>
      <p>Başarıyla çıkış yaptınız. Sizi tekrar bekleriz.</p>
      <p style={{ fontSize: "0.95rem", color: "#6b7280", marginTop: 12 }}>2 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
    </motion.div>
  );
};

export default Logout;
