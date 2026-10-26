# CognitiveCare System Architecture & Implementation Plan

## 1. Executive Summary & Ethical Disclaimer

**CognitiveCare** is a web-based supportive cognitive engagement and memory assistance platform designed for elderly individuals, with particular consideration for seniors experiencing mild cognitive impairment or early dementia, and their caregivers in the North Eastern Region (NER).

### Mandatory Clinical & Ethical Principles
1. **Supportive, Not Diagnostic**: The platform is an assistive cognitive stimulation and daily reminder tool. It does **not** diagnose dementia, estimate clinical stages, predict disease progression, or prescribe treatment.
2. **Transparent ML Adaptation**: Machine Learning models only predict the most comfortable **next game difficulty level** (Easy, Medium, Hard) to prevent cognitive frustration or disengagement.
3. **Caregiver & User Agency**: All ML-recommended difficulties can be manually overridden by the user or caregiver at any time.
4. **Safety & Privacy**: No real patient medical histories are collected. Synthetic demo profiles are provided. Passwords are salted and hashed (Bcrypt), authentication uses JWT with short expirations, and all caregiver access is strictly permission-gated.

---

## 2. Monorepo Structure

```text
CognitiveCare/
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── assets/               # Audio clips, high-contrast icons, imagery
│   │   ├── components/           # Accessible UI components (Navbar, VoicePrompt, Cards)
│   │   ├── context/              # AuthContext, ThemeContext, AccessibilityContext
│   │   ├── games/                # PictureMatching, SequenceMemory, ObjectRecognition
│   │   ├── pages/                # Landing, Login/Register, ElderlyDashboard, CaregiverPortal, Reminders
│   │   ├── services/             # Axios/fetch API clients
│   │   └── styles/               # Accessible Vanilla CSS design tokens & themes
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI routers (auth, users, games, ml, reminders, caregiver, health)
│   │   ├── core/                 # Config (pydantic-settings), Security, JWT, RBAC
│   │   ├── database/             # SQLAlchemy engine, session maker, base declarations
│   │   ├── models/               # SQLAlchemy ORM models (User, GameSession, Reminder, Routine, etc.)
│   │   ├── schemas/              # Pydantic schemas for request/response serialization & validation
│   │   ├── services/             # Application services (Auth, GameService, ReminderService, CaregiverService)
│   │   └── ml/                   # Synthetic dataset generator, Scikit-learn Pipeline, inference & fallback
│   ├── data/                     # Generated synthetic dataset (cognitive_game_sessions.csv)
│   ├── scripts/                  # Database initialization, admin creation, model retrain runner
│   ├── tests/                    # Pytest test suite (unit tests, API integration tests, ML pipeline tests)
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
├── docs/                         # Architecture, API guides, DB schemas, user documentation
├── .gitignore
└── README.md
```

---

## 3. Database Architecture (`cognitive_care_db`)

The database uses MySQL 8.0 with InnoDB engine and UTF8mb4 character set.

### Entity Relationship Model

1. **`users`**
   - `id`: INT, Primary Key, AUTO_INCREMENT
   - `email`: VARCHAR(255), Unique, Indexed
   - `hashed_password`: VARCHAR(255)
   - `full_name`: VARCHAR(150)
   - `role`: ENUM('elderly', 'caregiver', 'admin'), Indexed
   - `language_preference`: VARCHAR(10) DEFAULT 'en'
   - `high_contrast_mode`: BOOLEAN DEFAULT FALSE
   - `audio_prompts_enabled`: BOOLEAN DEFAULT TRUE
   - `untimed_mode_enabled`: BOOLEAN DEFAULT TRUE
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

2. **`caregiver_assignments`**
   - `id`: INT, Primary Key, AUTO_INCREMENT
   - `caregiver_id`: INT, Foreign Key -> `users.id`
   - `elderly_user_id`: INT, Foreign Key -> `users.id`
   - `relationship_type`: VARCHAR(50) (e.g., 'Child', 'Spouse', 'Professional Caregiver')
   - `consent_confirmed`: BOOLEAN DEFAULT TRUE
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

