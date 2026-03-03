# Supabase Setup Guide

**Version**: 1.1.0
**Last Updated**: 2026-03-02

## Database Migrations

The database schema is managed via SQL migrations located in `supabase/migrations/`.

### Applying Migrations (Local)

```bash
supabase db push
```

### Applying Migrations (Deployed)

Copy the contents of the files in `supabase/migrations/` (in order) and paste them into the Supabase SQL Editor.

## Storage Buckets

The following public buckets must be created in Supabase Storage:

1.  `avatars` - User profile photos and AI models
2.  `wardrobe` - Clothing item images
3.  `generated` - AI try-on output images

## Row Level Security (RLS)

RLS is enabled for all tables. Users can only read and write their own data (identified by `auth.uid()`).

- **Profiles**: `select`, `insert`, `update` restricted to owner.
- **Avatars**: `select`, `insert`, `update`, `delete` restricted to owner.
- **Wardrobe Items**: `select`, `insert`, `update`, `delete` restricted to owner.

---

## How It Fits Together

```
┌──────────────┐       ┌───────────────────────┐       ┌──────────────┐
│   Frontend   │──────▶│   Supabase Auth        │──────▶│   Google     │
│  (Vite app)  │       │  (handles login,       │       │   OAuth      │
│  port 3000   │       │   tokens, sessions)    │       │              │
└──────┬───────┘       └───────────────────────┘       └──────────────┘
       │
       │  Bearer <jwt>
       ▼
┌──────────────┐
│   FastAPI    │  ← verifies Supabase JWT
│  port 8000   │
└──────────────┘
```

The frontend talks to **two** services:

1. **Supabase** — for authentication (login, signup, Google OAuth, session management)
2. **FastAPI** — for everything else (wardrobe, outfits, AI try-on)

The JWT that Supabase issues is sent to FastAPI in the `Authorization` header so FastAPI knows who the user is.

---

## Two Modes of Development

### Mode A: Deployed Supabase (recommended to start)

Uses your cloud Supabase project. Google OAuth works out of the box.

**When to use**: Testing Google login, demoing, first-time setup.

### Mode B: Local Supabase

Runs Supabase on your machine via Docker. Fast, offline, free.

**When to use**: Day-to-day development, testing email/password login, running tests.

**Limitation**: Google OAuth requires extra config (redirect URIs must point to your local instance).

---

## Mode A: Deployed Supabase Setup

### Prerequisites

