# Feature: Virtual Wardrobe

**Status**: In Progress
**Priority**: P0
**Domain**: Wardrobe (`apps/web/src/features/wardrobe/`)
**Last Updated**: 2026-04-15

## User Story

As a user, I want to upload images of my clothing items so that I can build a digital wardrobe to organize and use in outfit creation.

## Acceptance Criteria

### Upload Items

- [x] User can upload an image of a clothing item (JPG, PNG, max 10MB)
- [ ] Instructions shown for taking flatlay photos (bird's eye view, solid background) - shows generic "front-facing" instruction only
- [x] Background automatically removed from uploaded image
- [ ] Image compressed and optimized before storage (not explicitly implemented)
- [x] Processing progress shown to user (removing background, optimizing)
- [x] User sees processed preview before saving

### Categorize Items

- [x] User assigns a category: tops, bottoms, outerwear, shoes, accessories, dresses
- [ ] User assigns colors (multi-select from preset palette) - AI auto-detects, manual selection not available
- [ ] User assigns seasons (spring, summer, fall, winter) - AI auto-detects, manual selection not available
- [x] User adds custom tags (comma-separated)
- [x] User enters a name for the item

### Browse Wardrobe

- [x] Grid view of all items with thumbnails
- [x] Filter by category
- [x] Filter by color (AI-detected)
- [x] Filter by season (AI-detected)
- [x] Search by name or tags
- [x] Items sorted by most recently added (default) - sort parameter not explicitly sent to API

### Edit Items

- [x] User can edit name, category, tags
- [ ] User can edit colors/seasons (displayed as read-only badges, cannot modify)
- [ ] User can replace the image (not implemented)
- [x] User can delete items (with confirmation)

### Upload Full Outfits

- [x] User can upload an image of a complete outfit
- [x] Outfit saved separately from individual items
- [ ] Outfit labeled and categorized (name only, no category selection)

## Pages

| Route       | Component    | Description                                    | Status |
| ----------- | ------------ | ---------------------------------------------- | ------ |
| `/wardrobe` | WardrobePage | Grid of items with filters, search, add button | ✅ Implemented |

## Components

| Component | Description | Status |
|-----------|-------------|--------|
| `WardrobePage` | Main page with grid layout | ✅ Implemented |
| `WardrobeGrid` | Responsive grid of item cards | ✅ Implemented |
| `WardrobeItemCard` | Individual item card with image overlay | ✅ Implemented |
| `CategoryFilter` | Category filter buttons | ✅ Implemented |
| `ColorFilter` | Filter by AI-detected color | ✅ Implemented |
| `SeasonFilter` | Filter by AI-detected season | ✅ Implemented |
| `UploadModal` | Upload form with background removal | ✅ Implemented |
| `UploadOutfitModal` | Upload complete outfit image | ✅ Implemented |
| `EditItemModal` | Edit/delete item modal | ✅ Partial (cannot edit colors/seasons, cannot replace image) |

## Backend API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/wardrobe/items` | GET | List items with filters | ✅ Implemented |
| `/api/wardrobe/items/:id` | GET | Get single item | ✅ Implemented |
| `/api/wardrobe/items` | POST | Create item with image | ✅ Implemented |
| `/api/wardrobe/items/:id` | PUT | Update item details | ✅ Implemented |
| `/api/wardrobe/items/:id` | DELETE | Delete item | ✅ Implemented |
| `/api/image/remove-background` | POST | Remove background from image | ✅ Implemented |
| `/api/ai/analyze` | POST | AI analysis for metadata detection | ✅ Implemented |

## Design References

- Image processing: Server-side via fal.ai BiRefNet v2
- Metadata detection: Google Gemini AI for color/season/category
- Storage: Supabase Storage bucket `wardrobe` with RLS
- Database: `wardrobe_items` table with RLS policies

## Technical Implementation

### Background Removal
- **Model**: fal.ai BiRefNet v2
- **Cost**: ~$0.001 per image
- **Flow**: Upload → Supabase temp storage → fal.ai processing → Supabase permanent storage
- **Architecture**: Server-side processing to avoid browser lag

### AI Metadata Detection
- **Model**: Google Gemini AI
- **Detects**: Colors, seasons, category suggestions
- **Flow**: Image uploaded → Gemini analyzes → suggestions shown to user

### Image Storage
- **Bucket**: `wardrobe`
- **Path**: `{user_id}/{item_id}.png`
- **Format**: Transparent PNG after background removal
- **Access**: RLS ensures users only see their own items

### Categories
Predefined categories:
- tops
- bottoms
- dresses
- shoes
- accessories
- outerwear

## Out of Scope (for now)

- Manual color/season assignment — handled by AI
- Automatic category detection (beyond AI suggestion) — future enhancement
- Batch upload — future enhancement
- Import from retailer URLs — future enhancement

## Remaining Work

### Medium Priority
- [ ] Add manual color/season selection to upload modal (if desired)
- [ ] Add image replacement to edit modal
- [ ] Upload instructions for flatlay photos

### Low Priority
- [ ] Image compression/optimization
- [ ] Outfit categorization
