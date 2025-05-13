
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaBox, FaHandshake, FaChartLine, FaCalculator, FaClock } from 'react-icons/fa';
import "../styles/LandingPage.css";
import { useNavigate } from 'react-router-dom';
// Import ScrollReveal if using the npm package
import ScrollReveal from 'scrollreveal';
import truckHeroImage from '../assets/truck-hero.jpg';

// JSX içinde kullanımı
<img src={truckHeroImage} alt="Logistics hero image" className="hero-img" />
const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize ScrollReveal
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '50px',
            duration: 1000,
            delay: 200,
            easing: 'ease-in-out',
            reset: false
        });

        // Apply animations to elements
        sr.reveal('.hero-title, .hero-description', {
            delay: 200,
            origin: 'top'
        });
        sr.reveal('.cta-button', {
            delay: 400
        });
        sr.reveal('.how-it-works h2', {
            delay: 200
        });
        sr.reveal('.step', {
            delay: 300,
            interval: 200
        });
        sr.reveal('.benefits h2', {
            delay: 200
        });
        sr.reveal('.benefit-item', {
            delay: 300,
            interval: 200
        });
        sr.reveal('.testimonial', {
            delay: 300,
            interval: 300
        });
        sr.reveal('.stats-container', {
            delay: 400
        });
        sr.reveal('.image-section', {
            delay: 300
        });

        // Clean up
        return () => {
            // No cleanup needed for ScrollReveal
        };
    }, []);

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
                <div className="header-image">
                    <img src="src/assets/truck-hero.jpg" alt="Logistics hero image" className="hero-img" />
                </div>
                <button className="cta-button" onClick={() => navigate("/register")}>Hemen Kayıt Ol</button>
            </header>

            <section className="image-section">
                <div className="image-container">
                    <img src="src/assets/logistics-map.jpg" alt="Logistics network on map" />
                </div>
                <div className="image-content">
                    <h2>Türkiye'nin Her Yerine Hizmet</h2>
                    <p>Ülkenin dört bir yanındaki taşıyıcılar ve yük sahiplerini birbirine bağlıyoruz.</p>
                </div>
            </section>

            <section className="how-it-works">
                <h2>Nasıl Çalışır?</h2>
                <div className="steps">
                    <div className="step">
                        <FaBox className="step-icon" />
                        <h3>Yük Sahipleri İçin</h3>
                        <p>Yükünüzü sisteme ekleyin ve en uygun taşıyıcıyı bulun.</p>
                        <img src="src/assets/cargo-owner.png" alt="Cargo owner using application" className="step-image" />
                    </div>
                    <div className="step">
                        <FaTruck className="step-icon" />
                        <h3>Kamyon Sahipleri İçin</h3>
                        <p>Mevcut yükleri görüntüleyin ve size en uygun olanı seçin.</p>
                        <img src="src/assets/truck-owner.png" alt="Truck owner finding cargo" className="step-image" />
                    </div>
                    <div className="step">
                        <FaHandshake className="step-icon" />
                        <h3>Güvenli Anlaşma</h3>
                        <p>Hızlı, güvenli ve kolay bir taşıma süreci başlatın.</p>
                        <img src="src/assets/safe-agreement.jpg" alt="Safe agreement process" className="step-image" />
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <h2>Rakamlarla Platformumuz</h2>
                <div className="stats-container">
                    <div className="stat-item">
                        <h3>5,000+</h3>
                        <p>Kayıtlı Taşıyıcı</p>
                    </div>
                    <div className="stat-item">
                        <h3>12,000+</h3>
                        <p>Tamamlanan Taşıma</p>
                    </div>
                    <div className="stat-item">
                        <h3>3,200+</h3>
                        <p>Aktif Yük Sahibi</p>
                    </div>
                </div>
            </section>

            <section className="benefits">
                <h2>Platformun Avantajları</h2>
                <div className="benefits-container">
                    <div className="benefit-item">
                        <FaChartLine className="step-icon" />
                        <div>
                            <h3>Akıllı Fiyat Analizi</h3>
                            <p>Piyasa verilerine göre anlık fiyat analizi.</p>
                        </div>
                        <img src="/images/price-analysis.jpg" alt="Price analysis graph" className="benefit-image" />
                    </div>
                    <div className="benefit-item">
                        <FaCalculator className="step-icon" />
                        <div>
                            <h3>Yapay Zeka Desteği</h3>
                            <p>Yapay zeka destekli tahmini fiyat hesaplama.</p>
                        </div>
                        <img src="src/assets/ai-calculation.png" alt="AI price calculation" className="benefit-image" />
                    </div>
                    <div className="benefit-item">
                        <FaTruck className="step-icon" />
                        <div>
                            <h3>Optimizasyon</h3>
                            <p>Kamyon sahipleri için yük takibi ve rota optimizasyonu.</p>
                        </div>
                        <img src="/images/route-optimization.jpg" alt="Route optimization" className="benefit-image" />
                    </div>

                    <div className="benefit-item">
                        <FaClock className="step-icon" />
                        <div>
                            <h3>Zaman Tasarrufu</h3>
                            <p>Hızlı eşleşme sistemi ile zaman kazanın.</p>
                        </div>
                        <img src="src/assets/time-saving.jpg" alt="Time saving" className="benefit-image" />
                    </div>
                </div>
            </section>

            <section className="testimonials">
                <h2>Kullanıcı Yorumları</h2>
                <div className="testimonials-container">
                    <div className="testimonial">
                        <p>"Bu platform sayesinde boş dönüş yapmayı bıraktım ve karlılığım %40 arttı."</p>
                        <div className="testimonial-author">
                            <img src="src/assets/driver1.jpg" alt="Truck driver" className="author-image" />
                            <p>Mehmet K. - Kamyon Sahibi</p>
                        </div>
                    </div>
                    <div className="testimonial">
                        <p>"Artık yüklerimiz için saatlerce telefon başında beklemiyoruz. Tek tıkla uygun taşıyıcıyı buluyoruz."</p>
                        <div className="testimonial-author">
                            <img src="src/assets/cargo-manager.webp" alt="Cargo manager" className="author-image" />
                            <p>Ayşe T. - Lojistik Müdürü</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="image-section reverse">
                <div className="image-container">
                    <img src="/images/mobile-app.jpg" alt="Mobile application" />
                </div>
                <div className="image-content">
                    <h2>Mobil Uygulama ile Her Yerden Erişim</h2>
                    <p>iOS ve Android uyumlu mobil uygulamamız ile yolda bile işlerinizi yönetin.</p>
                </div>
            </section>

            <div className="cta-section">
                <h2>Hemen Başlayın</h2>
                <p>Lojistik süreçlerinizi optimize etmek için bugün kaydolun.</p>
                <button onClick={() => navigate("/register")} className="cta-button">Ücretsiz Kayıt Ol</button>
                <button onClick={() => navigate("/login")} className="secondary-button">Giriş Yap</button>
            </div>
        </motion.div>
    );
};

export default LandingPage;