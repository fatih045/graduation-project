import React from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaBox, FaHandshake, FaChartLine, FaCalculator } from 'react-icons/fa';
import "../styles/LandingPage.css";
import { useNavigate } from 'react-router-dom';


const LandingPage: React.FC = () => {

 const navigate = useNavigate();



    return (
        <motion.div
            className="landing-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <header className="landing-header">
                <h1 className="hero-title">Yük ve Araç Sahipleri İçin En İyi Taşıma Çözümü</h1>
                <p className="hero-description">
                    Yük sahipleri ve kamyon sahiplerini güvenli, hızlı ve verimli şekilde bir araya getiren platform.
                </p>
                <button  className="cta-button" onClick={()=>navigate("/register")} >Hemen Kayıt Ol</button>

            </header>

            <section className="how-it-works">
                <h2>Nasıl Çalışır?</h2>
                <div className="steps">
                    <div className="step">
                        <FaBox className="step-icon" />
                        <h3>Yük Sahipleri İçin</h3>
                        <p>Yükünüzü sisteme ekleyin ve en uygun taşıyıcıyı bulun.</p>
                    </div>
                    <div className="step">
                        <FaTruck className="step-icon" />
                        <h3>Kamyon Sahipleri İçin</h3>
                        <p>Mevcut yükleri görüntüleyin ve  size en uygun olanı seçin.</p>
                    </div>
                    <div className="step">
                        <FaHandshake className="step-icon" />
                        <h3>Güvenli Anlaşma</h3>
                        <p>Hızlı, güvenli ve kolay bir taşıma süreci başlatın.</p>
                    </div>
                </div>
            </section>

            <section className="benefits">
                <h2>Platformun Avantajları</h2>
                <div className="benefit-item">
                    <FaChartLine className="step-icon" />
                    <p>Piyasa verilerine göre anlık fiyat analizi.</p>
                </div>
                <div className="benefit-item">
                    <FaCalculator className="step-icon" />
                    <p>Yapay zeka destekli tahmini fiyat hesaplama.</p>
                </div>
                <div className="benefit-item">
                    <FaTruck className="step-icon" />
                    <p>Kamyon sahipleri için yük takibi ve optimizasyon.</p>
                </div>
            </section>

            <div className="cta-section">
                <button onClick={()=>navigate("/login")} className="cta-button">Hemen Kayıt Ol</button>
            </div>
        </motion.div>
    );
};

export default LandingPage;
