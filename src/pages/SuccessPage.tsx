import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiCopy, FiHome, FiEdit3, FiShare2 } from "react-icons/fi";
import { FaLinkedin, FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import { useState, useEffect } from "react";
import "./SuccessPage.css";

const API = import.meta.env.VITE_API_URL || "https://portfolio-backend-d241lvixv-anshudevil07s-projects.vercel.app/api";

const SuccessPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(true);

  const portfolioUrl = `https://3d-portfolio-b835b6nde-anshudevil07s-projects.vercel.app/portfolio/${slug}`;
  const editToken = localStorage.getItem(`edit_token_${slug}`);

  useEffect(() => {
    fetch(`${API}/portfolio/${slug}/qr`)
      .then(r => r.json())
      .then(d => { if (d.qr) setQrCode(d.qr); })
      .catch(() => {})
      .finally(() => setQrLoading(false));
  }, [slug]);

  const copy = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Check out my 3D portfolio! 🚀`;
  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(portfolioUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${portfolioUrl}`)}`,
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = qrCode;
    a.download = `portfolio-qr-${slug}.png`;
    a.click();
  };

  return (
    <div className="success-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="success-layout">
        {/* Left: main card */}
        <div className="success-card">
          <div className="success-icon"><FiCheckCircle /></div>
          <h1>Your Portfolio is Live! 🎉</h1>
          <p className="success-desc">
            Your 3D portfolio is ready. Share it with the world!
          </p>

          <div className="url-box">
            <span>{portfolioUrl}</span>
            <button onClick={copy} className="copy-btn" title="Copy link">
              {copied ? "Copied!" : <FiCopy />}
            </button>
          </div>

          <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="view-btn">
            View My Portfolio →
          </a>

          {/* Social share */}
          <div className="share-section">
            <p className="share-label">Share your portfolio</p>
            <div className="share-btns">
              <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="share-btn share-linkedin">
                <FaLinkedin /> LinkedIn
              </a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="share-btn share-twitter">
                <FaXTwitter /> Twitter
              </a>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="share-btn share-whatsapp">
                <FaWhatsapp /> WhatsApp
              </a>
            </div>
          </div>

          {/* Edit link */}
          {editToken && (
            <div className="edit-notice">
              <FiEdit3 size={14} />
              <div>
                <p>Want to update your portfolio later?</p>
                <button onClick={() => navigate(`/edit/${editToken}`)} className="edit-link-btn">
                  Use your edit link
                </button>
                <p className="edit-warn">Save this page — this is the only way to edit your portfolio.</p>
              </div>
            </div>
          )}

          <p className="email-note">📧 A confirmation email has been sent to your inbox with your portfolio link and edit access.</p>

          <button className="home-btn" onClick={() => navigate("/")}>
            <FiHome /> Back to Home
          </button>
        </div>

        {/* Right: QR code */}
        <div className="qr-card">
          <h3>Your QR Code</h3>
          <p>Scan to open your portfolio on any device</p>
          <div className="qr-wrap">
            {qrLoading ? (
              <div className="qr-loading"><div className="qr-spinner" /></div>
            ) : qrCode ? (
              <img src={qrCode} alt="Portfolio QR Code" className="qr-img" />
            ) : (
              <div className="qr-error">QR unavailable</div>
            )}
          </div>
          {qrCode && (
            <button className="qr-download-btn" onClick={downloadQR}>
              Download QR Code
            </button>
          )}
          <p className="qr-hint">Perfect for business cards, resumes, or LinkedIn!</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
