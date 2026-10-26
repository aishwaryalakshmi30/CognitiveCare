import sys
import os
import argparse
import pymysql

# Add parent directory to sys.path so we can import app modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if "--sqlite" in sys.argv:
    os.environ["USE_SQLITE_FALLBACK"] = "True"

from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import engine, SessionLocal, Base
from app.models import (
    User,
    CaregiverAssignment,
    GameSession,
    Reminder,
    RoutineTask,
    MemoryCard
)


def create_mysql_database_if_not_exists():
    """Connects to MySQL server directly to ensure the target database exists."""
    if settings.USE_SQLITE_FALLBACK or "sqlite" in settings.SQLALCHEMY_DATABASE_URI:
        print("[DB INIT] Using SQLite fallback. Skipping MySQL database creation.")
        return

    print(f"[DB INIT] Connecting to MySQL server at {settings.DB_HOST}:{settings.DB_PORT} as '{settings.DB_USER}'...")
    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            charset="utf8mb4"
        )
        with conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            print(f"[DB INIT] Database `{settings.DB_NAME}` verified/created successfully.")
        conn.close()
    except pymysql.MySQLError as e:
        print(f"[DB INIT ERROR] Could not connect to MySQL server: {e}")
        print("[DB INIT HINT] Please verify DB_USER and DB_PASSWORD in backend/.env or your MySQL server status.")
        raise e


