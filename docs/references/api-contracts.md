# API Contracts

> **This document describes the current FastAPI backend, which is being replaced.** The contract for the new API lives in code at `packages/shared/src/contract.ts` and its entity schemas at `packages/shared/src/schemas.ts`. See `docs/decisions/cloudflare-architecture.md`. Until sub-project 2 ships, the web app still calls the endpoints below.

**Version:** 1.0.0
**Base URL:** `{VITE_API_URL || http://localhost:8000}`

All endpoints require authentication via Bearer token from Supabase Auth.

---

## Authentication

All API endpoints require a valid Supabase Auth session. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Error Response Format

All endpoints return errors in this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Avatar

### Generate Avatar Model Canvas

Generate a fashion model canvas from the user's uploaded photo.

**Endpoint:** `POST /api/avatar/generate`

**Request Body:**
```json
{
  "user_id": "string"
}
```

**Response (200):**
```json
{
  "status": "success",
  "model_path": "string (storage path to model canvas)"
}
```

**Errors:**
- `404` - Avatar not found. Please upload a photo first.
- `500` - Invalid avatar data format / Avatar record is incomplete / Generation failed

**Notes:**
- Requires an existing avatar record with `original_photo_path`
- Sets `model_status` to `processing`, then `ready` or `failed`
- Uses fal.ai for AI image generation

---

## Wardrobe

### Get Wardrobe Items

Retrieve all wardrobe items for a user with optional filters.

**Endpoint:** `GET /api/wardrobe/items`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | User's ID |
| `category` | string | No | Filter by category |
| `search` | string | No | Search in name and labels |
| `colors` | string | No | Comma-separated color filters |
| `seasons` | string | No | Comma-separated season filters |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "string",
    "name": "string",
    "category": "string",
    "image_path": "string | null",
    "labels": ["string"],
    "colors": ["string"],
    "seasons": ["string"],
    "is_inspiration": false,
    "is_template": false,
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
]
```

---

### Get Single Wardrobe Item

**Endpoint:** `GET /api/wardrobe/items/{item_id}`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "string",
  "name": "string",
  "category": "string",
  "image_path": "string | null",
  "labels": ["string"],
  "colors": ["string"],
  "seasons": ["string"],
  "is_inspiration": false,
  "is_template": false,
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

**Errors:**
- `404` - Item not found

---

### Create Wardrobe Item

**Endpoint:** `POST /api/wardrobe/items`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | User's ID |
| `name` | string | Yes | Item name |
| `category` | string | Yes | Item category |
| `labels` | string | No | Comma-separated labels |
| `colors` | string | No | Comma-separated colors |
| `seasons` | string | No | Comma-separated seasons |
| `image_path` | string | No* | Existing storage path |
| `image` | File | No* | Image file upload |

*Either `image_path` or `image` is required.

**Response (200):** Returns created `WardrobeItemResponse`

**Errors:**
- `400` - Either image_path or image file is required
- `500` - Failed to create item

---

### Update Wardrobe Item

**Endpoint:** `PUT /api/wardrobe/items/{item_id}`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Request Body:**
```json
{
  "name": "string (optional)",
  "category": "string (optional)",
  "labels": ["string"] (optional),
  "colors": ["string"] (optional),
  "seasons": ["string"] (optional)
}
```

**Response (200):** Returns updated `WardrobeItemResponse`

**Errors:**
- `404` - Item not found

---

### Delete Wardrobe Item

**Endpoint:** `DELETE /api/wardrobe/items/{item_id}`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Response (200):**
```json
{
  "status": "success",
  "message": "Item deleted"
}
```

**Errors:**
- `404` - Item not found

---

## Outfits

### Get Outfits

**Endpoint:** `GET /api/outfits`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "string",
    "name": "string | null",
    "item_ids": ["uuid"],
    "thumbnail_path": "string | null",
    "created_at": "ISO 8601 timestamp",
    "updated_at": "ISO 8601 timestamp"
  }
]
```

---

### Get Single Outfit

**Endpoint:** `GET /api/outfits/{outfit_id}`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Response (200):** Returns single `Outfit` object

**Errors:**
- `404` - Outfit not found

---

### Create Outfit

