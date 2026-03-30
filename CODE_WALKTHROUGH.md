# Code Review Walkthrough Guide

**Purpose:** Step-by-step guide for explaining the codebase structure during code review presentation.

---

## Part 1: Project Overview (5 minutes)

### Start Here: ARCHITECTURE.md

```
/Users/williamwu/Documents/academics/class/sdnd/sandbox/ThreadCount/ARCHITECTURE.md
```

**Key Points to Explain:**
- Full-stack monorepo: `frontend/` + `backend/` + `supabase/`
- System shape: React ↔ FastAPI ↔ Supabase ↔ fal.ai
- Frontend domains: auth, onboarding, dashboard, wardrobe, outfit-builder
- Dependency rule: `Types → API → Stores → Components → Pages`

### Then: UML Class Diagram

```
/Users/williamwu/Documents/academics/class/sdnd/sandbox/ThreadCount/docs/diagrams/uml-class-diagram.md
```

**Key Points:**
- Backend: `Settings` inherits from `BaseSettings`, Pydantic models from `BaseModel`
- Frontend: `ApiClient` class, domain types (WardrobeItem, Outfit, Profile)
- Relationship: `OutfitCanvasState` contains `OutfitItem` (composition)

---

## Part 2: Backend Walkthrough (10 minutes)

### Entry Point

```
backend/app/main.py (38 lines)
```

**Explain:**
1. FastAPI app creation
2. CORS middleware configuration
3. Global exception handler
4. Router registration (avatar, wardrobe, image, ai, outfits)
5. Health check endpoint

**Code to Highlight:**
```python
app.include_router(wardrobe.router, prefix="/api/wardrobe", tags=["wardrobe"])
```

### Configuration

```
backend/app/config.py (18 lines)
```

**Explain:**
1. `Settings` class inherits from `BaseSettings`
2. Environment variables loaded from `.env`
3. `lru_cache` for singleton pattern
4. **Security Issue**: API keys stored as plain strings (should be `SecretStr`)

**Code to Highlight:**
```python
class Settings(BaseSettings):
    supabase_url: str
    supabase_secret_key: str  # Should be SecretStr
    fal_api_key: str
```

### Supabase Client

```
backend/app/supabase_client.py (7 lines)
```

**Explain:**
1. Singleton pattern for Supabase client
2. Uses service role key (bypasses RLS for admin operations)

### Route Example: Wardrobe

```
backend/app/api/routes/wardrobe.py (281 lines)
```

**Walkthrough Order:**

1. **Imports and Logging Setup** (lines 1-12)
   - Explain: `logging.basicConfig()` duplicated here (should be in main.py only)

2. **Pydantic Models** (lines 14-40)
   - `WardrobeItem` - input model
   - `WardrobeItemResponse` - output model
   - `UpdateWardrobeItem` - partial update model
   - **Issue**: Models should be in `schemas/` directory, not route file

3. **GET /items Endpoint** (lines 42-98)
   - **Security Issue**: `user_id` from query param, no authentication
   - Query construction with filters
   - Response building

4. **POST /items Endpoint** (lines 132-209)
   - File upload handling
   - **Issue**: No file size or MIME type validation
   - Storage upload to Supabase
   - **Issue**: `datetime.utcnow()` deprecated

5. **PUT and DELETE Endpoints** (lines 211-281)
   - Same authentication issues
   - Cascade delete (removes image from storage)

**Code to Highlight:**
```python
@router.get("/items", response_model=List[WardrobeItemResponse])
async def get_wardrobe_items(
    user_id: str,  # ISSUE: No authentication - anyone can access any user's data
    ...
):
```

### Service Layer

```
backend/app/services/gemini_client.py (93 lines)
```

**Walkthrough:**
1. **Constructor** (lines 22-27): Configures Gemini API
2. **analyze_clothing_image** (lines 29-65): Main AI method
3. **validate_category, validate_seasons** (lines 70-93)
   - **SRP Violation**: Validation should be separate from client

