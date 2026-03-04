from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from app.supabase_client import get_supabase
import logging
import uuid
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class WardrobeItem(BaseModel):
    name: str
    category: str
    labels: Optional[List[str]] = []
    colors: Optional[List[str]] = []
    seasons: Optional[List[str]] = []

class WardrobeItemResponse(BaseModel):
    id: str
    user_id: str
    name: str
    category: str
    image_path: Optional[str] = None
    labels: List[str] = []
    colors: List[str] = []
    seasons: List[str] = []
    is_inspiration: bool = False
    is_template: bool = False
    created_at: str
    updated_at: str

class UpdateWardrobeItem(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    labels: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    seasons: Optional[List[str]] = None

@router.get("/items", response_model=List[WardrobeItemResponse])
async def get_wardrobe_items(
    user_id: str, 
    category: Optional[str] = None, 
    search: Optional[str] = None,
    colors: Optional[str] = None,
    seasons: Optional[str] = None
):
    """Get all wardrobe items for a user, with optional filters."""
    logger.info(f"Fetching wardrobe items for user: {user_id}")
    supabase = get_supabase()
    
    try:
        query = supabase.table("wardrobe_items").select("*").eq("user_id", user_id)
        
        if category:
            query = query.eq("category", category)
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,labels.cs.{{{search}}}")
        
        result = query.order("created_at", desc=True).execute()
        
        items = []
        for item in result.data:
            if colors:
                color_list = colors.split(',')
                item_colors = item.get('colors', [])
                if not any(c in item_colors for c in color_list):
                    continue
            
            if seasons:
                season_list = seasons.split(',')
                item_seasons = item.get('seasons', [])
                if not any(s in item_seasons for s in season_list):
                    continue
            
            items.append(WardrobeItemResponse(
                id=item["id"],
                user_id=item["user_id"],
                name=item["name"],
                category=item["category"],
                image_path=item.get("image_path"),
                labels=item.get("labels", []),
                colors=item.get("colors", []),
                seasons=item.get("seasons", []),
                is_inspiration=item.get("is_inspiration", False),
                is_template=item.get("is_template", False),
                created_at=item["created_at"],
                updated_at=item["updated_at"]
            ))
        
        return items
    
    except Exception as e:
        logger.error(f"Error fetching wardrobe items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/items/{item_id}", response_model=WardrobeItemResponse)
async def get_wardrobe_item(item_id: str, user_id: str):
    """Get a single wardrobe item by ID."""
    logger.info(f"Fetching wardrobe item: {item_id}")
    supabase = get_supabase()
    
    try:
        result = supabase.table("wardrobe_items").select("*").eq("id", item_id).eq("user_id", user_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = result.data
        return WardrobeItemResponse(
            id=item["id"],
            user_id=item["user_id"],
            name=item["name"],
            category=item["category"],
            image_path=item.get("image_path"),
            labels=item.get("labels", []),
            is_inspiration=item.get("is_inspiration", False),
            is_template=item.get("is_template", False),
            created_at=item["created_at"],
            updated_at=item["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching wardrobe item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/items", response_model=WardrobeItemResponse)
async def create_wardrobe_item(
    user_id: str = Form(...),
    name: str = Form(...),
    category: str = Form(...),
    labels: Optional[str] = Form(None),
    colors: Optional[str] = Form(None),
    seasons: Optional[str] = Form(None),
    image_path: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Create a new wardrobe item with image upload or existing image path."""
    logger.info(f"Creating wardrobe item for user: {user_id}")
    supabase = get_supabase()
    
    try:
        item_id = str(uuid.uuid4())
        file_path = image_path
        
        if not file_path and image:
            file_ext = image.filename.split('.')[-1].lower() if image.filename else 'jpg'
            file_path = f"{user_id}/{item_id}.{file_ext}"
            
            file_content = await image.read()
            
            logger.info(f"Uploading image to Supabase Storage: {file_path}")
            supabase.storage.from_("wardrobe").upload(file_path, file_content)
        
        if not file_path:
            raise HTTPException(status_code=400, detail="Either image_path or image file is required")
        
        labels_list = []
        if labels:
            labels_list = [label.strip() for label in labels.split(',') if label.strip()]
        
        colors_list = []
        if colors:
            colors_list = [c.strip() for c in colors.split(',') if c.strip()]
        
        seasons_list = []
        if seasons:
            seasons_list = [s.strip() for s in seasons.split(',') if s.strip()]
        
        result = supabase.table("wardrobe_items").insert({
            "id": item_id,
            "user_id": user_id,
            "name": name,
            "category": category,
            "image_path": file_path,
            "labels": labels_list,
            "colors": colors_list,
            "seasons": seasons_list,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create item")
        
        item = result.data[0]
        return WardrobeItemResponse(
            id=item["id"],
            user_id=item["user_id"],
            name=item["name"],
            category=item["category"],
            image_path=item.get("image_path"),
            labels=item.get("labels", []),
            is_inspiration=item.get("is_inspiration", False),
            is_template=item.get("is_template", False),
            created_at=item["created_at"],
            updated_at=item["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating wardrobe item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/items/{item_id}", response_model=WardrobeItemResponse)
async def update_wardrobe_item(item_id: str, user_id: str, updates: UpdateWardrobeItem):
    """Update wardrobe item details."""
    logger.info(f"Updating wardrobe item: {item_id}")
    supabase = get_supabase()
    
    try:
        update_data = {"updated_at": datetime.utcnow().isoformat()}
        
        if updates.name is not None:
            update_data["name"] = updates.name
        if updates.category is not None:
            update_data["category"] = updates.category
        if updates.labels is not None:
            update_data["labels"] = updates.labels
        
        result = supabase.table("wardrobe_items").update(update_data).eq("id", item_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item = result.data[0]
        return WardrobeItemResponse(
            id=item["id"],
            user_id=item["user_id"],
            name=item["name"],
            category=item["category"],
            image_path=item.get("image_path"),
            labels=item.get("labels", []),
            is_inspiration=item.get("is_inspiration", False),
            is_template=item.get("is_template", False),
            created_at=item["created_at"],
            updated_at=item["updated_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating wardrobe item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/{item_id}")
async def delete_wardrobe_item(item_id: str, user_id: str):
    """Delete a wardrobe item."""
    logger.info(f"Deleting wardrobe item: {item_id}")
    supabase = get_supabase()
    
    try:
        result = supabase.table("wardrobe_items").select("image_path").eq("id", item_id).eq("user_id", user_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Item not found")
        
        image_path = result.data.get("image_path")
        
        supabase.table("wardrobe_items").delete().eq("id", item_id).eq("user_id", user_id).execute()
        
        if image_path:
            try:
                supabase.storage.from_("wardrobe").remove([image_path])
                logger.info(f"Deleted image from storage: {image_path}")
            except Exception as e:
                logger.warning(f"Failed to delete image from storage: {str(e)}")
        
        return {"status": "success", "message": "Item deleted"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting wardrobe item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
