from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
load_dotenv()
from starlette.middleware.sessions import SessionMiddleware
from app.database import Base, engine

from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.predictions import router as predictions_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SCOPTIMA API",
    version="1.0.0",
)


IS_PRODUCTION = os.getenv("APP_ENV", "development") == "production"

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")

SESSION_SECRET = os.getenv("OAUTH_STATE_SECRET")

if IS_PRODUCTION and not SESSION_SECRET:
    raise RuntimeError("OAUTH_STATE_SECRET is required")

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET or "local-development-only",
    same_site="none" if IS_PRODUCTION else "lax",
    https_only=IS_PRODUCTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# ROUTERS
# ==========================================================

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(predictions_router)


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "SCOPTIMA backend is running"
    }


# ==========================================================
# HEALTH
# ==========================================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }