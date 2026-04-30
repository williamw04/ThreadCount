# Design Decision: Previous Looks Page Implementation

**Status**: Draft
**Last Updated**: 2026-04-17

## Problem Statement

Users have two ways to capture looks in the app:
1. Upload photos of outfits they've worn (via Virtual Wardrobe)
2. Generate AI renders of their avatar wearing outfits (via Outfit Builder's Try On feature)

Currently, there's no unified place to view these saved looks. Users must remember which feature they used and navigate there to find them.

## Decision

Create a dedicated "Previous Looks" page at `/looks` that aggregates both data sources into a Pinterest-style gallery with filter capability.

### Architecture

The feature will follow the existing frontend architecture pattern:
```
Types → API → Stores → Components → Pages
```

### Data Aggregation Strategy

The page will fetch data from two existing backend data sources:

1. **Saved Outfits** (uploaded photos):
   - Source: `/api/outfits` endpoint
   - Filter: `item_ids` is empty AND `thumbnail_path` is not null
   - Image URL: Constructed from `thumbnail_path` in `generated` bucket

2. **Renders** (AI-generated try-on):
   - Source: New `/api/generated-images` endpoint (to be created)
   - Image URL: Constructed from `image_path` in `generated` bucket

### API Layer

Create two new backend endpoints for generated images:
- `GET /api/generated-images` - List all generated images for a user
- `DELETE /api/generated-images/{id}` - Delete a generated image

The existing outfit endpoints are sufficient for uploaded outfits.

### Frontend Data Flow

1. **Types** (`types/looks.ts`):
   - Define `SavedOutfit` type (from outfits API)
   - Define `GeneratedImage` type (from generated-images API)
   - Define `Look` union type
   - Define `LookFilter` type: `'all' | 'saved' | 'rendered'`

2. **API** (`api/looks.ts`):
   - `fetchLooks()`: Promise.all to fetch both sources, combine and normalize
   - `deleteLook(id, type)`: Delete from appropriate source

3. **Store** (`stores/looks-store.ts`):
   - State: `looks: Look[]`, `filter: LookFilter`, `isLoading: boolean`
   - Actions: `loadLooks()`, `setFilter()`, `deleteLook()`

4. **Components**:
   - `LooksFilter`: Tab buttons for All / Saved Outfits / Renders
   - `LooksGrid`: Masonry layout using CSS columns or grid
   - `LookCard`: Image with overlay info
   - `LookDetailModal`: Full-size image view

### UI/UX Design

#### Layout
- Full-width page with reasonable horizontal padding
- Sticky filter bar at top (below header)
- Responsive grid:
  - Mobile (`<640px`): 2 columns
  - Tablet (640-1024px): 3 columns
  - Desktop (>1024px): 4 columns

#### Filter Component
- Three tabs: "All", "Saved Outfits", "Renders"
- Active tab visually highlighted
- Count badges showing number in each category

#### Cards
- Aspect ratio preserved (masonry layout)
- Hover state: slight scale up, show action buttons
- Bottom overlay with name and date
- Click to open detail modal

#### Detail Modal
- Centered overlay with dark backdrop
- Large image (max 80vh)
- Look name and date
- Delete button with confirmation

### Storage Integration

Both look types use the `generated` bucket in Supabase:
- Uploaded outfits: `{user_id}/outfits/{id}.{ext}`
- Generated images: `{user_id}/{id}.png`

The frontend will construct public URLs using the Supabase storage client.

## Rationale

### Why aggregate both sources?

1. **User-centric**: Users think of "my looks" as a single collection, not two separate things
2. **Discovery**: Makes both features more valuable by providing a central viewing place
3. **Simplicity**: Avoids forcing users to remember which feature they used

### Why client-side filtering?

For the initial implementation, client-side filtering is simpler and sufficient because:
- Most users will have `<100` looks initially
- Two API calls are made regardless (outfits + generated-images)
- Easy to swap to server-side filtering later if needed

### Why Pinterest-style layout?

- Familiar pattern for browsing image collections
- Accommodates variable aspect ratios gracefully
- More visually engaging than uniform grid
- Works well on both mobile and desktop

## Current Implementation

The feature is planned but not yet implemented. Key files to create:

```
frontend/src/features/looks/
├── types/
│   └── looks.ts
├── api/
│   └── looks.ts
├── stores/
│   └── looks-store.ts
├── components/
│   ├── LooksFilter.tsx
│   ├── LooksGrid.tsx
│   ├── LookCard.tsx
│   └── LookDetailModal.tsx
├── pages/
│   └── LooksPage.tsx
└── looks.tsx (route config)
```

Backend files to create:
```
backend/app/api/routes/generated_images.py
```

## How to Use

1. Navigate to `/looks` in the app
2. View all looks in the grid
3. Click tabs to filter by type
4. Click a look to see full-size view
5. Delete looks from the detail modal

## How to Modify

### Adding a new look source

1. Add fetch logic in `api/looks.ts`
2. Normalize data to `Look` type
3. Update store to handle new type

### Changing the filter UI

1. Modify `LooksFilter.tsx`
2. Update store's filter logic if needed

### Adding sort options

1. Add `sortBy` state to store
2. Create sort utility function
3. Add sort dropdown to UI

## Testing Considerations

- Test with empty states for each filter
- Test with many items (performance)
- Test responsive layout at all breakpoints
- Test delete flow for both look types

## Future Enhancements

- Server-side filtering for scale
- Sort by date/name
- Search within looks
- Bulk delete
- Share functionality
- Unified data model (single looks table)
