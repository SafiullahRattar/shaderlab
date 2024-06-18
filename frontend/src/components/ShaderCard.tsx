import { Link } from "react-router-dom";
import WebGLPreview from "./WebGLPreview";
import { Shader } from "../lib/api";
import "./ShaderCard.css";

interface ShaderCardProps {
  shader: Shader;
}

export default function ShaderCard({ shader }: ShaderCardProps) {
  const tags = shader.tags
    ? shader.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <Link to={`/shader/${shader.id}`} className="shader-card">
      <div className="shader-card-preview">
        <WebGLPreview
          glslCode={shader.glslCode}
          width="100%"
          height="100%"
        />
        <div className="shader-card-overlay">
          <span className="shader-card-view">View Shader</span>
        </div>
      </div>
      <div className="shader-card-body">
        <h3 className="shader-card-title">{shader.title}</h3>
        <p className="shader-card-desc">{shader.description}</p>
        <div className="shader-card-meta">
          <span className="shader-card-category">{shader.category}</span>
          {tags.length > 0 && (
            <div className="shader-card-tags">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="shader-card-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
