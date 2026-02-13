# Feature: Outfit Builder

**Status**: Planned
**Priority**: P1
**Domain**: Outfit Builder (`src/features/outfit-builder/`)
**Last Updated**: 2026-02-12

## User Story

As a user, I want to combine items from my wardrobe into outfits so I can plan what to wear and send outfits to the AI try-on feature.

## Acceptance Criteria

### Build Outfits
- [ ] Canvas displays garment slots in flatlay arrangement (hat → tops → bottoms → shoes)
- [ ] User can add items from wardrobe to canvas slots
- [ ] Garment images scale dynamically to fit viewport
- [ ] User can cycle through wardrobe items per category (previous/next arrows)
- [ ] User can remove items from canvas
- [ ] Shuffle button randomizes the outfit
- [ ] Canvas supports layering (e.g., t-shirt + jacket)

### Save Outfits
- [ ] User can name and save an outfit
- [ ] Saved outfits viewable in a gallery
- [ ] User can edit saved outfits
- [ ] User can delete saved outfits

### Integration
- [ ] "Try On" button sends outfit to AI try-on feature
- [ ] Wardrobe panel shows filtered items for selection

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/outfit-builder` | OutfitBuilderPage | Canvas + wardrobe panel side by side |
| `/outfits` | SavedOutfitsPage | Gallery of saved outfits |

## Design References

- Backend endpoints: `GET /outfits`, `POST /outfits`, `PUT /outfits/:id`, `DELETE /outfits/:id`

## Out of Scope (for now)

- Drag and drop positioning — future enhancement
- Outfit sharing — future enhancement
- Outfit calendar/scheduling — future enhancement
