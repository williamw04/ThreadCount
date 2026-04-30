# Seamless

Fashion web app where users upload photos to create avatars, build virtual wardrobes, assemble outfits, and generate AI images of themselves wearing those outfits.

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4, Zustand |
| Backend | Python 3.12+, FastAPI, Supabase |
| Testing | Vitest, React Testing Library, pytest |

## Project Structure

```
frontend/          # React SPA
backend/           # FastAPI service
docs/              # Feature specs, design docs, guides
supabase/          # DB & storage config
```

## Learn More

| Guide | Description |
|-------|-------------|
| [docs/intro.md](docs/intro.md) | Welcome and overview |
| [docs/getting-started/setup.md](docs/getting-started/setup.md) | Development environment setup |
| [docs/getting-started/architecture.md](docs/getting-started/architecture.md) | System shape, frontend domains, layer rules |
| [docs/guides/frontend.md](docs/guides/frontend.md) | Frontend patterns, conventions, component structure |
| [docs/guides/backend.md](docs/guides/backend.md) | Backend patterns, API endpoints, setup |
| [docs/features/](docs/features/) | Feature specifications |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
