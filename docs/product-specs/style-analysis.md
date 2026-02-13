# Feature: Style Analysis

**Status**: Planned
**Priority**: P3
**Domain**: Analysis (`src/features/analysis/`)
**Last Updated**: 2026-02-12

## User Story

As a user, I want the app to analyze what colors, styles, and clothing would look good on me — like consulting a personal stylist.

## Acceptance Criteria

- [ ] User can request a style analysis
- [ ] Analysis considers user's photos/avatar
- [ ] Results show recommended colors, styles, and clothing types
- [ ] User can generate AI images based on analysis recommendations
- [ ] Results saved for future reference

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/analysis` | AnalysisPage | Trigger analysis, view results, generate from recommendations |

## Design References

- Backend endpoints: `POST /analysis/request`, `GET /analysis/results`
- AI analysis happens entirely on backend
- Frontend displays results and offers generation actions

## Out of Scope (for now)

- Seasonal analysis updates — future enhancement
- Body type analysis — future enhancement
- Shopping recommendations with purchase links — future enhancement
