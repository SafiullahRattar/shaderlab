import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchShader, updateShader, deleteShader, Shader } from "../lib/api";
import WebGLPreview from "../components/WebGLPreview";
import LoadingSpinner from "../components/LoadingSpinner";
import "./ShaderView.css";

const TEMPLATE_SHADER = `void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float d = length(uv);
    vec3 col = vec3(0.1, 0.1, 0.2);
    col += 0.5 + 0.5 * cos(d * 5.0 + u_time + vec3(0.0, 2.0, 4.0));
    col *= smoothstep(1.0, 0.2, d);
    gl_FragColor = vec4(col, 1.0);
}`;

function highlightGLSL(code: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(
      /\b(void|float|int|bool|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|return|if|else|for|while|break|continue|uniform|precision|attribute|varying|in|out|inout|struct|const|discard|highp|mediump|lowp)\b/g,
      '<span class="glsl-kw">$1</span>'
    )
    .replace(
      /\b(sin|cos|tan|asin|acos|atan|pow|exp|log|sqrt|abs|sign|floor|ceil|fract|mod|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize|reflect|refract|transpose|determinant|inverse|texture|texture2D|textureCube|radians|degrees|atan)\b/g,
      '<span class="glsl-builtin">$1</span>'
    )
    .replace(
      /(\d+\.?\d*)/g,
      '<span class="glsl-num">$1</span>'
    )
    .replace(
      /(\/\/[^\n]*)/g,
      '<span class="glsl-comment">$1</span>'
    );
}

export default function ShaderView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shader, setShader] = useState<Shader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [glError, setGlError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchShader(parseInt(id, 10));
      setShader(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
      setEditCode(data.glslCode);
      setEditTags(data.tags);
      setEditCategory(data.category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shader");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!shader || !editTitle.trim()) return;
    setSaving(true);
    try {
      const updated = await updateShader(shader.id, {
        title: editTitle,
        description: editDescription,
        glslCode: editCode,
        tags: editTags,
        category: editCategory,
      });
      setShader(updated);
      setEditMode(false);
      setGlError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!shader || !window.confirm("Delete this shader permanently?")) return;
    setDeleting(true);
    try {
      await deleteShader(shader.id);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (shader) {
      setEditTitle(shader.title);
      setEditDescription(shader.description);
      setEditCode(shader.glslCode);
      setEditTags(shader.tags);
      setEditCategory(shader.category);
    }
    setEditMode(false);
    setGlError(null);
  };

  const tagsList = shader?.tags
    ? shader.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const activeCode = editMode ? editCode : shader?.glslCode || TEMPLATE_SHADER;

  if (loading) return <LoadingSpinner text="Loading shader..." />;

  if (error && !shader) {
    return (
      <div className="shader-view-error">
        <p>{error}</p>
        <button onClick={load} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="shader-view animate-fade-in-up">
      <div className="shader-preview-container">
        <WebGLPreview
          glslCode={activeCode}
          width="100%"
          height="100%"
          onError={setGlError}
        />
        {glError && (
          <div className="shader-gl-error">
            <span className="shader-gl-error-icon">!</span>
            {glError}
          </div>
        )}
      </div>

      <div className="shader-info">
        {!editMode ? (
          <>
            <div className="shader-info-header">
              <h1 className="shader-info-title">{shader?.title}</h1>
              <div className="shader-info-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            <p className="shader-info-desc">{shader?.description}</p>
            <div className="shader-info-meta">
              <span className="shader-info-category">{shader?.category}</span>
              <span className="shader-info-author">{shader?.author}</span>
              <span className="shader-info-date">
                {shader?.createdAt
                  ? new Date(shader.createdAt).toLocaleDateString()
                  : ""}
              </span>
            </div>
            {tagsList.length > 0 && (
              <div className="shader-info-tags">
                {tagsList.map((tag) => (
                  <span key={tag} className="shader-info-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="shader-code-section">
              <h2 className="shader-code-heading">GLSL Source</h2>
              <pre className="shader-code-block">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightGLSL(shader?.glslCode || ""),
                  }}
                />
              </pre>
            </div>
          </>
        ) : (
          <div className="shader-edit-form">
            <div className="shader-edit-header">
              <h2 className="shader-edit-title">Edit Shader</h2>
              <div className="shader-edit-actions">
                <button className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <label className="form-label">
              Title
              <input
                type="text"
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </label>

            <label className="form-label">
              Description
              <textarea
                className="form-textarea"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </label>

            <div className="form-row">
              <label className="form-label">
                Category
                <input
                  type="text"
                  className="form-input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </label>
              <label className="form-label">
                Tags (comma-separated)
                <input
                  type="text"
                  className="form-input"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </label>
            </div>

            <label className="form-label">
              GLSL Code
              <div className="code-editor-wrapper">
                <textarea
                  className="code-editor"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  spellCheck={false}
                  rows={18}
                />
                <pre className="code-editor-highlight" aria-hidden="true">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightGLSL(editCode),
                    }}
                  />
                </pre>
              </div>
            </label>

            {error && <p className="form-error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
