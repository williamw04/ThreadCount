# Feature: Virtual Wardrobe

**Status**: Planned
**Priority**: P0
**Domain**: Wardrobe (`src/features/wardrobe/`)
**Last Updated**: 2026-02-12

## User Story

As a user, I want to upload images of my clothing items so that I can build a digital wardrobe to organize and use in outfit creation.

## Acceptance Criteria

### Upload Items
- [ ] User can upload an image of a clothing item (JPG, PNG, max 10MB)
- [ ] Instructions shown for taking flatlay photos (bird's eye view, solid background)
- [ ] Background automatically removed from uploaded image
- [ ] Image compressed and optimized before storage
- [ ] Processing progress shown to user (removing background, optimizing)
- [ ] User sees processed preview before saving

### Categorize Items
- [ ] User assigns a category: tops, bottoms, outerwear, shoes, accessories, dresses
- [ ] User assigns colors (multi-select from preset palette)
- [ ] User assigns seasons (spring, summer, fall, winter)
- [ ] User adds custom tags (comma-separated)
- [ ] User enters a name for the item

### Browse Wardrobe
- [ ] Grid view of all items with thumbnails
- [ ] Filter by category
- [ ] Filter by color
- [ ] Filter by season
- [ ] Search by name or tags
- [ ] Items sorted by most recently added (default)

### Edit Items
- [ ] User can edit name, category, colors, seasons, tags
- [ ] User can replace the image
- [ ] User can delete items (with confirmation)

### Upload Full Outfits
- [ ] User can upload an image of a complete outfit
- [ ] Outfit saved separately from individual items
- [ ] Outfit labeled and categorized

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/wardrobe` | WardrobePage | Grid of items with filters, search, add button |

## Design References

- See `docs/design-docs/image-processing.md` for image pipeline details
- Backend endpoints: `GET /wardrobe/items`, `POST /wardrobe/items`, `PUT /wardrobe/items/:id`, `DELETE /wardrobe/items/:id`

## Out of Scope (for now)

- Automatic color detection from image — future enhancement
- Automatic category detection — future enhancement
- Batch upload — future enhancement
- Import from retailer URLs — future enhancement
