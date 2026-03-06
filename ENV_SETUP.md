# Environment Configuration Guide

This guide explains how to configure environment variables for Seamless development.

## Overview

Seamless has two separate environments:
- **Frontend** (`frontend/`): React app with client-side variables
- **Backend** (`backend/`): FastAPI server with server-side variables

**Critical Security Rules:**
- ✅ `.env.example` files: Committed to git (safe, templates only)
- ✅ `.env` files: Gitignored (contain secrets)
- ❌ NEVER commit `.env` or `.env.local` files
- ❌ NEVER put backend API keys in frontend env vars (visible in browser)

---

## Quick Setup

### 1. Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-service-role-secret-key

# fal.ai
FAL_API_KEY=your-fal-api-key
```

**Important:** Backend uses `SUPABASE_SECRET_KEY` (service role) to bypass RLS. Frontend uses `SUPABASE_ANON_KEY` only.

### 2. Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (only for local Supabase)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend URL
VITE_API_BASE_URL=http://localhost:8000
```

**Note:** Frontend uses `VITE_SUPABASE_ANON_KEY` which is safe to expose in client code.

---

## Environment Variables Reference

### Frontend Variables (`frontend/.env.local`)

| Variable | Required | Description | Where to Find |
|----------|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | Supabase Dashboard > Settings > API |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` | No | Google OAuth secret (local dev only) | Google Cloud Console > Credentials |
| `VITE_API_BASE_URL` | Yes | Backend API URL | Default: `http://localhost:8000` |

### Backend Variables (`backend/.env`)

| Variable | Required | Description | Where to Find |
|----------|----------|-------------|---------------|
| `SUPABASE_URL` | Yes | Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service role key | Supabase Dashboard > Settings > API |
| `FAL_API_KEY` | Yes | fal.ai API key | https://fal.ai/dashboard/keys |

---

## Security Best Practices

### 1. Frontend Variables (Public)
- Any variable starting with `VITE_` is bundled into the client JavaScript
- Visible in browser DevTools > Sources
- **Never store:** Backend API keys, database passwords, secrets
- **Safe to store:** URLs, public keys, feature flags

### 2. Backend Variables (Private)
- Only visible to the server
- Use `SUPABASE_SECRET_KEY` (service role) for admin operations
- Frontend cannot access these values

### 3. Key Management
- Rotate secrets regularly
- Use different keys for dev/staging/production
- Never share `.env` files in chat/commits
- Use environment-specific env files in production (not committed)

---

## Common Issues

### "No authentication token available"
- Frontend can't connect to backend
- Check `VITE_API_BASE_URL` matches backend address
- Verify backend is running on correct port

### "RLS policy violation"
- Backend using wrong Supabase key
- Ensure backend uses `SUPABASE_SECRET_KEY`, not anon key
- Service role key has admin privileges to bypass RLS

### "CORS error"
- Backend rejecting frontend requests
- Check `backend/app/main.py` CORS settings
- Ensure frontend origin is in `allow_origins` list

---

## Production Deployment

For production, do NOT use `.env` files. Instead:

### Frontend (Vercel/Netlify/etc.)
Set environment variables in deployment platform dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (production backend URL)

### Backend (Railway/Render/etc.)
Set environment variables in deployment platform dashboard:
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `FAL_API_KEY`

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
3. Copy to backend `.env` only (NEVER frontend)

### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 client ID
3. Add `http://localhost:5173/auth/callback` to authorized redirect URIs
4. Copy client secret to local Supabase dashboard

---

## Troubleshooting

### Verify Environment Setup

```bash
# Frontend - check if env vars are loaded
cd frontend
npm run dev
# Check browser console for any undefined variables

# Backend - check if env vars are loaded
cd backend
python -c "from app.config import get_settings; print(get_settings())"
```

### Reset Environment

```bash
# Backend
cd backend
rm .env
cp .env.example .env
# Fill in values again

# Frontend
cd frontend
rm .env.local
cp .env.example .env.local
# Fill in values again
```

---

## File Reference

- `frontend/.env.example` - Frontend template (committed)
- `frontend/.env.local` - Frontend actual values (gitignored)
- `backend/.env.example` - Backend template (committed)
- `backend/.env` - Backend actual values (gitignored)
- `.gitignore` - Ensures `.env` files are never committed

---

## Related Documentation

- [BACKEND.md](../docs/BACKEND.md) - Backend setup and API endpoints
- [FRONTEND.md](../docs/FRONTEND.md) - Frontend architecture and patterns
- [Supabase Setup Guide](../docs/guides/supabase-setup.md) - Supabase configuration
