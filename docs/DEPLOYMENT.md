# Deployment Guide

**Version**: 1.0.0
**Last Updated**: 2026-04-29

## Overview

This guide covers deploying the Seamless app to production using:
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **Database/Auth**: Supabase (already configured)

## Prerequisites

- GitHub account with this repository pushed
- Supabase project (already set up)
- API keys: `FAL_API_KEY`, `GOOGLE_API_KEY` (optional)

## Architecture

```
Vercel (frontend) --> Render (backend) --> Supabase (database/auth)
                                |
                                --> fal.ai (AI generation)
```

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (no credit card required for free tier)
3. Verify your email

### Step 2: Create Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Field | Value |
|-------|-------|
| Name | `seamless-backend` (or your preferred name) |
| Region | Oregon (or closest to you) |
| Runtime | **Python 3** |
| Branch | `main` |
| **Root Directory** | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Plan | **Free** |

4. Click **Advanced** → Add environment variables individually:

> **Note**: Use **Environment Variables** (not Secret Files). Your code already reads env vars via `pydantic_settings` and `os.getenv()`. No code changes needed.

| Key | Value | Where to find |
|-----|-------|---------------|
| `SUPABASE_URL` | `https://lfyujnnwpfotoelcxdzd.supabase.co` | Your `backend/.env` or Supabase Dashboard |
| `SUPABASE_SECRET_KEY` | Service role key | Your `backend/.env` (starts with `sb_secret_`) |
| `FAL_API_KEY` | Your fal.ai key | Your `backend/.env` |
| `GOOGLE_API_KEY` | Gemini API key | Your `backend/.env` (optional but recommended) |
| `CORS_ORIGINS` | Leave empty for now | Will update after frontend deployment |

5. Click **Create Web Service**

### Step 3: Wait for Deployment

- Render will build and deploy (2-5 minutes)
- Note your backend URL: `https://seamless-backend.onrender.com`
- Free tier services sleep after 15 min idle (first request takes ~30 sec to wake)

### Step 4: Verify Backend

Visit: `https://seamless-backend.onrender.com/health`

Should return: `{"status":"ok"}`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **Add New...** → **Project**
2. Select your GitHub repository
3. Configure:

| Field | Value |
|-------|-------|
| Framework Preset | **Vite** (auto-detected) |
| Root Directory | `frontend` |
| Build Command | `npm run build` (default) |
| Output Directory | `build` (default) |

### Step 3: Add Environment Variables

Click **Environment Variables** and add:

> **Note**: Copy values from your `frontend/.env.local` file. Vite automatically reads `VITE_*` prefix vars at build time.

| Key | Value | Where to find |
|-----|-------|---------------|
| `VITE_SUPABASE_URL` | `https://lfyujnnwpfotoelcxdzd.supabase.co` | Your `frontend/.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Anon key (starts with `sb_publishable_`) | Your `frontend/.env.local` |
| `VITE_API_BASE_URL` | `https://your-backend-name.onrender.com` | Your Render backend URL |

**Important**: Use the **anon/public key** here (safe for frontend). The secret key stays on the backend only.

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

---

## Part 3: Connect Frontend and Backend

### Step 1: Update Backend CORS

1. Go to Render Dashboard → `seamless-backend` → **Environment**
2. Update `CORS_ORIGINS` to your Vercel URL:

```
https://your-app.vercel.app
```

For multiple origins (dev + prod), separate with commas:
```
http://localhost:3000,https://your-app.vercel.app
```

3. Click **Save Changes** → Render will auto-redeploy

### Step 2: Update Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your production URL:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-app.vercel.app` |
| Redirect URLs | `https://your-app.vercel.app` |

3. Click **Save**

### Step 3: Update Google OAuth (if used)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://<your-supabase-ref>.supabase.co/auth/v1/callback
   ```
   (This should already exist from local setup)

5. Click **Save**

---

## Part 4: Verify Deployment

### Test the Full Flow

1. Visit `https://your-app.vercel.app`
2. Try logging in (email or Google OAuth)
3. Navigate through the app
4. Check backend logs in Render dashboard if errors occur

### Check Logs

