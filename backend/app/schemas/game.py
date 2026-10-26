from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class GameSessionCreate(BaseModel):
    game_type: str = Field(
        pattern="^(picture_matching|sequence_memory|familiar_object)$",
        description="Type of cognitive game played"
    )
    difficulty: str = Field(
        pattern="^(easy|medium|hard)$",
        default="easy"
    )
    recommended_by_ml: bool = False
    is_untimed: bool = True
    score: int = Field(default=0, ge=0)
    accuracy_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    total_attempts: int = Field(default=0, ge=0)
    correct_matches: int = Field(default=0, ge=0)
    completion_time_seconds: float = Field(default=0.0, ge=0.0)
    avg_response_time_seconds: float = Field(default=0.0, ge=0.0)
    hints_used: int = Field(default=0, ge=0)
    session_completed: bool = True
    notes: Optional[str] = None


class GameSessionRead(BaseModel):
    id: int
    user_id: int
    game_type: str
    difficulty: str
    recommended_by_ml: bool
    is_untimed: bool
    score: int
    accuracy_percentage: float
    total_attempts: int
    correct_matches: int
    completion_time_seconds: float
    avg_response_time_seconds: float
    hints_used: int
    session_completed: bool
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GameHistorySummary(BaseModel):
    total_sessions: int
    avg_accuracy: float
    favorite_game: str
    total_score: int
    recent_sessions: List[GameSessionRead]
