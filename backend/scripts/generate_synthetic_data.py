import os
import sys
import numpy as np
import pandas as pd

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import settings


def generate_synthetic_gameplay_data(n_samples: int = 2500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic, documented synthetic dataset representing cognitive gaming sessions
    for elderly dementia and mild cognitive impairment activity support.

    NOTE & DISCLAIMER:
    This dataset is strictly synthetic and generated for application development, interface testing,
    and difficulty adjustment prototyping. It DOES NOT represent clinical trial data, nor does it
    demonstrate medical efficacy or diagnose clinical dementia.
    """
    np.random.seed(random_state)

    game_types = ["picture_matching", "sequence_memory", "familiar_object"]
    difficulties = ["easy", "medium", "hard"]

    data = []

    for _ in range(n_samples):
        game_type = np.random.choice(game_types, p=[0.4, 0.35, 0.25])
        prev_diff = np.random.choice(difficulties, p=[0.45, 0.35, 0.20])

        # Latent user engagement & capability state for this session:
        # 0: high comfort/proficiency, 1: steady/moderate comfort, 2: needing gentle assistance
        user_state = np.random.choice([0, 1, 2], p=[0.30, 0.45, 0.25])

        if user_state == 0:  # High proficiency / high comfort
            accuracy = np.clip(np.random.normal(88.0, 6.0), 75.0, 100.0)
            avg_response_time = np.clip(np.random.normal(2.8, 0.8), 1.2, 5.5)
            hints_used = int(np.random.choice([0, 1], p=[0.8, 0.2]))
            recent_perf = np.clip(accuracy + np.random.normal(0, 4.0), 70.0, 100.0)
            
            # Recommendation logic with natural variation
            if prev_diff == "easy":
                rec_diff = np.random.choice(["medium", "easy"], p=[0.85, 0.15])
            elif prev_diff == "medium":
                rec_diff = np.random.choice(["hard", "medium"], p=[0.75, 0.25])
            else:
                rec_diff = "hard"

        elif user_state == 1:  # Moderate comfort / balanced play
            accuracy = np.clip(np.random.normal(70.0, 8.0), 55.0, 85.0)
            avg_response_time = np.clip(np.random.normal(4.8, 1.2), 2.5, 8.5)
            hints_used = int(np.random.choice([0, 1, 2], p=[0.35, 0.45, 0.20]))
            recent_perf = np.clip(accuracy + np.random.normal(0, 6.0), 50.0, 90.0)

            # Keep at current difficulty or gently adjust
            if prev_diff == "easy":
                rec_diff = np.random.choice(["easy", "medium"], p=[0.7, 0.3])
            elif prev_diff == "medium":
                rec_diff = np.random.choice(["medium", "easy", "hard"], p=[0.7, 0.2, 0.1])
            else:
                rec_diff = np.random.choice(["medium", "hard"], p=[0.7, 0.3])

        else:  # Needing gentle assistance / experiencing cognitive fatigue
            accuracy = np.clip(np.random.normal(48.0, 9.0), 20.0, 65.0)
            avg_response_time = np.clip(np.random.normal(7.5, 2.0), 4.0, 15.0)
            hints_used = int(np.random.choice([2, 3, 4, 5], p=[0.3, 0.4, 0.2, 0.1]))
            recent_perf = np.clip(accuracy + np.random.normal(0, 5.0), 20.0, 65.0)

            # Recommend gentle difficulty (easy or step down to easy)
            if prev_diff == "hard":
                rec_diff = "medium"
            else:
                rec_diff = "easy"

        # Apply realistic noise (5% random exploratory adjustments)
        if np.random.rand() < 0.05:
            rec_diff = np.random.choice(difficulties)

        data.append({
            "game_type": game_type,
            "previous_difficulty": prev_diff,
            "accuracy_percentage": round(float(accuracy), 2),
            "avg_response_time_seconds": round(float(avg_response_time), 2),
            "hints_used": int(hints_used),
            "recent_performance": round(float(recent_perf), 2),
            "recommended_difficulty": rec_diff
        })

    df = pd.DataFrame(data)
    return df


def main():
    output_path = os.path.join(
        os.path.dirname(__file__), "..", settings.DATASET_PATH
    )
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print(f"[DATA GENERATOR] Generating 2,500 synthetic gameplay sessions...")
    df = generate_synthetic_gameplay_data(n_samples=2500, random_state=42)

    df.to_csv(output_path, index=False)
    print(f"[DATA GENERATOR SUCCESS] Dataset saved to: {os.path.abspath(output_path)}")
    print(f"[DATA GENERATOR STATS] Shape: {df.shape}")
    print("\nClass distribution for recommended_difficulty:")
    print(df["recommended_difficulty"].value_counts(normalize=True).round(3) * 100)
    print("\nSample records:")
    print(df.head(5))


if __name__ == "__main__":
    main()
