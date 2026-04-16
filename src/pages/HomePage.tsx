import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiEdit3, FiArrowRight, FiX, FiMaximize2, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../hooks/useTheme";
import "./HomePage.css";

const DEMO_URL = "http://localhost:5173";

const HomePage = () => {
  const navigate = useNavigate();
  const glowRef = useRef<HTMLDivElement>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Lock body scroll when demo is open
  useEffect(() => {
    document.body.style.overflow = showDemo ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDemo]);

  const openDemo = () => {
    setIframeLoaded(true); // mount iframe
    setShowDemo(true);
  };

  return (
    <div className="home-page">
      <div className="cursor-glow" ref={glowRef} />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <header className="home-header">
        <div className="logo">
          <span className="logo-dot" />
          PortfolioGen
        </div>
        <button className="theme-toggle" onClick={toggle} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <main className="home-main">
        <div className="hero-text">
          <p className="hero-eyebrow">Build your presence online</p>
          <h1 className="hero-title">
            Your Portfolio,
            <br />
            <span className="hero-accent">Beautifully Crafted</span>
          </h1>
          <p className="hero-subtitle">
            Fill in your details and get a stunning 3D animated portfolio — just like the demo below.
          </p>
        </div>

        <div className="cards-grid">
          {/* Demo Card */}
          <div className="card card-demo">
            <div className="card-badge">Live Preview</div>
            <div className="card-icon-wrap">
              <FiPlay className="card-icon" />
            </div>
            <h2 className="card-title">See the Demo</h2>
            <p className="card-desc">
              Explore a fully interactive 3D portfolio with animated character, smooth scroll, tech stack physics, and more.
            </p>
            <ul className="card-features">
              <li><span className="feat-dot" />3D animated character</li>
              <li><span className="feat-dot" />Smooth GSAP scroll</li>
              <li><span className="feat-dot" />Physics tech stack</li>
              <li><span className="feat-dot" />Fully responsive</li>
            </ul>
            <div className="card-btn-group">
              <button className="card-btn card-btn-outline" onClick={openDemo}>
                <FiPlay size={13} /> Preview <FiArrowRight />
              </button>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="card-btn card-btn-ghost">
                <FiMaximize2 size={13} /> Full
              </a>
            </div>
          </div>

          {/* Create Card */}
          <div className="card card-create">
            <div className="card-badge card-badge-accent">Get Started</div>
            <div className="card-icon-wrap card-icon-accent">
              <FiEdit3 className="card-icon" />
            </div>
            <h2 className="card-title">Create Yours</h2>
            <p className="card-desc">
              Fill out a simple form with your info, projects, and skills. We'll generate your own 3D portfolio instantly.
            </p>
            <ul className="card-features">
              <li><span className="feat-dot feat-dot-accent" />Personal info & bio</li>
              <li><span className="feat-dot feat-dot-accent" />Projects & career</li>
              <li><span className="feat-dot feat-dot-accent" />Skills & tech stack</li>
              <li><span className="feat-dot feat-dot-accent" />Social links</li>
            </ul>
            <button className="card-btn card-btn-filled" onClick={() => navigate("/create")}>
              Build My Portfolio <FiArrowRight />
            </button>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat">
            <span className="stat-num">3D</span>
            <span className="stat-label">Animated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">Free</span>
            <span className="stat-label">Always</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">Fast</span>
            <span className="stat-label">Setup</span>
          </div>
        </div>
      </main>

      {/* Demo overlay — iframe stays mounted once loaded, just hidden/shown via CSS */}
      <div className={`demo-overlay${showDemo ? " demo-overlay-visible" : ""}`} onClick={() => setShowDemo(false)}>
        <div className="demo-modal" onClick={e => e.stopPropagation()}>
          <div className="demo-modal-header">
            <span className="demo-modal-title">
              <span className="logo-dot" /> Live Demo
            </span>
            <div className="demo-modal-actions">
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="demo-open-btn">
                <FiMaximize2 size={13} /> Open Full
              </a>
              <button className="demo-close-btn" onClick={() => setShowDemo(false)}>
                <FiX />
              </button>
            </div>
          </div>
          <div className="demo-iframe-wrap">
            {/* Only mount iframe once, never unmount — stays warm in background */}
            {iframeLoaded && (
              <iframe
                src={DEMO_URL}
                title="Portfolio Demo"
                allow="accelerometer; autoplay"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
