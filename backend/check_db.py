from app.supabase_client import get_supabase
import asyncio

async def check_user(user_id):
    supabase = get_supabase()
    # Check profile
    profile = supabase.table("profiles").select("*").eq("id", user_id).execute()
    print(f"Profile: {profile.data}")
    
    # Check avatar
    avatar = supabase.table("avatars").select("*").eq("user_id", user_id).execute()
    print(f"Avatars: {avatar.data}")

if __name__ == "__main__":
    import sys
    user_id = sys.argv[1] if len(sys.argv) > 1 else "bb18c8fc-548e-442a-a05b-293ad252b6a0"
    asyncio.run(check_user(user_id))
