# TypeScript Specific Rules

**Version**: 1.0.0
**Last Updated**: 2026-04-30

## Strict Mode

All TypeScript code must be written in strict mode.

## Type Safety Rules

### No `any`

The use of `any` is a **linting error**. Exception: narrow adapter layers that bridge untyped third-party data.

```typescript
// BAD
const data: any = response.json();

// GOOD - Use unknown first, then narrow
const data: unknown = response.json();
if (isUserData(data)) {
  // use data here
}
```

### Explicit Types Required

All variables and function parameters must carry explicit types.

```typescript
// BAD
function greet(name) {
  return `Hello, ${name}`;
}

// GOOD
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

### Unused Variables

Unused variables are a **linting error**. Parameters that are intentionally unused must be prefixed with an underscore:

```typescript
// Silence unused parameter warning
function handleClick(_event: MouseEvent) {
  console.log('Clicked');
}
```

### Type Inference

Let TypeScript infer types when obvious, but explicit return types for public functions are recommended:

```typescript
// TypeScript infers: const users: User[]
const users = getUsers();

// Explicit return type for public functions
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

## API Responses

Validate all API responses with **Zod** at the boundary:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;

function parseUser(data: unknown): User {
  return UserSchema.parse(data);
}
```

This provides **runtime type safety** beyond what TypeScript compiler alone can guarantee.

## Generics

Use generics for reusable, type-safe utilities:

```typescript
// GOOD - generic function
function getById<T>(items: T[], id: string): T | undefined {
  return items.find(item => 'id' in item && item.id === id);
}
```

## Utility Types

Use built-in utility types:

```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserSummary = Pick<User, 'id' | 'name'>;

// Omit - exclude specific properties
type UserWithoutEmail = Omit<User, 'email'>;
```

## Type Checking

```bash
# Run TypeScript type checking
npm run typecheck
```

## Interface vs Type

- Use **interfaces** for object shapes (preferred)
- Avoid inline type aliases for objects

## See Also

- [React & JSX Standards](./react-jsx.md)
- [API Pattern - Frontend Guide](./FRONTEND.md)
