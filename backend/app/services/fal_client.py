import fal_client
import os
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)


class FalClient:
    def __init__(self):
        settings = get_settings()
        os.environ["FAL_KEY"] = settings.fal_api_key

    def generate_image(self, image_url: str, prompt: str) -> dict:
        result = fal_client.subscribe("fal-ai/nano-banana-2/edit", {
            "prompt": prompt,
            "image_urls": [image_url]
        })

        if not result or "images" not in result:
            raise Exception("No image generated")

        return result["images"][0]
    
    def remove_background(self, image_url: str) -> str:
        """Remove background from image using BiRefNet v2 and return URL of processed image."""
        logger.info(f"Removing background from image: {image_url}")
        
        try:
            result = fal_client.subscribe(
                "fal-ai/birefnet/v2",
                arguments={
                    "image_url": image_url
                },
            )
            
            if not result or "image" not in result:
                raise Exception("Background removal failed - no image in response")
            
            processed_url = result["image"]["url"]
            logger.info(f"Background removed successfully: {processed_url}")
            return processed_url
            
        except Exception as e:
            logger.error(f"Background removal error: {str(e)}")
            raise Exception(f"Failed to remove background: {str(e)}")
