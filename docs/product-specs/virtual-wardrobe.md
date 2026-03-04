# Feature: Virtual Wardrobe

**Status**: In Progress
**Priority**: P0
**Domain**: Wardrobe (`frontend/src/features/wardrobe/`)
**Last Updated**: 2026-03-03

## User Story

As a user, I want to upload images of my clothing items so that I can build a digital wardrobe to organize and use in outfit creation.

## Acceptance Criteria

### Upload Items

- [x] User can upload an image of a clothing item (JPG, PNG, max 10MB)
- [ ] Instructions shown for taking flatlay photos (bird's eye view, solid background)
- [x] Background automatically removed from uploaded image
- [ ] Image compressed and optimized before storage
- [x] Processing progress shown to user (removing background, optimizing)
- [x] User sees processed preview before saving

### Categorize Items

- [x] User assigns a category: tops, bottoms, outerwear, shoes, accessories, dresses
- [ ] User assigns colors (multi-select from preset palette)
- [ ] User assigns seasons (spring, summer, fall, winter)
- [x] User adds custom tags (comma-separated)
- [x] User enters a name for the item

### Browse Wardrobe

- [x] Grid view of all items with thumbnails
- [x] Filter by category
- [ ] Filter by color
- [ ] Filter by season
- [x] Search by name or tags
- [x] Items sorted by most recently added (default)

### Edit Items

- [x] User can edit name, category, colors, seasons, tags
- [ ] User can replace the image
- [x] User can delete items (with confirmation)

### Upload Full Outfits

- [ ] User can upload an image of a complete outfit
- [ ] Outfit saved separately from individual items
- [ ] Outfit labeled and categorized

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
| `UploadModal` | Upload form with background removal | ✅ Implemented |
| `EditItemModal` | Edit/delete item modal | ✅ Implemented |

## Backend API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/wardrobe/items` | GET | List items with filters | ✅ Implemented |
| `/api/wardrobe/items/:id` | GET | Get single item | ✅ Implemented |
| `/api/wardrobe/items` | POST | Create item with image | ✅ Implemented |
| `/api/wardrobe/items/:id` | PUT | Update item details | ✅ Implemented |
| `/api/wardrobe/items/:id` | DELETE | Delete item | ✅ Implemented |
| `/api/image/remove-background` | POST | Remove background from image | ✅ Implemented |

## Design References

- Image processing: Server-side via fal.ai BiRefNet v2
- Storage: Supabase Storage bucket `wardrobe` with RLS
- Database: `wardrobe_items` table with RLS policies

## Technical Implementation

### Background Removal
- **Model**: fal.ai BiRefNet v2
- **Cost**: ~$0.001 per image
- **Flow**: Upload → Supabase temp storage → fal.ai processing → Supabase permanent storage
- **Architecture**: Server-side processing to avoid browser lag

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

- Automatic color detection from image — future enhancement
- Automatic category detection — future enhancement
- Batch upload — future enhancement
- Import from retailer URLs — future enhancement

## Remaining Work

### Medium Priority
- [ ] Color assignment
- [ ] Season assignment
- [ ] Upload instructions for flatlay photos
- [ ] Filter by color
- [ ] Filter by season
- [ ] Replace image in edit modal

### Low Priority
- [ ] Image compression/optimization
- [ ] Full outfit upload
