from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2, max_length=150)
    role: str = Field(default="elderly", pattern="^(elderly|caregiver|admin)$")
    language_preference: str = Field(default="en", max_length=10)
    high_contrast_mode: bool = False
    audio_prompts_enabled: bool = True
    untimed_mode_enabled: bool = True
    font_size_scale: str = Field(default="standard", pattern="^(standard|large|extra_large)$")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str
