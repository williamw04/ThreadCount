---
title: Seamless Application - UML Sequence Diagrams (Mermaid)
---

# UML Sequence Diagrams (Mermaid Format)

## Diagram 1: AI Image Analysis Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant Gemini as GeminiClient
    participant GeminiAPI as Google Gemini API

    User->>FE: select image file
    FE->>FE: getAuthToken() from Supabase
    FE->>API: POST /api/ai/analyze<br/>FormData { file }
    activate API

    API->>API: await file.read()
    API->>Gemini: new GeminiClient()
    activate Gemini

    Gemini->>Gemini: configure(api_key)
    Gemini->>GeminiAPI: generate_content_async(<br/>[base64_image, prompt])
    activate GeminiAPI

    GeminiAPI-->>Gemini: JSON {<br/>suggested_name,<br/>suggested_category,<br/>colors[], seasons[],<br/>tags[], style[],<br/>material_guess,<br/>confidence<br/>}
    deactivate GeminiAPI

    Gemini->>Gemini: validate_category()
    Gemini->>Gemini: validate_seasons()
    Gemini-->>API: Dict[str, Any]
    deactivate Gemini

    API-->>FE: AnalyzeImageResponse<br/>{ validated metadata }
    deactivate API

    FE->>FE: zod validation
    FE-->>User: display suggestions
```

---

## Diagram 2: Wardrobe Item Creation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant Storage as Supabase Storage
    participant DB as Supabase Database

    User->>FE: fill form, select image
    FE->>FE: getAuthToken()
    FE->>API: POST /api/wardrobe/items<br/>FormData {<br/>user_id, name, category,<br/>labels, colors, seasons,<br/>image<br/>}
    activate API

    API->>API: uuid.uuid4()
    API->>API: generate file_path
    API->>API: await image.read()

    API->>Storage: storage.from_("wardrobe")<br/>.upload(file_path, content)
    activate Storage
    Storage-->>API: success
    deactivate Storage

    API->>API: parse comma-separated<br/>labels, colors, seasons

    API->>DB: table("wardrobe_items")<br/>.insert({<br/>id, user_id, name,<br/>category, image_path,<br/>labels[], colors[],<br/>seasons[],<br/>created_at, updated_at<br/>})
    activate DB
    DB-->>API: inserted row
    deactivate DB

    API-->>FE: WardrobeItemResponse<br/>{ item data }
    deactivate API

    FE->>FE: zod validation
    FE-->>User: show success, new item card
```

---

## Diagram 3: Avatar Generation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant Supabase as Supabase (DB+Storage)
    participant Fal as FalClient
    participant FalAPI as fal.ai API

    User->>FE: click "Generate Avatar"
    FE->>API: POST /api/avatar/generate<br/>{ user_id }
    activate API

    API->>Supabase: table("avatars")<br/>.select("*")<br/>.eq("user_id", user_id)<br/>.eq("is_active", true)<br/>.order("created_at", desc)<br/>.limit(1)
    activate Supabase
    Supabase-->>API: { avatar record with<br/>original_photo_path }
    deactivate Supabase

    Note over API: Update status to "processing"
    API->>Supabase: table("avatars")<br/>.update({ model_status: "processing" })
    activate Supabase
    Supabase-->>API: updated
    deactivate Supabase

    API->>Supabase: storage.from_("avatars")<br/>.get_public_url(photo_path)
    activate Supabase
    Supabase-->>API: original_url
    deactivate Supabase

    API->>Fal: new FalClient()
    activate Fal
    Fal->>FalAPI: subscribe(<br/>"fal-ai/nano-banana-2/edit",<br/>{ prompt, image_urls }<br/>)
    activate FalAPI
    FalAPI-->>Fal: { url: generated_image }
    deactivate FalAPI
    Fal-->>API: { url }
    deactivate Fal

    API->>FalAPI: httpx.get(generated_url)
    activate FalAPI
    FalAPI-->>API: response.content (bytes)
    deactivate FalAPI

    API->>API: file_path = "{user_id}/model.png"

    API->>Supabase: storage.from_("avatars")<br/>.upload(file_path, content)
    activate Supabase
    Supabase-->>API: success
    deactivate Supabase

    Note over API: Update status to "ready"
    API->>Supabase: table("avatars")<br/>.update({<br/>model_status: "ready",<br/>model_canvas_path: file_path<br/>})
    activate Supabase
    Supabase-->>API: updated
    deactivate Supabase

    API-->>FE: { status: "success",<br/>model_path }
    deactivate API

    FE-->>User: show avatar ready state
