# Nexa Arena — Cinematic Gaming Web App (Prototype)

Welcome to Nexa Arena — a cinematic, modular, production-grade web app prototype combining a cinematic pre-landing animation, dark neon landing page, player dashboard, fullscreen 3D Car Customization Studio (with front-camera hand-gesture rotation), a mini racing game, tournaments, and full auth & real-time features.

This repository is a fully working codebase with:

- Modern React + Vite front-end
- Three.js-based 3D viewer and GLTF loader
- MediaPipe Hands integration for front-camera hand-gesture rotation & zoom
- Express.js server with SQLite persistence, JWT auth, and Socket.io real-time channels
- Mini racing game (arcade-style) implemented with Three.js
- Tournament & drifting championship endpoints and UI
- Smooth cinematic animations, motion UX, and responsive layout
- Clear extension points for AAA assets, high-quality models, and production hardening

Important note about assets and AAA fidelity
- High-fidelity car models, studio HDRIs, cinematic soundtracks, and bespoke fonts are not embedded here for licensing reasons.
- The codebase includes a loader and an assets pipeline; to obtain AAA visuals, drop high-quality GLTF/GLB models, HDRIs, and textures into `client/public/assets/` (structure shown below). The app will load them dynamically.
- The integrated MediaPipe hand-tracking works locally in the browser but requires camera permission. For real deployments, include privacy notices and use HTTPS.

What is included (high-level)
- Prelanding cinematic with a scripted timeline (Three.js + CSS/WebGL)
- Landing page with animated neon hero and micro-interactions
- Fullscreen Car Customization Studio:
  - Three.js PBR materials, environment map support, bloom, and realistic post-processing
  - GLTF/GLB loader for supercars (Ferrari, Lamborghini, etc.)
  - Hand-gesture rotation & pinch-zoom via MediaPipe Hands (front camera)
  - Parts swap, paint, decals, underglow, save/load designs
- Mini racing arcade with pickup points, scoring & unlocks
- Tournament registration, profiles, tournament listings, and analytics
- Auth modals with JWT-based API and real-time validation
- Socket.io for live match updates, leaderboards, and tournament notifications

Run locally (development)
1. Clone the repo.
2. Install dependencies:
   - root: `npm install`
   - run both server & client: `npm run dev`
3. Open http://localhost:5173

Folder layout (key)
- server/ — Express API, SQLite DB, Socket.io
- client/ — Vite React app with Three.js + MediaPipe
- client/public/assets/ — (place your models, textures, HDRIs here)
  - models/
    - ferrari.glb
    - lambo.glb
    - bmw.glb
    - gtr.glb
  - env/
    - studio.hdr
  - decals/
  - fonts/

Security & Production notes
- Replace the demo JWT secret with a secure secret stored in env vars.
- Serve via HTTPS and enable CORS & rate limiting.
- Use a production-grade DB (Postgres) and object storage (S3) for models & user uploads.
- Use a proper CI/CD pipeline and asset pipeline for optimized GLTFs.

Credits
- Prototype code assembled by the assistant. Use licensed assets for any production release.

Enjoy exploring the code — key files are below.