**Endpoint:** `POST /api/outfits`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | User's ID |
| `name` | string | No | Outfit name |
| `item_ids` | string | No | Comma-separated wardrobe item IDs |

**Response (200):** Returns created `Outfit` object

---

### Update Outfit

**Endpoint:** `PUT /api/outfits/{outfit_id}`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Request Body:**
```json
{
  "name": "string (optional)",
  "item_ids": ["uuid"] (optional)
}
```

**Response (200):** Returns updated `Outfit` object

---

### Delete Outfit

**Endpoint:** `DELETE /api/outfits/{outfit_id}`

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `user_id` | string | Yes |

**Response (200):**
```json
{
  "status": "success",
  "message": "Outfit deleted"
}
```

---

### Generate Outfit Thumbnail

Generate a composite thumbnail from wardrobe items.

**Endpoint:** `POST /api/outfits/generate-thumbnail`

**Request Body:**
```json
{
  "user_id": "string",
  "item_ids": ["uuid"]
}
```

**Response (200):**
```json
{
  "status": "success",
  "thumbnail_path": "string (storage path)",
  "thumbnail_url": "string (public URL)"
}
```

**Errors:**
- `400` - No item_ids provided / No valid clothing items found

---

### Upload Outfit Image

Upload an outfit image directly (not composed from items).

**Endpoint:** `POST /api/outfits/upload`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | User's ID |
| `name` | string | No | Outfit name |
| `image` | File | Yes | Image file (max 10MB) |

**Response (200):**
```json
{
  "status": "success",
  "outfit_id": "uuid",
  "thumbnail_path": "string",
  "thumbnail_url": "string"
}
```

**Errors:**
- `400` - No image provided / Image too large (max 10MB)
- `500` - Failed to save outfit record

---

## Try-On

### Generate Try-On Image

Generate an AI image of the user wearing selected clothing items.

**Endpoint:** `POST /api/try-on/generate`

**Request Body:**
```json
{
  "user_id": "string",
  "outfit_id": "uuid (optional)",
  "item_ids": ["uuid"]
}
```

**Response (200):**
```json
{
  "status": "success",
  "image_id": "uuid",
  "image_path": "string (storage path)",
  "image_url": "string (public URL)"
}
```

**Errors:**
- `400` - No clothing items provided / No valid clothing images found / Model canvas not available
- `404` - Avatar not found or not ready
- `500` - Try-on generation failed

**Notes:**
- Requires user to have an avatar with `model_status: "ready"`
- Uses fal.ai for AI image generation

---

## AI

### Analyze Clothing Image

Analyze a clothing image to extract metadata using Gemini AI.

**Endpoint:** `POST /api/ai/analyze`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| `file` | File | Yes (must be image) |

**Response (200):**
```json
{
  "suggested_name": "string",
  "suggested_category": "string",
  "colors": ["string"],
  "seasons": ["string"],
  "tags": ["string"],
  "style": ["string"],
  "material_guess": "string",
  "confidence": "low | medium | high"
}
```

**Errors:**
- `400` - File must be an image
- `500` - Failed to analyze image

---

## Categories

Valid wardrobe categories:
- `tops`
- `bottoms`
- `dresses`
- `outerwear`
- `shoes`
- `accessories`

---

## Seasons

Valid season values:
- `spring`
- `summer`
- `fall`
- `winter`

---

## Storage Buckets

| Bucket | Purpose |
|--------|---------|
| `avatars` | User avatar photos and model canvases |
| `wardrobe` | Wardrobe item images |
| `generated` | Generated try-on images and thumbnails |

---

## Frontend API Utilities

The frontend provides helper functions for constructing public URLs:

### Wardrobe Items
```typescript
import { getItemImageUrl } from '@/features/wardrobe/api';
const url = getItemImageUrl(item.image_path);
```

### Generated Images
```typescript
import { getGeneratedImageUrl } from '@/features/outfit-builder/api';
const url = getGeneratedImageUrl(imagePath);
```

### Avatar Images
```typescript
import { supabase } from '@/shared/api/supabase';
const { data } = supabase.storage.from('avatars').getPublicUrl(path);
const url = data.publicUrl;
```