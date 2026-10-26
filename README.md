# CognitiveCare

> **AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in Northeast India (NER)**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![Python](https://img.shields.io/badge/Python-3.14-blue?logo=python&logoColor=white)](https://www.python.org)
[![WCAG AAA](https://img.shields.io/badge/WCAG-2.1%20AAA-4CAF50)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Tests](https://img.shields.io/badge/PyTest-25%2F25%20Passed-brightgreen)](https://pytest.org)

CognitiveCare is a full-stack, senior-accessible cognitive activity, memory support, and caregiver monitoring web platform. It pairs 3 calm, untimed cognitive games with an explainable Machine Learning difficulty adaptation engine, daily routine checklist reminders, familiar photo memory albums with Web Speech API audio narration, and caregiver engagement monitoring.

---

## ⚠️ Important Ethical & Clinical Disclaimer

**CognitiveCare is a supportive cognitive stimulation and daily memory assistance tool. It is NOT a medical diagnostic system, clinical assessment tool, or medical device.**

- It does **NOT** diagnose dementia, Alzheimer's disease, or Mild Cognitive Impairment.
- It does **NOT** predict disease severity, staging, or life expectancy.
- It does **NOT** recommend medical treatments or replace certified geriatric healthcare professionals.
- Gameplay data and ML difficulty recommendations exist purely to prevent frustration and sustain comfortable engagement.
- All AI recommendations can be overridden at any time by the user or caregiver.

---

## 🌟 Key Features

### 1. Senior-Centric Cognitive Games (No Timers, Untimed Play)
- **Picture Matching Game**: Memory card-flipping game with familiar, friendly cultural and everyday illustrations (tea cup, singing bird, mango, orchid). Includes a "💡 Peek Hint" button and pause capability.
- **Sequence Memory Game**: Simon-style color panel sequencing paired with gentle Web Audio API melodic chimes and a "🔁 Replay Sequence" button.
- **Familiar Object Recognition**: Identification of everyday household and cultural objects with large touch options and a "🔊 Read Aloud" button.

### 2. Explainable Machine Learning Difficulty Adaptation
- **Random Forest Classifier**: Multi-class model (`EASY`, `MEDIUM`, `HARD`) trained with Scikit-learn (75.40% accuracy, 0.7491 macro F1 vs. 70.40% baseline).
- **Explainability**: Delivers a clear rationale (e.g., *"Comfortable accuracy (95.0%) with 0 errors. Ready for next challenge."*) and confidence score.
- **Dual-Layer Fallback**: Seamless fallback to rule-based heuristics if the ML model is unreachable.
- **Human-in-the-Loop Override**: Elderly users and caregivers can toggle or reject the AI recommendation with one tap.

### 3. Memory Assistance & Daily Independence
- **Daily Routine Checklists**: Interactive tasks (e.g., morning tea, gentle walk, hydration) with immediate audio/visual positive reinforcement.
- **Scheduled Reminders**: Customizable reminders across categories (`Medication`, `Appointment`, `Hydration`, `Social`).
- **Familiar Photo Memory Album**: Digital memory cards featuring family members, hometowns, and milestones, with native browser Web Speech API audio narration.

### 4. Portals for Caregivers & Administrators
- **Caregiver Dashboard**: View authorized patients, review non-diagnostic activity metrics, and schedule routine reminders.
- **Admin Management Portal**: Real-time platform KPI metrics, database stats, user directory, and direct access to the ML Model Transparency Report.
- **ML Transparency Dashboard**: Live feature importance charts, model evaluation metrics, confusion matrix, and ethical boundary statements.

### 5. Senior Accessibility Standards (WCAG 2.1 AAA)
- Minimum **52px touch targets** for tremor and motor comfort.
- **3-level dynamic typography scaling** (`Normal`, `Large`, `Extra Large`).
- Instant **High-Contrast Dark Mode** (pure black with cyan and gold accents).
- High visual contrast (exceeds 7:1 ratio), zero flashing or jarring animations.

---

## 🏛️ System Architecture

```text
CognitiveCare/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── admin.py          # Admin KPI & oversight endpoints
│   │   │   │   ├── auth.py           # JWT registration, login, and /me
│   │   │   │   ├── caregiver.py      # Patient analytics & caregiver views
│   │   │   │   ├── games.py          # Session logging & gameplay history
│   │   │   │   ├── health.py         # Health checks & ping
│   │   │   │   ├── memory_cards.py   # Photo memory cards & audio stories
│   │   │   │   ├── ml.py             # Difficulty recommendation & model info
│   │   │   │   ├── reminders.py      # Routines & scheduled reminders
│   │   │   │   └── users.py          # User management
│   │   │   └── deps.py               # Dependency injection & RBAC RoleChecker
│   │   ├── core/
│   │   │   ├── config.py             # Settings, DB URI, JWT secret
│   │   │   └── security.py           # bcrypt password hashing & JWT tokens
│   │   ├── database/
│   │   │   └── session.py            # SQLAlchemy engine & session maker
│   │   ├── models/                   # User, GameSession, Reminder, Routine, MemoryCard
│   │   ├── schemas/                  # Pydantic v2 schemas
│   │   └── ml/
│   │       ├── baseline.py           # Heuristic rule-based baseline classifier
│   │       ├── predictor.py          # Dual-layer predictor with explainability
│   │       └── saved_models/         # Serialized .joblib pipeline & metrics JSON
│   ├── data/                         # 2,500 sample synthetic gameplay dataset
│   ├── scripts/                      # Data generator, ML trainer, DB seeder
│   └── tests/                        # 25 PyTest unit & integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, GameResultModal, RoutineChecklist
│   │   ├── context/                  # AuthContext, AccessibilityContext (TTS)
│   │   ├── pages/                    # Dashboards, Games, Memory cards, Admin, ML Info
│   │   └── index.css                 # Vanilla CSS senior design system
│   └── package.json
├── docs/                             # Full documentation suite
├── run_backend.bat                   # 1-Click Windows backend launcher
├── run_frontend.bat                  # 1-Click Windows frontend launcher
├── init_database.bat                 # 1-Click Database init & seed script
└── train_ml_model.bat                # 1-Click Synthetic data & ML trainer
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11 - 3.14**
- **Node.js 18+** & **npm**
- **MySQL 8.0** (or local SQLite automatic fallback)

---

### Step 1: Database & Backend Setup

1. Open PowerShell or Command Prompt in `CognitiveCare/backend`:
   ```powershell
   cd "CognitiveCare/backend"
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables in `backend/.env` (a template is provided in `.env.example`):
   ```env
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/cognitive_care_db
   USE_SQLITE_FALLBACK=True
   SECRET_KEY=cognitive_care_super_secret_jwt_key_2026
   ```
   *(When `USE_SQLITE_FALLBACK=True`, the platform automatically uses `cognitive_care_dev.db` if MySQL is not reachable).*

5. Initialize the database and seed initial demo accounts:
   ```powershell
   python scripts/init_db.py
   ```

6. Generate the synthetic training data and train the Machine Learning model:
   ```powershell
   python scripts/generate_synthetic_data.py
   python scripts/train_model.py
   ```

7. Start the FastAPI backend server:
   ```powershell
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Swagger / OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - API Root: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

---

### Step 2: Frontend Setup

1. Open a new terminal in `CognitiveCare/frontend`:
   ```powershell
   cd "CognitiveCare/frontend"
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   - Open your browser to [http://localhost:5173](http://localhost:5173)

---

### Step 3: Windows 1-Click Launchers

For convenience on Windows 11, double-click the included batch scripts in the `CognitiveCare/` root directory:
- `init_database.bat` — Initializes tables and populates sample users.
- `train_ml_model.bat` — Generates dataset and trains the Random Forest model.
- `run_backend.bat` — Launches the FastAPI backend on port 8000.
- `run_frontend.bat` — Launches the React Vite frontend on port 5173.

---

## 🔑 Pre-Seeded Demo Credentials

The login page includes **1-click quick-fill buttons** for each role:

| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cognitivecare.org` | `Admin@1234` | System KPI cards, user management, ML model state |
| **Caregiver** | `caregiver.priya@cognitivecare.org` | `Caregiver@1234` | Assigned to Dhiren Borah & Maya Devi, patient metrics, reminder scheduler |
| **Elderly 1** | `dhiren.borah@cognitivecare.org` | `Elderly@1234` | Pre-seeded with 5 game sessions, routine checklist, 3 memory cards |
| **Elderly 2** | `maya.devi@cognitivecare.org` | `Elderly@1234` | Alternate patient account with pre-seeded history |

---

## 🧪 Testing & Verification

The backend includes a comprehensive 25-test suite covering database models, password hashing, RBAC security, API endpoints, ML pipeline training, predictions, and fallback resilience.

Run all tests from `CognitiveCare/backend`:
```powershell
.\.venv\Scripts\pytest.exe -v tests/
```

**Results**:
```text
tests/test_api_endpoints.py::test_health_check PASSED                    [  4%]
tests/test_api_endpoints.py::test_root_endpoint PASSED                   [  8%]
tests/test_api_endpoints.py::test_register_new_user PASSED               [ 12%]
tests/test_api_endpoints.py::test_login_invalid_password PASSED          [ 16%]
tests/test_api_endpoints.py::test_get_current_user_me PASSED             [ 20%]
tests/test_api_endpoints.py::test_elderly_forbidden_from_admin_stats PASSED [ 24%]
tests/test_api_endpoints.py::test_admin_access_admin_stats PASSED        [ 28%]
tests/test_api_endpoints.py::test_record_game_session_and_fetch_history PASSED [ 32%]
tests/test_api_endpoints.py::test_ml_recommendation_endpoint PASSED      [ 36%]
tests/test_api_endpoints.py::test_ml_model_info_endpoint PASSED          [ 40%]
tests/test_api_endpoints.py::test_create_and_toggle_reminder PASSED      [ 44%]
tests/test_api_endpoints.py::test_caregiver_list_authorized_patients PASSED [ 48%]
tests/test_api_endpoints.py::test_caregiver_forbidden_from_unlinked_patient PASSED [ 52%]
tests/test_db_models.py::test_password_hashing PASSED                    [ 56%]
tests/test_db_models.py::test_create_user_with_senior_preferences PASSED [ 60%]
tests/test_db_models.py::test_caregiver_assignment PASSED                [ 64%]
tests/test_db_models.py::test_game_session_metrics PASSED                [ 68%]
tests/test_db_models.py::test_reminder_and_routine_creation PASSED       [ 72%]
tests/test_ml_pipeline.py::test_dataset_exists_and_valid PASSED          [ 76%]
tests/test_ml_pipeline.py::test_model_artifact_loaded PASSED             [ 80%]
tests/test_ml_pipeline.py::test_prediction_high_proficiency PASSED       [ 84%]
tests/test_ml_pipeline.py::test_prediction_cognitive_fatigue PASSED      [ 88%]
tests/test_ml_pipeline.py::test_fallback_when_model_missing PASSED       [ 92%]
tests/test_ml_pipeline.py::test_rule_based_recommend_logic PASSED        [ 96%]
tests/test_ml_pipeline.py::test_baseline_classifier_sklearn_interface PASSED [100%]

======================= 25 passed in 39.60s =======================
```

To verify the frontend build:
```powershell
cd "CognitiveCare/frontend"
npm run build
```
*(Produces a production bundle with 0 errors).*

---

## 📚 Complete Documentation

Detailed guides are located in the `docs/` folder:
- [System Architecture & Plan](file:///c:/Users/aksha/OneDrive/Desktop/aiml%20project/CognitiveCare/docs/system_architecture_and_plan.md)
- [REST API Documentation](file:///c:/Users/aksha/OneDrive/Desktop/aiml%20project/CognitiveCare/docs/api_documentation.md)
- [Machine Learning Model Card & Evaluation Report](file:///c:/Users/aksha/OneDrive/Desktop/aiml%20project/CognitiveCare/docs/ml_model_report.md)
- [User Manual & Role Guide](file:///c:/Users/aksha/OneDrive/Desktop/aiml%20project/CognitiveCare/docs/user_manual.md)
- [Ethical Guidelines & Clinical Safeguards](file:///c:/Users/aksha/OneDrive/Desktop/aiml%20project/CognitiveCare/docs/ethical_and_clinical_safeguards.md)

---

## 🛠️ Troubleshooting

- **CORS Issues**: Ensure the backend `.env` contains `CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]`.
- **MySQL Connection Error**: If your local MySQL service is stopped or has a different root password, verify that `USE_SQLITE_FALLBACK=True` is enabled in `backend/.env`. It will automatically connect to SQLite without crashing.
- **Audio Synthesis**: The Web Speech API runs natively in modern Chromium, Edge, and Safari browsers without extra downloads. Ensure browser sound permissions are enabled.
