from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Game parameters
    game_type = Column(String(50), nullable=False, index=True)  # 'picture_matching', 'sequence_memory', 'familiar_object'
    difficulty = Column(String(20), nullable=False, default="easy")  # 'easy', 'medium', 'hard'
    recommended_by_ml = Column(Boolean, default=False, nullable=False)
    is_untimed = Column(Boolean, default=False, nullable=False)
    
    # Gameplay performance metrics
    score = Column(Integer, default=0, nullable=False)
    accuracy_percentage = Column(Float, default=0.0, nullable=False)
    total_attempts = Column(Integer, default=0, nullable=False)
    correct_matches = Column(Integer, default=0, nullable=False)
    completion_time_seconds = Column(Float, default=0.0, nullable=False)
    avg_response_time_seconds = Column(Float, default=0.0, nullable=False)
    hints_used = Column(Integer, default=0, nullable=False)
    session_completed = Column(Boolean, default=True, nullable=False)
    notes = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    user = relationship("User", back_populates="game_sessions")
