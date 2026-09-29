# Base44 Dev Environment

## Overview
TransitPulse — a React 19 + Vite 8 frontend (Tailwind, react-router, react-leaflet, recharts, socket.io-client) for a real-time public transport tracking system.

**Frontend-only in this repo.** The app expects a backend API + Socket.IO server (see `.env.example`: `VITE_API_URL` and `VITE_SOCKET_URL`, both defaulting to `http://localhost:5000`). That backend is NOT part of this repository. The frontend handles API/socket failures gracefully (try/catch in contexts), so it renders with empty data when the backend is absent.

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Web entry point: host port 3000 → container 5173 (Vite dev server).
- `node:22-bookworm-slim` base; source bind-mounted at `/app`; `npm ci` runs on startup, then `vite dev --host 0.0.0.0`.
- Live reload: edits to `src/` hot-reload in the preview automatically.

## Notes
- No external credentials/secrets required to boot.
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed so Vite accepts the preview's external hostname.
- To make live data/auth work, a backend implementing the API in `src/services/api.js` and Socket.IO events in `src/context/TransitContext.jsx` must be provided and `VITE_API_URL`/`VITE_SOCKET_URL` pointed at it.
