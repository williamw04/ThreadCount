# Product Specifications Index

**Last Updated**: 2026-03-02

## Core Features

- [User Authentication](./auth.md) - Login, signup, session management
- [Onboarding & User Profile](./user-profile.md) - Full body photo upload, avatar creation, profile management
- [Virtual Wardrobe](./virtual-wardrobe.md) - Upload garments, categorize, browse, manage
- [Outfit Builder & Try-On](./outfit-builder.md) - Assemble outfits, generate AI images of yourself wearing them, save to Previous Looks
- [Style Analysis](./style-analysis.md) - AI-powered color/style recommendations

## Implementation Priority

| Priority | Feature                   | Status      |
| -------- | ------------------------- | ----------- |
| P0       | User Authentication       | Completed   |
| P0       | Onboarding & User Profile | In Progress |
| P0       | Virtual Wardrobe          | Planned     |
| P1       | Outfit Builder & Try-On   | Planned     |
| P2       | Style Analysis            | Planned     |

## Deferred Features

These are planned for future iterations:

- **Inspiration** — Save clothes/outfits you don't own for reference. Will be a section within the Virtual Wardrobe when implemented.
- **FastAPI Backend** — Transition business logic and AI processing from frontend to dedicated backend service. (Started)
