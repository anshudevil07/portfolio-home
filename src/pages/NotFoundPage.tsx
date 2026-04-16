import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="nf-page">
      <div className="nf-orb nf-orb-1" />
      <div className="nf-orb nf-orb-2" />
      <div className="nf-content">
        <div className="nf-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="nf-actions">
          <button className="nf-btn-primary" onClick={() => navigate("/")}>← Back to Home</button>
          <button className="nf-btn-secondary" onClick={() => navigate("/create")}>Create Portfolio</button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