```

### Error Flow (Avatar Generation)

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant Supabase as Supabase (DB+Storage)
    participant Fal as FalClient
    participant FalAPI as fal.ai API

    Note over API: Previous steps completed...
    
    API->>Fal: generate_image()
    activate Fal
    Fal->>FalAPI: subscribe()
    activate FalAPI
    FalAPI-->>Fal: Error / Timeout
    deactivate FalAPI
    Fal-->>API: Exception raised
    deactivate Fal

    Note over API: Exception caught

    API->>Supabase: table("avatars")<br/>.update({ model_status: "failed" })
    activate Supabase
    Supabase-->>API: updated
    deactivate Supabase

    API-->>FE: HTTPException(500, error)

    FE-->>User: show error message
```

---

## Diagram 4: Outfit Creation & Save Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant Store as OutfitBuilder Store
    participant DB as Supabase Database

    User->>FE: navigate to outfit builder
    FE->>Store: fetchOutfits(userId)
    activate Store

    Store->>DB: .from("outfits")<br/>.select("*")<br/>.eq("user_id", userId)
    activate DB
    DB-->>Store: outfits[]
    deactivate DB

    Store->>Store: store.outfits = []
    Store-->>FE: outfits loaded
    deactivate Store

    FE-->>User: render saved outfits list

    Note over User,FE: User builds outfit...

    User->>FE: drag item to canvas slot
    FE->>Store: addToSlot(slot, item)
    activate Store
    Store->>Store: canvas[slot].push(item)
    Store-->>FE: canvas updated
    deactivate Store

    FE-->>User: update canvas display

    Note over User,FE: Repeat for each item...

    User->>FE: click "Save"
    FE->>FE: open save modal
    User->>FE: enter name "Summer Look"

    FE->>Store: saveOutfit(name)
    activate Store
    Store->>Store: collect item_ids from canvas

    Store->>DB: .from("outfits")<br/>.insert({<br/>user_id,<br/>name,<br/>item_ids[]<br/>})
    activate DB
    DB-->>Store: new Outfit record
    deactivate DB

    Store->>Store: outfits.push(newOutfit)
    Store->>Store: clearCanvas()
    Store-->>FE: outfit saved
    deactivate Store

    FE-->>User: show success, outfit card
```

---

## Diagram 5: Background Removal Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant Storage as Supabase Storage
    participant Fal as FalClient
    participant FalAPI as fal.ai API

    User->>FE: upload image, click<br/>"Remove Background"
    FE->>API: POST /api/image/remove-background<br/>FormData { user_id, file }
    activate API

    API->>API: generate temp file_path
    API->>Storage: upload temp file
    activate Storage
    Storage-->>API: success
    deactivate Storage

    API->>Storage: get_public_url(temp_path)
    activate Storage
    Storage-->>API: image_url
    deactivate Storage

    API->>Fal: new FalClient()
    activate Fal
    Fal->>FalAPI: subscribe(<br/>"fal-ai/birefnet/v2",<br/>{ image_url }<br/>)
    activate FalAPI
    FalAPI-->>Fal: { image: { url } }
    deactivate FalAPI
    Fal-->>API: processed_url
    deactivate Fal

    API->>FalAPI: httpx.get(processed_url)
    activate FalAPI
    FalAPI-->>API: image_bytes
    deactivate FalAPI

    API->>API: generate final file_path
    API->>Storage: upload(final_path, bytes)
    activate Storage
    Storage-->>API: success
    deactivate Storage

    API-->>FE: RemoveBackgroundResponse<br/>{<br/>processed_image_url,<br/>storage_path<br/>}
    deactivate API

    FE-->>User: display processed image
```

---

## Summary

| Flow | Actors | Key Operations | External Services |
|------|--------|----------------|-------------------|
| AI Analysis | User, Frontend, Backend, GeminiClient | Image upload, AI processing, validation | Google Gemini |
| Create Item | User, Frontend, Backend, Supabase | Form submission, file upload, DB insert | Supabase |
| Generate Avatar | User, Frontend, Backend, FalClient | Status updates, AI generation, storage | fal.ai |
| Save Outfit | User, Frontend, Store, Supabase | Canvas state management, DB insert | Supabase (direct) |
| Remove Background | User, Frontend, Backend, FalClient | Image processing, storage | fal.ai |

---

## Key Patterns

### Authentication Flow
All API calls follow this pattern:
1. Frontend calls `getAuthToken()` from Supabase
2. Token added to `Authorization: Bearer {token}` header
3. Backend validates token (via Supabase client)

### Error Handling
```
Frontend → API → Service → External API
                ↓
         On exception:
         1. Log error
         2. Update state if needed (e.g., model_status = "failed")
         3. Return HTTPException
         4. Frontend shows error message
```

### State Updates
- **Avatar Generation**: `model_status` transitions: `null → "processing" → "ready"` or `"failed"`
- **Outfit Builder**: Canvas state managed in Zustand store
- **Wardrobe**: Items cached in store after fetch