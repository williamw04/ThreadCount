# Contributing to Seamless

## Getting Started

1. **Fork & clone** the repository
2. **Set up your environment** - see [docs/FRONTEND.md](docs/FRONTEND.md) and [docs/BACKEND.md](docs/BACKEND.md)
3. **Create a feature branch** from `main`

## Coding Guidelines

### Architecture Rules

Follow the layer dependency order within each feature:

```
Types → API → Stores → Components → Pages
```

- Dependencies flow **forward only** - never import from a later layer
- Keep files under **300 lines**
- Use **named exports**
- Validate API responses with **zod** at the boundary
- Shared UI belongs in `frontend/src/shared/ui/`
- Don't import another feature's components directly - share types or primitives instead

### Code Quality

| Requirement | Target |
|-------------|--------|
| TypeScript | Strict mode, no `any` except adapter layers |
| Test coverage | 80% stores/API, 70% components |
| Pre-commit hooks | Must pass before pushing |

### Running Quality Checks

```bash
# Frontend
cd frontend
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run test:run  # Tests

# Backend
cd backend
pytest            # Python tests
```

## Development Workflow

### 1. Understand the Feature
- Read the product spec in `docs/features/[feature]/`
- Check for existing design docs in `docs/decisions/`
- Review relevant API contracts in `docs/references/api-contracts.md`

### 2. Implement
- Follow the layer rules from `docs/getting-started/architecture.md`
- Write tests alongside code
- Keep components small and focused

### 3. Test

### 4. Document
- Update relevant docs in the same PR
- Add product specs if creating new features
- Update `docs/getting-started/architecture.md` if adding new routes or domains

## PR Requirements

### Before Submitting

- [ ] All linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Tests pass (`npm run test:run`)
- [ ] New code has tests
- [ ] Documentation updated if needed

### PR Description Template

```markdown
## Summary
Brief description of changes

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Follows layer rules
- [ ] Files under 300 lines
- [ ] No `any` types (except adapters)
```

### Review Focus Areas

- Architecture: Layer rules followed?
- Testing: Coverage targets met?
- Security: No secrets exposed?
- DX: Is the code maintainable?

## Testing Requirements

### Coverage Targets

| Layer | Target |
|-------|--------|
| Stores | 80% |
| API/Client | 80% |
| Components | 70% |
| Pages | 60% |

### Testing Patterns

- **Co-locate tests**: Test file next to the unit under test
- **Test behavior, not implementation**: Use React Testing Library
- **Test stores in isolation**: Mock API dependencies
- **Integration tests**: For auth flow and critical user journeys

### Running Tests

```bash
# Frontend
npm run test:watch     # Watch mode
npm run test:run       # Single run
npm run test:coverage  # With coverage report

# Backend
pytest                 # All tests
pytest -v             # Verbose
pytest --cov          # With coverage
```

## Where to Find Things

| Need | Location |
|------|----------|
| What to build | `docs/features/` |
| Why designed this way | `docs/decisions/` |
| How system is organized | `docs/getting-started/architecture.md` |
| Frontend patterns | `docs/guides/frontend.md` |
| Backend patterns | `docs/guides/backend.md` |
| Setup guide | `docs/getting-started/setup.md` |
| Quality baseline | `docs/project/quality-score.md` |
| Tech debt | `docs/exec-plans/tech-debt-tracker.md` |

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Review past PRs for examples of contribution patterns
