# Design Decision: Authentication Strategy

**Status**: Planned
**Last Updated**: 2026-02-12

## Problem Statement

Seamless needs user authentication for account creation, login, and protecting routes. Users should be able to sign up with email/password and potentially OAuth providers later.

## Decision

Use Supabase Auth through the FastAPI backend. The frontend never talks to Supabase directly.

## Flow

```
1. User enters credentials in frontend
2. Frontend sends POST to FastAPI /auth/login
3. FastAPI authenticates with Supabase Auth
4. FastAPI returns JWT access token + refresh token
5. Frontend stores tokens (httpOnly cookies preferred, localStorage fallback)
6. Frontend sends token in Authorization header on subsequent requests
7. FastAPI validates token on each request
```

## Rationale

- **Backend mediates all auth**: No Supabase SDK on frontend. Backend controls auth flow, can add custom logic (rate limiting, audit logging, custom validation)
- **JWT tokens**: Stateless authentication, works well with React SPA
- **Supabase Auth**: Battle-tested auth with email/password, OAuth support, and Postgres integration

## Frontend Responsibilities

- Store auth tokens securely
- Attach tokens to API requests via shared HTTP client
- Redirect to login on 401 responses
- Protect routes with `ProtectedRoute` component
- Manage auth state in Zustand store

## Alternatives Considered

1. **Supabase SDK directly in frontend**: Rejected — bypasses backend, harder to add custom logic
2. **Session-based auth (cookies only)**: Rejected — more complex with SPA, CSRF concerns
3. **Third-party auth service (Auth0)**: Rejected — additional cost, vendor lock-in when Supabase already provides auth

## Implementation Notes

- Auth store: `src/features/auth/store.ts`
- API layer: `src/features/auth/api.ts`
- Protected route: `src/features/auth/components/ProtectedRoute.tsx`
- Token refresh: Handle in shared API client interceptor
