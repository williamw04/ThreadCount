# Feature: User Profile & Avatar

**Status**: Planned
**Priority**: P1
**Domain**: Profile (`src/features/profile/`)
**Last Updated**: 2026-02-12

## User Story

As a user, I want to upload photos of myself so the app can create an avatar for AI-generated try-on images.

## Acceptance Criteria

### Avatar Photos
- [ ] User prompted to upload photos after initial signup
- [ ] User can upload multiple photos from different angles
- [ ] Photos sent to backend for avatar/model creation
- [ ] User can view their current avatar photos
- [ ] User can delete individual photos
- [ ] User can upload new photos to update their avatar
- [ ] Skip option available (can set up later)

### Profile Management
- [ ] User can view their profile information
- [ ] User can edit display name
- [ ] User can change password
- [ ] User can delete their account (with confirmation)

### Settings
- [ ] Theme preference (if applicable)
- [ ] Notification preferences (if applicable)

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/profile` | ProfilePage | Avatar photos, profile info, edit options |
| `/settings` | SettingsPage | Account settings, preferences |

## Design References

- Backend endpoints: `GET /profile`, `PUT /profile`, `POST /profile/avatar`, `DELETE /profile/avatar/:id`
- Avatar processing happens on backend (feeds into AI model)

## Out of Scope (for now)

- 3D avatar visualization on frontend — future enhancement
- Social profile (public/private) — future enhancement