3. **`game_sessions`**
   - `id`: INT, Primary Key, AUTO_INCREMENT
   - `user_id`: INT, Foreign Key -> `users.id`, Indexed
   - `game_type`: ENUM('picture_matching', 'sequence_memory', 'familiar_object')
   - `difficulty`: ENUM('easy', 'medium', 'hard')
   - `recommended_by_ml`: BOOLEAN DEFAULT FALSE
   - `is_untimed`: BOOLEAN DEFAULT FALSE
   - `score`: INT DEFAULT 0
   - `accuracy_percentage`: FLOAT DEFAULT 0.0
   - `total_attempts`: INT DEFAULT 0
   - `correct_matches`: INT DEFAULT 0
   - `completion_time_seconds`: FLOAT DEFAULT 0.0
   - `avg_response_time_seconds`: FLOAT DEFAULT 0.0
   - `hints_used`: INT DEFAULT 0
   - `session_completed`: BOOLEAN DEFAULT TRUE
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP, Indexed

4. **`reminders`**
   - `id`: INT, Primary Key, AUTO_INCREMENT
   - `user_id`: INT, Foreign Key -> `users.id`, Indexed
   - `created_by_user_id`: INT, Foreign Key -> `users.id` (caregiver or self)
   - `title`: VARCHAR(200)
   - `description`: TEXT
   - `category`: ENUM('medication', 'hydration', 'meal', 'social', 'activity', 'general')
   - `reminder_time`: TIME
   - `reminder_date`: DATE (optional for recurring)
   - `is_recurring`: BOOLEAN DEFAULT TRUE
   - `is_completed`: BOOLEAN DEFAULT FALSE
   - `is_active`: BOOLEAN DEFAULT TRUE
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

5. **`routine_tasks`**
   - `id`: INT, Primary Key, AUTO_INCREMENT
   - `user_id`: INT, Foreign Key -> `users.id`, Indexed
   - `title`: VARCHAR(200)
   - `period_of_day`: ENUM('morning', 'afternoon', 'evening', 'night')
   - `order_index`: INT DEFAULT 0
   - `is_checked`: BOOLEAN DEFAULT FALSE
   - `last_checked_date`: DATE
   - `icon_name`: VARCHAR(50)
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

6. **`memory_cards`** (Familiar Persons & Places)
   - `id`: INT, Primary Key, AUTO_INCREMENT
   - `user_id`: INT, Foreign Key -> `users.id`, Indexed
   - `category`: ENUM('family', 'friend', 'place', 'pet', 'memory')
   - `name_or_title`: VARCHAR(150)
   - `relation`: VARCHAR(100) (e.g., 'Daughter', 'Childhood Home in Shillong')
   - `description`: TEXT
   - `photo_url`: VARCHAR(500)
   - `audio_prompt`: VARCHAR(255)
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 4. Machine Learning Difficulty Recommendation Pipeline

### Objective
Recommend an appropriate next game difficulty (`easy`, `medium`, `hard`) tailored to the player's recent gameplay metrics to maintain an engaging, non-stressful experience.

### Features
1. `game_type`: Categorical (`picture_matching`, `sequence_memory`, `familiar_object`)
2. `current_difficulty`: Categorical (`easy`, `medium`, `hard`)
3. `accuracy_percentage`: Numeric [0.0 - 100.0]
4. `avg_response_time_seconds`: Numeric (seconds per action)
5. `hints_used`: Numeric integer (0, 1, 2, 3+)
6. `recent_performance_score`: Weighted exponential moving average of past 3 sessions [0.0 - 100.0]

### Architecture
- **Pipeline**: Scikit-Learn `Pipeline` with:
  - `ColumnTransformer`:
    - Categorical: `OneHotEncoder(handle_unknown='ignore')`
    - Numerical: `StandardScaler()`
  - Classifier: `RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight='balanced')`
