from typing import List
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin_only
from app.models.user import User
from app.models.game_session import GameSession
from app.models.reminder import Reminder
from app.ml.predictor import predictor
from app.schemas.admin import SystemStatsRead
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["Administrator Management"])


@router.get("/stats", response_model=SystemStatsRead)
def get_system_statistics(
    admin: User = Depends(require_admin_only),
    db: Session = Depends(get_db)
):
    """Provides high-level system usage statistics, role counts, and ML status for administrators."""
    users = db.query(User).all()
    total_users = len(users)
    users_by_role = dict(Counter(u.role for u in users))

    sessions = db.query(GameSession).all()
    total_sessions = len(sessions)
    sessions_by_game = dict(Counter(s.game_type for s in sessions))

    total_reminders = db.query(Reminder).count()

    model_info = predictor.get_model_info()

    return SystemStatsRead(
        total_users=total_users,
        users_by_role=users_by_role,
        total_game_sessions=total_sessions,
        sessions_by_game=sessions_by_game,
        total_reminders=total_reminders,
        ml_model_status={
            "is_loaded": model_info.is_loaded,
            "algorithm": model_info.algorithm,
            "accuracy": model_info.accuracy,
            "macro_f1": model_info.macro_f1,
            "baseline_accuracy": model_info.baseline_accuracy
        },
        database_status="operational"
    )


@router.get("/users", response_model=List[UserRead])
def list_system_users(
    admin: User = Depends(require_admin_only),
    db: Session = Depends(get_db)
):
    """Lists authorized system accounts without exposing credentials."""
    return db.query(User).order_by(User.created_at).all()
