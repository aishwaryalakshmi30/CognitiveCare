# CognitiveCare User Manual & Operational Guide

Welcome to the **CognitiveCare** User Manual. This guide provides step-by-step instructions for elderly participants, caregivers, and platform administrators.

---

## 1. Quick Start & Demo Logins

For testing and demonstration, pre-configured demo accounts are available with one-click buttons on the login screen:

| Role | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Elderly User 1** | `dhiren.borah@cognitivecare.org` | `Elderly@1234` | Memory games, daily checklists, familiar photos |
| **Elderly User 2** | `maya.devi@cognitivecare.org` | `Elderly@1234` | Alternate patient account with pre-seeded history |
| **Caregiver** | `caregiver.priya@cognitivecare.org` | `Caregiver@1234` | Monitor patient activity, schedule routine reminders |
| **Admin** | `admin@cognitivecare.org` | `Admin@1234` | Platform KPIs, user database, model diagnostics |

---

## 2. Elderly User Guide

### 2.1 Senior-Friendly Accessibility Controls
At the top right of every screen in the navigation bar:
- **Font Size Selector**: Click `Normal`, `Large`, or `Extra Large` to immediately scale all text across the platform.
- **High Contrast Toggle**: Click `Contrast` to switch to high-contrast dark mode with bright yellow and cyan accents, maximizing legibility for cataracts or low vision.
- **Speech Narration**: Click the `🔊 Audio` button on any page or card to hear the text read aloud using natural speech synthesis.

### 2.2 Playing Cognitive Games
From the **Games Hub** (`/games`), choose any of the three games:

1. **Picture Matching Game**:
   - Flip 2 cards at a time to reveal friendly illustrations (tea cup, singing bird, mango, flowering orchid).
   - Matched cards remain face-up.
   - Use the **💡 Peek Hint** button at any time to briefly reveal all cards.
   - Click **⏸️ Pause Game** whenever you need to take a break without losing your place.
2. **Sequence Memory Game**:
   - Watch the colorful panels flash in an engaging sequence accompanied by gentle audio musical chimes.
   - Repeat the sequence by tapping the buttons in order.
   - Click **🔁 Replay Sequence** if you missed the melody.
3. **Familiar Object Recognition**:
   - View a clear image of an everyday domestic or cultural item (e.g. traditional teapot, reading glasses, wall clock).
   - Listen to the spoken prompt using the **🔊 Read Aloud** button.
   - Tap the matching name from the large answer options.

### 2.3 Post-Game Feedback & AI Difficulty Adjustment
When a game concludes:
- Confetti celebrates your achievement.
- The AI explains its recommendation: e.g., *"Comfortable accuracy (100.0%) with 0 errors. Ready for next challenge."*
- You can accept the AI suggestion or toggle to any difficulty level you prefer.

### 2.4 Daily Routine Checklist (`/routines`)
- View today's checklist (e.g., *Morning Tea & Water*, *Blood Pressure Check*, *Short Garden Stroll*).
- Tap the large checkbox to mark an item complete. A celebratory sound and green checkmark confirm your action.

### 2.5 Familiar Memories Album (`/memories`)
- Browse photo cards of family members, ancestral hometowns, and cherished moments.
- Click **🔊 Read Story** on any card to hear the memory read aloud in clear speech.
- Click **➕ Add New Memory** to add a new loved one or memorable event.

---

## 3. Caregiver Guide

### 3.1 Patient Overview
- Log in with your caregiver credentials.
- The **Caregiver Dashboard** (`/caregiver-dashboard`) lists all elderly patients assigned to your care.
- View real-time status, preferred font size, and total completed game sessions.

### 3.2 Activity Monitoring
- Select any patient to inspect their session history.
- Review average accuracy, completion times, and game preferences.
- **Reminder**: All data is purely non-diagnostic and serves solely to understand engagement patterns.

### 3.3 Adding Reminders
- Scroll to **Schedule a Reminder for Patient**.
- Enter a title (e.g. *"Evening medication with water"*), category (`Medication`, `Appointment`, `Hydration`, or `Social`), and scheduled time.
- The reminder appears immediately on the patient's dashboard.

---

## 4. Administrator Guide

### 4.1 System Overview
- Log in with admin credentials to access the **Admin Dashboard** (`/admin-dashboard`).
- View total registered users by role, aggregate cognitive game sessions, active reminders, and database health.

### 4.2 Machine Learning Model Transparency
- Click **ML Model Transparency** or visit `/ml-transparency`.
- Review the live model metrics, feature importances, confusion matrix, and training report.
- Verify the active status of the Random Forest pipeline and rule-based fallback engine.
