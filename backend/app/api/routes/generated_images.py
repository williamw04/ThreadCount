import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.supabase_client import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class GeneratedImage(BaseModel):
    id: str
    user_id: str
    outfit_id: Optional[str] = None
    image_path: str
    prompt: Optional[str] = None
    created_at: str


class GeneratedImageResponse(BaseModel):
    id: str
    user_id: str
    outfit_id: Optional[str] = None
    image_url: str
    prompt: Optional[str] = None
    created_at: str


def _db_to_response(item: dict, supabase) -> GeneratedImageResponse:
    # Converts database record to API response
    # Generates public URL from storage path for frontend consumption
    image_path = item.get("image_path")
    image_url = ""
    if image_path:
        image_url = supabase.storage.from_("generated").get_public_url(image_path)
        image_url = image_url if isinstance(image_url, str) else str(image_url)

    return GeneratedImageResponse(
        id=item["id"],
        user_id=item["user_id"],
        outfit_id=item.get("outfit_id"),
        image_url=image_url,
        prompt=item.get("prompt"),
        created_at=item["created_at"],
    )


@router.get("", response_model=list[GeneratedImageResponse])
async def get_generated_images(user_id: str):
    """Get all generated images for a user."""
    # Returns user's generated images in reverse chronological order
    # Used in gallery/history views
    logger.info(f"Fetching generated images for user: {user_id}")
    supabase = get_supabase()
    try:
        result = (
            supabase.table("generated_images")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return [_db_to_response(item, supabase) for item in result.data]
    except Exception as e:
        logger.error(f"Error fetching generated images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{image_id}", response_model=GeneratedImageResponse)
async def get_generated_image(image_id: str, user_id: str):
    """Get a single generated image by ID."""
    # Fetches specific generated image with user ownership verification
    logger.info(f"Fetching generated image: {image_id}")
    supabase = get_supabase()
    try:
        result = (
            supabase.table("generated_images")
            .select("*")
            .eq("id", image_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Generated image not found")
        return _db_to_response(result.data, supabase)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching generated image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{image_id}")
async def delete_generated_image(image_id: str, user_id: str):
    """Delete a generated image."""
    # Deletes both database record and storage file
    # Storage deletion failure is non-fatal (logged as warning)
    logger.info(f"Deleting generated image: {image_id}")
    supabase = get_supabase()
    try:
        result = (
            supabase.table("generated_images")
            .select("image_path")
            .eq("id", image_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Generated image not found")

        image_path = result.data.get("image_path")

        supabase.table("generated_images").delete().eq("id", image_id).eq(
            "user_id", user_id
        ).execute()

        if image_path:
            try:
                supabase.storage.from_("generated").remove([image_path])
                logger.info(f"Deleted image from storage: {image_path}")
            except Exception as e:
                logger.warning(f"Failed to delete image from storage: {str(e)}")

        return {"status": "success", "message": "Generated image deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting generated image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
