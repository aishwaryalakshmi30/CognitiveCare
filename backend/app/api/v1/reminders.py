from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, require_elderly_or_caregiver
from app.models.user import User
from app.models.reminder import Reminder
from app.models.routine import RoutineTask
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate
from app.schemas.routine import RoutineTaskCreate, RoutineTaskRead

router = APIRouter(prefix="/reminders", tags=["Reminders & Routines"])


# ==============================================================================
# Scheduled Reminders
# ==============================================================================

@router.get("/", response_model=List[ReminderRead])
def get_reminders(
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Retrieves all active reminders for the current user."""
    return db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.is_active == True
    ).order_by(Reminder.reminder_time).all()


@router.post("/", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: ReminderCreate,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Creates a custom reminder with optional text-to-speech audio prompt."""
    reminder = Reminder(
        user_id=current_user.id,
        created_by_user_id=current_user.id,
        title=reminder_in.title,
        description=reminder_in.description,
        category=reminder_in.category,
        reminder_time=reminder_in.reminder_time,
        reminder_date=reminder_in.reminder_date,
        is_recurring=reminder_in.is_recurring,
        is_completed=False,
        is_active=True,
        spoken_prompt=reminder_in.spoken_prompt or f"Reminder: {reminder_in.title}"
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/{reminder_id}/toggle", response_model=ReminderRead)
def toggle_reminder_status(
    reminder_id: int,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Marks a reminder as completed or repeats/unchecks it."""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    reminder.is_completed = not reminder.is_completed
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: int,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Deletes or deactivates a reminder."""
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    db.delete(reminder)
    db.commit()
    return None


# ==============================================================================
# Daily Routines
# ==============================================================================

@router.get("/routines", response_model=List[RoutineTaskRead])
def get_daily_routines(
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Fetches ordered daily routine checklist for the current user."""
    today_str = date.today().isoformat()
    routines = db.query(RoutineTask).filter(
        RoutineTask.user_id == current_user.id
    ).order_by(RoutineTask.period_of_day, RoutineTask.order_index).all()

    # Automatically reset checkboxes for a new day
    changed = False
    for r in routines:
        if r.last_checked_date and r.last_checked_date != today_str and r.is_checked:
            r.is_checked = False
            changed = True
    if changed:
        db.commit()

    return routines


@router.post("/routines", response_model=RoutineTaskRead, status_code=status.HTTP_201_CREATED)
def create_routine_task(
    routine_in: RoutineTaskCreate,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Adds a new routine task to the user's checklist."""
    task = RoutineTask(
        user_id=current_user.id,
        title=routine_in.title,
        period_of_day=routine_in.period_of_day,
        order_index=routine_in.order_index,
        icon_name=routine_in.icon_name,
        is_checked=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/routines/{routine_id}/toggle", response_model=RoutineTaskRead)
def toggle_routine_task(
    routine_id: int,
    current_user: User = Depends(require_elderly_or_caregiver),
    db: Session = Depends(get_db)
):
    """Checks off or unchecks a daily routine item."""
    task = db.query(RoutineTask).filter(
        RoutineTask.id == routine_id,
        RoutineTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Routine task not found.")

    task.is_checked = not task.is_checked
    if task.is_checked:
        task.last_checked_date = date.today().isoformat()
    db.commit()
    db.refresh(task)
    return task