| Platform | Where to find logs |
|----------|-------------------|
| Vercel | Dashboard → Project → **Deployments** → Click deployment → **Functions** |
| Render | Dashboard → Service → **Logs** |

---

## How Environment Variables Work

Your code already handles environment variables correctly—no changes needed.

### Backend (Python)

| Method | File | How it reads env vars |
|--------|------|----------------------|
| `pydantic_settings.BaseSettings` | `backend/app/config.py` | Auto-reads `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `FAL_API_KEY`, `GOOGLE_API_KEY` |
| `os.getenv()` | `backend/app/main.py` | Reads `CORS_ORIGINS` directly |

**On Render**: Environment variables are set in the system environment. `BaseSettings` picks them up automatically (env vars take precedence over `.env` file).

**On local dev**: Variables in `backend/.env` are read by `BaseSettings`.

### Frontend (Vite/React)

| Method | How it works |
|--------|--------------|
| `import.meta.env.VITE_*` | Vite reads `VITE_*` prefixed vars at build time and embeds them in the build output |

**On Vercel**: Set vars in dashboard—they're injected during build.

**On local dev**: Variables in `frontend/.env.local` are read by Vite.

---

## Environment Variables Summary

### Frontend (Vercel)

Copy from your `frontend/.env.local` file:

| Variable | Example | Notes |
|----------|---------|-------|
| `VITE_SUPABASE_URL` | `https://lfyujnnwpfotoelcxdzd.supabase.co` | From Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_xxx...` | **Public/anon key** (safe in frontend) |
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` | Your Render backend URL |

### Backend (Render)

Copy from your `backend/.env` file:

| Variable | Example | Notes |
|----------|---------|-------|
| `SUPABASE_URL` | `https://lfyujnnwpfotoelcxdzd.supabase.co` | Same as frontend |
| `SUPABASE_SECRET_KEY` | `sb_secret_xxx...` | **Service role key** (NOT anon key) |
| `FAL_API_KEY` | `cfb95676-xxx...` | From fal.ai dashboard |
| `GOOGLE_API_KEY` | `AIzaSyxxx...` | For Gemini AI analysis |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Set after frontend deployed |

---

## Free Tier Limitations

### Render

- 750 hours/month (enough for 1 service running continuously)
- 512MB RAM
- Sleeps after 15 min idle (30 sec cold start)
- No custom domain on free tier

### Vercel

- 100GB bandwidth/month
- Unlimited deployments
- Custom domains included
- Auto-deploys on git push

### Supabase

- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 5GB bandwidth

---

## Troubleshooting

### "CORS error" in browser console

- Verify `CORS_ORIGINS` on Render matches your Vercel URL exactly
- Check for trailing slashes (remove them)
- Ensure protocol is included (`https://`)

### Login redirects back to login page

- Check Supabase redirect URLs include your production URL
- Verify `VITE_SUPABASE_URL` and `VITE_API_BASE_URL` are set in Vercel
- Check browser console for errors

### Backend returns 500 error

- Check Render logs for details
- Verify `SUPABASE_SECRET_KEY` is correct (not anon key)
- Ensure `FAL_API_KEY` is valid

### First request is slow (30+ seconds)

- This is normal for Render free tier (cold start)
- Service wakes up after first request
- Subsequent requests are fast (~100ms)

### Images not loading

- Check Supabase storage buckets are created: `avatars`, `wardrobe`, `generated`
- Verify storage policies allow public read

---

## Future: Moving Beyond Free Tier

When you need more:

| Need | Solution |
|------|----------|
| No cold starts | Upgrade Render to Starter ($7/month) |
| More storage | Upgrade Supabase to Pro ($25/month) |
| Custom backend domain | Upgrade Render or use VPS |
| Higher bandwidth | Vercel Pro ($20/month) |

---

## Quick Reference

### URLs after deployment

| Service | URL format |
|---------|------------|
| Frontend | `https://your-app.vercel.app` |
| Backend | `https://seamless-backend.onrender.com` |
| Health check | `https://seamless-backend.onrender.com/health` |

### Useful commands

```bash
# Check backend health
curl https://seamless-backend.onrender.com/health

# View frontend build locally
cd frontend && npm run build && npm run preview

# Test CORS
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://seamless-backend.onrender.com/health
```