def init_database(seed_demo: bool = True, use_sqlite: bool = False):
    """Initializes tables and seeds initial demo data."""
    if use_sqlite:
        os.environ["USE_SQLITE_FALLBACK"] = "True"
        settings.USE_SQLITE_FALLBACK = True
        print("[DB INIT] Explicit --sqlite flag detected. Initializing SQLite database...")

    try:
        create_mysql_database_if_not_exists()
    except Exception as e:
        if not settings.USE_SQLITE_FALLBACK and not use_sqlite:
            print(f"\n[DB INIT NOTICE] MySQL connection failed. Error: {e}")
            print("[DB INIT TIP] To test immediately with SQLite fallback, run: python scripts/init_db.py --sqlite")
            print("[DB INIT TIP] Or set DB_PASSWORD=your_password in backend/.env to connect to MySQL.\n")
            raise e

    print("[DB INIT] Creating all database tables via SQLAlchemy metadata...")
    Base.metadata.create_all(bind=engine)
    print("[DB INIT] All tables created successfully.")

    if not seed_demo:
        return

    db = SessionLocal()
    try:
        print("[DB INIT] Seeding default demo users...")
        
        # 1. Admin
        admin = db.query(User).filter(User.email == "admin@cognitivecare.org").first()
        if not admin:
            admin = User(
                email="admin@cognitivecare.org",
                hashed_password=get_password_hash("Admin@1234"),
                full_name="System Administrator",
                role="admin",
                language_preference="en",
                high_contrast_mode=False
            )
            db.add(admin)

        # 2. Caregiver
        caregiver = db.query(User).filter(User.email == "caregiver.priya@cognitivecare.org").first()
        if not caregiver:
            caregiver = User(
                email="caregiver.priya@cognitivecare.org",
                hashed_password=get_password_hash("Caregiver@1234"),
                full_name="Dr. Priya Sharma",
                role="caregiver",
                language_preference="en"
            )
            db.add(caregiver)

        # 3. Elderly User 1
        elderly_1 = db.query(User).filter(User.email == "dhiren.borah@cognitivecare.org").first()
        if not elderly_1:
            elderly_1 = User(
                email="dhiren.borah@cognitivecare.org",
                hashed_password=get_password_hash("Elderly@1234"),
                full_name="Dhiren Borah",
                role="elderly",
                language_preference="en",
                audio_prompts_enabled=True,
                untimed_mode_enabled=True,
                font_size_scale="large"
            )
            db.add(elderly_1)

        # 4. Elderly User 2
        elderly_2 = db.query(User).filter(User.email == "maya.devi@cognitivecare.org").first()
        if not elderly_2:
            elderly_2 = User(
                email="maya.devi@cognitivecare.org",
                hashed_password=get_password_hash("Elderly@1234"),
                full_name="Maya Devi",
                role="elderly",
                language_preference="en",
                audio_prompts_enabled=True,
                untimed_mode_enabled=True,
                font_size_scale="standard"
            )
            db.add(elderly_2)

        db.commit()
        db.refresh(admin)
        db.refresh(caregiver)
        db.refresh(elderly_1)
        db.refresh(elderly_2)

        # Caregiver Assignments
        for patient, relation in [(elderly_1, "Primary Caregiver"), (elderly_2, "Family Caregiver")]:
            link = db.query(CaregiverAssignment).filter(
                CaregiverAssignment.caregiver_id == caregiver.id,
                CaregiverAssignment.elderly_user_id == patient.id
            ).first()
            if not link:
                assignment = CaregiverAssignment(
                    caregiver_id=caregiver.id,
                    elderly_user_id=patient.id,
                    relationship_type=relation,
                    consent_confirmed=True
                )
                db.add(assignment)

        # Seed Daily Routine Tasks for Dhiren Borah
        routine_items = [
            ("Morning herbal tea & glass of warm water", "morning", 1, "cup-hot"),
            ("Gentle 15-minute garden walk in sunlight", "morning", 2, "sun"),
            ("Play Picture Matching cognitive game", "afternoon", 3, "puzzle-piece"),
            ("Review family photograph memory cards", "evening", 4, "photograph"),
            ("Night calm breathing & herbal milk", "night", 5, "moon")
        ]
        for title, period, order, icon in routine_items:
            existing = db.query(RoutineTask).filter(
                RoutineTask.user_id == elderly_1.id,
                RoutineTask.title == title
            ).first()
            if not existing:
                db.add(RoutineTask(
                    user_id=elderly_1.id,
                    title=title,
                    period_of_day=period,
                    order_index=order,
                    is_checked=False,
                    icon_name=icon
                ))

        # Seed Reminders for Dhiren Borah
        reminders_data = [
            ("Morning Heart Care Tablet", "Take 1 tablet of prescribed cardio supplement with water after breakfast", "medication", "08:30", "Please remember your morning heart tablet after breakfast."),
            ("Midday Hydration & Water Glass", "Drink one full glass of clean drinking water", "hydration", "12:00", "Time for a refreshing glass of water."),
            ("Afternoon Brain Game Session", "Enjoy a relaxing game of Picture Matching or Sequence Memory", "activity", "15:30", "It is time for your afternoon relaxing game session."),
            ("Evening Family Conversation", "Video call with daughter Ananya in Guwahati", "social", "18:00", "Ananya will call you this evening.")
        ]
        for title, desc, cat, rtime, prompt in reminders_data:
            existing_rem = db.query(Reminder).filter(
                Reminder.user_id == elderly_1.id,
                Reminder.title == title
            ).first()
            if not existing_rem:
                db.add(Reminder(
                    user_id=elderly_1.id,
                    created_by_user_id=caregiver.id,
                    title=title,
                    description=desc,
                    category=cat,
                    reminder_time=rtime,
                    is_recurring=True,
                    is_completed=False,
                    is_active=True,
                    spoken_prompt=prompt
                ))

        # Seed Familiar Memory Cards for Dhiren Borah
        memory_cards_data = [
            ("Ananya Borah", "Daughter", "Architect living in Guwahati. She visits every Sunday afternoon with home-cooked sweets.", "family", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", "This is your beloved daughter Ananya."),
            ("Aarav", "Grandson", "Age 9. Loves painting, football, and showing you his school science drawings.", "family", "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80", "This is your energetic grandson Aarav."),
            ("Ancestral Home in Tezpur", "Childhood Memory", "Our family home surrounded by lush green tea gardens near the Brahmaputra river.", "place", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", "This is your cherished family home in Tezpur.")
        ]
        for name, rel, desc, cat, photo, prompt in memory_cards_data:
            existing_card = db.query(MemoryCard).filter(
                MemoryCard.user_id == elderly_1.id,
                MemoryCard.name_or_title == name
            ).first()
            if not existing_card:
                db.add(MemoryCard(
                    user_id=elderly_1.id,
                    name_or_title=name,
                    relation=rel,
                    description=desc,
                    category=cat,
                    photo_url=photo,
                    audio_prompt=prompt
                ))

        # Seed Initial Baseline Game Sessions for Dhiren Borah
        sample_sessions = [
            ("picture_matching", "easy", 85.0, 100, 12, 6, 45.0, 3.75, 1),
            ("picture_matching", "easy", 90.0, 120, 10, 6, 38.0, 3.8, 0),
            ("sequence_memory", "easy", 75.0, 80, 8, 6, 52.0, 6.5, 2),
            ("familiar_object", "easy", 95.0, 140, 7, 7, 30.0, 4.2, 0)
        ]
        for gtype, diff, acc, score, att, corr, ctime, avg_time, hints in sample_sessions:
            existing_sess = db.query(GameSession).filter(
                GameSession.user_id == elderly_1.id,
                GameSession.game_type == gtype,
                GameSession.score == score
            ).first()
            if not existing_sess:
                db.add(GameSession(
                    user_id=elderly_1.id,
                    game_type=gtype,
                    difficulty=diff,
                    recommended_by_ml=False,
                    is_untimed=True,
                    score=score,
                    accuracy_percentage=acc,
                    total_attempts=att,
                    correct_matches=corr,
                    completion_time_seconds=ctime,
                    avg_response_time_seconds=avg_time,
                    hints_used=hints,
                    session_completed=True
                ))

        db.commit()
        print("\n[DB INIT SUCCESS] Database initialized and seeded with demo accounts:")
        print("  +-------------+-------------------------------------+---------------+---------------+")
        print("  | Role        | Email                               | Password      | Full Name     |")
        print("  +-------------+-------------------------------------+---------------+---------------+")
        print("  | Admin       | admin@cognitivecare.org             | Admin@1234    | Administrator |")
        print("  | Caregiver   | caregiver.priya@cognitivecare.org   | Caregiver@1234| Dr. Priya S.  |")
        print("  | Elderly (1) | dhiren.borah@cognitivecare.org      | Elderly@1234  | Dhiren Borah  |")
        print("  | Elderly (2) | maya.devi@cognitivecare.org         | Elderly@1234  | Maya Devi     |")
        print("  +-------------+-------------------------------------+---------------+---------------+\n")
    except Exception as e:
        db.rollback()
        print(f"[DB INIT ERROR] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialize CognitiveCare MySQL database and seed initial demo data.")
    parser.add_argument("--no-seed", action="store_true", help="Initialize tables without inserting demo seed data.")
    parser.add_argument("--sqlite", action="store_true", help="Use SQLite fallback for instant local verification.")
    args = parser.parse_args()

    init_database(seed_demo=not args.no_seed, use_sqlite=args.sqlite)
