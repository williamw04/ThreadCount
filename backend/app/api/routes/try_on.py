import logging
import traceback
import uuid
from typing import List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.fal_client import FalClient
from app.supabase_client import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Prompt for virtual try-on image generation
# Instructs AI to maintain model appearance while adding clothing items
# Optimized for realistic draping and fit
TRY_ON_PROMPT = """Role: You are a professional fashion photography and virtual try-on image generator. 
Objective: Generate a photorealistic image of a model wearing the clothing items described. 
The model should look natural and the clothing should fit realistically on their body.

Instructions:
- The model from the input image should be wearing the described clothing items
- Maintain the model's appearance (face, body shape, skin tone) from the input image
- Clothing should drape naturally and look properly fitted
- Use studio lighting with a clean, neutral background (white, light gray, or off-white)
- High-quality, realistic fashion photography style
- No logos, text, or branding should be visible unless originally present
- Natural skin texture and realistic fabric drape
- Full body visible with proper proportions
- Neutral, natural expression on the model's face

Output: A single, high-quality fashion photography image showing the model wearing the clothing items."""


class TryOnItem(BaseModel):
    id: str
    name: str
    category: str
    image_path: str


class TryOnRequest(BaseModel):
    user_id: str
    outfit_id: Optional[str] = None
    item_ids: List[str]


@router.post("/generate")
async def generate_try_on(request: TryOnRequest):
    # Virtual try-on pipeline:
    # 1. Fetch user's active avatar with ready model canvas
    # 2. Get clothing item images from wardrobe
    # 3. Combine model canvas + clothing images for AI generation
    # 4. Generate try-on image via fal.ai
    # 5. Store result in generated_images table
    logger.info(f"Generating try-on for user: {request.user_id}")
    supabase = get_supabase()

    try:
        # Get user's active avatar with model canvas
        avatar_result = (
            supabase.table("avatars")
            .select("*")
            .eq("user_id", request.user_id)
            .eq("is_active", True)
            .eq("model_status", "ready")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not avatar_result.data or len(avatar_result.data) == 0:
            logger.warning(f"No ready avatar found for user: {request.user_id}")
            raise HTTPException(
                status_code=404,
                detail="Avatar not found or not ready. Please upload a photo and generate your model first.",
            )

        avatar = avatar_result.data[0]
        if not isinstance(avatar, dict):
            raise HTTPException(status_code=500, detail="Invalid avatar data format")

        model_canvas_path = avatar.get("model_canvas_path")
        if not model_canvas_path:
            raise HTTPException(
                status_code=400,
                detail="Model canvas not available. Please generate your avatar first.",
            )

        # Get public URL for model canvas
        # Strip "avatars/" prefix if present to get storage path
        canvas_path = str(model_canvas_path)
        if canvas_path.startswith("avatars/"):
            canvas_path = canvas_path[8:]

        model_canvas_url = supabase.storage.from_("avatars").get_public_url(canvas_path)
        model_url = (
            model_canvas_url
            if isinstance(model_canvas_url, str)
            else str(model_canvas_url)
        )
        logger.info(f"Model canvas URL: {model_url}")

        # Get outfit items from database
        if not request.item_ids:
            raise HTTPException(status_code=400, detail="No clothing items provided")

        items_result = (
            supabase.table("wardrobe_items")
            .select("id, name, category, image_path")
            .in_("id", request.item_ids)
            .execute()
        )

        if not items_result.data:
            raise HTTPException(status_code=400, detail="No valid clothing items found")

        items = items_result.data
        logger.info(f"Found {len(items)} clothing items for try-on")

        # Build image URL array: model canvas first, then clothing items
        # fal.ai uses first image as base, subsequent images as references
        all_image_urls = [model_url]  # Start with model canvas
        for item in items:
            image_path = item.get("image_path")
            if image_path:
                item_url = supabase.storage.from_("wardrobe").get_public_url(image_path)
                all_image_urls.append(
                    item_url if isinstance(item_url, str) else str(item_url)
                )

        if len(all_image_urls) < 2:
            raise HTTPException(
                status_code=400, detail="No valid clothing images found"
            )

        # Enhance prompt with specific clothing item details
        clothing_list = "\n".join(
            f"- {item.get('name', 'clothing item')} ({item.get('category', 'clothing')})"
            for item in items
        )
        enhanced_prompt = f"{TRY_ON_PROMPT}\n\nClothing items to wear:\n{clothing_list}"

        logger.info("Calling fal.ai for try-on generation...")
        fal_client = FalClient()

        generated = fal_client.generate_image(all_image_urls, enhanced_prompt)

        generated_url = None
        if isinstance(generated, dict):
            generated_url = generated.get("url")

        if not generated_url:
            logger.error("fal.ai response did not contain an image URL")
            raise Exception("Try-on generation failed - no URL in response")

        # Download generated image and store permanently
        logger.info(f"Downloading generated image from: {generated_url}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(generated_url)
            response.raise_for_status()

        # Save to generated_images table
        image_id = str(uuid.uuid4())
        file_path = f"{request.user_id}/{image_id}.png"

        logger.info(f"Uploading generated image to Supabase: {file_path}")
        try:
            supabase.storage.from_("generated").upload(
                path=file_path,
                file=response.content,
                file_options={"content-type": "image/png", "upsert": "true"},
            )
        except Exception:
            # Fallback for different SDK version
            supabase.storage.from_("generated").upload(file_path, response.content)

        # Insert record into generated_images table
        # Stores prompt for future reference and debugging
        image_record = (
            supabase.table("generated_images")
            .insert(
                {
                    "id": image_id,
                    "user_id": request.user_id,
                    "outfit_id": request.outfit_id,
                    "image_path": file_path,
                    "prompt": enhanced_prompt,
                }
            )
            .execute()
        )

        if not image_record.data:
            raise HTTPException(
                status_code=500, detail="Failed to save generated image record"
            )

        # Get public URL for the generated image
        public_url = supabase.storage.from_("generated").get_public_url(file_path)
        public_url_str = public_url if isinstance(public_url, str) else str(public_url)

        logger.info(f"Try-on generated successfully: {image_id}")
        return {
            "status": "success",
            "image_id": image_id,
            "image_path": file_path,
            "image_url": public_url_str,
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        error_detail = traceback.format_exc()
        logger.error(f"Error in generate_try_on: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
