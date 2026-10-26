from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MemoryCardCreate(BaseModel):
    category: str = Field(
        default="family",
        pattern="^(family|friend|place|pet|memory)$"
    )
    name_or_title: str = Field(min_length=2, max_length=150)
    relation: str = Field(min_length=2, max_length=100)
    description: Optional[str] = None
    photo_url: Optional[str] = None
    audio_prompt: Optional[str] = None


class MemoryCardRead(BaseModel):
    id: int
    user_id: int
    category: str
    name_or_title: str
    relation: str
    description: Optional[str]
    photo_url: Optional[str]
    audio_prompt: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
