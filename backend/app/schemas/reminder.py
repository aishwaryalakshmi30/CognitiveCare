from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ReminderCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: Optional[str] = None
    category: str = Field(
        default="general",
        pattern="^(medication|hydration|meal|activity|social|general)$"
    )
    reminder_time: str = Field(
        pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
        description="Time format HH:MM (24-hour)"
    )
    reminder_date: Optional[str] = None
    is_recurring: bool = True
    spoken_prompt: Optional[str] = None


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    reminder_time: Optional[str] = None
    reminder_date: Optional[str] = None
    is_recurring: Optional[bool] = None
    is_completed: Optional[bool] = None
    is_active: Optional[bool] = None
    spoken_prompt: Optional[str] = None


class ReminderRead(BaseModel):
    id: int
    user_id: int
    created_by_user_id: Optional[int]
    title: str
    description: Optional[str]
    category: str
    reminder_time: str
    reminder_date: Optional[str]
    is_recurring: bool
    is_completed: bool
    is_active: bool
    spoken_prompt: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
