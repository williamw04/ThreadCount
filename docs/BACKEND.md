# Backend Guide

**Version**: 1.0.0
**Last Updated**: 2026-03-02

## Overview

The Seamless backend is a Python-based FastAPI service. It acts as an orchestration layer between the frontend, Supabase, and various AI services (like fal.ai).

## Tech Stack

| Tool         | Purpose                                         |
| ------------ | ----------------------------------------------- |
| Python 3.12+ | Runtime                                         |
| FastAPI      | Web framework                                   |
| Uvicorn      | ASGI server                                     |
| Supabase-py  | Database and storage interaction (Admin)        |
| fal-python   | AI image generation (nano-banana-2/edit)        |
| Pydantic     | Data validation and settings management         |
| httpx        | Asynchronous HTTP client for downloading images |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # Application entrypoint & CORS config
│   ├── config.py            # Environment settings (Pydantic)
│   ├── supabase_client.py   # Supabase Admin initialization
│   ├── api/
│   │   └── routes/
│   │       └── avatar.py    # Avatar generation endpoints
│   └── services/
│       └── fal_client.py    # fal.ai service integration
├── requirements.txt         # Dependencies
├── .env                     # Local secrets (gitignored)
└── uvicorn.log              # Local server logs
```

## Setup & Development

### Prerequisites

- Python 3.12 or higher installed
- `pip` and `venv` (standard with Python)

### Local Setup

1.  **Create Virtual Environment**:

    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment**:
    Create `.env` file in the `backend/` directory:

    ```
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SECRET_KEY=your-secret-key
    FAL_API_KEY=your-fal-api-key
    ```

    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your-anon-key
    FAL_API_KEY=your-fal-api-key

    ```

    ```

4.  **Run Server**:
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

## API Endpoints

### Avatar Generation

- **Endpoint**: `POST /api/avatar/generate`
- **Auth**: Bearer token (Supabase JWT) required in header
- **Body**: `{ "user_id": "uuid" }`
- **Description**:
  1. Fetches user's latest avatar photo from Supabase.
  2. Sends photo to fal.ai for model canvas generation.
  3. Downloads generated image.
  4. Uploads result to Supabase Storage.
  5. Updates database record status to `ready`.

## Security

- **CORS**: Currently allows all origins in development (`.*` regex). Must be restricted in production.
- **Supabase Admin**: The backend uses the Service Role key (or Anon key with high permissions) to bypass RLS for orchestration.
- **Secrets**: API keys (fal.ai) are stored server-side to prevent exposure in the browser.
