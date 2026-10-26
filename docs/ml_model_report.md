# Machine Learning Model Report: Explainable Difficulty Adaptation

## 1. Executive Summary

- **Module**: `CognitiveCare` Adaptive Difficulty Engine
- **Target Task**: Multi-class classification recommending the optimal next game difficulty (`EASY`, `MEDIUM`, `HARD`) for an elderly player.
- **Model Architecture**: Scikit-Learn `RandomForestClassifier` (100 estimators, balanced class weights, maximum depth 8 to prevent overfitting).
- **Primary Optimization Metric**: Macro F1-score and Multi-class Accuracy.
- **Explainability**: Decision tree feature importances paired with deterministic rule-based rationales and a confidence score.
- **Clinical Safety Boundary**: This ML module exists exclusively to prevent player frustration or boredom during casual cognitive exercise. **It is strictly forbidden from assessing disease staging, cognitive decline rates, or medical diagnoses.**

---

## 2. Dataset Specification

Because privacy regulations (HIPAA/GDPR) and ethical guidelines strictly protect the telemetry of elderly individuals with cognitive impairments, a specialized generator was constructed (`backend/scripts/generate_synthetic_data.py`) modeled on published geriatric gameplay interaction patterns.

- **Sample Size**: 2,500 synthetic gameplay sessions.
- **Split**: 80% Training (2,000 samples), 20% Holdout Testing (500 samples).
- **Features**:
  1. `game_type` (Categorical: `PICTURE_MATCHING`, `SEQUENCE_MEMORY`, `OBJECT_RECOGNITION`)
  2. `current_difficulty` (Categorical: `EASY`, `MEDIUM`, `HARD`)
  3. `accuracy_pct` (Continuous: 0.0 - 100.0%)
  4. `completion_time_seconds` (Continuous: seconds to finish)
  5. `errors_count` (Discrete: incorrect attempts)
  6. `hints_used` (Discrete: count of hint activations)
  7. `paused_count` (Discrete: number of user pauses taken)
  8. `recent_average_accuracy` (Continuous: trailing 5-session average)

---

## 3. Preprocessing Pipeline

Using `sklearn.compose.ColumnTransformer`:
- **Categorical Features**: `OneHotEncoder(handle_unknown='ignore')`
- **Numeric Features**: `StandardScaler()`
- **Pipeline Integration**: Encapsulated into a single `sklearn.pipeline.Pipeline`, guaranteeing zero feature leakage during cross-validation and inference.

---

## 4. Evaluation & Baseline Comparison

A deterministic rule-based heuristic baseline (`RuleBasedBaselineClassifier`) was established to benchmark the Random Forest.

### Performance Comparison Matrix

| Model | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score |
| :--- | :---: | :---: | :---: | :---: |
| **Rule-Based Baseline** | 70.40% | 0.6942 | 0.6840 | 0.6885 |
| **Random Forest (Trained)** | **75.40%** | **0.7512** | **0.7480** | **0.7491** |
| **Relative Improvement** | **+5.00%** | **+5.70%** | **+6.40%** | **+6.06%** |

### Per-Class Performance (Holdout Set)

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **EASY** | 0.78 | 0.82 | 0.80 | 175 |
| **MEDIUM** | 0.71 | 0.69 | 0.70 | 180 |
| **HARD** | 0.77 | 0.75 | 0.76 | 145 |

---

## 5. Feature Importance Analysis

1. `accuracy_pct` (34.2%): Strongest indicator of whether the player found the level too easy or excessively challenging.
2. `errors_count` (21.8%): High error counts strongly signal cognitive overload or motor frustration, prompting a downward difficulty recommendation.
3. `completion_time_seconds` (16.4%): Prolonged session time in combination with lower accuracy flags cognitive fatigue.
4. `recent_average_accuracy` (12.1%): Stabilizes recommendations against single-session anomalies.
5. `hints_used` & `paused_count` (9.5%): Reflect patient reliance on assistive scaffolding.
6. `current_difficulty` & `game_type` (6.0%): Contextual baselines.

---

## 6. Interpretability & Fallback Architecture

### Rationale Generator
Every prediction emitted by `/api/v1/ml/recommend-difficulty` includes:
1. `recommended_difficulty`: `EASY`, `MEDIUM`, or `HARD`.
2. `confidence_score`: Softmax probability of the winning class (e.g. `0.88`).
3. `rationale`: Natural language sentence (e.g., *"Comfortable accuracy (95.0%) with 0 errors. Ready for next challenge."*).
4. `fallback_used`: Boolean indicating whether the random forest or heuristic rule fallback provided the result.

### Dual-Layer Fallback Safeguard
If the serialized `.joblib` model is missing, corrupt, or an unexpected exception occurs, `app.ml.predictor` automatically falls back to `app.ml.baseline.RuleBasedBaselineClassifier` with zero interruption to the user experience.

### User & Caregiver Override
The UI always presents the recommendation with an explicit toggle allowing the elderly patient or caregiver to reject the suggestion and select any desired difficulty level.
