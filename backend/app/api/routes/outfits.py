from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from app.supabase_client import get_supabase
import logging
import uuid
from datetime import datetime
import io
import httpx
from PIL import Image

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


@router.get("", response_model=List[Outfit])
async def get_outfits(user_id: str):
    """Get all outfits for a user."""
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

        outfits = []
        for item in result.data:
            outfits.append(
                Outfit(
                    id=item["id"],
                    user_id=item["user_id"],
                    name=item.get("name"),
                    item_ids=item.get("item_ids", []),
                    thumbnail_path=item.get("thumbnail_path"),
                    created_at=item["created_at"],
                    updated_at=item["updated_at"],
                )
            )

        return outfits

    except Exception as e:
        logger.error(f"Error fetching outfits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{outfit_id}", response_model=Outfit)
async def get_outfit(outfit_id: str, user_id: str):
    """Get a single outfit by ID."""
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

        item = result.data
        return Outfit(
            id=item["id"],
            user_id=item["user_id"],
            name=item.get("name"),
            item_ids=item.get("item_ids", []),
            thumbnail_path=item.get("thumbnail_path"),
            created_at=item["created_at"],
            updated_at=item["updated_at"],
        )

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

        item = result.data[0]
        return Outfit(
            id=item["id"],
            user_id=item["user_id"],
            name=item.get("name"),
            item_ids=item.get("item_ids", []),
            thumbnail_path=item.get("thumbnail_path"),
            created_at=item["created_at"],
            updated_at=item["updated_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{outfit_id}", response_model=Outfit)
async def update_outfit(outfit_id: str, user_id: str, updates: OutfitUpdate):
    """Update an outfit."""
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

        item = result.data[0]
        return Outfit(
            id=item["id"],
            user_id=item["user_id"],
            name=item.get("name"),
            item_ids=item.get("item_ids", []),
            thumbnail_path=item.get("thumbnail_path"),
            created_at=item["created_at"],
            updated_at=item["updated_at"],
        )

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
    logger.info(
        f"Generating thumbnail for user: {request.user_id} with {len(request.item_ids)} items"
    )
    supabase = get_supabase()

    try:
        if not request.item_ids:
            raise HTTPException(status_code=400, detail="No item_ids provided")

        items_result = (
            supabase.table("wardrobe_items")
            .select("id, name, category, image_path")
            .in_("id", request.item_ids)
            .execute()
        )

        if not items_result.data:
            raise HTTPException(status_code=400, detail="No valid clothing items found")

        items = items_result.data
        logger.info(f"Found {len(items)} items for thumbnail")

        canvas_width = 400
        canvas_height = 600
        canvas = Image.new("RGBA", (canvas_width, canvas_height), (255, 255, 255, 255))

        center_column_x = int(canvas_width * 0.15)
        center_column_width = int(canvas_width * 0.7)

        top_region_y = 0
        top_region_height = int(canvas_height * 0.3)
        bottom_region_y = int(canvas_height * 0.25)
        bottom_region_height = int(canvas_height * 0.55)
        shoes_region_y = int(canvas_height * 0.78)
        shoes_region_height = int(canvas_height * 0.22)

        accessory_width = int(canvas_width * 0.2)
        accessory_height = int(canvas_height * 0.12)

        tops = []
        bottoms = []
        shoes = []
        accessories_left = []
        accessories_right = []

        for item in items:
            category = item.get("category", "")
            if category in ["tops", "dresses", "outerwear"]:
                tops.append(item)
            elif category == "bottoms":
                bottoms.append(item)
            elif category == "shoes":
                shoes.append(item)
            elif category == "accessories":
                if len(accessories_left) <= len(accessories_right):
                    accessories_left.append(item)
                else:
                    accessories_right.append(item)

        async with httpx.AsyncClient(timeout=30.0) as client:

            async def load_image(url: str) -> Image.Image | None:
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    return Image.open(io.BytesIO(response.content)).convert("RGBA")
                except Exception as e:
                    logger.warning(f"Failed to load image: {e}")
                    return None

            async def paste_item(
                item: dict, x: int, y: int, max_w: int, max_h: int, z_index: int = 1
            ):
                image_path = item.get("image_path")
                if not image_path:
                    return
                try:
                    item_url = supabase.storage.from_("wardrobe").get_public_url(
                        image_path
                    )
                    image_url = item_url if isinstance(item_url, str) else str(item_url)
                    img = await load_image(image_url)
                    if not img:
                        return
                    img.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
                    paste_x = x + (max_w - img.width) // 2
                    paste_y = y + (max_h - img.height) // 2
                    canvas.paste(img, (paste_x, paste_y), img)
                except Exception as e:
                    logger.warning(f"Failed to paste item {item.get('id')}: {e}")

            for idx, item in enumerate(tops):
                await paste_item(
                    item,
                    center_column_x,
                    top_region_y,
                    center_column_width,
                    top_region_height,
                    10 if idx == 0 else 1,
                )

            for item in bottoms:
                await paste_item(
                    item,
                    center_column_x,
                    bottom_region_y,
                    center_column_width,
                    bottom_region_height,
                    5,
                )

            for item in shoes:
                await paste_item(
                    item,
                    center_column_x,
                    shoes_region_y,
                    center_column_width,
                    shoes_region_height,
                    5,
                )

            for idx, item in enumerate(accessories_left):
                y_pos = int(canvas_height * (0.1 + idx * 0.18))
                await paste_item(item, 10, y_pos, accessory_width, accessory_height, 3)

            for idx, item in enumerate(accessories_right):
                y_pos = int(canvas_height * (0.1 + idx * 0.18))
                await paste_item(
                    item,
                    canvas_width - accessory_width - 10,
                    y_pos,
                    accessory_width,
                    accessory_height,
                    3,
                )

        output = io.BytesIO()
        canvas.save(output, format="PNG")
        output.seek(0)

        thumbnail_id = str(uuid.uuid4())
        file_path = f"{request.user_id}/thumbnails/{thumbnail_id}.png"

        logger.info(f"Uploading thumbnail to: {file_path}")
        try:
            supabase.storage.from_("generated").upload(
                path=file_path,
                file=output.getvalue(),
                file_options={"content-type": "image/png", "upsert": "true"},
            )
        except Exception as e:
            logger.warning(f"Upload with options failed, trying fallback: {e}")
            output.seek(0)
            supabase.storage.from_("generated").upload(file_path, output.getvalue())

        thumbnail_url = supabase.storage.from_("generated").get_public_url(file_path)
        thumbnail_url_str = (
            thumbnail_url if isinstance(thumbnail_url, str) else str(thumbnail_url)
        )

        logger.info(f"Thumbnail generated: {file_path}")
        return {
            "status": "success",
            "thumbnail_path": file_path,
            "thumbnail_url": thumbnail_url_str,
        }

    except HTTPException:
        raise
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
