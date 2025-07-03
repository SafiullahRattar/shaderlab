# ShaderLab

**Creative GLSL Shader Gallery** — Write, preview, and share real-time fragment shaders.

> A full-stack web application demonstrating modern software engineering practices, real-time WebGL rendering, and production deployment patterns.

![ShaderLab](docs/screenshots/gallery.png)

---

## Quick Start

```bash
docker compose up
```

Then open [http://localhost:5173](http://localhost:5173) for the frontend, or [http://localhost:3001/api/health](http://localhost:3001/api/health) for the API health check.

The database seeds automatically on first run with 10 beautiful pre-made shaders.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  React SPA  │────▶│  Express API │────▶│   SQLite   │
│  (Vite)     │     │  (Node.js)   │     │  (Prisma)  │
│  Port 5173  │     │  Port 3001   │     │            │
└─────────────┘     └──────────────┘     └────────────┘
```

- **Frontend**: React 18 + TypeScript + Vite + React Router
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: SQLite (via Prisma, zero-config)
- **Rendering**: Raw WebGL fragment shader pipeline (no Three.js or frameworks)
- **Containerization**: Docker + docker compose (dev + prod configs)

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, TypeScript, Vite          |
| Routing     | React Router v6                     |
| Backend     | Express 4, TypeScript               |
| ORM         | Prisma (SQLite provider)            |
| Rendering   | WebGL 1.0 (native canvas)           |
| Styling     | CSS custom properties, DM Sans, JetBrains Mono |
| Dev Tools   | ESLint, tsx (TypeScript runner)     |
| CI/CD       | GitHub Actions                      |
| Deployment  | Docker, docker compose, Nginx       |

---

## Project Structure

```
shaderlab/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Navbar, Footer, WebGLPreview, ShaderCard, etc.
│   │   ├── pages/            # Gallery, ShaderView, ShaderEditor
│   │   ├── hooks/            # useShaders (data fetching)
│   │   ├── lib/              # API client
│   │   ├── App.tsx           # Router setup
│   │   └── main.tsx          # Entry point
│   ├── Dockerfile            # Dev Dockerfile
│   ├── Dockerfile.prod       # Production Dockerfile (Nginx + static build)
│   └── nginx.conf            # Nginx config for production
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/           # REST API routes (shaders CRUD)
│   │   ├── lib/              # Prisma client singleton
│   │   └── index.ts          # Express server entry
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── seed.ts           # Seed data (10 shaders)
│   ├── Dockerfile            # Dev Dockerfile
│   └── Dockerfile.prod       # Production Dockerfile
├── docker-compose.yml        # Development setup
├── docker-compose.prod.yml   # Production-like setup
├── .github/workflows/ci.yml  # CI pipeline
└── README.md
```

---

## API Endpoints

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | `/api/shaders`       | List shaders (paginated, searchable) |
| GET    | `/api/shaders/:id`   | Get single shader        |
| POST   | `/api/shaders`       | Create new shader        |
| PUT    | `/api/shaders/:id`   | Update shader            |
| DELETE | `/api/shaders/:id`   | Delete shader            |
| GET    | `/api/health`        | Health check             |

Query parameters for `GET /api/shaders`:
- `page` — page number (default: 1)
- `limit` — items per page (default: 12, max: 50)
- `search` — full-text search across title, description, and tags
- `category` — filter by exact category match
- `tag` — filter by tag substring

---

## Development

### Without Docker

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Type Checking & Linting

```bash
# Backend
cd backend && npm run typecheck && npm run lint

# Frontend
cd frontend && npm run typecheck && npm run lint
```

---

## Seed Shaders

The app ships with 10 pre-made GLSL fragment shaders:

1. **Cosmic Bloom** — Fractal noise with shifting color harmonies
2. **Raymarch Primitives** — Real-time ray marching with soft shadows
3. **Voronoi Cells** — Animated cellular noise patterns
4. **Ocean Depths** — Layered sine waves with caustic highlights
5. **Neon Tunnel** — Retro-futuristic synthwave tunnel
6. **Plasma Flow** — Classic demo-scene plasma effect
7. **Geometric Dance** — Rotating geometric shapes
8. **Fire Nebula** — FBM noise fire simulation
9. **Kaleidoscope Dreams** — Symmetric kaleidoscopic patterns
10. **Electric Storm** — Procedural lightning arcs

---

## Production Deployment

```bash
docker compose -f docker-compose.prod.yml up --build
```

The production setup uses:
- **Frontend**: Nginx serving static files, proxying `/api/` to backend
- **Backend**: Compiled TypeScript running on Node.js
- **Database**: SQLite with volume-mounted data directory

---

## License

MIT

<!-- -->
<!-- -->
<!-- -->
<!-- -->