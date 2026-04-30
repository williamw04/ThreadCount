# Features Documentation

This directory contains all feature documentation organized by feature area.

## Feature List

| Feature | Status | Priority | Files |
|---------|--------|----------|-------|
| [Auth](./auth/) | Completed | P0 | product-spec.md, design.md |
| [User Profile](./user-profile/) | In Progress | P0 | product-spec.md |
| [Virtual Wardrobe](./virtual-wardrobe/) | In Progress | P0 | product-spec.md, exec-plan.md |
| [Outfit Builder](./outfit-builder/) | In Progress | P1 | product-spec.md, design.md, exec-plan.md |
| [Style Analysis](./style-analysis/) | Planned | P2 | product-spec.md |

## Feature Structure

Each feature directory contains:

```
features/{feature-name}/
├── product-spec.md    # User stories, acceptance criteria, requirements
├── design.md          # Design decisions (if applicable)
└── exec-plan.md       # Execution plan with phases (if applicable)
```

## Additional Documentation

- [API Contracts](../references/api-contracts.md) - API endpoint definitions
- [Tech Debt](../exec-plans/tech-debt-tracker.md) - Technical debt tracking

## Architecture

See [docs/getting-started/architecture.md](../getting-started/architecture.md) for system-level architecture.
