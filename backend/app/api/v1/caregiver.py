from typing import List
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, require_caregiver_or_admin
from app.models.user import User
from app.models.caregiver import CaregiverAssignment
from app.models.game_session import GameSession
from app.models.reminder import Reminder
from app.schemas.caregiver import (
    PatientSummaryRead,
    PatientDetailRead,
    LinkPatientRequest,
    AvailablePatientRead,
)
from app.schemas.reminder import ReminderCreate, ReminderRead

router = APIRouter(prefix="/caregiver", tags=["Caregiver Portal"])



def verify_caregiver_patient_access(caregiver: User, patient_id: int, db: Session) -> User:
    """Verifies that the caregiver is explicitly authorized to view the requested patient's records."""
    if caregiver.role == "admin":
        patient = db.query(User).filter(User.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient account not found.")
        return patient

    link = db.query(CaregiverAssignment).filter(
        CaregiverAssignment.caregiver_id == caregiver.id,
        CaregiverAssignment.elderly_user_id == patient_id,
        CaregiverAssignment.consent_confirmed == True
    ).first()

    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have verified consent or authorization for this patient."
        )

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient account not found.")
    return patient


@router.get("/patients", response_model=List[PatientSummaryRead])
def list_authorized_patients(
    caregiver: User = Depends(require_caregiver_or_admin),
    db: Session = Depends(get_db)
):
    """Lists all elderly patients explicitly linked to this caregiver with confirmed consent."""
    if caregiver.role == "admin":
        assignments = db.query(CaregiverAssignment).all()
        # Also grab any elderly users not yet linked
        all_elderly = db.query(User).filter(User.role == "elderly").all()
    else:
        assignments = db.query(CaregiverAssignment).filter(
            CaregiverAssignment.caregiver_id == caregiver.id,
            CaregiverAssignment.consent_confirmed == True
        ).all()

    patient_summaries = []
    seen_ids = set()

    for a in assignments:
        patient = a.elderly_user
        if not patient or patient.id in seen_ids:
            continue
        seen_ids.add(patient.id)

        # Query metrics
        sessions = db.query(GameSession).filter(GameSession.user_id == patient.id).all()
        total_sessions = len(sessions)
        avg_acc = round(sum(s.accuracy_percentage for s in sessions) / total_sessions, 1) if total_sessions > 0 else 0.0

        last_sess = db.query(GameSession).filter(GameSession.user_id == patient.id).order_by(desc(GameSession.created_at)).first()
        last_date = last_sess.created_at.strftime("%Y-%m-%d %H:%M") if last_sess else None

        fav_game = None
        if total_sessions > 0:
            counts = Counter(s.game_type for s in sessions)
            fav_game = counts.most_common(1)[0][0]

        reminders_count = db.query(Reminder).filter(
            Reminder.user_id == patient.id,
            Reminder.is_active == True
        ).count()

        patient_summaries.append(PatientSummaryRead(
            patient_id=patient.id,
            full_name=patient.full_name,
            email=patient.email,
            relationship_type=a.relationship_type,
            language_preference=patient.language_preference,
            total_sessions_played=total_sessions,
            avg_accuracy=avg_acc,
            last_played_date=last_date,
            preferred_game=fav_game,
            active_reminders_count=reminders_count
        ))

    return patient_summaries


@router.get("/patients/{patient_id}/summary", response_model=PatientDetailRead)
def get_patient_detail_summary(
    patient_id: int,
    caregiver: User = Depends(require_caregiver_or_admin),
    db: Session = Depends(get_db)
):
    """Retrieves detailed non-diagnostic game activity, session metrics, and reminders for an authorized patient."""
    patient = verify_caregiver_patient_access(caregiver, patient_id, db)

    link = db.query(CaregiverAssignment).filter(
        CaregiverAssignment.elderly_user_id == patient.id
    ).first()
    rel = link.relationship_type if link else "Caregiver"

    sessions = db.query(GameSession).filter(
        GameSession.user_id == patient.id
    ).order_by(desc(GameSession.created_at)).all()

    total_games = len(sessions)
    overall_acc = round(sum(s.accuracy_percentage for s in sessions) / total_games, 1) if total_games > 0 else 0.0

    reminders = db.query(Reminder).filter(
        Reminder.user_id == patient.id,
        Reminder.is_active == True
    ).order_by(Reminder.reminder_time).all()

    return PatientDetailRead(
        patient=patient,
        relationship_type=rel,
        recent_sessions=sessions[:15],
        reminders=reminders,
        overall_accuracy=overall_acc,
        total_games=total_games
    )


@router.post("/patients/{patient_id}/reminders", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
def create_patient_reminder(
    patient_id: int,
    reminder_in: ReminderCreate,
    caregiver: User = Depends(require_caregiver_or_admin),
    db: Session = Depends(get_db)
):
    """Allows authorized caregivers to set medications and daily reminders for their elderly patient."""
    patient = verify_caregiver_patient_access(caregiver, patient_id, db)

    reminder = Reminder(
        user_id=patient.id,
        created_by_user_id=caregiver.id,
        title=reminder_in.title,
        description=reminder_in.description,
        category=reminder_in.category,
        reminder_time=reminder_in.reminder_time,
        reminder_date=reminder_in.reminder_date,
        is_recurring=reminder_in.is_recurring,
        is_completed=False,
        is_active=True,
        spoken_prompt=reminder_in.spoken_prompt or f"Friendly reminder for {patient.full_name}: {reminder_in.title}"
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder
