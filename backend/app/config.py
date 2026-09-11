from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase configuration for database and storage operations
    supabase_url: str
    supabase_secret_key: str

    # fal.ai API key for AI image generation (avatar generation, try-on, background removal)
    fal_api_key: str

    # Google Gemini API key for clothing analysis and metadata extraction
    # Optional - defaults to empty string if not configured
    google_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    # Cache settings to avoid re-reading environment variables on every request
    # Settings are loaded once and reused throughout the application lifecycle
    return Settings()
