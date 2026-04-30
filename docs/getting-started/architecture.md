# Architecture

This document covers the system architecture, frontend structure, and development conventions.

## System Shape

Seamless is a full-stack fashion application in one repository.

- `frontend/`: React SPA for auth, onboarding, dashboard, wardrobe, and outfit building.
- `backend/`: FastAPI service for business logic and integrations.
- `supabase/`: database, auth, and storage configuration.

### Data Flow

```
React frontend <-> FastAPI backend <-> Supabase
                          |
                          -> fal.ai (AI image generation)
```

## Frontend Structure

```
frontend/src/
|- features/    # feature domains
|- shared/      # reusable ui and api utilities
|- routes/      # router definition
|- App.tsx      # app bootstrap
```

## Implemented Frontend Domains

### Auth
- Login and signup pages
- Session initialization
- Protected route guard

### Onboarding
- Protected onboarding page

### Dashboard
- Protected post-auth landing page

### Wardrobe
- Wardrobe browsing and management UI

### Outfit Builder
- Outfit composition flow

### Present But Not Fully Implemented
- `profile` has API code but no active route
- Placeholder routes: outfits, previous-looks, analysis, profile

## Layer Rules

Within a feature domain, dependencies flow forward only:

```
Types -> API -> Stores -> Components -> Pages
```

### Constraints

- Dependencies move forward only
- Shared code belongs in `frontend/src/shared/`
- Cross-feature reuse through shared primitives or types, not direct imports

## Current Route Map

| Route | Status | Auth |
|-------|--------|------|
| `/` | redirect to `/login` | No |
| `/login` | implemented | No |
| `/signup` | implemented | No |
| `/onboarding` | implemented | Yes |
| `/dashboard` | implemented | Yes |
| `/wardrobe` | implemented | Yes |
| `/outfit-builder` | implemented | Yes |

### Planned Routes

- `/outfits`
- `/previous-looks`
- `/analysis`
- `/profile`

## Quality Constraints

- Frontend files should stay under 300 lines
- Validate API responses with Zod at the boundary
- Keep tests close to features and shared primitives
- Desktop support starts at `1024px`
- Outfit builder uses viewport-locked shell (`100dvh`)

## Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| TypeScript (strict) | Type safety |
| Vite 7 + SWC | Build and dev server |
| React Router v7 | Client routing |
| Tailwind CSS v4 | Styling |
| Zustand | Client state |
| Zod | Runtime validation |
| Vitest + React Testing Library | Testing |

### Backend

| Tool | Purpose |
|------|---------|
| Python 3.12+ | Runtime |
| FastAPI | Web framework |
| Uvicorn | ASGI server |
| Supabase | Database and storage |
| fal-client | AI image generation |
| Google GenerativeAI | AI image analysis |
| Pydantic | Data validation |

## See Also

- [Setup Guide](./setup.md)
- [Frontend Guide](../guides/FRONTEND.md)
- [Backend Guide](../guides/BACKEND.md)
- [Decisions](../decisions/index.md)
