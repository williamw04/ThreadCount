import fal_client
import os
from app.config import get_settings


class FalClient:
    def __init__(self):
        settings = get_settings()
        os.environ["FAL_KEY"] = settings.fal_api_key

    def generate_image(self, image_url: str, prompt: str) -> dict:
        result = fal_client.subscribe("fal-ai/nano-banana-2/edit", {
            "prompt": prompt,
            "image_urls": [image_url]
        })

        # fal_client returns the result directly if it's successful
        if not result or "images" not in result:
            raise Exception("No image generated")

        return result["images"][0]
