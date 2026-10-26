from typing import List, Optional
from pydantic import BaseModel
from app.schemas.user import UserRead
from app.schemas.game import GameSessionRead
from app.schemas.reminder import ReminderRead


class PatientSummaryRead(BaseModel):
    patient_id: int
    full_name: str
    email: str
    relationship_type: str
    language_preference: str
    total_sessions_played: int
    avg_accuracy: float
    last_played_date: Optional[str] = None
    preferred_game: Optional[str] = None
    active_reminders_count: int


class PatientDetailRead(BaseModel):
    patient: UserRead
    relationship_type: str
    recent_sessions: List[GameSessionRead]
    reminders: List[ReminderRead]
    overall_accuracy: float
    total_games: int
    disclaimer: str = (
        "Progress indicators reflect engagement with cognitive stimulation games only. "
        "They are not medical diagnostic evaluations or clinical staging metrics."
    )


class LinkPatientRequest(BaseModel):
    patient_id: Optional[int] = None
    patient_email: Optional[str] = None
    relationship_type: str = "Attending Physician / Doctor"
    consent_confirmed: bool = True


class AvailablePatientRead(BaseModel):
    id: int
    full_name: str
    email: str
    language_preference: str
    is_already_linked: bool

