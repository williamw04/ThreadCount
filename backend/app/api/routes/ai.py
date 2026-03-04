from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services.gemini_client import GeminiClient
import logging
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter()


class AnalyzeImageResponse(BaseModel):
    suggested_name: str
    suggested_category: str
    colors: List[str]
    seasons: List[str]
    tags: List[str]
    style: List[str]
    material_guess: str
    confidence: str


@router.post("/analyze", response_model=AnalyzeImageResponse)
async def analyze_image(file: UploadFile = File(...)):
    """Analyze a clothing image and extract metadata using Gemini AI."""
    logger.info(f"Analyzing image: {file.filename}")
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image_data = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        gemini = GeminiClient()
        result = await gemini.analyze_clothing_image(image_data, mime_type)
        
        validated_category = gemini.validate_category(result.get('suggested_category', 'tops'))
        validated_seasons = gemini.validate_seasons(result.get('seasons', ['spring', 'summer', 'fall', 'winter']))
        
        return AnalyzeImageResponse(
            suggested_name=result.get('suggested_name', 'Clothing Item'),
            suggested_category=validated_category,
            colors=result.get('colors', [])[:3],
            seasons=validated_seasons,
            tags=result.get('tags', [])[:5],
            style=result.get('style', []),
            material_guess=result.get('material_guess', ''),
            confidence=result.get('confidence', 'medium')
        )
        
    except Exception as e:
        logger.error(f"Image analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")
