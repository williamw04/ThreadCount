# Feature: Inspiration

**Status**: Planned
**Priority**: P2
**Domain**: Inspiration (`src/features/inspiration/`)
**Last Updated**: 2026-02-12

## User Story

As a user, I want to save images of clothes and outfits I don't own but am interested in, so I can reference them for future purchases or style ideas.

## Acceptance Criteria

- [ ] User can upload images of clothes/outfits they don't own
- [ ] Items saved to a separate "Inspiration" section (not mixed with owned wardrobe)
- [ ] User can add labels and notes to inspiration items
- [ ] User can browse and search inspiration items
- [ ] User can delete inspiration items

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/inspiration` | InspirationPage | Gallery of saved inspiration items |

## Design References

- Backend endpoints: `GET /inspiration`, `POST /inspiration`, `DELETE /inspiration/:id`

## Out of Scope (for now)

- Import from URLs (Pinterest, Instagram, retailer sites) — future enhancement
- Community/shared inspiration boards — future enhancement
