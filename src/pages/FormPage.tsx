import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiPlus, FiTrash2, FiCheck, FiUpload, FiFile, FiImage, FiX, FiSun, FiMoon } from "react-icons/fi";
import { uploadFile } from "../utils/upload";
import { useTheme } from "../hooks/useTheme";
import "./FormPage.css";

const API = (import.meta.env.VITE_API_URL || "").trim() 
  || "https://portfolio-backend-tan-kappa.vercel.app/api";
const STEPS = ["Personal", "Skills", "Projects", "Career", "Review"];

type Work = { title: string; description: string; link: string; image: string };
type Career = { company: string; role: string; duration: string; description: string };

interface FormData {
  name: string; title: string; email: string; phone: string;
  location: string; bio: string; github: string; linkedin: string;
  twitter: string; website: string; resumeUrl: string;
  skills: string[]; works: Work[]; career: Career[]; customSlug: string;
}

const defaultForm: FormData = {
  name: "", title: "", email: "", phone: "", location: "", bio: "",
  github: "", linkedin: "", twitter: "", website: "", resumeUrl: "",
  skills: [],
  works: [{ title: "", description: "", link: "", image: "" }],
  career: [{ company: "", role: "", duration: "", description: "" }],
  customSlug: "",
};

const FormPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slugStatus, setSlugStatus] = useState<"idle"|"checking"|"available"|"taken">("idle");
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resume upload state
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");

  // Project image upload states
  const [imgUploading, setImgUploading] = useState<Record<number, boolean>>({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const set = (key: keyof FormData, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const checkSlug = (val: string) => {
    const clean = val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    set("customSlug", clean);
    if (!clean) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
       console.log("API:", API);
       console.log("Slug API:", `${API}/portfolio/check-slug/${clean}`);

      const res = await fetch(`${API}/portfolio/check-slug/${clean}`);
      const data = await res.json();
      setSlugStatus(data.available ? "available" : "taken");
    }, 500);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) { set("skills", [...form.skills, s]); setSkillInput(""); }
  };

  const updateWork = (i: number, key: keyof Work, val: string) => {
    const works = [...form.works];
    works[i] = { ...works[i], [key]: val };
    set("works", works);
  };

  const updateCareer = (i: number, key: keyof Career, val: string) => {
    const career = [...form.career];
    career[i] = { ...career[i], [key]: val };
    set("career", career);
  };

  // Upload resume PDF
  const handleResumeUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Resume must be a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Resume must be under 10MB."); return; }
    setResumeUploading(true); setError("");
    try {
      const result = await uploadFile(file, "resumes");
      set("resumeUrl", result.url);
      setResumeFileName(file.name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Resume upload failed. Check Cloudinary config.");
    } finally { setResumeUploading(false); }
  };

  // Upload project image
  const handleImageUpload = async (i: number, file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setImgUploading(prev => ({ ...prev, [i]: true })); setError("");
    try {
      const result = await uploadFile(file, "projects");
      updateWork(i, "image", result.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Image upload failed. Check Cloudinary config.");
    } finally { setImgUploading(prev => ({ ...prev, [i]: false })); }
  };

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.title.trim()) errs.title = "Professional title is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (form.github && !/^https?:\/\//.test(form.github)) errs.github = "Must start with https://";
    if (form.linkedin && !/^https?:\/\//.test(form.linkedin)) errs.linkedin = "Must start with https://";
    if (form.website && !/^https?:\/\//.test(form.website)) errs.website = "Must start with https://";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    setError("");
    if (step === 0 && !validateStep0()) return;
    setFieldErrors({});
    setStep(s => s + 1);
  };

  const submit = async () => {
    console.log("API URL:", API);
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/portfolio/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      // Store edit token in localStorage — not in URL for security
      if (data.editToken) {
        localStorage.setItem(`edit_token_${data.slug}`, data.editToken);
      }
      navigate(`/success/${data.slug}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="form-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="form-container">
        <div className="form-top-row">
          <button className="back-btn" onClick={() => step === 0 ? navigate("/") : setStep(s => s - 1)}>
            <FiArrowLeft /> {step === 0 ? "Home" : "Back"}
          </button>
          <button className="theme-toggle" onClick={toggle} title="Toggle theme">
            {theme === "dark" ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>
        </div>

        <div className="progress-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`progress-step ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}>
              <div className="progress-dot">{i < step ? <FiCheck size={12} /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="form-card">

          {/* ── Step 0: Personal ── */}
          {step === 0 && (
            <div className="form-step">
              <h2>Personal Information</h2>
              <p className="step-desc">Tell us about yourself</p>
              <div className="form-grid">
                <Field label="Full Name *" value={form.name} onChange={v => set("name", v)} placeholder="John Doe" error={fieldErrors.name} />
                <Field label="Professional Title *" value={form.title} onChange={v => set("title", v)} placeholder="Full-Stack Developer" error={fieldErrors.title} />
                <Field label="Email *" value={form.email} onChange={v => set("email", v)} placeholder="john@example.com" type="email" error={fieldErrors.email} />
                <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} placeholder="+1 234 567 8900" />
                <Field label="Location" value={form.location} onChange={v => set("location", v)} placeholder="New York, USA" />
                <Field label="Website" value={form.website} onChange={v => set("website", v)} placeholder="https://yoursite.com" error={fieldErrors.website} />
                <Field label="GitHub" value={form.github} onChange={v => set("github", v)} placeholder="https://github.com/username" error={fieldErrors.github} />
                <Field label="LinkedIn" value={form.linkedin} onChange={v => set("linkedin", v)} placeholder="https://linkedin.com/in/username" error={fieldErrors.linkedin} />
                <Field label="Twitter / X" value={form.twitter} onChange={v => set("twitter", v)} placeholder="https://twitter.com/username" />
              </div>

              <div className="form-field full-width">
                <label>Bio</label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Write a short bio about yourself..." rows={4} />
              </div>

              {/* Resume Upload */}
              <div className="form-field full-width">
                <label>Resume / CV <span className="field-hint">(PDF only · max 10MB)</span></label>
                <div className="upload-zone" onClick={() => document.getElementById("resume-input")?.click()}>
                  <input
                    id="resume-input" type="file" accept=".pdf" hidden
                    onChange={e => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
                  />
                  {resumeUploading ? (
                    <div className="upload-loading"><div className="upload-spinner" /> Uploading...</div>
                  ) : form.resumeUrl ? (
                    <div className="upload-success">
                      <FiFile size={20} />
                      <span>{resumeFileName || "Resume uploaded"}</span>
                      <button className="upload-remove" onClick={e => { e.stopPropagation(); set("resumeUrl", ""); setResumeFileName(""); }}>
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FiUpload size={20} />
                      <span>Click to upload your resume PDF</span>
                      <p>Visitors can download it from your portfolio</p>
                      <div className="upload-specs">
                        <span>📄 Format: PDF only</span>
                        <span>📦 Max size: 10MB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom slug */}
              <div className="form-field full-width">
                <label>Custom Portfolio URL <span className="field-hint">(optional)</span></label>
                <div className="slug-input-wrap">
                  <span className="slug-prefix">portfoliogen.com/</span>
                  <input value={form.customSlug} onChange={e => checkSlug(e.target.value)} placeholder="your-name" style={{ flex: 1 }} />
                  {slugStatus === "checking" && <span className="slug-status checking">Checking...</span>}
                  {slugStatus === "available" && <span className="slug-status available">✓ Available</span>}
                  {slugStatus === "taken" && <span className="slug-status taken">✗ Taken</span>}
                </div>
                <p className="slug-hint">Leave blank to auto-generate. Only letters, numbers, and hyphens.</p>
              </div>
            </div>
          )}

          {/* ── Step 1: Skills ── */}
          {step === 1 && (
            <div className="form-step">
              <h2>Skills & Technologies</h2>
              <p className="step-desc">Add your technical skills</p>
              <div className="skill-input-row">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="e.g. React, Node.js, TypeScript..." />
                <button className="add-btn" onClick={addSkill}><FiPlus /> Add</button>
              </div>
              <div className="skills-list">
                {form.skills.map((s, i) => (
                  <div key={i} className="skill-tag">{s}
                    <button onClick={() => set("skills", form.skills.filter((_, idx) => idx !== i))}><FiTrash2 size={12} /></button>
                  </div>
                ))}
                {form.skills.length === 0 && <p className="empty-hint">No skills added yet. Type and press Enter or click Add.</p>}
              </div>
            </div>
          )}

          {/* ── Step 2: Projects ── */}
          {step === 2 && (
            <div className="form-step">
              <h2>Projects & Work</h2>
              <p className="step-desc">Showcase your best projects</p>
              {form.works.map((w, i) => (
                <div key={i} className="repeater-card">
                  <div className="repeater-header">
                    <span>Project {i + 1}</span>
                    {form.works.length > 1 && (
                      <button className="remove-btn" onClick={() => set("works", form.works.filter((_, idx) => idx !== i))}><FiTrash2 size={14} /></button>
                    )}
                  </div>
                  <div className="form-grid">
                    <Field label="Project Title" value={w.title} onChange={v => updateWork(i, "title", v)} placeholder="My Awesome App" />
                    <Field label="Live Link" value={w.link} onChange={v => updateWork(i, "link", v)} placeholder="https://myapp.com" />
                  </div>
                  <div className="form-field full-width">
                    <label>Description</label>
                    <textarea value={w.description} onChange={e => updateWork(i, "description", e.target.value)} placeholder="Describe the project..." rows={3} />
                  </div>

                  {/* Project image upload */}
                  <div className="form-field full-width">
                    <label>Project Image <span className="field-hint">(JPG/PNG/WebP · max 5MB · recommended 1280×720)</span></label>
                    <div className="upload-zone img-upload-zone" onClick={() => document.getElementById(`img-input-${i}`)?.click()}>
                      <input
                        id={`img-input-${i}`} type="file" accept="image/*" hidden
                        onChange={e => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])}
                      />
                      {imgUploading[i] ? (
                        <div className="upload-loading"><div className="upload-spinner" /> Uploading...</div>
                      ) : w.image ? (
                        <div className="img-preview-wrap">
                          <img src={w.image} alt="preview" className="img-preview" />
                          <button className="img-remove" onClick={e => { e.stopPropagation(); updateWork(i, "image", ""); }}>
                            <FiX size={14} /> Remove
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <FiImage size={20} />
                          <span>Click to upload project screenshot</span>
                          <p>Shown in your portfolio's work section</p>
                          <div className="upload-specs">
                            <span>🖼️ Format: JPG, PNG, WebP</span>
                            <span>📦 Max size: 5MB</span>
                            <span>📐 Recommended: 1280×720px</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button className="add-more-btn" onClick={() => set("works", [...form.works, { title: "", description: "", link: "", image: "" }])}>
                <FiPlus /> Add Another Project
              </button>
            </div>
          )}

          {/* ── Step 3: Career ── */}
          {step === 3 && (
            <div className="form-step">
              <h2>Career & Experience</h2>
              <p className="step-desc">Add your work experience</p>
              {form.career.map((c, i) => (
                <div key={i} className="repeater-card">
                  <div className="repeater-header">
                    <span>Experience {i + 1}</span>
                    {form.career.length > 1 && (
                      <button className="remove-btn" onClick={() => set("career", form.career.filter((_, idx) => idx !== i))}><FiTrash2 size={14} /></button>
                    )}
                  </div>
                  <div className="form-grid">
                    <Field label="Company" value={c.company} onChange={v => updateCareer(i, "company", v)} placeholder="Google" />
                    <Field label="Role" value={c.role} onChange={v => updateCareer(i, "role", v)} placeholder="Software Engineer" />
                    <Field label="Duration" value={c.duration} onChange={v => updateCareer(i, "duration", v)} placeholder="Jan 2022 – Present" />
                  </div>
                  <div className="form-field full-width">
                    <label>Description</label>
                    <textarea value={c.description} onChange={e => updateCareer(i, "description", e.target.value)} placeholder="What did you do there?" rows={3} />
                  </div>
                </div>
              ))}
              <button className="add-more-btn" onClick={() => set("career", [...form.career, { company: "", role: "", duration: "", description: "" }])}>
                <FiPlus /> Add Another Experience
              </button>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="form-step">
              <h2>Review & Submit</h2>
              <p className="step-desc">Everything look good?</p>
              <div className="review-grid">
                <ReviewItem label="Name" value={form.name} />
                <ReviewItem label="Title" value={form.title} />
                <ReviewItem label="Email" value={form.email} />
                <ReviewItem label="Location" value={form.location} />
                <ReviewItem label="Skills" value={form.skills.join(", ") || "—"} />
                <ReviewItem label="Projects" value={`${form.works.filter(w => w.title).length} added`} />
                <ReviewItem label="Experience" value={`${form.career.filter(c => c.company).length} added`} />
                <ReviewItem label="Resume" value={form.resumeUrl ? "✓ Uploaded" : "Not uploaded"} />
                <ReviewItem label="Custom URL" value={form.customSlug ? `portfoliogen.com/${form.customSlug}` : "Auto-generated"} />
              </div>
              {error && <div className="error-msg">{error}</div>}
            </div>
          )}

          {/* Navigation */}
          <div className="form-nav">
            {error && step !== 4 && <div className="error-msg" style={{ flex: 1 }}>{error}</div>}
            {step < 4 ? (
              <button className="nav-btn nav-btn-next" onClick={handleNext}>
                Next Step <FiArrowRight />
              </button>
            ) : (
              <button className="nav-btn nav-btn-submit" onClick={submit} disabled={loading || slugStatus === "taken"}>
                {loading ? "Submitting..." : <><FiCheck /> Submit Portfolio</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = "text", error }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string;
}) => (
  <div className="form-field">
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={error ? { borderColor: "#f87171" } : {}}
    />
    {error && <span className="field-error">{error}</span>}
  </div>
);

const ReviewItem = ({ label, value }: { label: string; value: string }) => (
  <div className="review-item">
    <span className="review-label">{label}</span>
    <span className="review-value">{value || "—"}</span>
  </div>
);

export default FormPage;
