import logging
import uuid

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.fal_client import FalClient
from app.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter()


class RemoveBackgroundRequest(BaseModel):
    image_url: str


class RemoveBackgroundResponse(BaseModel):
    processed_image_url: str
    storage_path: str


@router.post("/remove-background", response_model=RemoveBackgroundResponse)
async def remove_background(user_id: str = Form(...), file: UploadFile = File(...)):
    """Upload image, remove background, and return processed image."""
    # Background removal pipeline for wardrobe items:
    # 1. Upload original to temporary storage
    # 2. Process via fal.ai BiRefNet v2
    # 3. Download processed result
    # 4. Upload to permanent storage
    # 5. Clean up temporary file
    logger.info(f"Processing background removal for user: {user_id}")
    supabase = get_supabase()

    try:
        file_content = await file.read()
        file_ext = file.filename.split(".")[-1].lower() if file.filename else "jpg"
        temp_path = f"{user_id}/temp_{uuid.uuid4()}.{file_ext}"

        # Upload to temporary location for fal.ai processing
        logger.info(f"Uploading temp image to Supabase: {temp_path}")
        supabase.storage.from_("wardrobe").upload(temp_path, file_content)

        temp_url_resp = supabase.storage.from_("wardrobe").get_public_url(temp_path)
        temp_url = (
            temp_url_resp if isinstance(temp_url_resp, str) else str(temp_url_resp)
        )

        logger.info("Calling fal.ai for background removal...")
        fal_client = FalClient()
        processed_url = fal_client.remove_background(temp_url)

        # Download processed image from fal.ai
        logger.info(f"Downloading processed image from: {processed_url}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(processed_url)
            response.raise_for_status()

        # Store processed image with unique filename
        processed_path = f"{user_id}/processed_{uuid.uuid4()}.png"
        logger.info(f"Uploading processed image to Supabase: {processed_path}")

        try:
            supabase.storage.from_("wardrobe").upload(
                path=processed_path,
                file=response.content,
                file_options={"content-type": "image/png", "upsert": "true"},
            )
        except Exception:
            # Fallback for different Supabase SDK versions
            supabase.storage.from_("wardrobe").upload(processed_path, response.content)

        # Clean up temporary file (non-fatal if fails)
        try:
            supabase.storage.from_("wardrobe").remove([temp_path])
            logger.info(f"Cleaned up temp file: {temp_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up temp file: {str(e)}")

        processed_url_resp = supabase.storage.from_("wardrobe").get_public_url(
            processed_path
        )
        final_url = (
            processed_url_resp
            if isinstance(processed_url_resp, str)
            else str(processed_url_resp)
        )

        return RemoveBackgroundResponse(
            processed_image_url=final_url, storage_path=processed_path
        )

    except Exception as e:
        logger.error(f"Background removal failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
