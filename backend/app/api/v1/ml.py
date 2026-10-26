from fastapi import APIRouter, Depends
from app.api.deps import require_elderly_or_caregiver, require_any_user
from app.models.user import User
from app.ml.predictor import predictor
from app.schemas.ml import (
    DifficultyPredictionRequest,
    DifficultyPredictionResponse,
    ModelInfoResponse
)

router = APIRouter(prefix="/ml", tags=["Machine Learning Adaptation"])


@router.post("/recommend-difficulty", response_model=DifficultyPredictionResponse)
def get_recommended_difficulty(
    req: DifficultyPredictionRequest,
    current_user: User = Depends(require_elderly_or_caregiver)
):
    """
    Predicts the next game difficulty tailored to user metrics using the
    Scikit-learn Random Forest Pipeline (or transparent rule-based fallback).
    """
    return predictor.predict(req)


@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_information(current_user: User = Depends(require_any_user)):
    """
    Returns transparency details about the difficulty recommendation model,
    training metrics, baseline comparison, and non-clinical ethical notices.
    """
    return predictor.get_model_info()
