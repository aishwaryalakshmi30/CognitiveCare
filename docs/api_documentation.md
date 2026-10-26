# CognitiveCare API Documentation

Version: `1.0.0`  
Base URL: `http://localhost:8000/api/v1`  
Interactive OpenAPI Docs: `http://localhost:8000/docs`  
Alternative ReDoc: `http://localhost:8000/redoc`

---

## Authentication & Authorization Architecture

- **Token Format**: Bearer JWT (`Authorization: Bearer <access_token>`)
- **Token Expiry**: Configurable (Default: 4320 minutes / 3 days)
- **Roles**:
  - `ELDERLY`: Access to games, routine tasks, reminders, personal memory cards, and ML difficulty adaptation.
  - `CAREGIVER`: Access to assigned elderly patients, patient progress analytics, and reminder scheduling.
  - `ADMIN`: Platform-wide oversight, user management, and system metrics.

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Register a new user account.

**Access**: Public

**Request Body**:
```json
{
  "full_name": "Dhiren Borah",
  "email": "dhiren.borah@cognitivecare.org",
  "password": "ElderlyPassword@123",
  "role": "ELDERLY",
  "preferred_font_size": "large",
  "high_contrast_mode": false,
  "audio_assistance_enabled": true
}
```

**Response (201 Created)**:
```json
{
  "id": 3,
  "full_name": "Dhiren Borah",
  "email": "dhiren.borah@cognitivecare.org",
  "role": "ELDERLY",
  "is_active": true,
  "preferred_font_size": "large",
  "high_contrast_mode": false,
  "audio_assistance_enabled": true,
  "created_at": "2026-10-18T10:00:00Z"
}
```

---

### `POST /auth/login`
Authenticate with credentials and obtain a JWT bearer token.

**Access**: Public

**Request Body** (`application/x-www-form-urlencoded` or JSON):
```json
{
  "username": "dhiren.borah@cognitivecare.org",
  "password": "Elderly@1234"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": 3,
    "full_name": "Dhiren Borah",
    "email": "dhiren.borah@cognitivecare.org",
    "role": "ELDERLY"
  }
}
```

---

### `GET /auth/me`
Retrieve profile of currently authenticated user.

**Access**: Authenticated (`ELDERLY`, `CAREGIVER`, `ADMIN`)

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:
```json
{
  "id": 3,
  "full_name": "Dhiren Borah",
  "email": "dhiren.borah@cognitivecare.org",
  "role": "ELDERLY",
  "preferred_font_size": "large",
  "high_contrast_mode": false,
  "audio_assistance_enabled": true
}
```

---

## 2. Cognitive Games Endpoints (`/games`)

### `POST /games/sessions`
Record the completion of a cognitive game session.

**Access**: `ELDERLY`

**Request Body**:
```json
{
  "game_type": "PICTURE_MATCHING",
  "difficulty_level": "EASY",
  "score": 100,
  "accuracy_pct": 92.5,
  "completion_time_seconds": 45,
  "errors_count": 1,
  "hints_used": 0,
  "paused_count": 0,
  "notes": "Completed 6-card matching"
}
```

**Response (201 Created)**:
```json
{
  "id": 42,
  "user_id": 3,
  "game_type": "PICTURE_MATCHING",
  "difficulty_level": "EASY",
  "score": 100,
  "accuracy_pct": 92.5,
  "completion_time_seconds": 45,
  "errors_count": 1,
  "hints_used": 0,
  "paused_count": 0,
  "played_at": "2026-10-18T10:15:00Z"
}
```

---

### `GET /games/my-history`
Fetch the personal gameplay session history for the current user.

**Access**: `ELDERLY`

**Query Parameters**:
- `game_type` (optional): Filter by `PICTURE_MATCHING`, `SEQUENCE_MEMORY`, or `OBJECT_RECOGNITION`.
- `limit` (default: 50): Number of records.

---

## 3. Machine Learning Difficulty Recommender (`/ml`)

