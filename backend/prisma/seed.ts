import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const shaders = [
  {
    title: "Cosmic Bloom",
    description:
      "Organic fractal noise with shifting color harmonies. A hypnotic display of procedural beauty that evolves over time.",
    glslCode: `void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float d = length(uv);
    float a = atan(uv.y, uv.x);
    float n = sin(d * 8.0 - u_time * 0.5) * cos(a * 5.0 + u_time * 0.3);
    n += sin(d * 15.0 + u_time) * 0.5;
    n += sin(uv.x * 10.0 + sin(u_time * 0.7 + uv.y * 3.0)) * 0.3;
    vec3 col = 0.5 + 0.5 * cos(3.0 + d * 4.0 + n + vec3(0.0, 2.0, 4.0));
    col *= smoothstep(0.8, 0.15, d);
    col += 0.04 / (d + 0.08);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "fractal,noise,colorful,abstract",
    category: "Fractals",
    author: "ShaderLab",
  },
  {
    title: "Raymarch Primitives",
    description:
      "Real-time ray marching with spheres and planes. Soft shadows and ambient occlusion demonstrate advanced rendering techniques.",
    glslCode: `float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdPlane(vec3 p) { return p.y + 1.0; }
float sdTorus(vec3 p, vec2 t) { vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }

float map(vec3 p) {
    vec3 q = p;
    q.x += sin(p.y * 2.0 + u_time) * 0.3;
    float sphere = sdSphere(q - vec3(0.0, 0.4, 0.0), 0.7);
    float plane = sdPlane(p);
    float torus = sdTorus(p - vec3(1.5, -0.3, 0.5), vec2(0.4, 0.15));
    return min(min(sphere, plane), torus);
}

vec3 calcNormal(vec3 p) {
    float e = 0.001;
    return normalize(vec3(
        map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
        map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
        map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
    ));
}

float softShadow(vec3 ro, vec3 rd, float k) {
    float res = 1.0;
    float t = 0.05;
    for (int i = 0; i < 64; i++) {
        float h = map(ro + rd * t);
        res = min(res, k * h / t);
        t += h;
        if (res < 0.001 || t > 10.0) break;
    }
    return clamp(res, 0.0, 1.0);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, 0.5, 5.0);
    vec3 rd = normalize(vec3(uv, -1.8));
    float t = 0.0;
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001 || t > 30.0) break;
        t += d;
    }
    vec3 col = vec3(0.04, 0.04, 0.08);
    if (t < 30.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 lightPos = vec3(sin(u_time * 0.7) * 2.0, 3.0, cos(u_time * 0.7) * 2.0);
        vec3 lightDir = normalize(lightPos - p);
        float diff = max(dot(n, lightDir), 0.0);
        float shadow = softShadow(p + n * 0.01, lightDir, 8.0);
        vec3 albedo = vec3(0.2, 0.45, 0.8);
        float ao = 1.0 - t / 30.0;
        col = albedo * diff * shadow * ao + vec3(0.03, 0.05, 0.1);
    }
    col = pow(col, vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "raymarching,3D,lighting,advanced",
    category: "3D",
    author: "ShaderLab",
  },
  {
    title: "Voronoi Cells",
    description:
      "Animated Voronoi cellular noise forming organic, cell-like patterns. Clean edges and smooth animation.",
    glslCode: `vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    uv *= 3.0;
    vec2 iuv = floor(uv);
    vec2 fuv = fract(uv);
    float minDist = 1.0;
    vec2 minPoint = vec2(0.0);
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(iuv + neighbor);
            point = 0.5 + 0.5 * sin(u_time * 0.8 + 6.2831 * point);
            vec2 diff = neighbor + point - fuv;
            float dist = length(diff);
            if (dist < minDist) {
                minDist = dist;
                minPoint = point;
            }
        }
    }
    vec3 col = vec3(0.0);
    col += minPoint.x * vec3(0.2, 0.6, 1.0);
    col += minPoint.y * vec3(1.0, 0.2, 0.6);
    col += minDist * vec3(0.3, 0.8, 0.5);
    col *= smoothstep(0.0, 0.5, minDist);
    col += 0.02 / (minDist + 0.05);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "voronoi,noise,cellular,abstract",
    category: "Generative",
    author: "ShaderLab",
  },
  {
    title: "Ocean Depths",
    description:
      "Layered sine waves simulating deep ocean water with specular highlights and caustic light patterns.",
    glslCode: `float wave(vec2 p, float t) {
    float w = sin(p.x * 1.5 + t) * cos(p.y * 1.2 + t * 0.7);
    w += sin(p.x * 3.0 - t * 0.8) * 0.6 * cos(p.y * 2.8 + t * 0.6);
    w += sin(p.y * 4.0 + t * 1.2) * 0.4;
    return w * 0.15;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float h = 0.0;
    vec2 p = uv * 8.0;
    h += wave(p, u_time);
    h += wave(p * 2.1 + 1.0, u_time * 1.3) * 0.6;
    h += wave(p * 4.3 - 0.5, u_time * 0.9) * 0.35;
    float height = h * 0.5 + 0.5;
    vec3 deep = vec3(0.01, 0.08, 0.25);
    vec3 shallow = vec3(0.05, 0.35, 0.65);
    vec3 foam = vec3(0.7, 0.85, 1.0);
    vec3 col = mix(deep, shallow, smoothstep(0.2, 0.6, height));
    float sparkle = pow(abs(sin((p.x + p.y) * 30.0 + u_time * 2.0)), 20.0);
    col += foam * sparkle * smoothstep(0.6, 0.8, height) * 0.6;
    col += (1.0 - abs(uv.y - 0.5) * 2.0) * 0.1;
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "water,ocean,waves,calm",
    category: "Nature",
    author: "ShaderLab",
  },
  {
    title: "Neon Tunnel",
    description:
      "Retro-futuristic tunnel with glowing neon grids and pulsing colors. Inspired by 80s synthwave aesthetics.",
    glslCode: `void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float tunnel = 0.5 / (radius + 0.1);
    tunnel += sin(angle * 8.0 + u_time * 0.5) * 0.3 / (radius + 0.1);
    tunnel += sin(radius * 15.0 - u_time * 2.0) * 0.2;
    float grid = abs(sin(radius * 20.0 - u_time)) * abs(sin(angle * 12.0 + u_time * 0.3));
    vec3 col = vec3(0.0);
    col += vec3(0.0, 0.8, 1.0) * tunnel * 0.7;
    col += vec3(1.0, 0.2, 0.8) * grid * 0.5;
    col += vec3(1.0, 0.6, 0.0) * (1.0 - smoothstep(0.2, 0.4, radius)) * 0.3;
    col *= smoothstep(1.5, 0.1, radius);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "tunnel,neon,synthwave,retro",
    category: "Abstract",
    author: "ShaderLab",
  },
  {
    title: "Plasma Flow",
    description:
      "Classic plasma effect with smooth color gradients and flowing movement. A timeless demo-scene staple.",
    glslCode: `void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float cx = uv.x + 0.5 * sin(u_time * 0.5);
    float cy = uv.y + 0.5 * cos(u_time * 0.7);
    float v = sin(cx * 10.0 + u_time);
    v += sin((cy * 10.0 + sin(u_time * 0.7)) * 1.2);
    v += sin((cx + cy) * 8.0 + cos(u_time * 0.4));
    v += sin(sqrt(cx * cx + cy * cy) * 12.0 - u_time);
    vec3 col = vec3(0.0);
    col.r = sin(v * 3.14159 + 0.0) * 0.5 + 0.5;
    col.g = sin(v * 3.14159 + 2.094) * 0.5 + 0.5;
    col.b = sin(v * 3.14159 + 4.188) * 0.5 + 0.5;
    col *= 0.8 + 0.2 * sin(v * 6.0);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "plasma,classic,demo-scene,colorful",
    category: "Classic",
    author: "ShaderLab",
  },
  {
    title: "Geometric Dance",
    description:
      "Rotating geometric shapes in a minimal composition. Clean lines, sharp angles, and precise color blocking.",
    glslCode: `float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdTriangle(vec2 p, float s) { p.x = abs(p.x); return max(p.x * 0.866 + p.y * 0.5, -p.y) - s * 0.5; }

vec2 rotate(vec2 p, float a) {
    float s = sin(a), c = cos(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec3 col = vec3(0.05, 0.05, 0.12);
    float t = u_time * 0.4;
    for (int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 p = rotate(uv, t + fi * 1.57);
        float d = sdBox(p + vec2(sin(t * 0.7 + fi) * 0.5, cos(t * 0.6 + fi) * 0.4), vec2(0.3));
        col += vec3(0.8, 0.2 + fi * 0.2, 0.9 - fi * 0.15) * smoothstep(0.02, 0.0, d) * 0.5;
        d = sdTriangle(rotate(p, fi), 0.35);
        col += vec3(0.1 + fi * 0.2, 0.7, 0.3 + fi * 0.1) * smoothstep(0.02, 0.0, d) * 0.4;
    }
    col += 0.02 / (length(uv) + 0.1);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "geometric,shapes,minimal,clean",
    category: "Minimal",
    author: "ShaderLab",
  },
  {
    title: "Fire Nebula",
    description:
      "Swirling fire-like noise with rich warm tones. Volumetric-looking clouds of ember and smoke.",
    glslCode: `float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(sin(dot(i, vec2(12.9898, 78.233))) * 43758.5453,
                   sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453, u.x),
               mix(sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453,
                   sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233))) * 43758.5453, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * fract(noise(p)); p *= 2.0; a *= 0.5; }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;
    vec2 q = uv;
    q.y -= u_time * 0.15;
    float f = fbm(q * 3.5);
    f += fbm(q * 7.0 + f * 0.5) * 0.6;
    float height = 1.0 - uv.y;
    vec3 fire1 = vec3(1.0, 0.3, 0.05);
    vec3 fire2 = vec3(1.0, 0.7, 0.1);
    vec3 smoke = vec3(0.05, 0.02, 0.08);
    vec3 col = mix(smoke, fire1, smoothstep(0.1, 0.5, f) * height);
    col = mix(col, fire2, smoothstep(0.3, 0.7, f) * height * 0.7);
    col += pow(f, 2.0) * vec3(0.3, 0.1, 0.0) * height;
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "fire,nebula,noise,warm",
    category: "Nature",
    author: "ShaderLab",
  },
  {
    title: "Kaleidoscope Dreams",
    description:
      "Symmetric kaleidoscopic patterns unfolding in perpetual motion. Infinity mirrors with vibrant colors.",
    glslCode: `void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float segments = 6.0;
    angle = mod(angle, 3.14159 * 2.0 / segments);
    angle = abs(angle - 3.14159 / segments);
    uv = vec2(cos(angle), sin(angle)) * radius;
    float pattern = sin(uv.x * 8.0 + u_time * 0.8) * cos(uv.y * 8.0 - u_time * 0.6);
    pattern += sin((uv.x + uv.y) * 12.0 + u_time) * 0.5;
    pattern += sin(length(uv) * 15.0 - u_time * 1.2) * 0.4;
    pattern = pattern * 0.5 + 0.5;
    vec3 a = vec3(0.1, 0.0, 0.5);
    vec3 b = vec3(1.0, 0.2, 0.6);
    vec3 c = vec3(0.0, 0.8, 0.9);
    vec3 col = mix(a, b, pattern);
    col = mix(col, c, smoothstep(0.3, 0.7, pattern));
    col += 0.03 / (radius + 0.05);
    col *= smoothstep(1.8, 0.3, radius);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "kaleidoscope,symmetric,colorful,hypnotic",
    category: "Abstract",
    author: "ShaderLab",
  },
  {
    title: "Electric Storm",
    description:
      "Branching lightning patterns across a dark sky. Procedural electric arcs and volumetric glow effects.",
    glslCode: `float hash(vec2 p) { return fract(sin(dot(p, vec2(235.835, 563.293))) * 37485.234); }

float lightning(vec2 p, vec2 a, vec2 b, float w) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    float seg = d / w;
    float wiggle = (hash(vec2(floor(dot(p, vec2(13.0, 17.0))), 0.0)) - 0.5) * 0.8 + 0.5;
    return smoothstep(0.06, 0.0, seg) * wiggle;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec3 col = vec3(0.02, 0.02, 0.06);
    float t = u_time * 0.7;
    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        vec2 start = vec2(sin(t * 0.7 + fi) * 0.6, -0.9);
        vec2 mid = vec2(sin(t + fi) * 0.3, cos(t * 0.8 + fi) * 0.2);
        vec2 end = vec2(cos(t * 0.6 + fi) * 0.6, 0.9);
        float l = lightning(uv, start, mid, 0.02) * 0.4;
        l += lightning(uv, mid, end, 0.015) * 0.6;
        col += vec3(0.4, 0.6, 1.0) * l * 0.7;
        col += vec3(0.8, 0.9, 1.0) * l * l * 0.8;
    }
    col += 0.005 / abs(uv.y) * vec3(0.2, 0.3, 0.5);
    gl_FragColor = vec4(col, 1.0);
}`,
    tags: "lightning,electric,storm, dramatic",
    category: "Nature",
    author: "ShaderLab",
  },
];

async function main() {
  console.log("Clearing existing shaders...");
  await prisma.shader.deleteMany();

  console.log(`Seeding ${shaders.length} shaders...`);
  for (const shader of shaders) {
    await prisma.shader.create({ data: shader });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
