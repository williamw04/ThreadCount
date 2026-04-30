# General Best Practices

**Version**: 1.0.0
**Last Updated**: 2026-04-30

## Core Principles

1. **Readability First**: Code is read more often than it is written. Optimize for clarity over cleverness.
2. **Small Functions**: Functions should do one thing well. Aim for under 30 lines.
3. **Explicit Over Implicit**: Make dependencies and side effects visible.
4. **Fail Fast**: Validate inputs early and provide clear error messages.
5. **Keep It Simple**: Avoid unnecessary abstraction until repetition demands it.

## JavaScript/TypeScript Rules

- Use `const` by default, `let` only for values that must be reassigned
- `var` is forbidden
- Use strict equality (`===` and `!==`) for all comparisons
- **Prohibited**: `eval()`, `with` statements, prototype mutation
- Every declared variable must be used — remove unused variables before merging
- Callback functions in `map`, `filter`, `reduce` must explicitly return a value

## General Rules

- No `any` types except in narrow adapter layers
- Parse API responses with Zod at the boundary
- Keep files under 300 lines
- Co-locate tests with the code they test
- Use meaningful, descriptive names

## Code Review Checklist

- [ ] Does this code do what it's supposed to?
- [ ] Is the code readable and maintainable?
- [ ] Are there any security concerns?
- [ ] Are errors handled properly?
- [ ] Is there test coverage for new functionality?
- [ ] All variables used, no unused declarations?
- [ ] Strict equality used instead of loose equality?

## See Also

- [Naming Conventions](./naming-conventions.md)
- [Code Structure](./code-structure.md)
- [Testing Standards](./testing.md)