```
backend/app/services/fal_client.py (46 lines)
```

**Walkthrough:**
1. **Constructor** (line 12): Sets `FAL_KEY` in environment
   - **Issue**: Global environment pollution
2. **generate_image** (lines 14-25): AI image generation
3. **remove_background** (lines 27-41): Image processing

---

## Part 3: Frontend Walkthrough (15 minutes)

### Entry Point

```
frontend/src/main.tsx (few lines)
frontend/src/App.tsx (14 lines)
```

**Explain:**
1. React 19 bootstrap
2. Auth initialization via `useAuthStore().initialize()`
3. Router setup

### Route Configuration

```
frontend/src/routes/index.tsx (41 lines)
```

**Walkthrough:**
1. Route definitions with `createBrowserRouter`
2. Public routes: `/login`, `/signup`
3. Protected routes wrapped in `<ProtectedRoute>`
4. Redirect behavior

**Code to Highlight:**
```typescript
{
  path: "/wardrobe",
  element: <ProtectedRoute><WardrobePage /></ProtectedRoute>,
}
```

### Shared API Layer

```
frontend/src/shared/api/client.ts (87 lines)
```

**Walkthrough Order:**

1. **ApiClient Class** (lines 14-85)
   - Constructor with baseUrl
   - `getAuthToken()` - retrieves Supabase session token
   
2. **Request Method** (lines 28-68)
   - Header construction
   - Bearer token injection
   - Error handling
   - **Issue**: `return undefined as T` for 204 responses (type unsafe)

3. **HTTP Methods** (lines 70-84)
   - get, post, put, delete

**Code to Highlight:**
```typescript
private async getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
```

```
frontend/src/shared/api/supabase.ts (13 lines)
```

**Explain:**
- Supabase client initialization
- Environment variable validation

### Auth Domain

```
frontend/src/features/auth/types.ts (29 lines)
```

**Walkthrough:**
1. Zod schemas: `loginSchema`, `signupSchema`
2. Type inference: `LoginFormData`, `SignupFormData`
3. `AuthUser` type

```
frontend/src/features/auth/store.ts (107 lines)
```

**Walkthrough:**
1. State interface: `user`, `isLoading`, `error`
2. `initialize()` - session bootstrap
3. `login()`, `signup()`, `logout()` actions
4. **Issue**: Direct Supabase import (tight coupling)

```
frontend/src/features/auth/components/LoginForm.tsx (115 lines)
```

**Walkthrough:**
1. Zod validation with `safeParse`
2. Error parsing logic (lines 19-31)
   - **Issue**: Duplicated in SignupForm
3. Google OAuth button
4. Form submission flow

```
frontend/src/features/auth/components/ProtectedRoute.tsx (19 lines)
```

**Explain:**
- Guards protected routes
- Redirects to `/login` if no user

### Wardrobe Domain

```
frontend/src/features/wardrobe/types.ts (93 lines)
```

**Walkthrough:**
1. `Category` type union
2. `Season` type union
3. `WardrobeItem` interface
4. `WardrobeFilters` interface
5. `CATEGORIES` constant array

```
frontend/src/features/wardrobe/api.ts (246 lines)
```

**Walkthrough:**
1. **Issue**: Uses `VITE_API_URL` instead of `VITE_API_BASE_URL` (inconsistent)
2. **Issue**: Duplicate `getAuthToken()` function (lines 27-37)
3. `fetchWardrobeItems()` - with Zod validation
4. `createWardrobeItem()` - FormData upload
5. `analyzeImage()` - **Issue**: No Zod validation on response
6. **Issue**: `AIAnalysisResult` defined here (should be in types.ts)

```
frontend/src/features/wardrobe/store.ts (152 lines)
```

**Walkthrough:**
1. State interface: `items`, `isLoading`, `error`, `filters`
2. `fetchItems()` action (lines 35-53)
   - **Issue**: `useAuthStore.getState().user` direct coupling
