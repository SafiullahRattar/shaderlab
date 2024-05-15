import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-icon">✦</span>
          <span className="navbar-title">ShaderLab</span>
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Gallery
          </Link>
          <Link
            to="/write"
            className={`navbar-link navbar-link-accent ${location.pathname === "/write" ? "active" : ""}`}
          >
            Write
          </Link>
        </div>
      </div>
    </nav>
  );
}
