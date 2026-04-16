import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdArrowForward, MdArrowOutward, MdCopyright } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";
// Template CSS — exact same styles as the 3D portfolio
import "./template-styles/Navbar.css";
import "./template-styles/Landing.css";
import "./template-styles/About.css";
import "./template-styles/WhatIDo.css";
import "./template-styles/Career.css";
import "./template-styles/Work.css";
import "./template-styles/Contact.css";
import "./template-styles/style.css";
import "./PortfolioView.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Work { title: string; description: string; link: string; image: string; }
interface CareerItem { company: string; role: string; duration: string; description: string; }
interface Portfolio {
  name: string; title: string; email: string; phone: string;
  location: string; bio: string; github: string; linkedin: string;
  twitter: string; website: string; skills: string[];
  works: Work[]; career: CareerItem[]; status: string; slug: string;
}

const PortfolioView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workIndex, setWorkIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetch(`${API}/portfolio/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(() => setError("Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, [slug]);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setWorkIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  if (loading) return (
    <div className="pv-state-screen">
      <div className="pv-spinner" />
      <p>Loading portfolio...</p>
    </div>
  );

  if (error || !data) return (
    <div className="pv-state-screen">
      <div className="pv-state-card">
        <span>🔍</span>
        <h2>Portfolio not found</h2>
        <p>This portfolio doesn't exist or the link is incorrect.</p>
        <button onClick={() => navigate("/")}>← Back to Home</button>
      </div>
    </div>
  );

  if (data.status === "rejected") return (
    <div className="pv-state-screen">
      <div className="pv-state-card">
        <span>🚫</span>
        <h2>Portfolio Unavailable</h2>
        <p>This portfolio has been deactivated.</p>
        <button onClick={() => navigate("/")}>← Back to Home</button>
      </div>
    </div>
  );

  const works = data.works?.filter(w => w.title) ?? [];
  const career = data.career?.filter(c => c.company) ?? [];
  const initials = data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const nameParts = data.name.trim().split(" ");
  const firstName = nameParts[0].toUpperCase();
  const lastName = nameParts.slice(1).join(" ").toUpperCase();
  // Split title: "Full-Stack Developer" → label="Full-Stack &", main="Developer"
  const titleWords = data.title.trim().split(" ");
  const titleMain = titleWords[titleWords.length - 1];
  const titleLabel = titleWords.slice(0, -1).join(" ");

  return (
    <div className="pv-root">

      {/* ── Navbar (exact template structure) ── */}
      <div className="header">
        <button className="pv-back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft size={13} /> Home
        </button>
        <a href="#pv-landing" className="navbar-title">{initials}</a>
        {data.email && (
          <a href={`mailto:${data.email}`} className="navbar-connect">{data.email}</a>
        )}
        <ul>
          <li><a href="#pv-about">ABOUT</a></li>
          {works.length > 0 && <li><a href="#pv-work">WORK</a></li>}
          <li><a href="#pv-contact">CONTACT</a></li>
        </ul>
      </div>

      {/* ── Ambient circles (exact template) ── */}
      <div className="landing-circle1" />
      <div className="landing-circle2" />

      {/* ── Hero / Landing ── */}
      <div className="landing-section" id="pv-landing">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName}
              {lastName && <><br /><span style={{ fontWeight: 200 }}>{lastName}</span></>}
            </h1>
          </div>
          <div className="landing-info">
            {titleLabel && <h3>{titleLabel} &</h3>}
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{titleMain}</div>
            </h2>
          </div>
        </div>
        {/* Avatar in center (replaces 3D model) */}
        <div className="pv-avatar-wrap">
          <div className="pv-avatar-circle">
            <span>{initials}</span>
            <div className="character-rim" style={{ opacity: 0.6, animation: "none", transform: "translate(-50%, 100%) scale(1.4)" }} />
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <div className="about-section" id="pv-about">
        <div className="about-me">
          <div className="about-label">
            <span className="about-line" />
            <span className="about-tag">About Me</span>
          </div>
          <h2 className="about-heading">
            Crafting <em>digital</em><br />experiences
          </h2>
          {data.bio && <p className="para">{data.bio}</p>}
          <div className="about-stats">
            {data.location && (
              <div className="about-stat">
                <span className="stat-num">{data.location.split(",")[0]}</span>
                <span className="stat-label">Location</span>
              </div>
            )}
            {data.skills?.length > 0 && (
              <div className="about-stat">
                <span className="stat-num">{data.skills.length}+</span>
                <span className="stat-label">Skills</span>
              </div>
            )}
            {works.length > 0 && (
              <div className="about-stat">
                <span className="stat-num">{works.length}</span>
                <span className="stat-label">Projects</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── What I Do ── */}
      {data.skills?.length > 0 && (
        <div className="whatIDO">
          <div className="what-box">
            <h2 className="title">
              W<span className="hat-h2">HAT</span>
              <div>I<span className="do-h2"> DO</span></div>
            </h2>
          </div>
          <div className="what-box">
            <div className="what-box-in" style={{ display: "flex" }}>
              <div className="what-border2">
                <svg width="100%">
                  <line x1="0" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
                  <line x1="100%" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
                </svg>
              </div>
              {/* Card 1: title + first half of skills */}
              <div className="what-content what-noTouch">
                <div className="what-border1">
                  <svg height="100%">
                    <line x1="0" y1="0" x2="100%" y2="0" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                  </svg>
                </div>
                <div className="what-corner" />
                <div className="what-content-in">
                  <h3>{data.title.toUpperCase()}</h3>
                  <h4>Building great things</h4>
                  {data.bio && <p>{data.bio.slice(0, 120)}{data.bio.length > 120 ? "..." : ""}</p>}
                  <h5>Skillset &amp; tools</h5>
                  <div className="what-content-flex">
                    {data.skills.slice(0, 6).map((s, i) => (
                      <div key={i} className="what-tags">{s}</div>
                    ))}
                  </div>
                  <div className="what-arrow" />
                </div>
              </div>
              {/* Card 2: remaining skills */}
              <div className="what-content what-noTouch">
                <div className="what-border1">
                  <svg height="100%">
                    <line x1="0" y1="0" x2="100%" y2="0" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                    <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                  </svg>
                </div>
                <div className="what-corner" />
                <div className="what-content-in">
                  <h3>MORE SKILLS</h3>
                  <h4>Additional expertise</h4>
                  <h5>Skillset &amp; tools</h5>
                  <div className="what-content-flex">
                    {data.skills.slice(6).length > 0
                      ? data.skills.slice(6).map((s, i) => <div key={i} className="what-tags">{s}</div>)
                      : data.skills.map((s, i) => <div key={i} className="what-tags">{s}</div>)
                    }
                  </div>
                  <div className="what-arrow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Career ── */}
      {career.length > 0 && (
        <div className="career-section section-container">
          <div className="career-container">
            <h2>
              My career <span>&</span><br />experience
            </h2>
            <div className="career-info">
              <div className="career-timeline">
                <div className="career-dot" />
              </div>
              {career.map((c, i) => (
                <div key={i} className="career-info-box">
                  <div className="career-info-in">
                    <div className="career-role">
                      <h4>{c.role}</h4>
                      <h5>{c.company}</h5>
                    </div>
                    <h3>{c.duration?.split(/[-–]/)[0]?.trim() || "NOW"}</h3>
                  </div>
                  {c.description && <p>{c.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Work ── */}
      {works.length > 0 && (
        <div className="work-section" id="pv-work">
          <div className="work-container section-container">
            <h2>My <span>Work</span></h2>
            <div className="carousel-wrapper">
              <button className="carousel-arrow carousel-arrow-left" onClick={() => goToSlide(workIndex === 0 ? works.length - 1 : workIndex - 1)} aria-label="Previous">
                <MdArrowBack />
              </button>
              <button className="carousel-arrow carousel-arrow-right" onClick={() => goToSlide(workIndex === works.length - 1 ? 0 : workIndex + 1)} aria-label="Next">
                <MdArrowForward />
              </button>
              <div className="carousel-track-container">
                <div className="carousel-track" style={{ transform: `translateX(-${workIndex * 100}%)` }}>
                  {works.map((w, i) => (
                    <div key={i} className="carousel-slide">
                      <div className="carousel-content">
                        <div className="carousel-info">
                          <div className="carousel-number"><h3>0{i + 1}</h3></div>
                          <div className="carousel-details">
                            <h4>{w.title}</h4>
                            {w.description && <p className="carousel-category">{w.description}</p>}
                            {w.link && (
                              <div className="carousel-tools">
                                <a href={w.link} target="_blank" rel="noopener noreferrer" className="pv-work-link">
                                  View Project <MdArrowOutward />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="carousel-image-wrapper">
                          {w.image
                            ? (
                              <div className="work-image">
                                <div className="work-image-in">
                                  <img src={w.image} alt={w.title} />
                                  {w.link && (
                                    <a href={w.link} target="_blank" rel="noopener noreferrer">
                                      <div className="work-link"><MdArrowOutward /></div>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )
                            : (
                              <div className="pv-img-placeholder">{w.title[0]}</div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="carousel-dots">
                {works.map((_, i) => (
                  <button key={i} className={`carousel-dot${i === workIndex ? " carousel-dot-active" : ""}`} onClick={() => goToSlide(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact ── */}
      <div className="contact-section section-container" id="pv-contact">
        <div className="contact-container">
          <h3>Contact</h3>
          <div className="contact-flex">
            <div className="contact-box">
              {data.linkedin && (
                <>
                  <h4>Connect</h4>
                  <p>
                    <a href={data.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn — {data.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "")}
                    </a>
                  </p>
                </>
              )}
              {data.location && (
                <>
                  <h4>Location</h4>
                  <p>{data.location}</p>
                </>
              )}
            </div>
            <div className="contact-box">
              <h4>Social</h4>
              {data.github && <a href={data.github} target="_blank" rel="noreferrer" className="contact-social">GitHub <MdArrowOutward /></a>}
              {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="contact-social">LinkedIn <MdArrowOutward /></a>}
              {data.twitter && <a href={data.twitter} target="_blank" rel="noreferrer" className="contact-social">Twitter <MdArrowOutward /></a>}
              {data.email && <a href={`mailto:${data.email}`} className="contact-social">Email <MdArrowOutward /></a>}
            </div>
            <div className="contact-box">
              <h2>Designed and Developed<br />by <span>{data.name}</span></h2>
              <h5><MdCopyright /> 2026</h5>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PortfolioView;