### `POST /ml/recommend-difficulty`
Evaluates gameplay metrics from a completed session and computes an AI recommendation for next game difficulty, accompanied by human-interpretable rationale and confidence scores.

**Access**: `ELDERLY`, `CAREGIVER`

**Request Body**:
```json
{
  "game_type": "PICTURE_MATCHING",
  "current_difficulty": "MEDIUM",
  "accuracy_pct": 95.0,
  "completion_time_seconds": 38.0,
  "errors_count": 0,
  "hints_used": 0,
  "paused_count": 0,
  "recent_average_accuracy": 91.5
}
```

**Response (200 OK)**:
```json
{
  "recommended_difficulty": "HARD",
  "model_type": "RandomForestClassifier",
  "confidence_score": 0.88,
  "rationale": "High accuracy (95.0%) with minimal errors (0). Ready for next challenge.",
  "fallback_used": false,
  "disclaimer": "Non-diagnostic cognitive adaptation assistance only. User and caregiver can override this recommendation at any time."
}
```

---

### `GET /ml/model-info`
Provides transparent model metadata, evaluation metrics, and clinical safety disclaimers.

**Access**: Public

**Response (200 OK)**:
```json
{
  "model_name": "CognitiveGameDifficultyRecommender",
  "algorithm": "RandomForestClassifier (100 estimators)",
  "features": [
    "game_type",
    "current_difficulty",
    "accuracy_pct",
    "completion_time_seconds",
    "errors_count",
    "hints_used",
    "paused_count",
    "recent_average_accuracy"
  ],
  "classes": ["EASY", "MEDIUM", "HARD"],
  "evaluation_metrics": {
    "random_forest": {
      "accuracy": 0.754,
      "macro_f1": 0.7491
    },
    "rule_based_baseline": {
      "accuracy": 0.704,
      "macro_f1": 0.6885
    }
  },
  "ethical_boundaries": "This model regulates entertainment and cognitive exercise difficulty. It NEVER predicts disease progression, cognitive score assessments, or diagnosis."
}
```

---

## 4. Caregiver Progress Monitoring (`/caregiver`)

### `GET /caregiver/patients`
List all elderly patients assigned to the authenticated caregiver.

**Access**: `CAREGIVER`

---

### `GET /caregiver/patients/{patient_id}/summary`
Get aggregated, strictly non-diagnostic activity metrics for a specific patient.

**Access**: `CAREGIVER` (Patient must be assigned to this caregiver)

**Response (200 OK)**:
```json
{
  "patient_id": 3,
  "patient_name": "Dhiren Borah",
  "total_sessions": 24,
  "average_accuracy": 87.4,
  "favorite_game": "PICTURE_MATCHING",
  "recent_activity_date": "2026-10-18T10:15:00Z",
  "sessions_by_game": {
    "PICTURE_MATCHING": 12,
    "SEQUENCE_MEMORY": 7,
    "OBJECT_RECOGNITION": 5
  },
  "clinical_disclaimer": "Metrics represent supportive engagement trends and are NOT clinical indicators of dementia progression."
}
```

---

## 5. Routine Tasks & Reminders (`/reminders`)

### `GET /reminders/routines`
Fetch daily routine checklist for the logged-in user.

### `POST /reminders/routines/{task_id}/toggle`
Toggle routine completion status for today.

### `GET /reminders/`
List scheduled reminders.

### `POST /reminders/`
Create a new reminder.

---

## 6. Memory Cards (`/memory-cards`)

### `GET /memory-cards/`
Retrieve familiar people, places, and life milestone cards for the user.

### `POST /memory-cards/`
Add a new memory card with title, relationship, story text, and photo URL.

---

## 7. Admin Oversight (`/admin`)

### `GET /admin/dashboard-stats`
System KPI metrics: user counts by role, total game sessions recorded, active reminders, and ML engine operational status.

**Access**: `ADMIN`
