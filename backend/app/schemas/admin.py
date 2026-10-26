from typing import Dict, Any, List
from pydantic import BaseModel
from app.schemas.user import UserRead


class SystemStatsRead(BaseModel):
    total_users: int
    users_by_role: Dict[str, int]
    total_game_sessions: int
    sessions_by_game: Dict[str, int]
    total_reminders: int
    ml_model_status: Dict[str, Any]
    database_status: str
