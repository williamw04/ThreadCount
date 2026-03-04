import google.generativeai as genai
from app.config import get_settings
import logging
import base64
from typing import Dict, List, Any

logger = logging.getLogger(__name__)


class GeminiClient:
    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    async def analyze_clothing_image(self, image_data: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        """Analyze a clothing image and extract colors, seasons, tags, and suggested category."""
        logger.info("Analyzing clothing image with Gemini...")
        
        base64_image = base64.standard_b64encode(image_data).decode('utf-8')
        
        prompt = """Analyze this clothing item image and provide the following information in JSON format:

{
  "suggested_name": "A descriptive name for this item (e.g., 'Blue Denim Jacket', 'White Cotton T-Shirt')",
  "suggested_category": "One of: tops, bottoms, dresses, shoes, accessories, outerwear",
  "colors": ["list of dominant colors visible, max 3"],
  "seasons": ["list of applicable seasons: spring, summer, fall, winter"],
  "tags": ["relevant tags for this item, max 5 tags"],
  "style": ["style descriptors like casual, formal, sporty, bohemian, etc."],
  "material_guess": "guessed material if visible",
  "confidence": "high/medium/low based on image clarity"
}

Rules:
- Be specific with colors (e.g., "navy blue" not just "blue")
- Suggest realistic seasons based on the item type and style
- Tags should be useful for search (e.g., "denim", "casual", "summer", "lightweight")
- Category must be one of the exact options listed
- If uncertain about any field, use your best guess but set confidence to "low"

Return ONLY the JSON object, no other text."""

        try:
            response = await self.model.generate_content_async([
                {
                    "mime_type": mime_type,
                    "data": base64_image
                },
                prompt
            ])
            
            import json
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            result = json.loads(text.strip())
            logger.info(f"Analysis complete: {result.get('suggested_name', 'Unknown item')}")
            return result
            
        except Exception as e:
            logger.error(f"Gemini analysis failed: {str(e)}")
            raise Exception(f"Failed to analyze image: {str(e)}")

    def validate_category(self, category: str) -> str:
        """Validate and normalize category."""
        valid_categories = ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear']
        category_lower = category.lower().strip()
        
        for valid in valid_categories:
            if valid in category_lower or category_lower in valid:
                return valid
        
        return 'tops'

    def validate_seasons(self, seasons: List[str]) -> List[str]:
        """Validate and normalize seasons."""
        valid_seasons = ['spring', 'summer', 'fall', 'winter']
        result = []
        
        for season in seasons:
            season_lower = season.lower().strip()
            for valid in valid_seasons:
                if valid in season_lower or season_lower in valid:
                    if valid not in result:
                        result.append(valid)
        
        return result if result else ['spring', 'summer', 'fall', 'winter']
