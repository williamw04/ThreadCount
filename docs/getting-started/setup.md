# Setup Guide

This guide covers how to set up your development environment. We recommend using Docker for the simplest local development experience.

---

## Quick Start (Docker - Recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS, Windows, or Linux)
- Docker Compose v2+

### Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key

# AI Services
FAL_API_KEY=your-fal-api-key
GOOGLE_API_KEY=your-gemini-api-key
```

### Running the Application

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts both frontend and backend containers:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health

### Other Commands

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.dev.yml up` | Start without rebuilding |
| `docker compose -f docker-compose.dev.yml down` | Stop containers |
| `docker compose -f docker-compose.dev.yml logs -f` | View logs |
| `docker compose -f docker-compose.dev.yml logs -f backend` | View backend logs only |

---

## Manual Setup (Alternative)

If you prefer to run services locally without Docker, follow these steps.

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

### Running the Development Server

```bash
cd frontend
npm run dev
```

The development server will start at `http://localhost:5173`.

### Other Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting without changes |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run typecheck` | Run TypeScript type checking |

---

## Backend Setup

### Installation

#### 1. Navigate to backend directory

```bash
cd backend
```

#### 2. Create and activate virtual environment

**Unix (macOS/Linux):**
```bash
python3 --version  # Verify Python 3.12+
python3 -m venv venv
source venv/bin/activate
```

**Windows (PowerShell):**
```powershell
python --version  # Verify Python 3.12+
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> **Note**: If you get an execution policy error on Windows, run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_ANON_KEY=your-anon-key
FAL_API_KEY=your-fal-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Running the Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`.

### Deactivating the Virtual Environment

| Platform | Command |
|----------|---------|
| Unix (macOS/Linux) | `deactivate` |
| Windows (PowerShell/CMD) | `deactivate` |

---

---

## Getting Credentials

### Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy URL, anon key, and service role key

### fal.ai

1. Go to https://fal.ai/dashboard/keys
2. Create new API key
3. Copy to backend `.env` only (never frontend)

### Google Gemini

1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Copy to backend `.env`

---

## Verification

Once both servers are running:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health

---

## See Also

- [Frontend Guide](../guides/FRONTEND.md)
- [Backend Guide](../guides/BACKEND.md)
- [Architecture](./architecture.md)
