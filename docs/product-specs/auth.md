# Feature: User Authentication

**Status**: Planned
**Priority**: P0
**Domain**: Auth (`src/features/auth/`)
**Last Updated**: 2026-02-12

## User Story

As a new user, I want to create an account and log in so that I can access my virtual wardrobe and save my outfits.

## Acceptance Criteria

### Signup
- [ ] User can create account with email and password
- [ ] Email validation (valid format required)
- [ ] Password requirements enforced (minimum length, complexity TBD)
- [ ] Error messages shown for validation failures
- [ ] Redirect to dashboard after successful signup
- [ ] User prompted to upload avatar photos after first signup (see user-profile.md)

### Login
- [ ] User can log in with email and password
- [ ] Error message shown for invalid credentials
- [ ] Redirect to dashboard after successful login
- [ ] "Remember me" option (extended token lifetime)

### Session Management
- [ ] Auth token stored securely
- [ ] Token automatically refreshed before expiry
- [ ] User redirected to login on session expiry
- [ ] Logout clears all stored tokens and state

### Protected Routes
- [ ] Unauthenticated users redirected to /login
- [ ] After login, user returns to originally requested page

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | Email + password form, link to signup |
| `/signup` | SignupPage | Email + password form, link to login |

## Design References

- See `docs/design-docs/auth-strategy.md` for technical approach
- Backend endpoints: `POST /auth/login`, `POST /auth/signup`, `POST /auth/refresh`, `POST /auth/logout`

## Out of Scope (for now)

- OAuth providers (Google, Apple) — future enhancement
- Multi-factor authentication — future enhancement
- Password reset via email — next iteration
- Email verification — next iteration