- A Supabase project at [supabase.com](https://supabase.com)
- A Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### Step 1: Get your Supabase credentials

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → your project
2. Navigate to **Settings → API**
3. Copy:
   - **Project URL** (e.g. `https://lfyujnnwpfotoelcxdzd.supabase.co`)
   - **anon public key** (the `eyJ...` or `sb_publishable_...` string)

### Step 2: Enable Google Auth in Supabase dashboard

1. Go to **Authentication → Providers → Google**
2. Toggle **enabled**
3. Enter your **Google Client ID** (from Google Cloud Console)
4. Enter your **Google Client Secret** (from Google Cloud Console)
5. Save

### Step 3: Configure redirect URLs in Supabase dashboard

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add to **Redirect URLs**: `http://localhost:3000`

### Step 4: Configure Google Cloud Console

1. Go to [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
5. Save

### Step 5: Update .env.local

```bash
# Point to your deployed Supabase
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-anon-key>"

# Not needed for deployed mode — secret is stored in Supabase dashboard
# SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=""

VITE_API_BASE_URL="http://localhost:8000"
```

### Step 6: Start the app

```bash
npm run dev
```

Visit `http://localhost:3000`. Click "Continue with Google" — it should redirect to Google, then back to `/onboarding`.

---

## Mode B: Local Supabase Setup

### Prerequisites

- [Docker Desktop](https://docs.docker.com/desktop/) installed and running
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`brew install supabase/tap/supabase`)

### Step 1: Start local Supabase

```bash
supabase start
```

This prints something like:

```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJ...
```

Copy the **API URL** and **anon key**.

### Step 2: Update .env.local

```bash
# Point to local Supabase
VITE_SUPABASE_URL="http://localhost:54321"
VITE_SUPABASE_ANON_KEY="<anon-key-from-supabase-start>"

# Google OAuth secret (read by supabase/config.toml)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

VITE_API_BASE_URL="http://localhost:8000"
```

### Step 3: Configure Google Cloud Console for local

Add these redirect URIs in your Google OAuth Client:

```
http://localhost:54321/auth/v1/callback
```

Add to Authorized JavaScript origins:

```
http://localhost:3000
```

### Step 4: Verify config.toml

The file `supabase/config.toml` should contain:

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000"]

[auth.external.google]
enabled = true
client_id = "<your-google-client-id>"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
```

The `env(...)` syntax reads the value from `.env.local` at startup.

### Step 5: Restart Supabase (if it was already running)

```bash
supabase stop
supabase start
```

This reloads `config.toml` and picks up the new env vars.

### Step 6: Start the app

```bash
npm run dev
```

---

## Switching Between Modes

The only thing that changes between modes is the two `VITE_SUPABASE_*` values in `.env.local`:

| Variable                                      | Mode A (Deployed)         | Mode B (Local)            |
| --------------------------------------------- | ------------------------- | ------------------------- |
| `VITE_SUPABASE_URL`                           | `https://xxx.supabase.co` | `http://localhost:54321`  |
| `VITE_SUPABASE_ANON_KEY`                      | Key from dashboard        | Key from `supabase start` |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` | Not needed (in dashboard) | Needed (for config.toml)  |

**After changing `.env.local`, restart the dev server** (`Ctrl+C`, then `npm run dev`). Vite only reads env vars at startup.

### Quick switch tip

You can keep two env files and swap:

```bash
# Save your current config
cp .env.local .env.deployed

# Switch to local
cp .env.local.local .env.local
npm run dev

# Switch back to deployed
cp .env.deployed .env.local
npm run dev
```

---

## Google OAuth Redirect URIs — Summary

You may need multiple redirect URIs in Google Cloud Console depending on which modes you use:

| Mode              | Redirect URI                                         |
| ----------------- | ---------------------------------------------------- |
| Deployed Supabase | `https://<project-ref>.supabase.co/auth/v1/callback` |
| Local Supabase    | `http://localhost:54321/auth/v1/callback`            |

Both can be added simultaneously — Google allows multiple redirect URIs.

---

## Troubleshooting

### "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"

- Check `.env.local` exists and has both variables filled in
- Restart the dev server (Vite only reads env vars at startup)
- Make sure variable names match exactly (e.g. `VITE_SUPABASE_ANON_KEY`, not `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)

### Google login redirects back to the login page

- Auth initialization race condition. Check that `ProtectedRoute` uses `isInitialized` (already fixed in our codebase).
- Check browser console for errors.

### "redirect_uri_mismatch" error from Google

- The redirect URI in Google Cloud Console must exactly match what Supabase is using.
- For deployed: `https://<project-ref>.supabase.co/auth/v1/callback`
- For local: `http://localhost:54321/auth/v1/callback`

### Email/password login fails locally

- Make sure `supabase start` is running.
- Check that `VITE_SUPABASE_URL` points to `http://localhost:54321`.

### Token/session not persisting after page refresh

- Supabase JS stores tokens in `localStorage`. Check browser DevTools → Application → Local Storage.
- Make sure `App.tsx` calls `initialize()` on mount.

---

## File Reference

| File                         | Purpose                                              |
| ---------------------------- | ---------------------------------------------------- |
| `.env.local`                 | Your actual secrets and config (gitignored)          |
| `.env.example`               | Template — copy to `.env.local` and fill in          |
| `supabase/config.toml`       | Local Supabase config (committed)                    |
| `src/shared/api/supabase.ts` | Supabase JS client initialization                    |
| `src/features/auth/api.ts`   | Auth functions (login, signup, Google OAuth, logout) |
| `src/features/auth/store.ts` | Zustand store with `onAuthStateChange` listener      |
