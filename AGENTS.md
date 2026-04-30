# Agent Operating Guide

**Version:** 1.1.0
**Last Updated:** 2026-03-02

## Purpose

This file is your navigation map for the Seamless repository. It points you to the right context for your current task. This is NOT a comprehensive instruction manual—it's a table of contents.

## Project Summary

Seamless is a fashion web app where users upload photos of themselves to create an avatar, build a virtual wardrobe of clothing items, assemble outfits, and generate AI images of themselves wearing those outfits. See `docs/features/` for full feature definitions.

## Core Principles

1. **Repository as System of Record**: If it's not in this repository, it doesn't exist.
2. **Progressive Disclosure**: Start here, then navigate to specific docs as needed.
3. **Mechanical Enforcement**: Architectural rules are enforced by linters and tests, not convention.
4. **Documentation is Code**: All docs are versioned and updated alongside code changes.
5. **Full Stack Mono-repo**: This repo contains both the React frontend and the FastAPI backend.

## Getting Started

### First-Time Setup

1. Read `docs/getting-started/architecture.md` for domain map and layer structure
2. Review `docs/guides/frontend.md` for component patterns and conventions
3. Review `docs/guides/backend.md` for backend patterns and setup
4. Check `docs/decisions/core-beliefs.md` for foundational principles

### Before Starting Work

1. Identify the affected domain(s) from `docs/getting-started/architecture.md`
2. Check `docs/project/quality-score.md` for current quality baseline
3. Review relevant feature specs in `docs/features/`
4. For complex work, check `docs/exec-plans/tech-debt-tracker.md` for ongoing initiatives

## Where to Find Information

| Need                            | Location                               |
| ------------------------------- | -------------------------------------- |
| What to build                   | `docs/features/`                       |
| Why it's designed this way      | `docs/decisions/`                       |
| How the system is organized     | `docs/getting-started/architecture.md` |
| Frontend patterns & conventions | `docs/guides/frontend.md`              |
| Backend patterns & conventions  | `docs/guides/backend.md`               |
| Quality expectations            | `docs/project/quality-score.md`        |
| Current work in progress        | `docs/exec-plans/tech-debt-tracker.md` |
| Supabase & auth setup           | `docs/getting-started/setup.md`        |
| Deployment guide                | `docs/DEPLOYMENT.md`                   |
| Tech debt backlog               | `docs/exec-plans/tech-debt-tracker.md` |
| Library references              | `docs/references/`                     |

## Running Documentation

```bash
cd docs
npm install
npm run start  # Runs at http://localhost:3000
```

## Tech Stack

### Frontend (`frontend/`)

- React 19 + TypeScript
- Vite 7 + SWC
- React Router v7
- Tailwind CSS v4
- Zustand
- Vitest + React Testing Library

### Backend (`backend/`)

- Python 3.12+
- FastAPI
- Uvicorn
- Supabase-py
- fal-python (AI generation)

## Key Constraints

### Architectural Layers (Frontend)

Within each domain (`frontend/src/features/`), dependencies flow forward:

```
Types → API → Stores → Components → Pages
```

See `docs/getting-started/architecture.md` for full details.

### Code Quality

- All API responses validated with zod schemas at boundaries (Frontend)
- No `any` types except in adapter layers
- File size limit: 300 lines (split if exceeded)
- Test coverage: minimum 80% for stores/API, 70% for components

### Documentation

- Product specs must have: user story, acceptance criteria
- Design docs must have: problem statement, decision, rationale
- All docs cross-linked and indexed

## Working in This Repository

### Development Workflow

1. **Understand**: Read related product spec and design docs
2. **Plan**: For complex tasks, check or create an execution plan
3. **Implement**: Follow architectural constraints from `docs/getting-started/architecture.md`
4. **Test**: Write tests alongside code
5. **Document**: Update relevant docs in the same PR

### When You're Stuck

1. Check if patterns exist in other domains
2. Verify the API contract with `docs/references/api-contracts.md`
3. If a capability is missing, document the gap first

---

**Remember**: This file is your starting point. Navigate to specific docs for detail. Don't try to hold everything in context—use the structured docs to find what you need.