3. `setFilters()`, `clearFilters()` - reactive fetching
4. `addItem()`, `updateItem()`, `deleteItem()` - CRUD operations

**Code to Highlight:**
```typescript
fetchItems: async () => {
  const user = useAuthStore.getState().user;  // Hidden dependency
  if (!user) { set({ error: 'User not authenticated' }); return; }
  const items = await api.fetchWardrobeItems(user.id, filters);
}
```

```
frontend/src/features/wardrobe/pages/WardrobePage.tsx (244 lines)
```

**Walkthrough:**
1. Filter bar with CategoryFilter, ColorFilter, SeasonFilter
2. WardrobeGrid component
3. UploadModal trigger
4. Active filter count display

```
frontend/src/features/wardrobe/components/UploadModal.tsx (360 lines)
```

**Walkthrough:**
1. **Issue**: File exceeds 300-line limit
2. Image dropzone
3. AI analysis integration
4. Preview state management
5. Form submission

**Suggested Split:**
```
UploadModal.tsx (~150 lines)
ImageDropzone.tsx (~80 lines)
ImagePreview.tsx (~60 lines)
```

### Outfit Builder Domain

```
frontend/src/features/outfit-builder/types.ts (82 lines)
```

**Walkthrough:**
1. `OutfitSlot` type - canvas positions
2. `OutfitItem` - item on canvas
3. `OutfitCanvasState` - full canvas state
4. `Outfit`, `OutfitCreateInput`, `OutfitUpdateInput`

```
frontend/src/features/outfit-builder/store.ts (381 lines)
```

**Walkthrough:**
1. **Issue**: File exceeds 300-line limit
2. Canvas state: top[], bottom, shoes, accessories
3. Layer management for stacked items
4. CRUD for saved outfits
5. **Issue**: Same auth store coupling as wardrobe

```
frontend/src/features/outfit-builder/pages/OutfitBuilderPage.tsx (180 lines)
```

**Walkthrough:**
1. Viewport-locked shell (100dvh)
2. Header with navigation
3. OutfitCanvas in center
4. WardrobePanel on side
5. Controls row at bottom

```
frontend/src/features/outfit-builder/components/WardrobePanel.tsx (463 lines)
```

**Walkthrough:**
1. **Critical Issue**: File exceeds 300-line limit (463 lines)
2. Tab navigation (Wardrobe, Saved Looks)
3. Category filtering
4. Item grid display
5. Drag to canvas functionality

**Suggested Split:**
```
WardrobePanel.tsx (~150 lines)
WardrobePanelNavigation.tsx (~80 lines)
WardrobePanelItems.tsx (~100 lines)
WardrobePanelSaved.tsx (~80 lines)
```

```
frontend/src/features/outfit-builder/components/OutfitCanvas.tsx (270 lines)
```

**Walkthrough:**
1. Canvas slot rendering
2. Item positioning logic
3. **Issue**: Magic numbers in `getAccessoryPosition()`
4. Drop zone handling

```
frontend/src/features/outfit-builder/components/OutfitCard.tsx (69 lines)
```

**Walkthrough:**
1. Saved outfit display
2. Delete button with `window.confirm()`
   - **Issue**: Browser dialog doesn't match app style

### Shared UI Components

```
frontend/src/shared/ui/Button.tsx (51 lines)
frontend/src/shared/ui/Input.tsx (61 lines)
frontend/src/shared/ui/Card.tsx (28 lines)
```

**Explain:**
- Consistent styling patterns
- forwardRef for Input (proper React pattern)
- Tailwind CSS usage

---

## Part 4: Security Deep Dive (5 minutes)

### Backend Authentication Gap

**Show:**
```
backend/app/api/routes/wardrobe.py:42-48
```

```python
@router.get("/items")
async def get_wardrobe_items(
    user_id: str,  # No JWT validation - anyone can pass any ID
    ...
):
```

