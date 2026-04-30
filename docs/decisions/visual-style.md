# Design Decision: Visual Style — Monochrome Brutalist Luxury

**Status**: Active
**Last Updated**: 2026-03-14

## One-Line Direction

> A monochrome fashion workspace with Gentle Monster tension: stark, sculptural, quiet, and expensive.

## Visual Intent

- The product should feel like a luxury optical showroom translated into a web app.
- The UI is mostly black, white-adjacent, charcoal, and steel grey.
- Brutalist structure does the visual work: hard edges, strong lines, large type, disciplined spacing.
- Garment imagery remains the focal point; chrome should recede.

## Core Principles

1. **Monochrome first**: avoid decorative accent colors.
2. **Hard geometry**: sharp corners, crisp borders, rectangular framing.
3. **Luxury through restraint**: fewer elements, larger negative space, stronger composition.
4. **Editorial contrast**: oversized headings paired with compact utilitarian labels.

## Palette

| Token | Value | Usage |
| --- | --- | --- |
| `--bg` | `#f3f3f1` | Main page surface |
| `--bg-elevated` | `#fbfbf8` | Raised panels, cards, modals |
| `--surface-inverse` | `#111111` | Inverse sections, dominant actions |
| `--text-primary` | `#111111` | Headings, key body text |
| `--text-secondary` | `#4f4f4a` | Secondary copy |
| `--text-muted` | `#7b7b74` | Metadata, placeholders |
| `--border` | `#cfcfc8` | Standard dividers |
| `--border-strong` | `#111111` | Structural lines, emphasis |
| `--success` | `#1f1f1b` | Keep semantic states near-monochrome |
| `--error` | `#2a2a26` | Keep semantic states near-monochrome |

## Typography

- **Display / headings**: high-contrast serif or sharply editorial face.
- **Body / controls**: restrained sans-serif.
- **Metadata**: monospace or narrow grotesk for labels, ids, and filters.
- Use typography to create hierarchy before adding visual ornament.

## Layout

- Use wide margins and deliberate empty space.
- Prefer stacked sections separated by strong horizontal rules.
- Favor asymmetry over centered marketing layouts.
- Cards and panels should read as framed objects, not soft containers.
- Desktop only: support starts at `1024px`; remove mobile layouts, drawers, and touch-first sizing.
- Default page padding starts at `24px` and scales with viewport width using a shared `--page-px` token.

## Header Behavior

- Authenticated pages use a floating three-column header with an exact `72px` height.
- Non-builder pages begin transparent and move to a blurred surface on scroll.
- Builder pages keep the header structurally separated and non-reactive to scroll because the builder locks the viewport.

## Outfit Builder Viewport Rule

- The outfit builder is a viewport-contained application shell, not a scrolling page.
- The builder must satisfy: `header + canvas + controls <= 100dvh`.
- Use `--header-h`, `--controls-h`, and `--canvas-h` to budget the viewport.
- Lock body scroll while the builder is active.
- Side panels scroll internally; the canvas never scrolls.
- Garment imagery and mannequin layers must scale proportionally with `object-fit: contain` and never clip or overflow the visible canvas.

## Components

### Buttons

- Primary actions can use dark fills with light text.
- Secondary actions should be outlined with strong borders.
- No pill shapes; corners stay square or nearly square.

### Inputs

- Use hard edges and visible borders.
- Labels should feel utilitarian: compact, uppercase or tightly tracked.
- Focus states should rely on contrast and line weight, not bright color.

### Cards

- Flat or minimally elevated.
- Borders matter more than shadow.
- Imagery should sit inside clean rectangular frames.

## Motion

- Keep transitions sparse and purposeful.
- Favor abrupt but polished fades, wipes, and staggered reveals.
- Avoid playful bounce or ornamental micro-interactions.

## Route Context

This visual system applies to the currently implemented frontend routes:

- `/login`
- `/signup`
- `/onboarding`
- `/dashboard`
- `/wardrobe`
- `/outfit-builder`

Planned routes should inherit this system when implemented, but they are not part of the current live route map.
