# Formatting & Style

**Version**: 1.0.0
**Last Updated**: 2026-04-30

## Prettier Configuration (Frontend)

The project uses Prettier as the canonical formatter. Configuration enforces:

- **2-space** indentation
- **Print width**: 100 characters
- **Single quotes** for strings
- **Trailing commas** in all multi-line structures
- **Semicolons** at the end of every statement
- **Parentheses** always around arrow function parameters
- **LF** line endings

### Commands

```bash
# Format with Prettier
npm run format

# Check without changes
npm run format:check
```

## ESLint

ESLint runs alongside Prettier (via `eslint-config-prettier`) to prevent rule conflicts.

```bash
# Lint
npm run lint

# Auto-fix
npm run lint:fix
```

## Pre-commit Hooks

Formatting is automatically enforced on staged files through **lint-staged** and **Husky** pre-commit hooks. Unformatted code should never reach the repository.

## Python (Ruff)

```bash
# Format with Ruff
ruff format

# Fix issues
ruff check --fix
```

### Python Rules

- 4-space indentation
- Maximum line length: 100 characters
- Import sorting via isort (integrated in ruff)

## CSS / Tailwind

- Use Tailwind utility classes
- Custom CSS only for complex animations or overrides
- Follow the visual style guide in `docs/decisions/visual-style.md`

## See Also

- [Naming Conventions](./naming-conventions.md)
- [Visual Style](../decisions/visual-style.md)
