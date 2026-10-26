# Ethical Guidelines & Clinical Safeguards

## 1. Core Principle: Non-Diagnostic Mandate

**CognitiveCare is strictly a supportive cognitive stimulation, daily memory aid, and casual engagement platform.**

### What CognitiveCare IS:
- A joyful, dignified space for elderly individuals to engage in casual cognitive exercise.
- A digital reminder and daily routine checklist that promotes personal independence.
- A personalized digital photo album that preserves family memories with audio narration.
- A non-judgmental system that adapts difficulty downward when a player struggles, preventing frustration and feelings of helplessness.

### What CognitiveCare IS NOT:
- **NOT** a diagnostic instrument for Alzheimer's disease, Mild Cognitive Impairment (MCI), or vascular dementia.
- **NOT** a clinical cognitive screening assessment (it does not replace MMSE, MoCA, or SLUMS).
- **NOT** a prognostic tool (it will **never** predict disease staging, deterioration timeline, or life expectancy).
- **NOT** a medical prescription or therapeutic intervention device.

---

## 2. Platform Safeguards Implementation

### Explicit Non-Diagnostic Disclaimers
1. **API Responses**: Every payload delivered by `/api/v1/ml/recommend-difficulty`, `/api/v1/caregiver/patients/{id}/summary`, and `/api/v1/games/my-history` contains a mandatory disclaimer field.
2. **Caregiver Dashboard**: A prominent, non-dismissible banner warns caregivers that gameplay metrics reflect daily motor and concentration comfort on a specific afternoon, rather than clinical neurological decline.
3. **Admin Dashboard**: System metrics clearly label all analytics as engagement activity rather than clinical indicators.

### Senior-Centric UI & Cognitive Empathy
- **No Timers / Zero Pressure**: No game enforces sudden time limits or failure countdowns.
- **Untimed Play & Pause**: The user can pause or exit any game at any time without punitive score penalties.
- **Dignified Encouragement**: The interface celebrates every attempt with positive, warm reinforcement rather than harsh error buzzers or red "Game Over" banners.
- **High-Contrast & Large Touch Targets**: Designed in accordance with WCAG 2.1 AAA recommendations (52px+ touch targets, scalable typography, calm color palette).

---

## 3. Machine Learning Ethics & Human-in-the-Loop Override

- **Narrow AI Scope**: The Machine Learning model is strictly bounded to difficulty classification (`EASY`, `MEDIUM`, `HARD`). It does not calculate a "cognitive deficit index" or "dementia score".
- **Explainability**: Every recommendation gives a clear, friendly reason in plain language.
- **Full Human Override**: Both the elderly user and their caregiver retain the absolute authority to select any game difficulty level, ignoring the algorithm's advice.

---

## 4. Privacy & Data Protection

- **Role-Based Access Control (RBAC)**: Only caregivers explicitly assigned to an elderly individual can view their engagement metrics. Caregivers cannot view other unrelated patients.
- **Secure Password Hashing**: Utilizes industry-standard `bcrypt` password hashing with salt rounds.
- **Stateless JWT Tokens**: Revocable, encrypted bearer authentication tokens.
- **Local / Self-Hosted Compatibility**: Database and models operate entirely within the institution's or family's private infrastructure (MySQL/SQLite), guaranteeing that sensitive photos and names never leak to third-party ad networks.
