# Backend Guide

**Version**: 1.4.0
**Last Updated**: 2026-04-29

## Overview

The Seamless backend is a Python-based FastAPI service. It acts as an orchestration layer between the frontend, Supabase, and various AI services (like fal.ai).

## Setup

See [Getting Started](../getting-started/setup.md) for detailed setup instructions.

## Tech Stack

| Tool            | Purpose                                         |
| --------------- | ----------------------------------------------- |
| Python 3.12+    | Runtime                                         |
| FastAPI         | Web framework                                   |
| Uvicorn         | ASGI server                                     |
| Supabase        | Database and storage interaction (Admin)        |
| fal-client      | AI image generation (nano-banana-2/edit)        |
| Google GenerativeAI | AI image analysis for metadata detection   |
| Pillow          | Image processing (thumbnails, composites)       |
| Pydantic        | Data validation and settings management         |
| httpx           | Asynchronous HTTP client for downloading images |

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # Application entrypoint & CORS config
│   ├── config.py                  # Environment settings (Pydantic)
│   ├── supabase_client.py         # Supabase Admin initialization
│   ├── api/
│   │   └── routes/
│   │       ├── avatar.py          # Avatar generation endpoints
│   │       ├── wardrobe.py        # Wardrobe item CRUD endpoints
│   │       ├── outfits.py         # Outfit CRUD and thumbnail generation
│   │       ├── ai.py              # AI analysis endpoints
│   │       ├── try_on.py          # Try-on generation endpoints
│   │       └── image_processing.py # Background removal endpoints
│   └── services/
│       ├── fal_client.py          # fal.ai service integration
│       ├── gemini_client.py       # Google Gemini AI for metadata detection
│       └── thumbnail_generator.py # Outfit thumbnail composite generation
├── requirements.txt               # Dependencies
└── .env                           # Local secrets (gitignored)
```

## API Endpoints

All endpoints (except `/health` and `/test-cors`) require a Bearer token (Supabase JWT) in the Authorization header.

### Health & Testing

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/health` | Health check endpoint |
| GET | `/test-cors` | CORS testing endpoint |

### Avatar Generation

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/avatar/generate` | Generate avatar from user's photo |

**Body**: `{ "user_id": "uuid" }`

**Flow**:
1. Fetches user's latest avatar photo from Supabase.
2. Sends photo to fal.ai for model canvas generation.
3. Downloads generated image.
4. Uploads result to Supabase Storage.
5. Updates database record status to `ready`.

### Wardrobe Items

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/wardrobe/items` | List all wardrobe items for user |
| GET | `/api/wardrobe/items/{item_id}` | Get single wardrobe item |
| POST | `/api/wardrobe/items` | Create new wardrobe item |
| PUT | `/api/wardrobe/items/{item_id}` | Update wardrobe item |
| DELETE | `/api/wardrobe/items/{item_id}` | Delete wardrobe item |

### Outfits

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/outfits` | List all saved outfits for user |
| GET | `/api/outfits/{outfit_id}` | Get single outfit |
| POST | `/api/outfits` | Create new outfit |
| PUT | `/api/outfits/{outfit_id}` | Update outfit |
| DELETE | `/api/outfits/{outfit_id}` | Delete outfit |
| POST | `/api/outfits/generate-thumbnail` | Generate outfit thumbnail from items |
| POST | `/api/outfits/upload` | Upload and save outfit image |

### AI Analysis

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/ai/analyze` | Analyze image for metadata (colors, seasons, category) |

### Try-On

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/try-on/generate` | Generate AI image of user wearing outfit |

### Image Processing

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/image/remove-background` | Remove background from image |

## Security

- **CORS**: Configured for localhost origins (`http://localhost:5173`, `http://localhost:3000`). Must be updated with production domain(s) before deployment.
- **Supabase Admin**: The backend uses the Service Role key (or Anon key with high permissions) to bypass RLS for orchestration.
- **Secrets**: API keys (fal.ai) are stored server-side to prevent exposure in the browser.
- **Environment Variables**: See [Getting Started](../getting-started/setup.md) for configuring secrets.
