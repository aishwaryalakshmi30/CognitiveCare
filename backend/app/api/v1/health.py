from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_db
from app.ml.predictor import predictor

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint validating API, database connectivity, and ML model status."""
    db_healthy = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_healthy = False

    model_info = predictor.get_model_info()

    return {
        "status": "healthy" if db_healthy else "degraded",
        "service": "CognitiveCare Backend API",
        "version": "1.0.0",
        "database_connected": db_healthy,
        "ml_model_loaded": model_info.is_loaded,
        "disclaimer": (
            "CognitiveCare is a supportive cognitive activity and daily memory assistance tool. "
            "It is not a clinical diagnostic system."
        )
    }
