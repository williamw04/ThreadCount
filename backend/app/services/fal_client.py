import logging
import os

import fal_client

from app.config import get_settings

logger = logging.getLogger(__name__)


class FalClient:
    def __init__(self):
        settings = get_settings()
        # fal.ai client reads API key from environment variable
        # Set during initialization to ensure availability for all operations
        os.environ["FAL_KEY"] = settings.fal_api_key

    def generate_image(self, image_urls: list[str], prompt: str) -> dict:
        # Uses fal-ai/nano-banana-2/edit model for image editing
        # Supports multiple input images (model canvas + clothing items for try-on)
        # Returns first generated image from the result set
        result = fal_client.subscribe(
            "fal-ai/nano-banana-2/edit", {"prompt": prompt, "image_urls": image_urls}
        )

        if not result or "images" not in result:
            raise Exception("No image generated")

        return result["images"][0]

    def remove_background(self, image_url: str) -> str:
        """Remove background from image using BiRefNet v2 and return URL of processed image."""
        # BiRefNet v2 provides high-quality background removal for clothing items
        # Used during wardrobe item upload to create clean product images
        logger.info(f"Removing background from image: {image_url}")

        try:
            result = fal_client.subscribe(
                "fal-ai/birefnet/v2",
                arguments={"image_url": image_url},
            )

            if not result or "image" not in result:
                raise Exception("Background removal failed - no image in response")

            processed_url = result["image"]["url"]
            logger.info(f"Background removed successfully: {processed_url}")
            return processed_url

        except Exception as e:
            logger.error(f"Background removal error: {str(e)}")
            raise Exception(f"Failed to remove background: {str(e)}")
