from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    language_preference: str
    high_contrast_mode: bool
    audio_prompts_enabled: bool
    untimed_mode_enabled: bool
    font_size_scale: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdatePreferences(BaseModel):
    language_preference: Optional[str] = None
    high_contrast_mode: Optional[bool] = None
    audio_prompts_enabled: Optional[bool] = None
    untimed_mode_enabled: Optional[bool] = None
    font_size_scale: Optional[str] = None
    full_name: Optional[str] = None
