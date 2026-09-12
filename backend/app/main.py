import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    ai,
    avatar,
    generated_images,
    image_processing,
    outfits,
    try_on,
    wardrobe,
)

app = FastAPI(title="Seamless API")

# Allow frontend origins from environment or default to local dev servers
# Supports multiple origins separated by commas for different environments
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

# CORS middleware required for frontend-backend communication during development
# and production when served from different domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Catch-all handler prevents unhandled exceptions from exposing stack traces
    # Access-Control-Allow-Origin header needed for CORS on error responses
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"},
    )


# Route organization mirrors frontend feature domains:
# - avatar: User photo upload and AI model generation
# - wardrobe: Clothing item management and storage
# - image_processing: Background removal and image optimization
# - ai: Gemini-powered clothing analysis and metadata extraction
# - outfits: Outfit composition and thumbnail generation
# - try_on: Virtual try-on with AI image generation
# - generated_images: Management of AI-generated images
app.include_router(avatar.router, prefix="/api/avatar", tags=["avatar"])
app.include_router(wardrobe.router, prefix="/api/wardrobe", tags=["wardrobe"])
app.include_router(
    image_processing.router, prefix="/api/image", tags=["image-processing"]
)
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(outfits.router, prefix="/api/outfits", tags=["outfits"])
app.include_router(try_on.router, prefix="/api/try-on", tags=["try-on"])
app.include_router(
    generated_images.router, prefix="/api/generated-images", tags=["generated-images"]
)


@app.get("/health")
def health():
    # Health check endpoint for load balancers and monitoring
    return {"status": "ok"}


@app.get("/test-cors")
def test_cors():
    # Development endpoint to verify CORS configuration
    return {"message": "CORS test"}
