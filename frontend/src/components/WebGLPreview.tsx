import { useRef, useEffect, useCallback } from "react";

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const POSITIONS = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "Unknown compilation error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "Unknown link error";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

function buildFragmentSource(userCode: string): string {
  const alreadyHasMain = /void\s+main\s*\(/.test(userCode);
  if (alreadyHasMain) {
    return `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

${userCode}`;
  }
  return `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.0);
  ${userCode}
  gl_FragColor = vec4(col, 1.0);
}`;
}

interface WebGLPreviewProps {
  glslCode: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: string | null) => void;
  paused?: boolean;
}

export default function WebGLPreview({
  glslCode,
  width,
  height,
  className,
  style,
  onError,
  paused,
}: WebGLPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const errorRef = useRef<boolean>(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) {
      onErrorRef.current?.("WebGL not supported");
      return;
    }

    let program: WebGLProgram;
    try {
      const fragSrc = buildFragmentSource(glslCode);
      program = createProgram(gl, VERTEX_SHADER_SRC, fragSrc);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Shader compilation failed";
      onErrorRef.current?.(msg);
      errorRef.current = true;
      gl.clearColor(0.12, 0.04, 0.04, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    errorRef.current = false;
    onErrorRef.current?.(null);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, POSITIONS, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const dpr = window.devicePixelRatio || 1;
    const draw = () => {
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      gl.useProgram(program);
      if (resolutionLoc) gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      if (timeLoc) gl.uniform1f(timeLoc, performance.now() / 1000);
      if (mouseLoc) gl.uniform2f(mouseLoc, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!paused) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [glslCode, paused]);

  useEffect(() => {
    const cleanup = render();
    return () => cleanup?.();
  }, [render]);

  const displayWidth = width || "100%";
  const displayHeight = height || "100%";

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: displayWidth,
        height: displayHeight,
        background: "#0a0a14",
        borderRadius: "inherit",
        ...style,
      }}
    />
  );
}
