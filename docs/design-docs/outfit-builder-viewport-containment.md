# Design Decision: Outfit Builder Viewport Containment

**Status**: Active
**Last Updated**: 2026-03-16

## Problem Statement

The outfit builder is not a normal scrolling page. Its header, canvas, saved-looks panel, wardrobe panel, and bottom controls all need to stay visible within one desktop viewport while still reusing the shared authenticated shell.

## Decision

- Keep `/outfit-builder` inside the shared `AppShell`, but switch the shell into a builder-specific mode.
- In builder mode, `AppShell` disables scroll-reactive header behavior, locks document scroll with `body.builder-active`, and constrains the route wrapper to `100dvh`.
- Budget vertical space with shared tokens: `--header-h`, `--controls-h`, and `--canvas-h`.
- Render the builder page as a two-row shell: a non-scrolling canvas row plus a fixed controls row.
- Allow scrolling only inside internal panels; keep the central canvas overflow-hidden and scale garment imagery with `object-fit: contain`.

## Current Implementation

- `frontend/src/shared/layout/AppShell.tsx` detects `/outfit-builder`, pins the header to its builder presentation, removes normal page padding, and applies the body scroll lock.
- `frontend/src/styles/globals.css` defines the shared viewport tokens and the `.builder-shell`, `.builder-controls`, and `.canvas-area` containment rules.
- `frontend/src/features/outfit-builder/pages/OutfitBuilderPage.tsx` renders the builder as a three-column workspace inside `.builder-shell` and keeps the bottom action row separate from the canvas region.

## Rationale

- Reusing `AppShell` preserves shared navigation and authenticated chrome without introducing a second top-level layout.
- Route-specific shell behavior keeps the builder aligned with the architecture rule already documented in `ARCHITECTURE.md`.
- Shared viewport tokens make future sizing adjustments predictable and reduce hard-coded height math across components.

## Follow-Up

- Add regression tests for builder mode in `AppShell`, including body scroll locking and non-reactive header behavior.
- Add page-level tests for `OutfitBuilderPage` that confirm the shell/controls structure renders as a viewport-contained layout.
- Add viewport validation checks that catch overflow regressions where header, canvas, and controls exceed `100dvh`.