**Explain:** This allows unauthorized access to any user's data.

### Frontend Token Handling

**Show:**
```
frontend/src/shared/api/client.ts:21-26
```

```typescript
private async getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;  // Good: tokens from Supabase SDK
}
```

**Explain:** Frontend handles tokens correctly via Supabase SDK.

### Secrets Configuration

**Show:**
```
backend/app/config.py:5-9
```

```python
class Settings(BaseSettings):
    supabase_secret_key: str  # ISSUE: Should be SecretStr
    fal_api_key: str          # ISSUE: Should be SecretStr
```

---

## Part 5: SOLID Principles Examples (5 minutes)

### SRP Violation Example

**Show:**
```
backend/app/services/gemini_client.py:70-93
```

```python
class GeminiClient:
    def analyze_clothing_image(...)  # AI responsibility
    def validate_category(...)        # Validation - should be separate
    def validate_seasons(...)         # Validation - should be separate
```

**Explain:** One class doing two different things.

### DIP Violation Example

**Show:**
```
frontend/src/features/wardrobe/store.ts:36
```

```typescript
const user = useAuthStore.getState().user;  # Direct dependency on concrete store
```

**Better Approach:**
```typescript
fetchItems: async (userId: string) => {  # Accept userId as parameter
  const items = await api.fetchWardrobeItems(userId, filters);
}
```

---

## Part 6: Code Standards Violations (5 minutes)

### File Size Violations

| File | Lines | Limit | Status |
|------|-------|-------|--------|
| `WardrobePanel.tsx` | 463 | 300 | ❌ |
| `outfit-builder/store.ts` | 381 | 300 | ❌ |
| `UploadModal.tsx` | 360 | 300 | ❌ |

### Missing Zod Validation

**Show:**
```
frontend/src/features/wardrobe/api.ts:215-224
```

```typescript
// analyzeImage() response is NOT validated with Zod
export async function analyzeImage(image: File): Promise<AIAnalysisResult> {
  const response = await fetch(...);
  return response.json();  // No Zod parsing
}
```

---

## Summary Script

**Opening (2 min):**
"This is a full-stack fashion app called Seamless. It has React frontend, FastAPI backend, and Supabase for auth/database. The architecture follows domain-driven design with clear separation between features."

**Backend Summary (2 min):**
"The backend has routes for wardrobe, outfits, and AI processing. Key issues: no authentication on endpoints, secrets stored as plain strings, and business logic mixed with HTTP handling."

**Frontend Summary (2 min):**
"The frontend follows Types → API → Stores → Components → Pages. Key issues: three files exceed 300-line limit, cross-store coupling to auth, and inconsistent API approach across features."

**Closing (2 min):**
"Priority fixes: add backend authentication, split oversized files, use SecretStr for API keys, and increase test coverage from 10% to target 70-80%."

---

## Quick Reference: File Locations

### Backend Core Files
| File | Purpose |
|------|---------|
| `backend/app/main.py` | App entry, CORS, routers |
| `backend/app/config.py` | Environment settings |
| `backend/app/supabase_client.py` | DB client singleton |
| `backend/app/api/routes/wardrobe.py` | Wardrobe CRUD |
| `backend/app/api/routes/outfits.py` | Outfit CRUD |
| `backend/app/services/gemini_client.py` | AI image analysis |
| `backend/app/services/fal_client.py` | AI image generation |

### Frontend Core Files
| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | App bootstrap |
| `frontend/src/routes/index.tsx` | Route config |
| `frontend/src/shared/api/client.ts` | HTTP client |
| `frontend/src/features/auth/store.ts` | Auth state |
| `frontend/src/features/wardrobe/store.ts` | Wardrobe state |
| `frontend/src/features/outfit-builder/store.ts` | Canvas state |
| `frontend/src/features/outfit-builder/components/WardrobePanel.tsx` | Side panel |

---

*Guide prepared for code review walkthrough*