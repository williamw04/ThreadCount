# UML Sequence Diagrams - Seamless Application

**Version:** 1.0.0  
**Generated:** 2026-03-23

## Overview

Sequence diagrams show interactions between objects in sequential order, illustrating:
- Call sequence between components
- Caller/callee relationships
- Parameter passing (data flow)
- Return values
- Internal state changes

---

## Sequence Diagram 1: AI Image Analysis Flow

**Scenario:** User uploads a clothing image for AI-powered analysis to extract metadata (category, colors, seasons, tags).

### ASCII Sequence Diagram

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User   │     │  Frontend  │     │  Backend API │     │ GeminiClient │     │ Google Gemini│
│         │     │  (React)   │     │  (FastAPI)   │     │   (Service)  │     │     API      │
└────┬────┘     └─────┬──────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
     │                │                   │                    │                    │
     │  select image  │                   │                    │                    │
     │───────────────>│                   │                    │                    │
     │                │                   │                    │                    │
     │                │ POST /api/ai/analyze              │                    │
     │                │ FormData: {file}  │                    │                    │
     │                │──────────────────>│                    │                    │
     │                │                   │                    │                    │
     │                │                   │ getAuthToken()     │                    │
     │                │                   │ from Supabase      │                    │
     │                │                   │───────────────────────────────────────>│
     │                │                   │                    │                    │
     │                │                   │ GeminiClient()     │                    │
     │                │                   │───────────────────>│                    │
     │                │                   │                    │ configure(api_key) │
     │                │                   │                    │───────────────────>│
     │                │                   │                    │                    │
     │                │                   │ analyze_clothing_image(              │
     │                │                   │   image_data: bytes,                │
     │                │                   │   mime_type: str                    │
     │                │                   │ )                  │                    │
     │                │                   │───────────────────>│                    │
     │                │                   │                    │                    │
     │                │                   │                    │ base64_encode()    │
     │                │                   │                    │─────────┐          │
     │                │                   │                    │         │          │
     │                │                   │                    │<────────┘          │
     │                │                   │                    │                    │
     │                │                   │                    │ generate_content_async(
     │                │                   │                    │   [image, prompt]  │
     │                │                   │                    │───────────────────>│
     │                │                   │                    │                    │
     │                │                   │                    │    {suggested_name,│
     │                │                   │                    │     suggested_category,
     │                │                   │                    │     colors[],      │
     │                │                   │                    │     seasons[],     │
     │                │                   │                    │     tags[],        │
     │                │                   │                    │     style[],       │
     │                │                   │                    │     material_guess,│
     │                │                   │                    │     confidence}    │
     │                │                   │                    │<───────────────────│
     │                │                   │                    │                    │
     │                │                   │                    │ validate_category()│
     │                │                   │                    │─────────┐          │
     │                │                   │                    │         │          │
     │                │                   │                    │<────────┘          │
     │                │                   │                    │                    │
     │                │                   │                    │ validate_seasons() │
     │                │                   │                    │─────────┐          │
     │                │                   │                    │         │          │
     │                │                   │                    │<────────┘          │
     │                │                   │                    │                    │
     │                │                   │ AnalyzeImageResponse                   │
     │                │                   │ {suggested_name,   │                    │
     │                │                   │  suggested_category,                  │
     │                │                   │  colors[], seasons[],                │
     │                │                   │  tags[], style[],  │                    │
     │                │                   │  material_guess,   │                    │
     │                │                   │  confidence}       │                    │
     │                │                   │<───────────────────│                    │
     │                │                   │                    │                    │
     │                │ JSON Response     │                    │                    │
     │                │<──────────────────│                    │                    │
     │                │                   │                    │                    │
     │  display       │                   │                    │                    │
     │  suggestions   │                   │                    │                    │
     │<───────────────│                   │                    │                    │
     │                │                   │                    │                    │
```

### Key Data Passed

| Step | From | To | Data |
|------|------|-----|------|
| 1 | User | Frontend | `File` (image file) |
| 2 | Frontend | Backend | `FormData { file: File }` |
| 3 | Backend | GeminiClient | `image_data: bytes`, `mime_type: str` |
| 4 | GeminiClient | Gemini API | `base64_image: str`, `prompt: str` |
| 5 | Gemini API | GeminiClient | `JSON { suggested_name, suggested_category, colors[], seasons[], tags[], style[], material_guess, confidence }` |
| 6 | GeminiClient | Backend | Validated `Dict[str, Any]` |
| 7 | Backend | Frontend | `AnalyzeImageResponse` |

---

## Sequence Diagram 2: Wardrobe Item Creation Flow

**Scenario:** User creates a new wardrobe item with an image upload.

### ASCII Sequence Diagram

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌────────────┐     ┌────────────┐
│  User   │     │  Frontend  │     │  Backend API │     │  Supabase  │     │  Supabase  │
│         │     │  (React)   │     │  (FastAPI)   │     │  Storage   │     │    DB      │
└────┬────┘     └─────┬──────┘     └──────┬───────┘     └─────┬──────┘     └─────┬──────┘
     │                │                   │                   │                  │
     │ fill form      │                   │                   │                  │
     │ select image   │                   │                   │                  │
     │───────────────>│                   │                   │                  │
     │                │                   │                   │                  │
     │                │ POST /api/wardrobe/items             │                  │
     │                │ FormData: {        │                   │                  │
     │                │   user_id,         │                   │                  │
     │                │   name,            │                   │                  │
     │                │   category,        │                   │                  │
     │                │   labels,          │                   │                  │
     │                │   colors,          │                   │                  │
     │                │   seasons,         │                   │                  │
     │                │   image            │                   │                  │
     │                │ }                  │                   │                  │
     │                │──────────────────>│                   │                  │
     │                │                   │                   │                  │
     │                │                   │ uuid.uuid4()      │                  │
     │                │                   │─────────┐         │                  │
     │                │                   │         │         │                  │
     │                │                   │<────────┘         │                  │
     │                │                   │                   │                  │
     │                │                   │ file_path =       │                  │
     │                │                   │ "{user_id}/       │                  │
     │                │                   │  {item_id}.ext"   │                  │
     │                │                   │                   │                  │
     │                │                   │ await image.read()│                  │
     │                │                   │─────────┐         │                  │
     │                │                   │         │         │                  │
     │                │                   │<────────┘         │                  │
     │                │                   │                   │                  │
     │                │                   │ storage.from_("wardrobe")            │
     │                │                   │   .upload(        │                  │
     │                │                   │     file_path,    │                  │
     │                │                   │     file_content  │                  │
     │                │                   │   )               │                  │
     │                │                   │──────────────────────────────────>│  │
     │                │                   │                   │                  │
     │                │                   │                   │   success        │
     │                │                   │<──────────────────────────────────│  │
     │                │                   │                   │                  │
     │                │                   │ parse labels, colors, seasons       │
     │                │                   │ from comma-separated strings        │
     │                │                   │─────────┐         │                  │
     │                │                   │         │         │                  │
     │                │                   │<────────┘         │                  │
     │                │                   │                   │                  │
     │                │                   │ table("wardrobe_items")              │
     │                │                   │   .insert({       │                  │
     │                │                   │     id,           │                  │
     │                │                   │     user_id,      │                  │
     │                │                   │     name,         │                  │
     │                │                   │     category,     │                  │
     │                │                   │     image_path,   │                  │
     │                │                   │     labels[],     │                  │
     │                │                   │     colors[],     │                  │
     │                │                   │     seasons[],    │                  │
     │                │                   │     created_at,   │                  │
     │                │                   │     updated_at    │                  │
     │                │                   │   })              │                  │
     │                │                   │─────────────────────────────────────>│
     │                │                   │                   │                  │
     │                │                   │                   │   {inserted row} │
     │                │                   │<─────────────────────────────────────│
     │                │                   │                   │                  │
     │                │                   │ WardrobeItemResponse               │
     │                │                   │ {id, user_id, name, category,      │
     │                │                   │  image_path, labels[], colors[],   │
     │                │                   │  seasons[], is_inspiration,        │
     │                │                   │  is_template, created_at,          │
     │                │                   │  updated_at}      │                  │
     │                │<──────────────────│                   │                  │
     │                │                   │                   │                  │
     │                │ zod validation    │                   │                  │
     │                │─────────┐         │                   │                  │
     │                │         │         │                   │                  │
     │                │<────────┘         │                   │                  │
     │                │                   │                   │                  │
     │  show success  │                   │                   │                  │
     │  new item card │                   │                   │                  │
     │<───────────────│                   │                   │                  │
     │                │                   │                   │                  │
```

### Key Data Passed

| Step | From | To | Data |
|------|------|-----|------|
| 1 | User | Frontend | `{ name, category, labels[], colors[], seasons[], image: File }` |
| 2 | Frontend | Backend | `FormData { user_id, name, category, labels, colors, seasons, image }` |
| 3 | Backend | Supabase Storage | `file_path: str`, `file_content: bytes` |
| 4 | Backend | Supabase DB | `{ id, user_id, name, category, image_path, labels[], colors[], seasons[], created_at, updated_at }` |
| 5 | Supabase DB | Backend | Inserted row with all fields |
| 6 | Backend | Frontend | `WardrobeItemResponse` |
| 7 | Frontend | User | Display new item in UI |

---

## Sequence Diagram 3: Avatar Generation Flow

**Scenario:** User triggers AI-powered avatar generation from their uploaded photo.

### ASCII Sequence Diagram

```
┌─────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐
│  User   │  │  Frontend  │  │  Backend API │  │ Supabase │  │FalClient │  │ fal.ai │
│         │  │  (React)   │  │  (FastAPI)   │  │          │  │          │  │        │
└────┬────┘  └─────┬──────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘  └───┬────┘
     │             │                │               │             │            │
     │ click       │                │               │             │            │
     │ "Generate"  │                │               │             │            │
     │────────────>│                │               │             │            │
     │             │                │               │             │            │
     │             │ POST /api/avatar/generate     │             │            │
     │             │ {user_id}      │               │             │            │
     │             │───────────────>│               │             │            │
     │             │                │               │             │            │
     │             │                │ table("avatars")            │            │
     │             │                │ .select("*")  │             │            │
     │             │                │ .eq("user_id", user_id)     │            │
     │             │                │ .eq("is_active", true)      │            │
     │             │                │ .order("created_at", desc)  │            │
     │             │                │ .limit(1)     │             │            │
     │             │                │──────────────>│             │            │
     │             │                │               │             │            │
     │             │                │ {avatar record│             │            │
     │             │                │  with original_photo_path}  │            │
     │             │                │<──────────────│             │            │
     │             │                │               │             │            │
     │             │                │ table("avatars")            │            │
     │             │                │ .update({    │             │            │
     │             │                │   model_status:│            │            │
     │             │                │   "processing" │            │            │
     │             │                │ })            │             │            │
     │             │                │──────────────>│             │            │
     │             │                │               │             │            │
     │             │                │ storage.from_("avatars")    │            │
     │             │                │ .get_public_url(photo_path) │            │
     │             │                │──────────────>│             │            │
     │             │                │               │             │            │
     │             │                │ original_url  │             │            │
     │             │                │<──────────────│             │            │
     │             │                │               │             │            │
     │             │                │ FalClient()   │             │            │
     │             │                │─────────────────────────────>│            │
     │             │                │               │             │            │
     │             │                │ generate_image(original_url,│            │
     │             │                │   AVATAR_PROMPT)            │            │
     │             │                │─────────────────────────────>│            │
     │             │                │               │             │            │
     │             │                │               │             │ subscribe( │
     │             │                │               │             │ "nano-     │
     │             │                │               │             │ banana-2/  │
     │             │                │               │             │ edit",     │
     │             │                │               │             │ {prompt,   │
     │             │                │               │             │  image_url}│
     │             │                │               │             │───────────>│
     │             │                │               │             │            │
     │             │                │               │             │ {url:      │
     │             │                │               │             │  generated │
     │             │                │               │             │  _image}   │
     │             │                │               │             │<───────────│
     │             │                │               │             │            │
     │             │                │ {url: generated_image_url}  │            │
     │             │                │<─────────────────────────────│            │
     │             │                │               │             │            │
     │             │                │ httpx.get(generated_url)    │            │
     │             │                │─────────────────────────────────────────>│
     │             │                │               │             │            │
     │             │                │ response.content (image bytes)          │
     │             │                │<─────────────────────────────────────────│
     │             │                │               │             │            │
     │             │                │ file_path =   │             │            │
     │             │                │ "{user_id}/   │             │            │
     │             │                │  model.png"   │             │            │
     │             │                │               │             │            │
     │             │                │ storage.from_("avatars")    │            │
     │             │                │ .upload(      │             │            │
     │             │                │   file_path,  │             │            │
     │             │                │   response.   │             │            │
     │             │                │   content     │             │            │
     │             │                │ )             │             │            │
     │             │                │──────────────>│             │            │
     │             │                │               │             │            │
     │             │                │               │ success     │            │
     │             │                │<──────────────│             │            │
     │             │                │               │             │            │
     │             │                │ table("avatars")            │            │
     │             │                │ .update({    │             │            │
     │             │                │   model_status:│            │            │
     │             │                │   "ready",    │             │            │
     │             │                │   model_canvas│             │            │
     │             │                │   _path:      │             │            │
     │             │                │   file_path   │             │            │
     │             │                │ })            │             │            │
     │             │                │──────────────>│             │            │
     │             │                │               │             │            │
     │             │                │ {status: "success",         │            │
     │             │                │  model_path: file_path}     │            │
     │             │<───────────────│               │             │            │
     │             │                │               │             │            │
     │  show avatar │               │               │             │            │
     │  ready state │               │               │             │            │
     │<─────────────│               │               │             │            │
     │             │                │               │             │            │

ERROR FLOW:
     │             │                │               │             │            │
     │             │                │ [on exception]│             │            │
     │             │                │ table("avatars")            │            │
     │             │                │ .update({    │             │            │
     │             │                │   model_status:│            │            │
     │             │                │   "failed"    │             │            │
     │             │                │ })            │             │            │
     │             │                │──────────────>│             │            │
     │             │                │               │             │            │
     │             │                │ HTTPException(500, error)   │            │
     │             │<───────────────│               │             │            │
     │             │                │               │             │            │
     │  show error  │               │               │             │            │
     │  message     │               │               │             │            │
     │<─────────────│               │               │             │            │
```

### Internal State Changes

| Component | State Change |
|-----------|-------------|
| Avatar Record | `model_status: null → "processing" → "ready"` or `"failed"` |
| Avatar Record | `model_canvas_path: null → "{user_id}/model.png"` |
| Supabase Storage | New file created at `{user_id}/model.png` |

---

## Sequence Diagram 4: Outfit Creation & Save Flow

**Scenario:** User builds an outfit by selecting wardrobe items and saves it.

### ASCII Sequence Diagram

```
┌─────────┐     ┌────────────┐     ┌────────────────┐     ┌────────────┐
│  User   │     │  Frontend  │     │ OutfitBuilder  │     │  Supabase  │
│         │     │  (React)   │     │    Store       │     │    DB      │
└────┬────┘     └─────┬──────┘     └───────┬────────┘     └─────┬──────┘
     │                │                    │                    │
     │ navigate to    │                    │                    │
     │ outfit builder │                    │                    │
     │───────────────>│                    │                    │
     │                │                    │                    │
     │                │ fetchOutfits(userId)                   │
     │                │───────────────────>│                    │
     │                │                    │ .from("outfits")   │
     │                │                    │ .select("*")       │
     │                │                    │ .eq("user_id")     │
     │                │                    │───────────────────>│
     │                │                    │                    │
     │                │                    │ outfits[]          │
     │                │                    │<───────────────────│
     │                │                    │                    │
     │                │ store.outfits = [] │                    │
     │                │<───────────────────│                    │
     │                │                    │                    │
     │  render saved  │                    │                    │
     │  outfits list  │                    │                    │
     │<───────────────│                    │                    │
     │                │                    │                    │
     │ fetch wardrobe │                    │                    │
     │ items          │                    │                    │
     │───────────────>│                    │                    │
     │                │ fetchWardrobeItems(userId)              │
     │                │───────────────────────────────────────>│
     │                │                    │                    │
     │                │ wardrobeItems[]    │                    │
     │                │<───────────────────────────────────────│
     │                │                    │                    │
     │  show wardrobe │                    │                    │
     │  panel         │                    │                    │
     │<───────────────│                    │                    │
     │                │                    │                    │
     │ drag item to   │                    │                    │
     │ canvas slot    │                    │                    │
     │───────────────>│                    │                    │
     │                │                    │                    │
     │                │ addToSlot(slot, item)                   │
     │                │───────────────────>│                    │
     │                │                    │                    │
     │                │                    │ canvas[slot].push(item)
     │                │                    │─────────┐          │
     │                │                    │         │          │
     │                │                    │<────────┘          │
     │                │                    │                    │
     │                │                    │ [emit update]      │
     │                │<───────────────────│                    │
     │                │                    │                    │
     │  update canvas │                    │                    │
     │  display       │                    │                    │
     │<───────────────│                    │                    │
     │                │                    │                    │
     │   ... repeat for each item ...      │                    │
     │                │                    │                    │
     │ click "Save"   │                    │                    │
     │───────────────>│                    │                    │
     │                │                    │                    │
     │                │ open save modal    │                    │
     │                │─────────┐          │                    │
     │                │         │          │                    │
     │                │<────────┘          │                    │
     │                │                    │                    │
     │  enter name    │                    │                    │
     │  "Summer Look" │                    │                    │
     │───────────────>│                    │                    │
     │                │                    │                    │
     │                │ saveOutfit(name)   │                    │
     │                │───────────────────>│                    │
     │                │                    │                    │
     │                │                    │ collect item_ids   │
     │                │                    │ from canvas        │
     │                │                    │─────────┐          │
     │                │                    │         │          │
     │                │                    │<────────┘          │
     │                │                    │                    │
     │                │                    │ createOutfit(userId, {
     │                │                    │   name: "Summer Look",
     │                │                    │   item_ids: ["id1","id2",...]
     │                │                    │ })                 │
     │                │                    │───────────────────>│
     │                │                    │                    │
     │                │                    │ .from("outfits")   │
     │                │                    │ .insert({          │
     │                │                    │   user_id,         │
     │                │                    │   name,            │
     │                │                    │   item_ids[]       │
     │                │                    │ })                 │
     │                │                    │                    │
     │                │                    │ new Outfit record  │
     │                │                    │<───────────────────│
     │                │                    │                    │
     │                │                    │ outfits.push(newOutfit)
     │                │                    │─────────┐          │
     │                │                    │         │          │
     │                │                    │<────────┘          │
     │                │                    │                    │
     │                │ clearCanvas()      │                    │
     │                │───────────────────>│                    │
     │                │                    │                    │
     │                │                    │ canvas = {         │
     │                │                    │   top: [],         │
     │                │                    │   bottom: null,    │
     │                │                    │   shoes: null,     │
     │                │                    │   accessoriesLeft: [],
     │                │                    │   accessoriesRight: []
     │                │                    │ }                  │
     │                │                    │─────────┐          │
     │                │                    │         │          │
     │                │                    │<────────┘          │
     │                │                    │                    │
     │                │ [emit update]      │                    │
     │                │<───────────────────│                    │
     │                │                    │                    │
     │  show success  │                    │                    │
     │  outfit card   │                    │                    │
     │<───────────────│                    │                    │
     │                │                    │                    │
```

### Key State Changes

| Component | State Before | State After |
|-----------|-------------|-------------|
| `OutfitBuilderStore.canvas` | `{ top: [], bottom: null, shoes: null, ... }` | Contains selected items |
| `OutfitBuilderStore.outfits` | `[]` | `[newOutfit]` |
| Supabase `outfits` table | No record | New outfit record inserted |

---

## Sequence Diagram 5: Background Removal Flow

**Scenario:** User removes background from an uploaded image.

### ASCII Sequence Diagram

```
┌─────────┐     ┌────────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User   │     │  Frontend  │     │  Backend API │     │ FalClient│     │  fal.ai  │
│         │     │  (React)   │     │  (FastAPI)   │     │          │     │          │
└────┬────┘     └─────┬──────┘     └──────┬───────┘     └────┬─────┘     └────┬─────┘
     │                │                   │                  │                │
     │ upload image   │                   │                  │                │
     │ click "Remove  │                   │                  │                │
     │ Background"    │                   │                  │                │
     │───────────────>│                   │                  │                │
     │                │                   │                  │                │
     │                │ POST /api/image/remove-background   │                │
     │                │ FormData: {       │                  │                │
     │                │   user_id,        │                  │                │
     │                │   file            │                  │                │
     │                │ }                 │                  │                │
     │                │──────────────────>│                  │                │
     │                │                   │                  │                │
     │                │                   │ file_path =      │                │
     │                │                   │ "{user_id}/      │                │
     │                │                   │  temp/{uuid}.ext"│                │
     │                │                   │                  │                │
     │                │                   │ storage.upload() │                │
     │                │                   │─────────────────────────────────>│
     │                │                   │                  │                │
     │                │                   │ get_public_url() │                │
     │                │                   │─────────────────────────────────>│
     │                │                   │                  │                │
     │                │                   │ image_url        │                │
     │                │                   │<─────────────────────────────────│
     │                │                   │                  │                │
     │                │                   │ FalClient()      │                │
     │                │                   │─────────────────>│                │
     │                │                   │                  │                │
     │                │                   │ remove_background(image_url)      │
     │                │                   │─────────────────>│                │
     │                │                   │                  │                │
     │                │                   │                  │ subscribe(     │
     │                │                   │                  │ "fal-ai/       │
     │                │                   │                  │ birefnet/v2",  │
     │                │                   │                  │ {image_url})   │
     │                │                   │                  │───────────────>│
     │                │                   │                  │                │
     │                │                   │                  │ {image: {      │
     │                │                   │                  │   url:         │
     │                │                   │                  │   processed_url
     │                │                   │                  │ }}             │
     │                │                   │                  │<───────────────│
     │                │                   │                  │                │
     │                │                   │ processed_url    │                │
     │                │                   │<─────────────────│                │
     │                │                   │                  │                │
     │                │                   │ httpx.get(processed_url)          │
     │                │                   │─────────────────────────────────>│
     │                │                   │                  │                │
     │                │                   │ image_bytes      │                │
     │                │                   │<─────────────────────────────────│
     │                │                   │                  │                │
     │                │                   │ final_path =     │                │
     │                │                   │ "{user_id}/      │                │
     │                │                   │  {uuid}.png"     │                │
     │                │                   │                  │                │
     │                │                   │ storage.upload(  │                │
     │                │                   │   final_path,    │                │
     │                │                   │   image_bytes    │                │
     │                │                   │ )                │                │
     │                │                   │─────────────────────────────────>│
     │                │                   │                  │                │
     │                │                   │ RemoveBackgroundResponse          │
     │                │                   │ {processed_image_url,             │
     │                │                   │  storage_path}   │                │
     │                │<──────────────────│                  │                │
     │                │                   │                  │                │
     │  display       │                   │                  │                │
     │  processed     │                   │                  │                │
     │  image         │                   │                  │                │
     │<───────────────│                   │                  │                │
     │                │                   │                  │                │
```

---

## Summary of Interaction Patterns

| Flow | Participants | Key Data Flow |
|------|--------------|---------------|
| AI Analysis | Frontend → Backend → GeminiClient → Gemini API | Image bytes → JSON metadata |
| Create Wardrobe Item | Frontend → Backend → Supabase (Storage + DB) | FormData → DB record |
| Generate Avatar | Frontend → Backend → Supabase → FalClient → fal.ai | user_id → generated image URL |
| Save Outfit | Frontend → Store → Supabase | Canvas state → Outfit record |
| Remove Background | Frontend → Backend → Supabase → FalClient → fal.ai | Image file → processed image URL |