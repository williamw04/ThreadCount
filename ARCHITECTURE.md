# Architecture

**Version**: 1.0.0
**Last Updated**: 2026-02-12

## Overview

Seamless is a fashion web app. This document describes the **frontend** architecture. The backend (Python + FastAPI + Supabase) is a separate service.

The frontend is a React SPA that communicates with the FastAPI backend via REST API. All business logic and data persistence lives in the backend. The frontend handles presentation, local state, and user interactions.

## System Architecture

```
┌─────────────────────┐         ┌───────────────────────┐         ┌──────────────────┐
│   React Frontend    │  HTTP   │   FastAPI Backend     │         │    Supabase      │
│   (this repo)       │ ──────> │   (separate repo)     │ ──────> │                  │
│                     │  JSON   │                       │         │  • Postgres DB   │
│                     │ <────── │                       │ <────── │  • Auth          │
│                     │         │                       │         │  • Storage       │
└─────────────────────┘         └───────────────────────┘         └──────────────────┘
```

## Domain Map

### Auth (`src/features/auth/`)
- Login, signup, password reset
- Session/token management on frontend
- Protected route guards
- Dependencies: None (foundational)

### User Profile (`src/features/profile/`)
- Avatar photo upload and management
- User preferences and settings
- Account lifecycle (edit profile, delete account)
- Dependencies: Auth

### Wardrobe (`src/features/wardrobe/`)
- Upload and process garment images (background removal, compression)
- Categorize and label clothing items
- Browse, search, and filter wardrobe
- Edit and delete items
- Dependencies: Auth

### Outfit Builder (`src/features/outfit-builder/`)
- Flatlay canvas for assembling outfits
- Drag items from wardrobe to canvas
- Save outfit combinations
- Dependencies: Auth, Wardrobe

### Try-On (`src/features/try-on/`)
- Select outfit or individual items
- Trigger AI image generation (via backend)
- View and save generated images to "Previous Looks"
- Style-based generation (select a style, generate outfit)
- Dependencies: Auth, Wardrobe, Outfit Builder

### Inspiration (`src/features/inspiration/`)
- Save clothing/outfits user doesn't own
- Browse inspiration gallery
- Dependencies: Auth

### Analysis (`src/features/analysis/`)
- Request AI style analysis (colors, styles that suit user)
- View recommendations
- Generate outfits based on analysis
- Dependencies: Auth, User Profile

## Layer Structure

Within each domain, code is organized into layers. Dependencies flow forward (left to right):

```
Types → API → Stores → Components → Pages
```

### Layer Descriptions

**Types** (`types.ts` or `types/`)
- TypeScript interfaces, enums, zod schemas
- Shared data shapes for the domain
- No logic, no imports from other layers
- Dependencies: None

**API** (`api.ts` or `api/`)
- HTTP calls to FastAPI backend
- Request/response type definitions
- Response validation with zod schemas (parse at boundary)
- Dependencies: Types only

**Stores** (`store.ts` or `stores/`)
- Zustand stores for domain state
- Client-side business logic
- Caching and optimistic updates
- Dependencies: Types, API

**Components** (`components/`)
- React components specific to this domain
- Presentational and container components
- Dependencies: Types, Stores

**Pages** (`pages/`)
- Route-level components
- Page layout and composition
- Dependencies: Types, Stores, Components

### Shared Layer

Cross-cutting code lives in `src/shared/`:

**UI** (`src/shared/ui/`)
- Reusable UI primitives: Button, Input, Card, Modal, etc.
- Built on Radix UI where applicable
- No domain logic

**Hooks** (`src/shared/hooks/`)
- Shared custom hooks (useDebounce, useMediaQuery, etc.)
- No domain-specific logic

**Utils** (`src/shared/utils/`)
- Formatting, validation helpers
- Image processing utilities
- No domain-specific logic

**API Client** (`src/shared/api/`)
- Base HTTP client configuration
- Auth token injection
- Error handling wrapper

## Package Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── SignupPage.tsx
│   ├── profile/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   └── pages/
│   ├── wardrobe/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   └── pages/
│   ├── outfit-builder/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   └── pages/
│   ├── try-on/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   └── pages/
│   ├── inspiration/
│   │   ├── types.ts
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   └── pages/
│   └── analysis/
│       ├── types.ts
│       ├── api.ts
│       ├── store.ts
│       ├── components/
│       └── pages/
├── shared/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── hooks/
│   ├── utils/
│   └── api/
│       └── client.ts
├── routes/
│   └── index.tsx
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

## Route Map

| Route | Page | Auth Required | Domain |
|-------|------|---------------|--------|
| `/` | Landing | No | — |
| `/login` | Login | No | Auth |
| `/signup` | Signup | No | Auth |
| `/dashboard` | Dashboard | Yes | — |
| `/wardrobe` | My Wardrobe | Yes | Wardrobe |
| `/outfit-builder` | Outfit Builder | Yes | Outfit Builder |
| `/try-on` | Virtual Try-On | Yes | Try-On |
| `/outfits` | Saved Outfits | Yes | Outfit Builder |
| `/inspiration` | Inspiration | Yes | Inspiration |
| `/analysis` | Style Analysis | Yes | Analysis |
| `/profile` | User Profile | Yes | Profile |
| `/settings` | Settings | Yes | Profile |

## Dependency Rules

### Inter-Domain Dependencies (Frontend)

```
Auth ──────────────────────────────────────> All domains (via ProtectedRoute + auth store)
User Profile ─────────────────────────────> Try-On, Analysis
Wardrobe ─────────────────────────────────> Outfit Builder, Try-On, Inspiration
Outfit Builder ───────────────────────────> Try-On
```

### Import Rules

**Allowed:**
```typescript
// Component importing from its own domain
import { WardrobeItem } from '../types';

// Any domain importing from shared
import { Button } from '@/shared/ui/Button';
import { useAuth } from '@/features/auth/store';

// Cross-domain type imports
import type { WardrobeItem } from '@/features/wardrobe/types';
```

**Not Allowed:**
```typescript
// Component importing another domain's components
import { ClothingCard } from '@/features/wardrobe/components/ClothingCard';

// Store importing from pages layer (backward dependency)
import { WardrobePage } from '../pages/WardrobePage';
```

## File Size Limits

- Maximum: 300 lines per file (enforced by linter)
- Recommended: 150-200 lines
- If exceeded, split by extracting components, hooks, or utilities

## Evolution Guidelines

### Adding a New Domain
1. Create domain directory under `src/features/`
2. Set up layer files (types, api, store, components/, pages/)
3. Add routes to `src/routes/index.tsx`
4. Update this document with domain description and dependencies
5. Create product spec in `docs/product-specs/`
6. Update `docs/QUALITY_SCORE.md`

### Adding a New Shared Component
1. Add to `src/shared/ui/`
2. Ensure no domain-specific logic
3. Add tests

## References

- See `docs/FRONTEND.md` for component and styling patterns
- See `docs/QUALITY_SCORE.md` for quality expectations per domain
- See `docs/product-specs/` for feature definitions
