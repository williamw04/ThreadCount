# UML Class Diagram - Seamless Application

**Version:** 1.0.0  
**Generated:** 2026-03-23

## Legend

| Symbol | Meaning |
|--------|---------|
| `+` | Public |
| `-` | Private |
| `#` | Protected |
| `~` | Package/Internal |
| `──▶` | Inheritance |
| `──►` | Dependency |
| `──◆` | Composition |
| `──◇` | Aggregation |

---

## ASCII Class Diagram

```
                                    ┌─────────────────────────────────┐
                                    │     EXTERNAL LIBRARIES          │
                                    │                                 │
                                    │  ┌───────────────────────────┐  │
                                    │  │   pydantic.BaseModel      │  │
                                    │  └───────────────────────────┘  │
                                    │  ┌───────────────────────────┐  │
                                    │  │pydantic_settings.         │  │
                                    │  │BaseSettings               │  │
                                    │  └───────────────────────────┘  │
                                    └─────────────────────────────────┘
                                                   │
                                                   │ inherits
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  BACKEND (Python)                               │
│                                                                                  │
│  ┌─────────────────────────────────┐                                            │
│  │          Settings               │  inherits from BaseSettings               │
│  │─────────────────────────────────│                                            │
│  │ + supabase_url: str             │                                            │
│  │ + supabase_secret_key: str      │                                            │
│  │ + fal_api_key: str              │                                            │
│  │ + gemini_api_key: str           │                                            │
│  │─────────────────────────────────│                                            │
│  │ (uses BaseSettings defaults)    │                                            │
│  └───────────────┬─────────────────┘                                            │
│                  │                                                              │
│                  │ depends on                                                    │
│                  ▼                                                              │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐      │
│  │       GeminiClient               │  │          FalClient               │      │
│  │─────────────────────────────────│  │─────────────────────────────────│      │
│  │ + model: GenerativeModel         │  │ (no attributes)                  │      │
│  │─────────────────────────────────│  │─────────────────────────────────│      │
│  │ + __init__()                     │  │ + __init__()                     │      │
│  │ + analyze_clothing_image(        │  │ + generate_image(                │      │
│  │     image_data: bytes,           │  │     image_url: str,              │      │
│  │     mime_type: str               │  │     prompt: str                  │      │
│  │   ) -> Dict[str, Any]            │  │   ) -> dict                      │      │
│  │ + validate_category(             │  │ + remove_background(             │      │
│  │     category: str                │  │     image_url: str               │      │
│  │   ) -> str                       │  │   ) -> str                       │      │
│  │ + validate_seasons(              │  └─────────────────────────────────┘      │
│  │     seasons: List[str]           │                                            │
│  │   ) -> List[str]                 │                                            │
│  └─────────────────────────────────┘                                            │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        PYDANTIC MODELS (inherits BaseModel)               │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │  │
│  │  │   GenerateAvatarRequest     │  │     WardrobeItem            │       │  │
│  │  │─────────────────────────────│  │─────────────────────────────│       │  │
│  │  │ + user_id: str              │  │ + name: str                 │       │  │
│  │  └─────────────────────────────┘  │ + category: str             │       │  │
│  │                                   │ + labels: Optional[List[str]]│       │  │
│  │  ┌─────────────────────────────┐  │ + colors: Optional[List[str]]│      │  │
│  │  │   WardrobeItemResponse      │  │ + seasons: Optional[List[str]]│     │  │
│  │  │─────────────────────────────│  └─────────────────────────────┘       │  │
│  │  │ + id: str                   │                                        │  │
│  │  │ + user_id: str              │  ┌─────────────────────────────┐       │  │
│  │  │ + name: str                 │  │   UpdateWardrobeItem        │       │  │
│  │  │ + category: str             │  │─────────────────────────────│       │  │
│  │  │ + image_path: Optional[str] │  │ + name: Optional[str]       │       │  │
│  │  │ + labels: List[str]         │  │ + category: Optional[str]   │       │  │
│  │  │ + colors: List[str]         │  │ + labels: Optional[List[str]]│      │  │
│  │  │ + seasons: List[str]        │  │ + colors: Optional[List[str]]│      │  │
│  │  │ + is_inspiration: bool      │  │ + seasons: Optional[List[str]]│     │  │
│  │  │ + is_template: bool         │  └─────────────────────────────┘       │  │
│  │  │ + created_at: str           │                                        │  │
│  │  │ + updated_at: str           │  ┌─────────────────────────────┐       │  │
│  │  └─────────────────────────────┘  │   RemoveBackgroundRequest   │       │  │
│  │                                   │─────────────────────────────│       │  │
│  │  ┌─────────────────────────────┐  │ + image_url: str            │       │  │
│  │  │   RemoveBackgroundResponse  │  └─────────────────────────────┘       │  │
│  │  │─────────────────────────────│                                        │  │
│  │  │ + processed_image_url: str   │  ┌─────────────────────────────┐       │  │
│  │  │ + storage_path: str         │  │   AnalyzeImageResponse      │       │  │
│  │  └─────────────────────────────┘  │─────────────────────────────│       │  │
│  │                                   │ + suggested_name: str       │       │  │
│  │  ┌─────────────────────────────┐  │ + suggested_category: str   │       │  │
│  │  │         Outfit              │  │ + colors: List[str]         │       │  │
│  │  │─────────────────────────────│  │ + seasons: List[str]        │       │  │
│  │  │ + id: str                   │  │ + tags: List[str]           │       │  │
│  │  │ + user_id: str              │  │ + style: List[str]          │       │  │
│  │  │ + name: Optional[str]       │  │ + material_guess: str       │       │  │
│  │  │ + item_ids: List[str]       │  │ + confidence: str           │       │  │
│  │  │ + thumbnail_path: Optional  │  └─────────────────────────────┘       │  │
│  │  │ + created_at: str           │                                        │  │
│  │  │ + updated_at: str           │  ┌─────────────────────────────┐       │  │
│  │  └─────────────────────────────┘  │   OutfitCreate              │       │  │
│  │                                   │─────────────────────────────│       │  │
│  │  ┌─────────────────────────────┐  │ + name: Optional[str]       │       │  │
│  │  │   OutfitUpdate              │  │ + item_ids: List[str]       │       │  │
│  │  │─────────────────────────────│  └─────────────────────────────┘       │  │
│  │  │ + name: Optional[str]       │                                        │  │
│  │  │ + item_ids: Optional[List]  │                                        │  │
│  │  └─────────────────────────────┘                                        │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                                   │
                                                   │ API Response Mapping
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND (TypeScript)                           │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           ApiClient (Class)                             │   │
│  │─────────────────────────────────────────────────────────────────────────│   │
│  │ - baseUrl: string                                                       │   │
│  │─────────────────────────────────────────────────────────────────────────│   │
│  │ + constructor(baseUrl: string)                                          │   │
│  │ - getAuthToken(): Promise<string | null>                                │   │
│  │ - request<T>(endpoint: string, options?: RequestOptions): Promise<T>    │   │
│  │ + get<T>(endpoint: string, options?: RequestOptions): Promise<T>         │   │
│  │ + post<T>(endpoint: string, body?: unknown, options?: RequestOptions)   │   │
│  │ + put<T>(endpoint: string, body?: unknown, options?: RequestOptions)    │   │
│  │ + delete<T>(endpoint: string, options?: RequestOptions): Promise<T>     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        AUTH TYPES (Interfaces/Types)                     │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │  │
│  │  │       AuthUser              │  │     LoginFormData           │       │  │
│  │  │─────────────────────────────│  │─────────────────────────────│       │  │
│  │  │ + id: string                │  │ + email: string             │       │  │
│  │  │ + email: string             │  │ + password: string          │       │  │
│  │  └─────────────────────────────┘  └─────────────────────────────┘       │  │
│  │                                                                          │  │
│  │  ┌─────────────────────────────┐                                        │  │
│  │  │     SignupFormData         │                                        │  │
│  │  │─────────────────────────────│                                        │  │
│  │  │ + email: string            │                                        │  │
│  │  │ + password: string          │                                        │  │
│  │  │ + confirmPassword: string   │                                        │  │
│  │  └─────────────────────────────┘                                        │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      WARDROBE TYPES (Interfaces/Types)                   │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │  │
│  │  │      WardrobeItem           │  │  CreateWardrobeItemInput   │       │  │
│  │  │─────────────────────────────│  │─────────────────────────────│       │  │
│  │  │ + id: string                │  │ + name: string              │       │  │
│  │  │ + user_id: string           │  │ + category: Category       │       │  │
│  │  │ + name: string              │  │ + labels?: string[]        │       │  │
│  │  │ + category: Category        │  │ + colors?: string[]        │       │  │
│  │  │ + image_path: string | null │  │ + seasons?: string[]       │       │  │
│  │  │ + labels: string[]          │  │ + image?: File             │       │  │
│  │  │ + colors: string[]          │  │ + imagePath?: string       │       │  │
│  │  │ + seasons: string[]         │  └─────────────────────────────┘       │  │
│  │  │ + is_inspiration: boolean   │                                        │  │
│  │  │ + is_template: boolean      │  ┌─────────────────────────────┐       │  │
│  │  │ + created_at: string        │  │  UpdateWardrobeItemInput    │       │  │
│  │  │ + updated_at: string        │  │─────────────────────────────│       │  │
│  │  └─────────────────────────────┘  │ + name?: string             │       │  │
│  │                                   │ + category?: Category       │       │  │
│  │  ┌─────────────────────────────┐  │ + labels?: string[]         │       │  │
│  │  │     WardrobeFilters         │  │ + colors?: string[]         │       │  │
│  │  │─────────────────────────────│  │ + seasons?: string[]        │       │  │
│  │  │ + category?: Category       │  └─────────────────────────────┘       │  │
│  │  │ + search?: string           │                                        │  │
│  │  │ + colors?: string[]         │  ┌─────────────────────────────┐       │  │
│  │  │ + seasons?: Season[]        │  │   AIAnalysisResult          │       │  │
│  │  └─────────────────────────────┘  │─────────────────────────────│       │  │
│  │                                   │ + suggested_name: string    │       │  │
│  │                                   │ + suggested_category: string│      │  │
│  │                                   │ + colors: string[]          │       │  │
│  │                                   │ + seasons: string[]         │       │  │
│  │                                   │ + tags: string[]            │       │  │
│  │                                   │ + style: string[]           │       │  │
│  │                                   │ + material_guess: string    │       │  │
│  │                                   │ + confidence: string        │       │  │
│  │                                   └─────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      OUTFIT TYPES (Interfaces/Types)                    │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │  │
│  │  │         Outfit              │  │       OutfitItem            │       │  │
│  │  │─────────────────────────────│  │─────────────────────────────│       │  │
│  │  │ + id: string                │  │ + id: string                │       │  │
│  │  │ + user_id: string           │  │ + name: string              │       │  │
│  │  │ + name: string | null       │  │ + category: Category        │       │  │
│  │  │ + item_ids: string[]        │  │ + image_path: string | null │       │  │
│  │  │ + thumbnail_path: string    │  └──────────────┬──────────────┘       │  │
│  │  │ + created_at: string        │                 │                       │  │
│  │  │ + updated_at: string        │                 │ composition           │  │
│  │  └──────────────┬──────────────┘                 ▼                       │  │
│  │                 │              ┌─────────────────────────────┐       │  │
│  │                 │ aggregation  │   OutfitCanvasState         │       │  │
│  │                 │ (via item_ids)│─────────────────────────────│       │  │
│  │                 └──────────►   │ + top: OutfitItem[]         │       │  │
│  │                                │ + bottom: OutfitItem | null │       │  │
│  │  ┌─────────────────────────────┐│ + shoes: OutfitItem | null  │       │  │
│  │  │   OutfitCreateInput         ││ + accessoriesLeft: OutfitItem[]│    │  │
│  │  │─────────────────────────────││ + accessoriesRight: OutfitItem[]│   │  │
│  │  │ + name?: string             │└─────────────────────────────┘       │  │
│  │  │ + item_ids: string[]        │                                        │  │
│  │  └─────────────────────────────┘  ┌─────────────────────────────┐       │  │
│  │                                   │   OutfitUpdateInput         │       │  │
│  │                                   │─────────────────────────────│       │  │
│  │                                   │ + name?: string             │       │  │
│  │                                   │ + item_ids?: string[]       │       │  │
│  │                                   └─────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                      PROFILE TYPES (Interfaces/Types)                   │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │  │
│  │  │        Profile              │  │         Avatar              │       │  │
│  │  │─────────────────────────────│  │─────────────────────────────│       │  │
│  │  │ + id: string                │  │ + id: string                │       │  │
│  │  │ + display_name: string | null│ │ + user_id: string           │       │  │
│  │  │ + onboarding_completed: bool │ │ + original_photo_path: str  │       │  │
│  │  │ + tutorial_completed: bool   │ │ + model_canvas_path: str    │       │  │
│  │  │ + created_at: string        │  │ + model_status: 'pending' | │       │  │
│  │  │ + updated_at: string        │  │   'processing' | 'ready' |   │       │  │
│  │  └─────────────────────────────┘  │   'failed'                  │       │  │
│  │                                   │ + is_active: boolean        │       │  │
│  │                                   │ + created_at: string        │       │  │
│  │                                   │ + updated_at: string        │       │  │
│  │                                   └─────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                        API CLIENT TYPES (Interfaces)                    │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │  │
│  │  │     RequestOptions          │  │        ApiError             │       │  │
│  │  │─────────────────────────────│  │─────────────────────────────│       │  │
│  │  │ + body?: unknown            │  │ + status: number            │       │  │
│  │  │ (extends RequestInit)       │  │ + message: string           │       │  │
│  │  └─────────────────────────────┘  └─────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                          TYPE ALIASES                                    │  │
│  │──────────────────────────────────────────────────────────────────────────│  │
│  │  Category = 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories'   │  │
│  │           | 'outerwear'                                                  │  │
│  │                                                                          │  │
│  │  Season = 'spring' | 'summer' | 'fall' | 'winter'                       │  │
│  │                                                                          │  │
│  │  OutfitSlot = 'top' | 'bottom' | 'shoes' | 'accessoriesLeft'            │  │
│  │             | 'accessoriesRight'                                         │  │
│  │                                                                          │  │
│  │  MainCategory = 'top' | 'bottoms' | 'shoes' | 'accessories'              │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Summary

### Inheritance Relationships

| Child Class | Parent Class |
|-------------|--------------|
| `Settings` | `pydantic_settings.BaseSettings` |
| `GenerateAvatarRequest` | `pydantic.BaseModel` |
| `WardrobeItem` | `pydantic.BaseModel` |
| `WardrobeItemResponse` | `pydantic.BaseModel` |
| `UpdateWardrobeItem` | `pydantic.BaseModel` |
| `RemoveBackgroundRequest` | `pydantic.BaseModel` |
| `RemoveBackgroundResponse` | `pydantic.BaseModel` |
| `AnalyzeImageResponse` | `pydantic.BaseModel` |
| `Outfit` | `pydantic.BaseModel` |
| `OutfitCreate` | `pydantic.BaseModel` |
| `OutfitUpdate` | `pydantic.BaseModel` |

### Dependencies

| From | To | Description |
|------|----|----|
| `GeminiClient` | `Settings` | Uses for API key configuration |
| `FalClient` | `Settings` | Uses for API key configuration |
| `ApiClient` | Supabase | Gets authentication tokens |
| `WardrobeFilters` | `Category`, `Season` | Uses type aliases |
| `CreateWardrobeItemInput` | `WardrobeItem` | Used to create WardrobeItem |
| `UpdateWardrobeItemInput` | `WardrobeItem` | Used to update WardrobeItem |
| `OutfitCreateInput` | `Outfit` | Used to create Outfit |
| `OutfitUpdateInput` | `Outfit` | Used to update Outfit |

### Composition

| Container | Component | Description |
|-----------|-----------|-------------|
| `OutfitCanvasState` | `OutfitItem` | Canvas contains OutfitItems in various slots |

### Aggregation

| Container | Component | Description |
|-----------|-----------|-------------|
| `Outfit` | `WardrobeItem` | Outfit references WardrobeItems via item_ids |

---

## Backend-Frontend Mapping

| Backend Model | Frontend Type | Relationship |
|---------------|---------------|--------------|
| `WardrobeItemResponse` | `WardrobeItem` | API response maps to frontend interface |
| `AnalyzeImageResponse` | `AIAnalysisResult` | API response maps to frontend interface |
| `Outfit` | `Outfit` | Same structure, used in both layers |
| `OutfitCreate` | `OutfitCreateInput` | Request/response pair |
| `OutfitUpdate` | `OutfitUpdateInput` | Request/response pair |
| `UpdateWardrobeItem` | `UpdateWardrobeItemInput` | Request/response pair |