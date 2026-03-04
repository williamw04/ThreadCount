# Execution Plan: Virtual Wardrobe

**Status**: Complete
**Created**: 2026-03-03
**Priority**: P0

## Goal

Implement the Virtual Wardrobe feature allowing users to upload, categorize, browse, and manage their clothing items.

## Success Criteria

- [x] Users can upload clothing item images (JPG, PNG, max 10MB)
- [x] Background automatically removed from uploaded images
- [x] Users can categorize items (tops, bottoms, dresses, shoes, accessories, outerwear)
- [x] Users can add labels/tags to items
- [x] Grid view displays all wardrobe items with thumbnails
- [x] Filter items by category
- [x] Search items by name or tags
- [x] Users can edit item details (name, category, labels)
- [x] Users can delete items

## Phase Breakdown

### Phase 1: Backend API (Day 1)

- [x] Create `backend/app/api/routes/wardrobe.py`
- [x] Implement endpoints:
  - `GET /api/wardrobe/items` - List all items for authenticated user
  - `GET /api/wardrobe/items/:id` - Get single item
  - `POST /api/wardrobe/items` - Create new item (with image upload)
  - `PUT /api/wardrobe/items/:id` - Update item details
  - `DELETE /api/wardrobe/items/:id` - Delete item
- [x] Add background removal service integration
- [x] Test endpoints with Supabase

### Phase 2: Frontend Structure (Day 1-2)

- [x] Create `frontend/src/features/wardrobe/` directory structure
- [x] Define types in `types.ts`
- [x] Create API functions in `api.ts`
- [x] Build wardrobe store with Zustand in `store.ts`
- [x] Add route to `/wardrobe` in routes config

### Phase 3: Core Components (Day 2)

- [x] Build `WardrobePage.tsx` - Main page with grid layout
- [x] Create `WardrobeGrid.tsx` - Grid display of items
- [x] Create `WardrobeItem.tsx` - Individual item card
- [x] Create `AddItemButton.tsx` - Floating action button
- [x] Create `CategoryFilter.tsx` - Category filter bar

### Phase 4: Item Management (Day 2-3)

- [x] Build `UploadModal.tsx` - Upload form with image preview
- [x] Implement image upload to Supabase Storage
- [x] Add background removal processing indicator
- [x] Create `ItemDetailsModal.tsx` - View/edit item details
- [x] Add delete confirmation dialog

### Phase 5: Polish & Testing (Day 3)

- [x] Add search functionality
- [x] Implement responsive design
- [x] Add loading states and error handling
- [ ] Write unit tests for components
- [ ] Write integration tests for API

## Technical Decisions

### Background Removal

**Options Considered:**
1. fal.ai background removal (if available)
2. remove.bg API
3. Client-side processing (TensorFlow.js)
4. Self-hosted rembg

**Decision**: Use fal.ai for server-side background removal
- **Rationale**: Consistent with existing stack, no browser lag, better quality
- **Model**: BiRefNet v2 (upgraded from rembg)
- **Cost**: ~$0.001 per image
- **Architecture**: Backend orchestrates, fal.ai handles ML

### Image Storage

- Bucket: `wardrobe` (already created in migration 006)
- Path: `{user_id}/{item_id}.{ext}`
- RLS policies ensure users can only access their own images

### Categories

Using predefined categories from database schema:
- tops
- bottoms
- dresses
- shoes
- accessories
- outerwear

## Database Schema

Already exists in `supabase/migrations/003_create_wardrobe_items.sql`:
- `id`, `user_id`, `name`, `category`, `image_path`, `labels`, `is_inspiration`, `is_template`
- RLS policies configured for user access

## Dependencies

- Auth: User must be authenticated
- Storage: Supabase Storage bucket "wardrobe" with RLS
- AI: fal-client for background removal

## Progress Tracker

- [x] Phase 1: Backend API
- [x] Phase 2: Frontend Structure
- [x] Phase 3: Core Components
- [x] Phase 4: Item Management
- [ ] Phase 5: Polish & Testing

## Blockers

- None currently

## Notes

- Background removal is a nice-to-have, not blocking for MVP
- Template items are preloaded via migration 007
- Inspiration items will be handled separately (future feature)
- Upgraded to BiRefNet v2 for better clothing cutouts (~$0.001 per image)
- Background removal moved to backend service to avoid browser lag

