import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShader } from "../lib/api";
import WebGLPreview from "../components/WebGLPreview";
import "./ShaderEditor.css";

const DEFAULT_TEMPLATE = `void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float d = length(uv);
    float a = atan(uv.y, uv.x);
    float n = sin(d * 6.0 - u_time * 0.8) * cos(a * 4.0 + u_time * 0.5);
    vec3 col = 0.5 + 0.5 * cos(d * 3.0 + n + u_time * 0.4 + vec3(0.0, 2.0, 4.0));
    col *= smoothstep(0.7, 0.15, d);
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

export default function ShaderEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState(DEFAULT_TEMPLATE);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glError, setGlError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!code.trim()) {
      setError("GLSL code is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const shader = await createShader({
        title: title.trim(),
        description: description.trim(),
        glslCode: code.trim(),
        tags: tags.trim(),
        category: category.trim() || "General",
      });
      navigate(`/shader/${shader.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save shader");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shader-editor animate-fade-in-up">
      <header className="editor-header">
        <div className="editor-header-top">
          <h1 className="editor-title">Write Mode</h1>
          <div className="editor-header-actions">
            <button
              className="btn-secondary btn-sm"
              onClick={() => setPaused(!paused)}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish Shader"}
            </button>
          </div>
        </div>
        <p className="editor-subtitle">
          Write GLSL fragment shaders with live preview. Uniforms available:{" "}
          <code className="editor-code-inline">u_time</code>,{" "}
          <code className="editor-code-inline">u_resolution</code>,{" "}
          <code className="editor-code-inline">u_mouse</code>
        </p>
      </header>

      <div className="editor-form-row">
        <label className="form-label">
          Title
          <input
            type="text"
            className="form-input"
            placeholder="My Amazing Shader"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="form-label">
          Category
          <input
            type="text"
            className="form-input"
            placeholder="Abstract, Fractals, 3D..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label className="form-label">
          Tags (comma-separated)
          <input
            type="text"
            className="form-input"
            placeholder="noise, colorful, generative"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
      </div>

      <label className="form-label">
        Description
        <textarea
          className="form-textarea"
          rows={2}
          placeholder="A brief description of your shader..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="editor-workspace">
        <div className="editor-pane">
          <div className="editor-pane-header">
            <span className="editor-pane-label">GLSL Editor</span>
          </div>
          <div className="code-editor-wrapper editor-code-full">
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={24}
            />
            <pre className="code-editor-highlight" aria-hidden="true">
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightGLSL(code),
                }}
              />
            </pre>
          </div>
        </div>

        <div className="editor-pane">
          <div className="editor-pane-header">
            <span className="editor-pane-label">Live Preview</span>
            {glError && (
              <span className="editor-pane-error-badge">Error</span>
            )}
          </div>
          <div className="editor-preview">
            <WebGLPreview
              glslCode={code}
              width="100%"
              height="100%"
              onError={setGlError}
              paused={paused}
            />
            {glError && (
              <div className="editor-preview-error">
                <span className="editor-preview-error-icon">!</span>
                {glError}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
