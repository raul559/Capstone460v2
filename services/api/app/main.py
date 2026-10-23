from fastapi import FastAPI

from app.api.routes import health

app = FastAPI(title="SkinAI API")

app.include_router(health.router, prefix="/api/v2")