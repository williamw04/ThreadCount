from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import avatar

app = FastAPI(title="Seamless API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(avatar.router, prefix="/api/avatar", tags=["avatar"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/test-cors")
def test_cors():
    return {"message": "CORS test"}
