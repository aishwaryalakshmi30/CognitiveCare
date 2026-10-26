from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(50), nullable=False, default="elderly", index=True)  # 'elderly', 'caregiver', 'admin'
    
    # Senior accessibility preferences
    language_preference = Column(String(10), default="en", nullable=False)
    high_contrast_mode = Column(Boolean, default=False, nullable=False)
    audio_prompts_enabled = Column(Boolean, default=True, nullable=False)
    untimed_mode_enabled = Column(Boolean, default=True, nullable=False)
    font_size_scale = Column(String(20), default="standard", nullable=False)  # 'standard', 'large', 'extra_large'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    game_sessions = relationship("GameSession", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", foreign_keys="[Reminder.user_id]", back_populates="user", cascade="all, delete-orphan")
    routine_tasks = relationship("RoutineTask", back_populates="user", cascade="all, delete-orphan")
    memory_cards = relationship("MemoryCard", back_populates="user", cascade="all, delete-orphan")

    caregiver_links = relationship(
        "CaregiverAssignment",
        foreign_keys="[CaregiverAssignment.elderly_user_id]",
        back_populates="elderly_user",
        cascade="all, delete-orphan"
    )
    assigned_patients = relationship(
        "CaregiverAssignment",
        foreign_keys="[CaregiverAssignment.caregiver_id]",
        back_populates="caregiver",
        cascade="all, delete-orphan"
    )
