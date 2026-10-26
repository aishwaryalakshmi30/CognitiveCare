from typing import List, Optional
from pydantic import BaseModel, Field


class DifficultyPredictionRequest(BaseModel):
    game_type: str = Field(
        default="picture_matching",
        description="Type of cognitive game: 'picture_matching', 'sequence_memory', or 'familiar_object'"
    )
    previous_difficulty: str = Field(
        default="easy",
        description="Difficulty of the most recent session: 'easy', 'medium', or 'hard'"
    )
    accuracy_percentage: float = Field(
        default=75.0,
        ge=0.0,
        le=100.0,
        description="User accuracy percentage in the session (0.0 to 100.0)"
    )
    avg_response_time_seconds: float = Field(
        default=4.0,
        ge=0.0,
        le=120.0,
        description="Average response time in seconds per match or interaction"
    )
    hints_used: int = Field(
        default=0,
        ge=0,
        le=20,
        description="Number of hints requested during the session"
    )
    recent_performance: float = Field(
        default=75.0,
        ge=0.0,
        le=100.0,
        description="Exponential weighted performance average across past 3 sessions"
    )


class DifficultyPredictionResponse(BaseModel):
    recommended_difficulty: str
    confidence: float
    explanation: str
    method_used: str  # "ml_pipeline" or "rule_fallback"
    can_override: bool = True
    disclaimer: str = (
        "Supportive difficulty adjustment only. "
        "Not a medical diagnostic assessment or clinical prognosis."
    )


class ModelInfoResponse(BaseModel):
    model_name: str
    algorithm: str
    accuracy: float
    macro_f1: float
    baseline_accuracy: float
    baseline_macro_f1: float
    feature_names: List[str]
    target_classes: List[str]
    is_loaded: bool
    disclaimer: str
