from typing import List, Optional
from collections import Counter
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, require_elderly_or_caregiver
from app.models.user import User
from app.models.game_session import GameSession
from app.schemas.game import GameSessionCreate, GameSessionRead, GameHistorySummary

router = APIRouter(prefix="/games", tags=["Cognitive Games"])


@router.post("/sessions", response_model=GameSessionRead, status_code=status.HTTP_201_CREATED)
def record_game_session(
    session_in: GameSessionCreate,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Records a completed or paused cognitive game session."""
    session = GameSession(
        user_id=current_user.id,
        game_type=session_in.game_type,
        difficulty=session_in.difficulty,
        recommended_by_ml=session_in.recommended_by_ml,
        is_untimed=session_in.is_untimed,
        score=session_in.score,
        accuracy_percentage=session_in.accuracy_percentage,
        total_attempts=session_in.total_attempts,
        correct_matches=session_in.correct_matches,
        completion_time_seconds=session_in.completion_time_seconds,
        avg_response_time_seconds=session_in.avg_response_time_seconds,
        hints_used=session_in.hints_used,
        session_completed=session_in.session_completed,
        notes=session_in.notes
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/history", response_model=List[GameSessionRead])
def get_session_history(
    game_type: Optional[str] = Query(None, description="Filter by picture_matching, sequence_memory, or familiar_object"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Fetches past cognitive gaming sessions for the current user."""
    query = db.query(GameSession).filter(GameSession.user_id == current_user.id)
    if game_type:
        query = query.filter(GameSession.game_type == game_type)
    
    sessions = query.order_by(desc(GameSession.created_at)).limit(limit).all()
    return sessions


@router.get("/summary", response_model=GameHistorySummary)
def get_game_summary(
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Calculates aggregate gameplay statistics and favorite games for the elderly dashboard."""
    sessions = db.query(GameSession).filter(
        GameSession.user_id == current_user.id
    ).order_by(desc(GameSession.created_at)).all()

    total_sessions = len(sessions)
    if total_sessions == 0:
        return GameHistorySummary(
            total_sessions=0,
            avg_accuracy=0.0,
            favorite_game="Picture Matching",
            total_score=0,
            recent_sessions=[]
        )

    avg_accuracy = round(sum(s.accuracy_percentage for s in sessions) / total_sessions, 1)
    total_score = sum(s.score for s in sessions)
    
    game_counts = Counter(s.game_type for s in sessions)
    fav_key = game_counts.most_common(1)[0][0]
    game_labels = {
        "picture_matching": "Picture Matching",
        "sequence_memory": "Sequence Memory",
        "familiar_object": "Familiar Object Recognition"
    }
    favorite_game = game_labels.get(fav_key, fav_key)

    return GameHistorySummary(
        total_sessions=total_sessions,
        avg_accuracy=avg_accuracy,
        favorite_game=favorite_game,
        total_score=total_score,
        recent_sessions=sessions[:10]
    )
