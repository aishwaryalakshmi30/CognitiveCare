from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import (
    auth,
    users,
    games,
    ml,
    reminders,
    memory_cards,
    caregiver,
    admin,
    health
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=(
        "CognitiveCare API: AI-Based Cognitive Gaming and Memory Assistance Platform "
        "for Elderly Dementia Patients in NER.\n\n"
        "**Ethical Disclaimer**: This platform is a supportive cognitive stimulation "
        "and daily memory assistance tool. It does NOT diagnose dementia, assess clinical "
        "disease severity, or recommend medical treatments."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(users.router, prefix=api_v1_prefix)
app.include_router(games.router, prefix=api_v1_prefix)
app.include_router(ml.router, prefix=api_v1_prefix)
app.include_router(reminders.router, prefix=api_v1_prefix)
app.include_router(memory_cards.router, prefix=api_v1_prefix)
app.include_router(caregiver.router, prefix=api_v1_prefix)
app.include_router(admin.router, prefix=api_v1_prefix)
app.include_router(health.router, prefix=api_v1_prefix)

# Direct /health check
app.include_router(health.router)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health",
        "status": "online",
        "disclaimer": (
            "CognitiveCare is designed for supportive cognitive stimulation. "
            "It does not perform clinical diagnosis or medical treatment planning."
        )
    }
