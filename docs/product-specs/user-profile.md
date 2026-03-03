# Feature: Onboarding & User Profile

**Status**: In Progress
**Priority**: P0
**Domain**: Profile (`src/features/profile/`)
**Last Updated**: 2026-03-02

## User Story

As a new user, I want to upload a full body photo of myself after signing up so the app can create an avatar for AI-generated try-on images. As a returning user, I want to manage my photos and profile.

## Acceptance Criteria

### Onboarding (first-time after signup)

#### Step 1: Photo Upload

- [x] After signup, user is redirected to an onboarding screen
- [x] User prompted to upload a full body photo of themselves
- [x] Instructions shown (stand straight, neutral background, full body visible)
- [x] Photo preview shown before confirming upload
- [x] Photo sent to backend for avatar/model creation (fal.ai nano-banana-2/edit)
- [x] Success confirmation shown
- [x] Skip option available (can set up later from profile)

#### Step 2: Interactive Tutorial (Guided Walkthrough)

- [ ] After photo upload, user enters an interactive tutorial
- [ ] Tutorial walks user through the complete core flow:
  1. **Explore Preloaded Wardrobe**: User sees sample clothing items preloaded in their virtual wardrobe (tops, bottoms, shoes, accessories)
  2. **Add to Outfit Builder**: User selects items from wardrobe to add to outfit builder
  3. **Arrange Outfit**: User arranges selected items in the outfit builder canvas
  4. **Generate Try-On**: User generates an AI image of themselves wearing the outfit
  5. **Save to Looks**: User saves the generated image to "Previous Looks"
- [ ] Tutorial includes step-by-step guidance with tooltips or highlights
- [ ] Tutorial is skippable at any point
- [ ] User can replay the tutorial from their profile settings

#### Step 3: Complete Onboarding

- [ ] After completing (or skipping) tutorial, user reaches dashboard
- [x] Preloaded sample items remain in their wardrobe as a starting point (Database migration created)

### Avatar Management (returning users)

- [ ] User can view their current avatar photo from their profile
- [ ] User can delete their photo and upload a new one to update their avatar
- [ ] Updating the avatar triggers a new model creation on the backend

### Profile Management

- [ ] User can view their profile information
- [ ] User can edit display name
- [ ] User can change password
- [ ] User can delete their account (with confirmation)
- [ ] User can replay the onboarding tutorial from settings

## Preloaded Wardrobe Items

When new users complete onboarding, their wardrobe is seeded with sample items:

| Category    | Sample Items                                   |
| ----------- | ---------------------------------------------- |
| Tops        | White t-shirt, Blue denim jacket, Black blazer |
| Bottoms     | Blue jeans, Black trousers, Khaki shorts       |
| Dresses     | Little black dress, Summer maxi dress          |
| Shoes       | White sneakers, Black leather boots, Sandals   |
| Accessories | Silver watch, Leather belt, Sunglasses         |

- [ ] Preloaded items are read-only templates (cannot be edited/deleted by user)
- [ ] Preloaded items include placeholder images
- [ ] User can add their own clothing items alongside preloaded items

## Pages

| Route         | Component       | Description                                 |
| ------------- | --------------- | ------------------------------------------- |
| `/onboarding` | OnboardingPage  | Photo upload + guided tutorial flow         |
| `/profile`    | ProfilePage     | Avatar photo, profile info, edit options    |
| `/tutorial`   | TutorialOverlay | Interactive walkthrough overlay (any route) |

## Design References

- Backend endpoints: `GET /profile`, `PUT /profile`, `POST /profile/avatar`, `DELETE /profile/avatar`
- Avatar processing happens on backend (feeds into AI model for try-on)

## Database Schema

### Tables

```sql
-- profiles (extends auth.users)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  display_name text,
  onboarding_completed boolean DEFAULT false,
  tutorial_completed boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
)

-- avatars (user's photo + AI-generated model)
avatars (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  original_photo_path text,    -- User's uploaded photo (Supabase Storage)
  model_canvas_path text,      -- AI-generated model canvas (for try-on)
  model_status text,           -- 'pending', 'processing', 'ready', 'failed'
  is_active boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
)
```

### Storage Buckets

| Bucket           | Purpose                     |
| ---------------- | --------------------------- |
| `avatars/photos` | Original user uploads       |
| `avatars/models` | AI-generated model canvases |
| `wardrobe`       | Clothing images             |
| `generated`      | AI try-on results           |

## Out of Scope (for now)

- Multiple photos from different angles — future enhancement
- 3D avatar visualization on frontend — future enhancement
- Social profile (public/private) — future enhancement
- User-customizable preloaded wardrobe selection — future enhancement

## Dependencies

The interactive tutorial requires:

- Virtual Wardrobe feature to be partially implemented (to display preloaded items)
- Outfit Builder feature to be partially implemented (for the try-on step)
- Previous Looks / Saved Images feature (can be stubbed for tutorial)
