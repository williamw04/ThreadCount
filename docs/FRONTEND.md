# Frontend Guide

**Version**: 1.0.0
**Last Updated**: 2026-02-12

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite 6 + SWC | Build tool (fast compilation via Rust-based SWC) |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Zustand | State management |
| Radix UI | Accessible headless UI primitives |
| Lucide React | Icons |
| react-hook-form + zod | Form handling + validation |
| Vitest + React Testing Library | Unit and component testing |

## Component Patterns

### File Naming
- Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `types.ts` or `camelCase.types.ts`
- Tests: `ComponentName.test.tsx` (co-located next to component)

### Component Structure
```typescript
// Imports - grouped: react, external libs, internal shared, domain-local
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { useAuth } from '../store';
import type { LoginFormData } from '../types';

// Types for this component (if small, inline; if large, separate file)
interface LoginFormProps {
  onSuccess: () => void;
}

// Component
export function LoginForm({ onSuccess }: LoginFormProps) {
  // hooks first
  // derived state
  // handlers
  // render
}
```

### Component Guidelines
- **Named exports** (not default exports) for all components
- **Function declarations** (`function Foo()`) for components, not arrow functions
- **Props interfaces** defined above the component or in `types.ts`
- **Max 300 lines** per file. Split large components into smaller ones.
- **Co-locate tests**: `LoginForm.test.tsx` next to `LoginForm.tsx`

## Styling

### Tailwind CSS Conventions
- Use Tailwind utility classes directly in JSX
- Use CSS variables for theme colors (defined in `src/styles/globals.css`):
  - `var(--background)`, `var(--primary)`, `var(--accent)`, `var(--secondary)`, `var(--border)`
- Use `clsx` or `tailwind-merge` for conditional classes
- No inline `style={}` except for truly dynamic values (e.g., calculated sizes)

### Design Tokens
```css
:root {
  --background: #FAFAFA;
  --card-bg: #FFFFFF;
  --primary: #1A1A1A;
  --accent: #C9A87C;
  --secondary: #6B7280;
  --success: #22C55E;
  --error: #EF4444;
  --border: #E5E7EB;
}
```

## State Management

### Zustand Store Pattern
```typescript
import { create } from 'zustand';
import type { WardrobeItem } from './types';
import { fetchWardrobeItems } from './api';

interface WardrobeState {
  items: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
}

export const useWardrobeStore = create<WardrobeState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await fetchWardrobeItems();
      set({ items, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load wardrobe', isLoading: false });
    }
  },
}));
```

### When to Use What
- **Zustand**: Shared state across components (auth, wardrobe items, current outfit)
- **useState**: Local component state (form inputs, UI toggles, modals)
- **URL state (React Router)**: Current page, filters, search params

## API Layer

### Pattern
```typescript
import { z } from 'zod';
import { apiClient } from '@/shared/api/client';

// Define response schema
const WardrobeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['tops', 'bottoms', 'outerwear', 'shoes', 'accessories']),
  imageUrl: z.string().url(),
  colors: z.array(z.string()),
  season: z.array(z.string()),
  tags: z.array(z.string()),
});

// Parse response at boundary
export async function fetchWardrobeItems() {
  const response = await apiClient.get('/wardrobe/items');
  return z.array(WardrobeItemSchema).parse(response.data);
}
```

### Rules
- All API calls go through the shared `apiClient` (handles auth tokens, base URL, errors)
- All responses validated with zod at the API layer boundary
- API functions return typed data, never raw responses

## Routing

### Protected Routes
```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

## Testing

### Tools
- **Vitest**: Test runner (native Vite integration)
- **React Testing Library**: Component rendering and queries
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Extended DOM matchers

### Pattern
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Guidelines
- Test behavior, not implementation
- Query by role, text, or label (not by class or test-id unless necessary)
- Co-locate tests with components
- Mock API calls, not stores (test the full store → component flow when practical)

## References

- See `ARCHITECTURE.md` for domain structure and layer rules
- See `docs/design-docs/core-beliefs.md` for foundational principles
- See `docs/QUALITY_SCORE.md` for coverage targets
