import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import "./FormPage.css";

const API = import.meta.env.VITE_API_URL || "https://portfolio-backend-tan-kappa.vercel.app/api";

const EditPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [slug, setSlug] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    bio: "", title: "", phone: "", location: "",
    github: "", linkedin: "", twitter: "", website: "", resumeUrl: "",
    skills: [] as string[],
    works: [{ title: "", description: "", link: "", image: "" }],
    career: [{ company: "", role: "", duration: "", description: "" }],
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    fetch(`${API}/portfolio/edit/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError("Invalid or expired edit link."); return; }
        setSlug(d.slug);
        setForm({
          bio: d.bio || "", title: d.title || "",
          phone: d.phone || "", location: d.location || "",
          github: d.github || "", linkedin: d.linkedin || "",
          twitter: d.twitter || "", website: d.website || "",
          resumeUrl: d.resumeUrl || "",
          skills: d.skills || [],
          works: d.works?.length ? d.works : [{ title: "", description: "", link: "", image: "" }],
          career: d.career?.length ? d.career : [{ company: "", role: "", duration: "", description: "" }],
        });
      })
      .catch(() => setError("Failed to load portfolio."))
      .finally(() => setLoading(false));
  }, [token]);

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) { set("skills", [...form.skills, s]); setSkillInput(""); }
  };

  const save = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/portfolio/edit/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => navigate(`/portfolio/${data.slug}`), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="form-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><div style={{ color:"var(--text-muted)" }}>Loading...</div></div>;
  if (error && !slug) return <div className="form-page" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><div style={{ color:"#f87171", textAlign:"center" }}><h2>Invalid Link</h2><p>{error}</p></div></div>;

  return (
    <div className="form-page">
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="form-container">
        <button className="back-btn" onClick={() => navigate("/")}>
          <FiArrowLeft /> Home
        </button>
        <div className="form-card">
          <div className="form-step">
            <h2>Edit Your Portfolio</h2>
            <p className="step-desc">Update your details below</p>

            <div className="form-grid">
              <Field label="Professional Title" value={form.title} onChange={v => set("title", v)} placeholder="Full-Stack Developer" />
              <Field label="Phone" value={form.phone} onChange={v => set("phone", v)} placeholder="+1 234 567 8900" />
              <Field label="Location" value={form.location} onChange={v => set("location", v)} placeholder="New York, USA" />
              <Field label="Website" value={form.website} onChange={v => set("website", v)} placeholder="https://yoursite.com" />
              <Field label="GitHub" value={form.github} onChange={v => set("github", v)} placeholder="https://github.com/username" />
              <Field label="LinkedIn" value={form.linkedin} onChange={v => set("linkedin", v)} placeholder="https://linkedin.com/in/username" />
              <Field label="Twitter / X" value={form.twitter} onChange={v => set("twitter", v)} placeholder="https://twitter.com/username" />
              <Field label="Resume URL" value={form.resumeUrl} onChange={v => set("resumeUrl", v)} placeholder="https://..." />
            </div>

            <div className="form-field full-width">
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Write a short bio..." rows={4} />
            </div>

            {/* Skills */}
            <div className="form-field full-width">
              <label>Skills</label>
              <div className="skill-input-row">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="e.g. React, Node.js..." />
                <button className="add-btn" onClick={addSkill}><FiPlus /> Add</button>
              </div>
              <div className="skills-list" style={{ marginTop: 10 }}>
                {form.skills.map((s, i) => (
                  <div key={i} className="skill-tag">{s}
                    <button onClick={() => set("skills", form.skills.filter((_, idx) => idx !== i))}><FiTrash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="form-field full-width">
              <label>Projects</label>
              {form.works.map((w, i) => (
                <div key={i} className="repeater-card" style={{ marginBottom: 12 }}>
                  <div className="repeater-header">
                    <span>Project {i + 1}</span>
                    {form.works.length > 1 && <button className="remove-btn" onClick={() => set("works", form.works.filter((_, idx) => idx !== i))}><FiTrash2 size={14} /></button>}
                  </div>
                  <div className="form-grid">
                    <Field label="Title" value={w.title} onChange={v => { const w2=[...form.works]; w2[i]={...w2[i],title:v}; set("works",w2); }} placeholder="My App" />
                    <Field label="Link" value={w.link} onChange={v => { const w2=[...form.works]; w2[i]={...w2[i],link:v}; set("works",w2); }} placeholder="https://..." />
                  </div>
                  <div className="form-field full-width">
                    <label>Description</label>
                    <textarea value={w.description} onChange={e => { const w2=[...form.works]; w2[i]={...w2[i],description:e.target.value}; set("works",w2); }} rows={2} />
                  </div>
                </div>
              ))}
              <button className="add-more-btn" onClick={() => set("works", [...form.works, { title:"", description:"", link:"", image:"" }])}><FiPlus /> Add Project</button>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:10, padding:"12px 16px", color:"#4ade80", fontSize:"0.88rem" }}>✓ Saved! Redirecting to your portfolio...</div>}
          </div>

          <div className="form-nav">
            <button className="nav-btn nav-btn-submit" onClick={save} disabled={saving}>
              {saving ? "Saving..." : <><FiCheck /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="form-field">
    <label>{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

export default EditPage;
