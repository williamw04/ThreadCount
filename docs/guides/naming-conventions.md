# Naming Conventions

**Version**: 1.0.0
**Last Updated**: 2026-04-30

## TypeScript / JavaScript

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Functions | camelCase | `getUserById()` |
| Classes | PascalCase | `UserProfile` |
| React Components | PascalCase | `UserProfile` |
| Interfaces | PascalCase | `UserProfileProps` |
| Types | PascalCase | `ApiResponse` |
| Enums | PascalCase | `UserRole` |
| True constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Boolean variables | is/has/can prefix | `isActive`, `hasPermission` |

## Python

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_name` |
| Functions | snake_case | `get_user_by_id()` |
| Classes | PascalCase | `UserProfile` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Private methods | underscore prefix | `_internal_method()` |
| Pydantic models | PascalCase with suffix | `UserRequest`, `UserResponse` |

## Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Utilities | kebab-case | `api-client.ts` |
| Constants | SCREAMING_SNAKE_CASE | `constants.ts` |
| Directories | kebab-case | `user-profile/` |

## CSS / Tailwind

| Type | Convention | Example |
|------|------------|---------|
| Custom properties | kebab-case | `--primary-color` |
| Tailwind classes | utility-first | `flex`, `text-center` |

## Database

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case, plural | `user_profiles` |
| Columns | snake_case | `created_at` |
| Foreign keys | `table_id` suffix | `user_id` |

## TypeScript Type Names

- Use interfaces for object shapes (preferred over inline type aliases)
- Use clear, descriptive names
- Follow linter-enforced conventions

## Pydantic Model Names

- Use suffixes to distinguish input vs response models
- `UserRequest` for input, `UserResponse` for output
- Don't reuse the same name for different purposes

## See Also

- [Formatting & Style](./formatting-style.md)
- [Code Structure](./code-structure.md)
