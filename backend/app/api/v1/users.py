from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserRead, UserUpdatePreferences

router = APIRouter(prefix="/users", tags=["Users & Preferences"])


@router.get("/profile", response_model=UserRead)
def get_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile and settings."""
    return current_user


@router.patch("/preferences", response_model=UserRead)
def update_preferences(
    prefs: UserUpdatePreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates senior accessibility preferences (high contrast, audio prompts, untimed play, font size)."""
    if prefs.high_contrast_mode is not None:
        current_user.high_contrast_mode = prefs.high_contrast_mode
    if prefs.audio_prompts_enabled is not None:
        current_user.audio_prompts_enabled = prefs.audio_prompts_enabled
    if prefs.untimed_mode_enabled is not None:
        current_user.untimed_mode_enabled = prefs.untimed_mode_enabled
    if prefs.font_size_scale is not None:
        current_user.font_size_scale = prefs.font_size_scale
    if prefs.language_preference is not None:
        current_user.language_preference = prefs.language_preference
    if prefs.full_name is not None and prefs.full_name.strip():
        current_user.full_name = prefs.full_name.strip()

    db.commit()
    db.refresh(current_user)
    return current_user
