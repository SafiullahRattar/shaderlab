import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-icon">✦</span>
          <span>ShaderLab</span>
        </div>
        <p className="footer-text">
          Creative GLSL Shader Gallery &mdash; Write, preview, and share fragment shaders in real time.
        </p>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} ShaderLab. Built with WebGL &amp; React.
        </p>
      </div>
    </footer>
  );
}
