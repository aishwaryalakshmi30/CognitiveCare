from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class CaregiverAssignment(Base):
    __tablename__ = "caregiver_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    caregiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    elderly_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(100), default="Caregiver", nullable=False)
    consent_confirmed = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("caregiver_id", "elderly_user_id", name="uq_caregiver_elderly"),
    )

    caregiver = relationship("User", foreign_keys=[caregiver_id], back_populates="assigned_patients")
    elderly_user = relationship("User", foreign_keys=[elderly_user_id], back_populates="caregiver_links")
