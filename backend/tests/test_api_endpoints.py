import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.session import Base, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.caregiver import CaregiverAssignment
from app.models.game_session import GameSession
from app.models.reminder import Reminder

from sqlalchemy.pool import StaticPool

# Use in-memory SQLite with StaticPool so all threads share the exact same database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed test users
    admin = User(
        email="test_admin@cognitivecare.org",
        hashed_password=get_password_hash("AdminPass!123"),
        full_name="Test Administrator",
        role="admin"
    )
    caregiver = User(
        email="test_caregiver@cognitivecare.org",
        hashed_password=get_password_hash("CaregiverPass!123"),
        full_name="Nurse Priya",
        role="caregiver"
    )
    elderly = User(
        email="test_elderly@cognitivecare.org",
        hashed_password=get_password_hash("ElderlyPass!123"),
        full_name="Dhiren Test",
        role="elderly",
        high_contrast_mode=True
    )
    unauthorized_elderly = User(
        email="unauthorized_elderly@cognitivecare.org",
        hashed_password=get_password_hash("ElderlyPass!123"),
        full_name="Unlinked Patient",
        role="elderly"
    )

    db.add_all([admin, caregiver, elderly, unauthorized_elderly])
    db.commit()
    db.refresh(admin)
    db.refresh(caregiver)
    db.refresh(elderly)
    db.refresh(unauthorized_elderly)

    # Link caregiver to elderly (with consent confirmed)
    assignment = CaregiverAssignment(
        caregiver_id=caregiver.id,
        elderly_user_id=elderly.id,
        relationship_type="Primary Caregiver",
        consent_confirmed=True
    )
    db.add(assignment)

    # Seed a game session
    session = GameSession(
        user_id=elderly.id,
        game_type="picture_matching",
        difficulty="easy",
        score=120,
        accuracy_percentage=90.0,
        total_attempts=10,
        correct_matches=6,
        completion_time_seconds=40.0,
        avg_response_time_seconds=4.0,
        hints_used=0,
        session_completed=True
    )
    db.add(session)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def get_token(client, email, password):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


# ==============================================================================
# Health & Root Tests
# ==============================================================================

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "diagnostic" in data["disclaimer"].lower()


def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "CognitiveCare" in res.json()["project"]


# ==============================================================================
# Authentication & Registration Tests
# ==============================================================================

def test_register_new_user(client):
    payload = {
        "email": "new.senior@cognitivecare.org",
        "password": "SeniorSecure@123",
        "full_name": "Ramen Baruah",
        "role": "elderly",
        "language_preference": "en",
        "high_contrast_mode": True,
        "audio_prompts_enabled": True,
        "untimed_mode_enabled": True,
        "font_size_scale": "large"
    }
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "new.senior@cognitivecare.org"
    assert data["role"] == "elderly"


def test_login_invalid_password(client):
    res = client.post("/api/v1/auth/login", json={"email": "test_elderly@cognitivecare.org", "password": "WrongPassword"})
    assert res.status_code == 401


def test_get_current_user_me(client):
    token = get_token(client, "test_elderly@cognitivecare.org", "ElderlyPass!123")
    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "test_elderly@cognitivecare.org"


# ==============================================================================
# RBAC Tests
# ==============================================================================

def test_elderly_forbidden_from_admin_stats(client):
    elderly_token = get_token(client, "test_elderly@cognitivecare.org", "ElderlyPass!123")
    res = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {elderly_token}"})
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]


def test_admin_access_admin_stats(client):
    admin_token = get_token(client, "test_admin@cognitivecare.org", "AdminPass!123")
    res = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_users"] >= 4
    assert data["database_status"] == "operational"


# ==============================================================================
# Cognitive Games Tests
# ==============================================================================

def test_record_game_session_and_fetch_history(client):
    token = get_token(client, "test_elderly@cognitivecare.org", "ElderlyPass!123")
    payload = {
        "game_type": "sequence_memory",
        "difficulty": "medium",
        "recommended_by_ml": True,
        "is_untimed": True,
        "score": 150,
        "accuracy_percentage": 85.0,
        "total_attempts": 10,
        "correct_matches": 8,
        "completion_time_seconds": 35.0,
        "avg_response_time_seconds": 3.5,
        "hints_used": 1,
        "session_completed": True
    }
    res = client.post("/api/v1/games/sessions", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    assert res.json()["game_type"] == "sequence_memory"

    # Fetch history
    hist = client.get("/api/v1/games/sessions/history", headers={"Authorization": f"Bearer {token}"})
    assert hist.status_code == 200
    assert len(hist.json()) >= 2

    # Fetch summary
    summary = client.get("/api/v1/games/summary", headers={"Authorization": f"Bearer {token}"})
    assert summary.status_code == 200
    assert summary.json()["total_sessions"] >= 2
    assert summary.json()["avg_accuracy"] > 0


# ==============================================================================
# Machine Learning Recommendations Tests
# ==============================================================================

def test_ml_recommendation_endpoint(client):
    token = get_token(client, "test_elderly@cognitivecare.org", "ElderlyPass!123")
    payload = {
        "game_type": "picture_matching",
        "previous_difficulty": "easy",
        "accuracy_percentage": 92.0,
        "avg_response_time_seconds": 2.5,
        "hints_used": 0,
        "recent_performance": 90.0
    }
    res = client.post("/api/v1/ml/recommend-difficulty", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_difficulty"] in ["medium", "hard"]
    assert data["can_override"] is True
    assert "diagnostic" in data["disclaimer"].lower()


def test_ml_model_info_endpoint(client):
    token = get_token(client, "test_elderly@cognitivecare.org", "ElderlyPass!123")
    res = client.get("/api/v1/ml/model-info", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "RandomForestClassifier" in data["algorithm"]
    assert data["accuracy"] > 0.65


# ==============================================================================
# Reminders & Routines Tests
# ==============================================================================

def test_create_and_toggle_reminder(client):
    token = get_token(client, "test_elderly@cognitivecare.org", "ElderlyPass!123")
    payload = {
        "title": "Evening Tea and Hydration",
        "category": "hydration",
        "reminder_time": "17:30",
        "is_recurring": True,
        "spoken_prompt": "Please enjoy your warm evening tea."
    }
    res = client.post("/api/v1/reminders/", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    reminder_id = res.json()["id"]

    # Toggle status
    toggle = client.patch(f"/api/v1/reminders/{reminder_id}/toggle", headers={"Authorization": f"Bearer {token}"})
    assert toggle.status_code == 200
    assert toggle.json()["is_completed"] is True


# ==============================================================================
# Caregiver Portal Tests
# ==============================================================================

def test_caregiver_list_authorized_patients(client):
    caregiver_token = get_token(client, "test_caregiver@cognitivecare.org", "CaregiverPass!123")
    res = client.get("/api/v1/caregiver/patients", headers={"Authorization": f"Bearer {caregiver_token}"})
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 1
    assert any(p["email"] == "test_elderly@cognitivecare.org" for p in patients)


def test_caregiver_forbidden_from_unlinked_patient(client):
    caregiver_token = get_token(client, "test_caregiver@cognitivecare.org", "CaregiverPass!123")
    
    # Query unlinked patient id
    db = TestingSessionLocal()
    unlinked = db.query(User).filter(User.email == "unauthorized_elderly@cognitivecare.org").first()
    unlinked_id = unlinked.id
    db.close()

    # Attempt to view unlinked patient summary
    res = client.get(f"/api/v1/caregiver/patients/{unlinked_id}/summary", headers={"Authorization": f"Bearer {caregiver_token}"})
    assert res.status_code == 403
    assert "Access forbidden" in res.json()["detail"]
