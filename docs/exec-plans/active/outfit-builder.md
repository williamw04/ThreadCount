# Execution Plan: Outfit Builder

**Status**: In Progress
**Created**: 2026-03-05
**Priority**: P0

## Goal

Allow users to create and visualize outfits by combining items from their virtual wardrobe.

## Success Criteria

- [x] Users can select items from their wardrobe to add to outfit canvas
- [x] Visual representation of outfit (top, bottoms, shoes)
- [x] Hierarchical category navigation (Tops > T-shirts, Dresses, Outerwear)
- [x] Layering support for tops (e.g., shirt + jacket)
- [x] Swap between layered tops
- [x] Replace existing items in slots with confirmation dialog
- [x] Limit of 2 tops with replacement selection
- [x] Click selected item to remove it
- [x] Auto-jump to category when clicking canvas slot
- [x] Visual highlight on selected garment (not slot container)
- [x] Dedicated Shoes category (separated from Accessories)
- [x] Save outfits to database
- [ ] Builder header, canvas, and controls stay contained within `100dvh` with no page scroll on `/outfit-builder`
- [ ] Builder shell has regression coverage for `AppShell` route behavior and viewport containment
- [ ] View saved outfits
- [ ] Generate AI images of outfits

## Phase Breakdown

### Phase 1: Canvas & Selection (2026-03-04)

- [x] Create outfit builder page with canvas layout
- [x] Implement wardrobe panel with category tabs
- [x] Add item selection to canvas slots
- [x] Visual feedback for selected slots

### Phase 2: Hierarchical Navigation (2026-03-04)

- [x] Main categories: Tops, Bottoms, Shoes, Accessories
- [x] Sub-categories for Tops (T-shirts, Tank tops, Dresses, Outerwear)
- [x] Sub-categories for Bottoms (Jeans, Dress pants)
- [x] Sub-categories for Accessories (Hats, Jewelry, Bags, etc.)

### Phase 3: Layering & Swap (2026-03-05)

- [x] Support multiple items in top slot
- [x] Display active/inactive layers with opacity
- [x] Swap button to toggle between layered tops
- [x] Consistent sizing between layers (45% width)

### Phase 4: Item Management (2026-03-05)

- [x] Replace confirmation dialog for bottom/shoes
- [x] Limit of 2 tops with replacement selection dialog
- [x] Click selected item to remove
- [x] Visual indication of items already in canvas

### Phase 5: UI Polish (2026-03-05)

- [x] Highlight garment (not container) on selection
- [x] Proper visibility for selected categories
- [x] Dedicated Shoes category
- [x] Auto-jump to category when clicking canvas slot

### Phase 6: Persistence & Display

- [x] Save outfit to database
- [ ] Load saved outfits
- [ ] Out display
- [fit cards ] AI generation of outfit images

### Phase 7: Viewport Containment Follow-Up (2026-03-16)

- [ ] Document builder-specific shell behavior and viewport budget
- [ ] Add regression tests for `AppShell` builder mode
- [ ] Add viewport validation for header/canvas/controls containment

## Technical Decisions

### Layering Approach

**Decision**: Active layer displayed at full opacity, inactive layer at 30% opacity behind it.
- **Rationale**: Allows user to see both options without full stacking
- **Swap**: Button to toggle which layer is active

### Category Structure

Using 4 main categories:
- Tops (includes dresses, outerwear)
- Bottoms
- Shoes
- Accessories

### Slot Mapping

| Category | Slot |
|----------|------|
| tops | top |
| dresses | top |
| outerwear | top |
| bottoms | bottom |
| shoes | shoes |
| accessories | shoes (for now) |

## Dependencies

- Virtual Wardrobe: Required for selecting items
- Supabase: For outfit persistence
- fal.ai: For outfit image generation (future)

## Progress Tracker

- [x] Phase 1: Canvas & Selection
- [x] Phase 2: Hierarchical Navigation
- [x] Phase 3: Layering & Swap
- [x] Phase 4: Item Management
- [x] Phase 5: UI Polish
- [ ] Phase 6: Persistence & Display

## Blockers

- None currently

## Notes

- Image sizing inconsistency: Different uploaded images have different aspect ratios. Consider normalizing on upload.
- Accessories currently map to shoes slot - may need separate handling in future.
- Current builder implementation already uses a viewport-locked shell in `AppShell` and `globals.css`; follow-up work is validation and regression coverage, not a new layout direction.
