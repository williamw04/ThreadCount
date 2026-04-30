# Welcome to Seamless

Seamless is a fashion web application where users can:

- Upload photos to create a personalized avatar
- Build a virtual wardrobe of clothing items
- Assemble outfits from their wardrobe
- Generate AI images of themselves wearing outfits

## Quick Start

1. **Clone the repository**

2. **Set up your environment**

   See [Getting Started](./getting-started/setup.md) for detailed setup instructions.

   ```bash
   # Frontend
   cd frontend
   npm install
   npm run dev

   # Backend (in another terminal)
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Open your browser**

   Navigate to `http://localhost:5173`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | Python 3.12+, FastAPI |
| Database | Supabase (PostgreSQL, Auth, Storage) |
| AI | fal.ai (image generation), Google Gemini (image analysis) |

## Project Structure

```
├── frontend/       # React SPA
├── backend/        # FastAPI service
├── supabase/       # Database schema and config
└── docs/           # Documentation
```

## Documentation

| Section | Description |
|---------|-------------|
| [Getting Started](getting-started/setup.md) | Setup development environment |
| [Architecture](getting-started/architecture.md) | System design and conventions |
| [Frontend Guide](guides/FRONTEND.md) | Frontend patterns and code style |
| [Backend Guide](guides/BACKEND.md) | Backend patterns and API endpoints |
| [Features](features/index.md) | Feature specifications |
| [Decisions](decisions/index.md) | Design decisions and rationale |

## Contributing

See [CONTRIBUTING.md](https://github.com/anomalyco/seamless/blob/main/CONTRIBUTING.md) for contribution guidelines.

---

**Questions?** Open an issue on GitHub or check existing issues for help.
