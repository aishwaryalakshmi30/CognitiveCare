from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class RoutineTask(Base):
    __tablename__ = "routine_tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(200), nullable=False)
    period_of_day = Column(String(50), default="morning", nullable=False)  # 'morning', 'afternoon', 'evening', 'night'
    order_index = Column(Integer, default=0, nullable=False)
    is_checked = Column(Boolean, default=False, nullable=False)
    last_checked_date = Column(String(20), nullable=True)  # 'YYYY-MM-DD'
    icon_name = Column(String(50), default="sun", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="routine_tasks")
