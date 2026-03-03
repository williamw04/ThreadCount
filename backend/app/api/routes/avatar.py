from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.fal_client import FalClient
from app.supabase_client import get_supabase
import httpx
import traceback

router = APIRouter()

AVATAR_PROMPT = """Role: You are a professional fashion photography and virtual try-on image generator. Objective: Given a photo of a person, generate a high-quality, neutral modeling image that serves as a reusable canvas for future product visualization (e.g., clothing, accessories). The output must prioritize realism, accurate body proportions, and clean separation between the model and clothing regions. Instructions: Generate a full-body fashion model photo based on the person in the input image. Preserve: Body shape and proportions Skin tone Facial structure (neutral expression) Hair shape and volume (simple, unobstructive styling) Do not stylize the face or body beyond realistic enhancement (no beauty exaggeration). Pose & Composition: Neutral, balanced stance (e.g., slight contrapposto or straight-on). Arms relaxed and positioned to avoid covering torso or hips. Legs visible and unobstructed. Camera angle: eye-level or slightly above. Framing: full body, centered, with margin around the subject. Clothing (Temporary / Placeholder): Dress the model in simple, form-fitting, neutral garments: Solid color (e.g., beige, light gray, muted pink, soft black) No logos, text, patterns, or branding Clothing should clearly define: Torso Waist Hips Legs Avoid excessive layering, accessories, or textures. Clothing must be easy to replace digitally (clean edges, no occlusion). Footwear: Minimal, neutral shoes or barefoot. No dramatic heels or complex straps unless unavoidable. Lighting & Environment: Studio lighting: soft, even, shadow-controlled. Background: plain, light neutral (white, off-white, or light gray). No props, no furniture, no background elements. Image Quality: Ultra-high resolution Sharp focus Realistic skin texture Accurate fabric drape No motion blur, no artistic effects Constraints (Important): No exaggerated fashion poses No dramatic expressions No stylization (editorial, fantasy, cinematic, anime, etc.) No cropping of limbs No body distortion No sexualized posing Final Output Goal: A clean, realistic, full-body model image that functions as a neutral base canvas for future virtual try-on rendering, where tops, bottoms, dresses, shoes, and accessories can be swapped without re-posing or re-lighting the subject."""


class GenerateAvatarRequest(BaseModel):
    user_id: str


@router.post("/generate")
async def generate_avatar(request: GenerateAvatarRequest):
    try:
        supabase = get_supabase()

        # Get user's latest avatar
        result = supabase.table("avatars").select("*").eq("user_id", request.user_id).eq("is_active", True).order("created_at", desc=True).limit(1).execute()

        if not result.data or len(result.data) == 0:
            return JSONResponse(status_code=404, content={"error": "Avatar not found"})

        avatar = result.data[0]
        
        # Ensure avatar is a dictionary
        if not isinstance(avatar, dict):
            return JSONResponse(status_code=500, content={"error": "Invalid avatar data format"})
            
        avatar_id = avatar.get("id")
        original_photo_path = avatar.get("original_photo_path")
        
        if not avatar_id or not original_photo_path:
            return JSONResponse(status_code=500, content={"error": "Missing avatar data"})

        # Update status to processing
        supabase.table("avatars").update({"model_status": "processing"}).eq("id", avatar_id).execute()

        # Get public URL of original photo
        photo_path = str(original_photo_path)
        if photo_path.startswith("avatars/"):
            photo_path = photo_path[8:]
        
        original_url = supabase.storage.from_("avatars").get_public_url(photo_path)

        # Generate new image
        fal_client = FalClient()
        generated = fal_client.generate_image(original_url, AVATAR_PROMPT)

        # Download and upload to Supabase
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(generated["url"])
            response.raise_for_status()

        file_path = f"{request.user_id}/model.png"
        
        # We need to pass the options differently based on the client version
        try:
            supabase.storage.from_("avatars").upload(
                file_path, 
                response.content, 
                file_options={"content-type": "image/png", "upsert": "true"}
            )
        except Exception:
            # Fallback for some versions
            # Some versions don't accept dictionaries for file_options, so we skip it
            supabase.storage.from_("avatars").upload(file_path, response.content)

        # Update avatar record
        supabase.table("avatars").update({
            "model_status": "ready",
            "model_canvas_path": file_path
        }).eq("id", avatar_id).execute()

        return {"status": "success", "model_path": file_path}

    except Exception as e:
        error_detail = traceback.format_exc()
        print(f"Error in generate_avatar: {error_detail}")
        return JSONResponse(status_code=500, content={"error": str(e), "detail": error_detail})
