# Backend Guide

**Version**: 1.2.0
**Last Updated**: 2026-03-24

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

#### Unix-based systems (macOS/Linux)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Check Python version and create Virtual Environment**:
   
   First, verify you have Python 3.12+ installed:
   ```bash
   python3 --version
   ```
   
   If the version is 3.12 or higher, create the virtual environment:
   ```bash
   python3 -m venv venv
   ```
   
   > **Note**: If `python3 --version` shows an older version, you may need to use `python3.12` or `python3.13` explicitly, or install a newer Python version from [python.org](https://www.python.org/downloads/).

3. **Activate Virtual Environment**:
   ```bash
   source venv/bin/activate
   ```
   
   The previous step created a `venv/` folder containing an isolated Python environment with its own interpreter, pip, and packages. Activating it modifies your shell's PATH so that `python` and `pip` commands use this environment instead of your system Python. You'll see `(venv)` appear in your terminal prompt when active.

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment**:
   Create `.env` file in the `backend/` directory:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-secret-key
   SUPABASE_ANON_KEY=your-anon-key
   FAL_API_KEY=your-fal-api-key
   ```

6. **Run Server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Windows (PowerShell)

1. **Navigate to backend directory**:
   ```powershell
   cd backend
   ```

2. **Check Python version and create Virtual Environment**:
   
   First, verify you have Python 3.12+ installed:
   ```powershell
   python --version
   ```
   
   If the version is 3.12 or higher, create the virtual environment:
   ```powershell
   python -m venv venv
   ```
   
   > **Note**: If your Python version is below 3.12, download and install a newer version from [python.org](https://www.python.org/downloads/). During installation, check "Add Python to PATH".

3. **Activate Virtual Environment**:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   
   The previous step created a `venv\` folder containing an isolated Python environment with its own interpreter, pip, and packages. Activating it modifies your shell's PATH so that `python` and `pip` commands use this environment instead of your system Python. You'll see `(venv)` appear in your terminal prompt when active.
   
   > **Note**: If you get an execution policy error, run this first:
   > ```powershell
   > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   > ```

4. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

5. **Configure Environment**:
   Create `.env` file in the `backend/` directory:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-secret-key
   SUPABASE_ANON_KEY=your-anon-key
   FAL_API_KEY=your-fal-api-key
   ```

6. **Run Server**:
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Windows (Command Prompt)

1. **Navigate to backend directory**:
   ```cmd
   cd backend
   ```

2. **Check Python version and create Virtual Environment**:
   
   First, verify you have Python 3.12+ installed:
   ```cmd
   python --version
   ```
   
   If the version is 3.12 or higher, create the virtual environment:
   ```cmd
   python -m venv venv
   ```
   
   > **Note**: If your Python version is below 3.12, download and install a newer version from [python.org](https://www.python.org/downloads/). During installation, check "Add Python to PATH".

3. **Activate Virtual Environment**:
   ```cmd
   venv\Scripts\activate.bat
   ```
   
   The previous step created a `venv\` folder containing an isolated Python environment with its own interpreter, pip, and packages. Activating it modifies your shell's PATH so that `python` and `pip` commands use this environment instead of your system Python. You'll see `(venv)` appear in your terminal prompt when active.

4. **Install Dependencies**:
   ```cmd
   pip install -r requirements.txt
   ```

5. **Configure Environment**:
   Create `.env` file in the `backend/` directory:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-secret-key
   SUPABASE_ANON_KEY=your-anon-key
   FAL_API_KEY=your-fal-api-key
   ```

6. **Run Server**:
   ```cmd
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Deactivating the Virtual Environment

When you're done working, deactivate the virtual environment:

| Platform | Command |
| -------- | ------- |
| Unix (macOS/Linux) | `deactivate` |
| Windows (PowerShell/CMD) | `deactivate` |

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

- **CORS**: Configured for localhost origins (`http://localhost:5173`, `http://localhost:3000`). Must be updated with production domain(s) before deployment.
- **Supabase Admin**: The backend uses the Service Role key (or Anon key with high permissions) to bypass RLS for orchestration.
- **Secrets**: API keys (fal.ai) are stored server-side to prevent exposure in the browser.
- **Environment Variables**: See `ENV_SETUP.md` for complete guide on configuring secrets.
