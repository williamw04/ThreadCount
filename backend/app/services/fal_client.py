import fal
from app.config import get_settings


class FalClient:
    def __init__(self):
        settings = get_settings()
        fal.config(credentials=settings.fal_api_key)

    def generate_image(self, image_url: str, prompt: str) -> dict:
        result = fal.subscribe("fal-ai/nano-banana-2/edit", {
            "input": {
                "prompt": prompt,
                "image_urls": [image_url]
            }
        })

        images = result.data.images if hasattr(result, 'data') else result.images
        if not images or len(images) == 0:
            raise Exception("No image generated")

        return images[0]
