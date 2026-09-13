from supabase import Client, create_client

from app.config import get_settings


def get_supabase() -> Client:
    # Create Supabase client using service role key for backend operations
    # This bypasses Row Level Security (RLS) for authenticated backend operations
    # Frontend uses separate anon key with RLS policies applied
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_secret_key)
