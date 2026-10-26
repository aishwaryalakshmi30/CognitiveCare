from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class MemoryCard(Base):
    __tablename__ = "memory_cards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(50), default="family", nullable=False)  # 'family', 'friend', 'place', 'pet', 'memory'
    name_or_title = Column(String(150), nullable=False)
    relation = Column(String(100), nullable=False)  # e.g., 'Daughter', 'Childhood Home in Shillong'
    description = Column(String(500), nullable=True)
    photo_url = Column(String(500), nullable=True)
    audio_prompt = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="memory_cards")
