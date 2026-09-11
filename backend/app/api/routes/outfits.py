import logging
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.services.thumbnail_generator import ThumbnailGenerator
from app.supabase_client import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


class Outfit(BaseModel):
    id: str
    user_id: str
    name: Optional[str] = None
    item_ids: List[str] = []
    thumbnail_path: Optional[str] = None
    created_at: str
    updated_at: str


class OutfitCreate(BaseModel):
    name: Optional[str] = None
    item_ids: List[str] = []


class OutfitUpdate(BaseModel):
    name: Optional[str] = None
    item_ids: Optional[List[str]] = None


class GenerateThumbnailRequest(BaseModel):
    user_id: str
    item_ids: List[str]


def _db_to_outfit(item: dict) -> Outfit:
    # Converts database record to Pydantic model
    return Outfit(
        id=item["id"],
        user_id=item["user_id"],
        name=item.get("name"),
        item_ids=item.get("item_ids", []),
        thumbnail_path=item.get("thumbnail_path"),
        created_at=item["created_at"],
        updated_at=item["updated_at"],
    )


@router.get("", response_model=List[Outfit])
async def get_outfits(user_id: str):
    """Get all outfits for a user."""
    # Returns user's outfits in reverse chronological order
    logger.info(f"Fetching outfits for user: {user_id}")
    supabase = get_supabase()
    try:
        result = (
            supabase.table("outfits")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return [_db_to_outfit(item) for item in result.data]
    except Exception as e:
        logger.error(f"Error fetching outfits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{outfit_id}", response_model=Outfit)
async def get_outfit(outfit_id: str, user_id: str):
    """Get a single outfit by ID."""
    # Verifies user ownership before returning outfit
    logger.info(f"Fetching outfit: {outfit_id}")
    supabase = get_supabase()
    try:
        result = (
            supabase.table("outfits")
            .select("*")
            .eq("id", outfit_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Outfit not found")
        return _db_to_outfit(result.data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=Outfit)
async def create_outfit(
    user_id: str = Form(...),
    name: Optional[str] = Form(None),
    item_ids: Optional[str] = Form(None),
):
    """Create a new outfit."""
    # Accepts item_ids as comma-separated string for form submission compatibility
    logger.info(f"Creating outfit for user: {user_id}")
    supabase = get_supabase()
    try:
        outfit_id = str(uuid.uuid4())
        item_ids_list = []
        if item_ids:
            item_ids_list = [uid.strip() for uid in item_ids.split(",") if uid.strip()]

        result = (
            supabase.table("outfits")
            .insert(
                {
                    "id": outfit_id,
                    "user_id": user_id,
                    "name": name,
                    "item_ids": item_ids_list,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create outfit")
        return _db_to_outfit(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{outfit_id}", response_model=Outfit)
async def update_outfit(outfit_id: str, user_id: str, updates: OutfitUpdate):
    """Update an outfit."""
    # Supports partial updates - only provided fields are updated
    logger.info(f"Updating outfit: {outfit_id}")
    supabase = get_supabase()
    try:
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        if updates.name is not None:
            update_data["name"] = updates.name
        if updates.item_ids is not None:
            update_data["item_ids"] = updates.item_ids

        result = (
            supabase.table("outfits")
            .update(update_data)
            .eq("id", outfit_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Outfit not found")
        return _db_to_outfit(result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{outfit_id}")
async def delete_outfit(outfit_id: str, user_id: str):
    """Delete an outfit."""
    logger.info(f"Deleting outfit: {outfit_id}")
    supabase = get_supabase()
    try:
        result = (
            supabase.table("outfits")
            .delete()
            .eq("id", outfit_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Outfit not found")
        return {"status": "success", "message": "Outfit deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-thumbnail")
async def generate_outfit_thumbnail(request: GenerateThumbnailRequest):
    """Generate a thumbnail by compositing wardrobe item images."""
    # Creates visual outfit preview by compositing individual item images
    # Used for outfit cards in the UI
    logger.info(
        f"Generating thumbnail for user: {request.user_id} with {len(request.item_ids)} items"
    )
    try:
        generator = ThumbnailGenerator()
        result = await generator.generate(request.user_id, request.item_ids)
        return {"status": "success", **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_outfit_image(
    user_id: str = Form(...),
    name: Optional[str] = Form(None),
    image: UploadFile = File(...),
):
    """Upload an outfit image directly without composing from wardrobe items."""
    # Alternative to thumbnail generation for pre-made outfit images
    # Creates outfit record with uploaded image as thumbnail
    logger.info(f"Uploading outfit image for user: {user_id}")
    supabase = get_supabase()
    try:
        if not image.filename:
            raise HTTPException(status_code=400, detail="No image provided")

        outfit_id = str(uuid.uuid4())
        file_ext = image.filename.split(".")[-1] if "." in image.filename else "png"
        file_path = f"{user_id}/outfits/{outfit_id}.{file_ext}"

        image_content = await image.read()
        if len(image_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

        logger.info(f"Uploading outfit image to: {file_path}")
        try:
            supabase.storage.from_("generated").upload(
                path=file_path,
                file=image_content,
                file_options={
                    "content-type": image.content_type or "image/png",
                    "upsert": "true",
                },
            )
        except Exception as e:
            logger.warning(f"Upload with options failed, trying fallback: {e}")
            supabase.storage.from_("generated").upload(file_path, image_content)

        result = (
            supabase.table("outfits")
            .insert(
                {
                    "id": outfit_id,
                    "user_id": user_id,
                    "name": name,
                    "item_ids": [],
                    "thumbnail_path": file_path,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save outfit record")

        thumbnail_url = supabase.storage.from_("generated").get_public_url(file_path)
        thumbnail_url_str = (
            thumbnail_url if isinstance(thumbnail_url, str) else str(thumbnail_url)
        )
        logger.info(f"Outfit uploaded: {outfit_id}")
        return {
            "status": "success",
            "outfit_id": outfit_id,
            "thumbnail_path": file_path,
            "thumbnail_url": thumbnail_url_str,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
