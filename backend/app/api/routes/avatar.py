from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.fal_client import FalClient
from app.supabase_client import get_supabase
import httpx
import traceback
import logging
from typing import Any, Dict, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

AVATAR_PROMPT = """Role: You are a professional fashion photography and virtual try-on image generator. Objective: Given a photo of a person, generate a high-quality, neutral modeling image that serves as a reusable canvas for future product visualization (e.g., clothing, accessories). The output must prioritize realism, accurate body proportions, and clean separation between the model and clothing regions. Instructions: Generate a full-body fashion model photo based on the person in the input image. Preserve: Body shape and proportions Skin tone Facial structure (neutral expression) Hair shape and volume (simple, unobstructive styling) Do not stylize the face or body beyond realistic enhancement (no beauty exaggeration). Pose & Composition: Neutral, balanced stance (e.g., slight contrapposto or straight-on). Arms relaxed and positioned to avoid covering torso or hips. Legs visible and unobstructed. Camera angle: eye-level or slightly above. Framing: full body, centered, with margin around the subject. Clothing (Temporary / Placeholder): Dress the model in simple, form-fitting, neutral garments: Solid color (e.g., beige, light gray, muted pink, soft black) No logos, text, patterns, or branding Clothing should clearly define: Torso Waist Hips Legs Avoid excessive layering, accessories, or textures. Clothing must be easy to replace digitally (clean edges, no occlusion). Footwear: Minimal, neutral shoes or barefoot. No dramatic heels or complex straps unless unavoidable. Lighting & Environment: Studio lighting: soft, even, shadow-controlled. Background: plain, light neutral (white, off-white, or light gray). No props, no furniture, no background elements. Image Quality: Ultra-high resolution Sharp focus Realistic skin texture Accurate fabric drape No motion blur, no artistic effects Constraints (Important): No exaggerated fashion poses No dramatic expressions No stylization (editorial, fantasy, cinematic, anime, etc.) No cropping of limbs No body distortion No sexualized posing Final Output Goal: A clean, realistic, full-body model image that functions as a neutral base canvas for future virtual try-on rendering, where tops, bottoms, dresses, shoes, and accessories can be swapped without re-posing or re-lighting the subject."""


class GenerateAvatarRequest(BaseModel):
    user_id: str


@router.post("/generate")
async def generate_avatar(request: GenerateAvatarRequest):
    logger.info(f"Generating avatar for user: {request.user_id}")
    supabase = get_supabase()
    avatar_id = None

    try:
        # Get user's latest avatar
        result = (
            supabase.table("avatars")
            .select("*")
            .eq("user_id", request.user_id)
            .eq("is_active", True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not result.data or len(result.data) == 0:
            logger.warning(f"No avatar found for user: {request.user_id}")
            raise HTTPException(
                status_code=404, detail="Avatar not found. Please upload a photo first."
            )

        avatar = result.data[0]
        if not isinstance(avatar, dict):
            raise HTTPException(
                status_code=500, detail="Invalid avatar data format from database"
            )

        avatar_id = avatar.get("id")
        original_photo_path = avatar.get("original_photo_path")

        if not avatar_id or not original_photo_path:
            logger.error(f"Avatar record is incomplete for user: {request.user_id}")
            raise HTTPException(status_code=500, detail="Avatar record is incomplete")

        # Update status to processing
        logger.info(f"Setting avatar {avatar_id} status to processing")
        supabase.table("avatars").update({"model_status": "processing"}).eq(
            "id", avatar_id
        ).execute()

        # Get public URL of original photo
        photo_path = str(original_photo_path)
        if photo_path.startswith("avatars/"):
            photo_path = photo_path[8:]

        url_resp = supabase.storage.from_("avatars").get_public_url(photo_path)
        # Handle different response types from get_public_url
        original_url = url_resp if isinstance(url_resp, str) else str(url_resp)
        logger.info(f"Original image URL: {original_url}")

        # Generate new image via fal.ai
        logger.info("Calling fal.ai for image generation...")
        fal_client = FalClient()
        generated = fal_client.generate_image([original_url], AVATAR_PROMPT)

        generated_url = None
        if isinstance(generated, dict):
            generated_url = generated.get("url")

        if not generated_url:
            logger.error("fal.ai response did not contain an image URL")
            raise Exception("fal.ai generation failed - no URL in response")

        # Download and upload to Supabase
        logger.info(f"Downloading generated image from: {generated_url}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(generated_url)
            response.raise_for_status()

        file_path = f"{request.user_id}/model.png"
        logger.info(f"Uploading model canvas to Supabase: {file_path}")

        try:
            supabase.storage.from_("avatars").upload(
                path=file_path,
                file=response.content,
                file_options={"content-type": "image/png", "upsert": "true"},
            )
        except Exception:
            # Fallback for different SDK version
            supabase.storage.from_("avatars").upload(file_path, response.content)

        # Update avatar record
        logger.info(f"Setting avatar {avatar_id} status to ready")
        supabase.table("avatars").update(
            {"model_status": "ready", "model_canvas_path": file_path}
        ).eq("id", avatar_id).execute()

        return {"status": "success", "model_path": file_path}

    except HTTPException as he:
        raise he
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"Error in generate_avatar: {error_detail}")

        if avatar_id:
            try:
                supabase.table("avatars").update({"model_status": "failed"}).eq(
                    "id", avatar_id
                ).execute()
            except:
                pass

        raise HTTPException(status_code=500, detail=str(e))
