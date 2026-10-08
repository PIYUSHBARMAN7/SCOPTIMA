from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

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


app.add_middleware(
    SessionMiddleware,

    secret_key=os.getenv(
        "OAUTH_STATE_SECRET",
        "development-oauth-secret-change-me",
    ),

    same_site="lax",

    https_only=False,
)

# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
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