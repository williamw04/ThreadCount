# Feature: Previous Looks

**Status**: Planned
**Priority**: P1
**Domain**: Looks (`frontend/src/features/looks/`)
**Last Updated**: 2026-04-17

## User Story

As a user, I want to view my previously saved looks (both uploaded outfit photos and AI-generated try-on renders) in a Pinterest-inspired gallery so I can browse and revisit my fashion history.

## Background

Users currently have two ways to save looks:
1. **Saved Outfits**: Upload photos of complete outfits they've worn (via wardrobe upload)
2. **Renders**: AI-generated images of their avatar wearing outfits created in the Outfit Builder (via "Try On" feature)

These are currently stored in different tables:
- `outfits` table - stores user-uploaded outfit images (`thumbnail_path` populated, `item_ids` empty)
- `generated_images` table - stores AI try-on results

## Acceptance Criteria

### View Previous Looks

- [ ] Pinterest-style masonry/grid layout displaying look cards
- [ ] Two filter tabs/categories: "Saved Outfits" and "Renders"
- [ ] Default view shows all looks (or "All" tab)
- [ ] Each look card displays:
  - Image thumbnail (cover fit)
  - Look name/title (if available)
  - Date created
- [ ] Clicking a look opens a detail view/modal with larger image
- [ ] Responsive grid (2-4 columns depending on viewport)

### Filter Between Categories

- [ ] Tab or toggle switch to filter between:
  - **Saved Outfits**: User-uploaded photos from wardrobe
  - **Renders**: AI-generated try-on images
- [ ] Empty state message when no looks in a category
- [ ] Filter persists during session

### Manage Looks

- [ ] Delete a look (with confirmation)
- [ ] Rename a look (optional, for organization)

## Pages

| Route | Component | Description | Status |
|-------|-----------|-------------|--------|
| `/looks` | LooksPage | Pinterest-style grid with filter tabs | 📋 Planned |

## Components

| Component | Description | Status |
|-----------|-------------|--------|
| `LooksPage` | Main page with grid and filter | 📋 Planned |
| `LooksFilter` | Tab/toggle for Saved Outfits vs Renders | 📋 Planned |
| `LooksGrid` | Responsive masonry grid layout | 📋 Planned |
| `LookCard` | Individual look card with image and info | 📋 Planned |
| `LookDetailModal` | Full-size view of a look | 📋 Planned |

## Backend API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/outfits` | GET | List all outfits (includes uploaded outfits) | ✅ Existing |
| `/api/outfits/{id}` | GET | Get single outfit | ✅ Existing |
| `/api/outfits/{id}` | DELETE | Delete outfit | ✅ Existing |
| `/api/outfits/{id}` | PUT | Update outfit name | ✅ Existing |
| `/api/generated-images` | GET | List generated images (try-on results) | ⚠️ Needs to be created |
| `/api/generated-images/{id}` | GET | Get single generated image | ⚠️ Needs to be created |
| `/api/generated-images/{id}` | DELETE | Delete generated image | ⚠️ Needs to be created |

## Database Schema

### Existing Tables

**outfits** table (for user-uploaded outfits):
- `id` uuid
- `user_id` uuid
- `name` text
- `item_ids` uuid[] (empty for uploaded outfits)
- `thumbnail_path` text (image path in `generated` bucket)
- `created_at` timestamptz

**generated_images** table (for AI try-on):
- `id` uuid
- `user_id` uuid
- `outfit_id` uuid (optional)
- `image_path` text
- `prompt` text
- `created_at` timestamptz

### Storage

- **Bucket**: `generated`
- **Path for uploaded outfits**: `{user_id}/outfits/{outfit_id}.{ext}`
- **Path for generated images**: `{user_id}/{image_id}.png`

## Technical Implementation

### Frontend Architecture

Following the pattern from `docs/getting-started/architecture.md`:
```
Types → API → Stores → Components → Pages
```

- **Types**: Define `Look` type (union of outfit and generated image)
- **API**: Create API functions to fetch both data sources
- **Stores**: Zustand store for looks state management
- **Components**: Reusable UI components
- **Pages**: Route handler

### Filtering Strategy

Two approaches for filtering:
1. **Client-side**: Fetch all data, filter in frontend (simpler, good for small datasets)
2. **Server-side**: New endpoint accepts filter param, returns filtered results (better for scale)

Recommendation: Start with client-side filtering (simpler), can optimize later.

### UI Design

- Pinterest-style masonry grid with variable height cards
- Sticky filter tabs at top
- Smooth transitions between filter states
- Skeleton loading states
- Empty states with helpful messaging

## Out of Scope (for now)

- Sorting options (date, name) - future enhancement
- Search within looks - future enhancement
- Bulk actions (delete multiple) - future enhancement
- Sharing looks - future enhancement
- Creating looks directly from this page - use existing flows

## Implementation Notes

1. The existing `looks` table is NOT used - we're using `outfits` for uploads and `generated_images` for AI renders
2. Need to add API endpoints for `generated_images` CRUD operations
3. Consider deduplicating the data model in the future (unified looks table)
