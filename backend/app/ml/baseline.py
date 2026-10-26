from typing import Tuple, List, Union
import numpy as np
import pandas as pd


def rule_based_recommend(
    game_type: str,
    previous_difficulty: str,
    accuracy_percentage: float,
    avg_response_time_seconds: float,
    hints_used: int,
    recent_performance: float
) -> Tuple[str, str]:
    """
    Explainable, conservative rule-based difficulty recommendation logic.
    Used both as a baseline comparator and as a safety fallback when ML artifacts
    are missing, uninitialized, or receiving anomalous inputs.

    Returns:
        (recommended_difficulty, explanation_text)
    """
    # 1. Needing gentle assistance or experiencing cognitive fatigue
    if accuracy_percentage < 60.0 or hints_used >= 3 or avg_response_time_seconds > 8.5 or recent_performance < 55.0:
        if previous_difficulty == "hard":
            return "medium", "Recent session indicated some challenging moments. Stepping down to Medium for a comfortable experience."
        return "easy", "Gentle pace recommended to ensure a calm, frustration-free cognitive exercise."

    # 2. High comfort and proficiency
    if accuracy_percentage >= 85.0 and hints_used <= 1 and avg_response_time_seconds <= 4.0 and recent_performance >= 80.0:
        if previous_difficulty == "easy":
            return "medium", "Excellent accuracy and comfort on Easy! Stepping up to Medium for positive stimulation."
        return "hard", "Consistently strong accuracy and prompt responses indicate readiness for Hard difficulty."

    # 3. Steady, balanced performance
    if previous_difficulty == "hard" and accuracy_percentage < 70.0:
        return "medium", "Adjusting to Medium difficulty to keep the activity comfortable and steady."
    elif previous_difficulty == "easy" and accuracy_percentage > 78.0:
        return "medium", "Good progress on Easy. Medium difficulty provides an engaging next step."
    
    # Default to current difficulty or medium
    return previous_difficulty if previous_difficulty in ["easy", "medium", "hard"] else "medium", \
           f"Maintaining {previous_difficulty.capitalize()} difficulty based on balanced gameplay metrics."


class RuleBasedBaselineClassifier:
    """
    Scikit-learn compatible wrapper for the rule-based baseline comparator.
    Enables direct performance metric comparison against Random Forest during training.
    """
    def __init__(self):
        self.classes_ = np.array(["easy", "hard", "medium"])

    def fit(self, X, y=None):
        return self

    def predict(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        predictions = []
        if isinstance(X, pd.DataFrame):
            for _, row in X.iterrows():
                pred, _ = rule_based_recommend(
                    game_type=str(row.get("game_type", "picture_matching")),
                    previous_difficulty=str(row.get("previous_difficulty", "easy")),
                    accuracy_percentage=float(row.get("accuracy_percentage", 70.0)),
                    avg_response_time_seconds=float(row.get("avg_response_time_seconds", 4.5)),
                    hints_used=int(row.get("hints_used", 1)),
                    recent_performance=float(row.get("recent_performance", 70.0))
                )
                predictions.append(pred)
        else:
            # Array format assuming standard feature ordering
            for row in X:
                pred, _ = rule_based_recommend(
                    game_type=str(row[0]),
                    previous_difficulty=str(row[1]),
                    accuracy_percentage=float(row[2]),
                    avg_response_time_seconds=float(row[3]),
                    hints_used=int(row[4]),
                    recent_performance=float(row[5])
                )
                predictions.append(pred)
        return np.array(predictions)
