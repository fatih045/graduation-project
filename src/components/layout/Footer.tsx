import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import "../../styles/footer.css";
function  Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Logo & Slogan */}
                <h2 className="footer-logo">Logistify</h2>
                <p>Yük ve kamyon sahiplerini buluşturan platform</p>

                {/* Footer Linkleri */}
                <div className="footer-links">
                    <a href="#">Hakkımızda</a>
                    <a href="#">Hizmetler</a>
                    <a href="#">Gizlilik Politikası</a>
                    <a href="#">İletişim</a>
                </div>

                {/* Sosyal Medya Linkleri */}
                <div className="footer-social">
                    <a href="#"><FaFacebook/></a>
                    <a href="#"><FaTwitter/></a>
                    <a href="#"><FaLinkedin/></a>
                    <a href="#"><FaInstagram/></a>
                </div>

                {/* Copyright */}
                <p className="footer-copyright">
                    © {new Date().getFullYear()} Logistify. Tüm hakları saklıdır.
                </p>
            </div>
        </footer>
    )
}

export default Footer