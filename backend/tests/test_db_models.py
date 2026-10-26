import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.caregiver import CaregiverAssignment
from app.models.game_session import GameSession
from app.models.reminder import Reminder
from app.models.routine import RoutineTask
from app.models.memory_card import MemoryCard


@pytest.fixture(scope="module")
def test_db():
    """In-memory SQLite database for isolated unit tests."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()


def test_password_hashing():
    plain = "SecureTestPassword@123"
    hashed = get_password_hash(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_create_user_with_senior_preferences(test_db):
    user = User(
        email="test.elderly@example.com",
        hashed_password=get_password_hash("SeniorPass!123"),
        full_name="Grandpa Test",
        role="elderly",
        high_contrast_mode=True,
        audio_prompts_enabled=True,
        untimed_mode_enabled=True,
        font_size_scale="large"
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    assert user.id is not None
    assert user.role == "elderly"
    assert user.high_contrast_mode is True
    assert user.untimed_mode_enabled is True
    assert user.font_size_scale == "large"


def test_caregiver_assignment(test_db):
    caregiver = User(
        email="caregiver.test@example.com",
        hashed_password=get_password_hash("Caregiver!123"),
        full_name="Nurse Sarah",
        role="caregiver"
    )
    elderly = test_db.query(User).filter(User.email == "test.elderly@example.com").first()
    test_db.add(caregiver)
    test_db.commit()
    test_db.refresh(caregiver)

    assignment = CaregiverAssignment(
        caregiver_id=caregiver.id,
        elderly_user_id=elderly.id,
        relationship_type="Primary Caregiver",
        consent_confirmed=True
    )
    test_db.add(assignment)
    test_db.commit()
    test_db.refresh(assignment)

    assert assignment.id is not None
    assert assignment.caregiver.email == "caregiver.test@example.com"
    assert assignment.elderly_user.email == "test.elderly@example.com"


def test_game_session_metrics(test_db):
    elderly = test_db.query(User).filter(User.email == "test.elderly@example.com").first()
    session = GameSession(
        user_id=elderly.id,
        game_type="picture_matching",
        difficulty="easy",
        recommended_by_ml=False,
        is_untimed=True,
        score=100,
        accuracy_percentage=88.5,
        total_attempts=12,
        correct_matches=6,
        completion_time_seconds=45.2,
        avg_response_time_seconds=3.7,
        hints_used=1,
        session_completed=True
    )
    test_db.add(session)
    test_db.commit()
    test_db.refresh(session)

    assert session.id is not None
    assert session.score == 100
    assert session.accuracy_percentage == 88.5
    assert session.user.id == elderly.id


def test_reminder_and_routine_creation(test_db):
    elderly = test_db.query(User).filter(User.email == "test.elderly@example.com").first()
    
    # Reminder
    reminder = Reminder(
        user_id=elderly.id,
        title="Afternoon Hydration",
        category="hydration",
        reminder_time="14:00",
        is_recurring=True,
        spoken_prompt="Please take a sip of water now."
    )
    test_db.add(reminder)
    
    # Routine task
    routine = RoutineTask(
        user_id=elderly.id,
        title="Morning garden walk",
        period_of_day="morning",
        order_index=1,
        is_checked=False
    )
    test_db.add(routine)
    
    # Memory card
    card = MemoryCard(
        user_id=elderly.id,
        name_or_title="Priya",
        relation="Daughter",
        category="family",
        description="Lives in Jorhat"
    )
    test_db.add(card)
    
    test_db.commit()
    test_db.refresh(reminder)
    test_db.refresh(routine)
    test_db.refresh(card)

    assert reminder.id is not None
    assert routine.id is not None
    assert card.id is not None
    assert reminder.user_id == elderly.id
    assert routine.period_of_day == "morning"
    assert card.relation == "Daughter"
