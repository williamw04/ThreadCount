from app.supabase_client import get_supabase
import asyncio

async def list_data():
    supabase = get_supabase()
    # Profiles
    profiles = supabase.table("profiles").select("*").execute()
    print(f"Profiles ({len(profiles.data)}): {profiles.data}")
    
    # Avatars
    avatars = supabase.table("avatars").select("*").execute()
    print(f"Avatars ({len(avatars.data)}): {avatars.data}")

if __name__ == "__main__":
    asyncio.run(list_data())
