# Feature: AI Try-On

**Status**: Planned
**Priority**: P2
**Domain**: Try-On (`src/features/try-on/`)
**Last Updated**: 2026-02-12

## User Story

As a user, I want to see AI-generated images of myself wearing outfits from my wardrobe so I can visualize how clothes look on me before wearing them.

## Acceptance Criteria

### Generate Try-On Image
- [ ] User selects an outfit (from saved outfits or individual items)
- [ ] User triggers image generation
- [ ] Loading state shown during generation (may take 10-30+ seconds)
- [ ] Generated image displayed to user
- [ ] User can regenerate with same outfit

### Style-Based Generation
- [ ] User can select from a list of styles (casual, formal, streetwear, etc.)
- [ ] System generates outfit suggestions in that style
- [ ] User sees AI image of themselves in the generated outfit

### Save Results
- [ ] User can save generated images to "Previous Looks"
- [ ] Previous Looks gallery viewable
- [ ] User can delete saved looks

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/try-on` | TryOnPage | Outfit selection + generated image display |

## Design References

- Backend endpoints: `POST /try-on/generate`, `GET /try-on/history`, `DELETE /try-on/history/:id`
- AI generation happens entirely on backend
- Frontend only submits request and polls/waits for result

## Technical Notes

- Generation is async — backend may return a job ID that frontend polls
- Consider WebSocket for real-time progress updates
- Large images — may need progressive loading

## Out of Scope (for now)

- Real-time / live try-on — future enhancement
- Video try-on — future enhancement
- Multiple angle views — future enhancement
