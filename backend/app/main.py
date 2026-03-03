from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import avatar, wardrobe, image_processing

app = FastAPI(title="Seamless API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

app.include_router(avatar.router, prefix="/api/avatar", tags=["avatar"])
app.include_router(wardrobe.router, prefix="/api/wardrobe", tags=["wardrobe"])
app.include_router(image_processing.router, prefix="/api/image", tags=["image-processing"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/test-cors")
def test_cors():
    return {"message": "CORS test"}