- **Baseline Comparison**: A documented rule-based heuristic comparator.
- **Evaluation**: Accuracy, Macro F1-Score, Classification Report, Confusion Matrix.
- **Fail-Safe Fallback**: If the model artifact is missing or an unexpected input is provided, the service uses an explainable deterministic rule fallback:
  - If accuracy < 60% or hints >= 3: recommend `easy`
  - If accuracy > 85% and hints <= 1: recommend `hard`
  - Otherwise: recommend `medium` (or keep current level).
- **Explainability**: Response returns both the predicted level and a human-readable explanation (e.g., *"Recommended Medium based on 82% accuracy with 1 hint in your last session"*).

---

## 5. REST API Specifications

| Method | Endpoint | Description | Protected Roles |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT access token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & preferences | Elderly, Caregiver, Admin |
| `PATCH` | `/api/v1/users/preferences` | Update accessibility & audio preferences | Elderly, Caregiver, Admin |
| `POST` | `/api/v1/games/sessions` | Record a completed game session | Elderly, Caregiver |
| `GET` | `/api/v1/games/sessions/history` | Retrieve user's past game sessions | Elderly, Caregiver, Admin |
| `POST` | `/api/v1/ml/recommend-difficulty` | Predict next recommended difficulty | Elderly, Caregiver |
| `GET` | `/api/v1/ml/model-info` | Get model metrics & baseline comparison | Any Authenticated |
| `GET` | `/api/v1/reminders/` | List active daily reminders & routines | Elderly, Caregiver |
| `POST` | `/api/v1/reminders/` | Create a reminder | Elderly, Caregiver |
| `PATCH` | `/api/v1/reminders/{id}/toggle`| Mark reminder completed / uncompleted | Elderly, Caregiver |
| `GET` | `/api/v1/caregiver/patients` | List authorized patients for caregiver | Caregiver, Admin |
| `GET` | `/api/v1/caregiver/patients/{id}/summary` | Retrieve patient session stats & activity trends | Caregiver, Admin |
| `GET` | `/api/v1/admin/stats` | System health, user counts, model status | Admin |
| `GET` | `/api/v1/health` | Service health status | Public |

---

## 6. Senior-Centric UX Design System

1. **Visual Clarity & Typography**:
   - High legibility typeface (`Inter` / `Outfit`).
   - Default base font size: 18px (scalable up to 24px in Large Text mode).
   - Minimum target touch/click sizes: 52px × 52px.
2. **Color Palette (Calm & High Contrast)**:
   - Primary: Deep Calming Navy (`#1E3A8A`) & Soft Indigo (`#3730A3`).
   - Accent / Positive: Warm Sage Green (`#15803D`).
   - Warning / Reminder: Soft Amber (`#B45309`).
   - Background: Soft Warm Off-White (`#F8FAFC`) to minimize glare.
   - High Contrast Mode: Crisp Dark Theme (`#0F172A`) with Bright Amber (`#FCD34D`) and High Contrast White (`#FFFFFF`).
3. **Accessibility (WCAG 2.1 AAA Compliant)**:
   - No flashing animations, harsh sound effects, or sudden modal shifts.
   - Web Speech API integration for reading out instructions, card descriptions, and reminders.
   - Clear text labels alongside all icons.
   - Untimed option enabled by default to remove cognitive anxiety.

---

## 7. Implementation Milestones

- **Milestone 0**: Structure & Architecture Setup *(Complete)*
- **Milestone 1**: Database Models, SQLAlchemy Setup, MySQL Initialization Scripts
- **Milestone 2**: Synthetic Dataset Generation, Model Training Script, Joblib Serialization & Baseline Comparison
- **Milestone 3**: FastAPI Core, Auth (JWT + RBAC), Game Service, Reminders Service, ML API with Fallback
- **Milestone 4**: React Frontend Setup (Vite), Senior Design System, Accessibility Modes & Navigation
- **Milestone 5**: Interactive Cognitive Games (Picture Matching, Sequence Memory, Object Recognition) & Memory Cards
- **Milestone 6**: Caregiver Portal (Trends, Activity Charts, Patient Management) & Admin Health Monitor
- **Milestone 7**: Automated PyTest Suite, Frontend Tests, Manual Verification, and Comprehensive Documentation
