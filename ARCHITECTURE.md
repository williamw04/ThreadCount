# Architecture

**Version**: 1.2.0
**Last Updated**: 2026-03-02

## Overview

Seamless is a fashion web app. This repository contains both the **React frontend** and the **FastAPI backend**.

- **Frontend** (`frontend/`): React SPA handling presentation, local state, and user interactions.
- **Backend** (`backend/`): FastAPI service handling business logic, AI integrations (fal.ai), and Supabase orchestration.
- **Database/Auth/Storage**: Supabase (Postgres, Auth, S3-compatible storage).

## System Architecture

```
┌─────────────────────┐         ┌───────────────────────┐         ┌──────────────────┐
│   React Frontend    │  HTTP   │   FastAPI Backend     │  SDK    │    Supabase      │
│   (frontend/src/)   │ ──────> │   (backend/)          │ ──────> │                  │
│                     │  JSON   │                       │  SQL    │  • Postgres DB   │
│                     │ <────── │                       │ <────── │  • Auth          │
│                     │         │                       │         │  • Storage       │
└─────────────────────┘         └──────────┬────────────┘         └──────────────────┘
                                           │
                                           │ SDK
                                           ▼
                                 ┌───────────────────────┐
                                 │       fal.ai          │
                                 │   (AI Generation)     │
                                 └───────────────────────┘
```

## Domain Map (Frontend)

The frontend is organized by feature domains within `frontend/src/features/`.

### Auth (`frontend/src/features/auth/`)

- Login, signup, password reset
- Session/token management on frontend
- Protected route guards
- Dependencies: None (foundational)

### User Profile (`frontend/src/features/profile/`)

- Avatar photo upload and management
- User preferences and settings
- Account lifecycle (edit profile, delete account)
- Dependencies: Auth

### Wardrobe (`frontend/src/features/wardrobe/`)

- Upload and process garment images (background removal, compression)
- Categorize and label clothing items
- Browse, search, and filter wardrobe
- Edit and delete items
- Dependencies: Auth

### Outfit Builder (`frontend/src/features/outfit-builder/`)

- Flatlay canvas for assembling outfits
- Drag items from wardrobe to canvas
- Save outfit combinations
- Dependencies: Auth, Wardrobe

### Try-On (`frontend/src/features/try-on/`)

- Select outfit or individual items
- Trigger AI image generation (via backend)
- View and save generated images to "Previous Looks"
- Style-based generation (select a style, generate outfit)
- Dependencies: Auth, Wardrobe, Outfit Builder

### Inspiration (`frontend/src/features/inspiration/`)

- Save clothing/outfits user doesn't own
- Browse inspiration gallery
- Dependencies: Auth

### Analysis (`frontend/src/features/analysis/`)

- Request AI style analysis (colors, styles that suit user)
- View recommendations
- Generate outfits based on analysis
- Dependencies: Auth, User Profile

## Layer Structure (Frontend)

Within each domain, code is organized into layers. Dependencies flow forward (left to right):

```
Types → API → Stores → Components → Pages
```

## Package Structure

```
.
├── frontend/                # React Frontend
│   ├── src/                 # Application source
│   │   ├── features/        # Domain-driven features
│   │   ├── shared/          # Reusable UI, hooks, utils
│   │   ├── routes/          # Routing config
│   │   └── ...
│   ├── public/              # Static assets
│   ├── package.json
│   └── ...
├── backend/                 # FastAPI Backend
│   ├── app/                 # Application source
│   │   ├── api/             # API routes
│   │   ├── services/        # Business logic / AI integration
│   │   └── ...
│   ├── requirements.txt
│   └── ...
├── supabase/                # Supabase configuration & migrations
│   └── migrations/          # SQL migration files
├── docs/                    # Project documentation
└── ...
```

## Route Map

| Route             | Page           | Auth Required | Domain         |
| ----------------- | -------------- | ------------- | -------------- |
| `/`               | Landing        | No            | —              |
| `/login`          | Login          | No            | Auth           |
| `/signup`         | Signup         | No            | Auth           |
| `/dashboard`      | Dashboard      | Yes           | —              |
| `/wardrobe`       | My Wardrobe    | Yes           | Wardrobe       |
| `/outfit-builder` | Outfit Builder | Yes           | Outfit Builder |
| `/try-on`         | Virtual Try-On | Yes           | Try-On         |
| `/outfits`        | Saved Outfits  | Yes           | Outfit Builder |
| `/inspiration`    | Inspiration    | Yes           | Inspiration    |
| `/analysis`       | Style Analysis | Yes           | Analysis       |
| `/profile`        | User Profile   | Yes           | Profile        |
| `/settings`       | Settings       | Yes           | Profile        |

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
import { WardrobeItem } from "../types";

// Any domain importing from shared
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/features/auth/store";

// Cross-domain type imports
import type { WardrobeItem } from "@/features/wardrobe/types";
```

**Not Allowed:**

```typescript
// Component importing another domain's components
import { ClothingCard } from "@/features/wardrobe/components/ClothingCard";

// Store importing from pages layer (backward dependency)
import { WardrobePage } from "../pages/WardrobePage";
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
