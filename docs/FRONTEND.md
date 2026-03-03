# Frontend Guide

**Version**: 1.1.0
**Last Updated**: 2026-03-02

## Tech Stack

| Tool                           | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| React 19                       | UI framework                                     |
| TypeScript (strict)            | Type safety                                      |
| Vite 7 + SWC                   | Build tool (fast compilation via Rust-based SWC) |
| React Router v7                | Client-side routing                              |
| Tailwind CSS v4                | Utility-first styling                            |
| Zustand                        | State management                                 |
| Lucide React                   | Icons                                            |
| zod                            | Schema validation (parse at boundaries)          |
| Vitest + React Testing Library | Unit and component testing                       |

## Communication with Backend

The frontend communicates with two primary services:

1.  **Supabase Auth/Storage/DB**: Direct interaction for standard CRUD operations and authentication.
2.  **FastAPI Backend (`/api`)**: Orchestration for complex business logic, AI generation (fal.ai), and data processing.

### API Layer Pattern

All API calls must include the Supabase session token in the `Authorization` header when calling the FastAPI backend.

```typescript
// src/features/profile/api.ts
export async function processAvatar(userId: string) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Get current session for token
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${API_BASE_URL}/api/avatar/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  // ... handle response
}
```

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

> Full visual spec: `docs/design-docs/visual-style.md` — "The Light Table" theme.

### Tailwind CSS Conventions

- Use Tailwind utility classes directly in JSX
- Use CSS variables for theme colors (defined in `src/styles/globals.css`)
- Use `clsx` for conditional classes
- Use inline `style={{ fontFamily: 'var(--font-serif)' }}` only for font-family overrides and truly dynamic values
- **No pure white** (`#FFFFFF`) anywhere — use `var(--bg-elevated)` for the lightest tone

### Design Tokens

```css
:root {
  /* Surfaces */
  --bg: #f5f0eb; /* Alabaster page background */
  --bg-elevated: #fdfbf9; /* Cards, modals */

  /* Text */
  --text-primary: #0d0d0d; /* Near-black for headings */
  --text-secondary: #6b6560; /* Warm grey for body text */
  --text-tertiary: #a39e98; /* Metadata, placeholders */

  /* Borders */
  --border: #e8e3dd; /* Subtle warm border */
  --border-strong: #0d0d0d; /* Editorial divider lines */

  /* Accent — International Orange (the ONE UI color) */
  --accent: #d94e1f;
  --accent-hover: #c14319;

  /* Semantic */
  --error: #c4391c;
  --success: #2d7a3a;

  /* Shadows */
  --shadow-levitate: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04);

  /* Typography */
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Space Mono', 'Courier New', monospace;
}
```

### Typography

Three fonts, three roles:

| Role         | Font             | CSS Variable   | Usage                                                          |
| ------------ | ---------------- | -------------- | -------------------------------------------------------------- |
| **Headings** | Instrument Serif | `--font-serif` | Page titles, section headers — editorial/fashion magazine feel |
| **Body**     | Inter            | `--font-sans`  | Body text, buttons, form labels — neutral workhorse            |
| **Metadata** | Space Mono       | `--font-mono`  | Tags, labels, IDs, brand/size/fabric — garment tag feel        |

Apply via inline style where Tailwind's `font-*` utilities don't cover it:

```tsx
<h1 style={{ fontFamily: 'var(--font-serif)' }}>Wardrobe</h1>
<span style={{ fontFamily: 'var(--font-mono)' }}>WOOL · AUTUMN</span>
```

### Component Styling Rules

**Buttons:**

- **Primary**: Solid `--accent` background, white text. Uppercase, letter-spaced. For THE main action on a page.
- **Secondary**: Black border, transparent fill, black text. For supporting actions.
- **Ghost**: No border, warm grey text. For tertiary actions.
- No rounded corners on buttons.

**Cards:**

- `--bg-elevated` background, `--border` border, `--shadow-card` shadow.
- No rounded corners (or 2px max). Editorial, not playful.

**Inputs:**

- Bottom-border only (underline style), no box borders.
- Labels: uppercase, letter-spaced, `--text-secondary`.
- Focus state: bottom border turns `--accent`.

**Tags / Metadata:**

- Space Mono, uppercase, letter-spaced.
- Example: `WOOL · AUTUMN · NAVY`

**Layout:**

- Use thin `--border-strong` horizontal rules to separate sections (editorial style).
- Aggressive whitespace — fill ~60% of the screen, let the content breathe.
- Clothing images get `--shadow-levitate` to float above the surface.

### Color Rule

> The clothes are the only color on the screen. UI uses black, warm greys, and the single orange accent. No other colors.

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
- See `docs/design-docs/visual-style.md` for the full visual design spec
- See `docs/design-docs/core-beliefs.md` for foundational principles
- See `docs/QUALITY_SCORE.md` for coverage targets
