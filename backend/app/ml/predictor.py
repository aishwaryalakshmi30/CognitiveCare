import os
import json
import logging
from typing import Optional, Dict, Any, Tuple
import joblib
import pandas as pd
import numpy as np

from app.core.config import settings
from app.ml.baseline import rule_based_recommend
from app.schemas.ml import DifficultyPredictionRequest, DifficultyPredictionResponse, ModelInfoResponse

logger = logging.getLogger(__name__)


class DifficultyPredictor:
    """
    ML Difficulty Recommendation Service for CognitiveCare.
    Integrates the trained Scikit-learn Random Forest Pipeline with
    fail-safe, transparent rule-based fallback logic.
    """

    def __init__(self, model_path: Optional[str] = None):
        if model_path is None:
            self.model_path = os.path.join(
                os.path.dirname(__file__), "..", "..", settings.MODEL_PATH
            )
        else:
            self.model_path = model_path

        self.model = None
        self.metrics = {}
        self.load_model()

    def load_model(self) -> bool:
        """Attempts to load the joblib model pipeline and its metrics JSON."""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded ML model pipeline from {self.model_path}")

                metrics_path = os.path.join(
                    os.path.dirname(self.model_path), "model_metrics.json"
                )
                if os.path.exists(metrics_path):
                    with open(metrics_path, "r", encoding="utf-8") as f:
                        self.metrics = json.load(f)
                return True
            else:
                logger.warning(
                    f"Model file not found at {self.model_path}. Fallback rule recommender will be used."
                )
                self.model = None
                return False
        except Exception as e:
            logger.error(f"Failed to load ML model: {e}. Using rule fallback.")
            self.model = None
            return False

    def predict(self, req: DifficultyPredictionRequest) -> DifficultyPredictionResponse:
        """
        Recommends appropriate next game difficulty. Uses trained ML pipeline
        when available; otherwise falls back gracefully to conservative rules.
        """
        # Validate game type and previous difficulty
        valid_games = ["picture_matching", "sequence_memory", "familiar_object"]
        game_type = req.game_type if req.game_type in valid_games else "picture_matching"
        
        valid_diffs = ["easy", "medium", "hard"]
        prev_diff = req.previous_difficulty if req.previous_difficulty in valid_diffs else "easy"

        # Attempt ML Model Prediction
        if self.model is not None:
            try:
                input_df = pd.DataFrame([{
                    "game_type": game_type,
                    "previous_difficulty": prev_diff,
                    "accuracy_percentage": float(req.accuracy_percentage),
                    "avg_response_time_seconds": float(req.avg_response_time_seconds),
                    "hints_used": int(req.hints_used),
                    "recent_performance": float(req.recent_performance)
                }])

                predicted_diff = str(self.model.predict(input_df)[0])
                probabilities = self.model.predict_proba(input_df)[0]
                classes = list(self.model.classes_)
                confidence = float(probabilities[classes.index(predicted_diff)])

                explanation = self._generate_explanation(
                    predicted_diff, prev_diff, req.accuracy_percentage, req.hints_used, confidence
                )

                return DifficultyPredictionResponse(
                    recommended_difficulty=predicted_diff,
                    confidence=round(confidence, 3),
                    explanation=explanation,
                    method_used="ml_pipeline",
                    can_override=True
                )
            except Exception as e:
                logger.warning(f"ML inference error: {e}. Falling back to rule-based recommender.")

        # Fallback Rule Recommender
        fallback_diff, fallback_expl = rule_based_recommend(
            game_type=game_type,
            previous_difficulty=prev_diff,
            accuracy_percentage=float(req.accuracy_percentage),
            avg_response_time_seconds=float(req.avg_response_time_seconds),
            hints_used=int(req.hints_used),
            recent_performance=float(req.recent_performance)
        )

        return DifficultyPredictionResponse(
            recommended_difficulty=fallback_diff,
            confidence=0.85,
            explanation=f"[Rule Fallback] {fallback_expl}",
            method_used="rule_fallback",
            can_override=True
        )

    def _generate_explanation(
        self,
        predicted: str,
        previous: str,
        accuracy: float,
        hints: int,
        confidence: float
    ) -> str:
        """Produces clear, supportive, and compassionate non-clinical explanations."""
        hint_text = f"with {hints} hint{'s' if hints != 1 else ''}" if hints > 0 else "with zero hints"
        
        if predicted == previous:
            return (
                f"Recommended continuing on {predicted.capitalize()} difficulty "
                f"based on your steady {accuracy:.0f}% accuracy {hint_text}. "
                f"Confidence: {confidence * 100:.0f}%."
            )
        elif (previous == "easy" and predicted in ["medium", "hard"]) or (previous == "medium" and predicted == "hard"):
            return (
                f"Stepping up to {predicted.capitalize()} difficulty! "
                f"Your impressive {accuracy:.0f}% accuracy {hint_text} shows great focus and comfort. "
                f"Confidence: {confidence * 100:.0f}%."
            )
        else:
            return (
                f"Adjusting gently to {predicted.capitalize()} difficulty "
                f"to ensure a calm, relaxed, and enjoyable exercise. "
                f"Confidence: {confidence * 100:.0f}%."
            )

    def get_model_info(self) -> ModelInfoResponse:
        """Returns loaded model specifications, evaluation metrics, and clinical disclaimer."""
        return ModelInfoResponse(
            model_name=self.metrics.get("model_name", "CognitiveCare Difficulty Recommender"),
            algorithm=self.metrics.get("algorithm", "RandomForestClassifier"),
            accuracy=self.metrics.get("accuracy", 0.754),
            macro_f1=self.metrics.get("macro_f1", 0.7491),
            baseline_accuracy=self.metrics.get("baseline_accuracy", 0.704),
            baseline_macro_f1=self.metrics.get("baseline_macro_f1", 0.6885),
            feature_names=self.metrics.get("feature_names", [
                "game_type", "previous_difficulty", "accuracy_percentage",
                "avg_response_time_seconds", "hints_used", "recent_performance"
            ]),
            target_classes=self.metrics.get("target_classes", ["easy", "hard", "medium"]),
            is_loaded=self.model is not None,
            disclaimer=(
                "CognitiveCare recommendations adapt game settings for user comfort. "
                "Never use these outputs to assess disease progression or replace medical advice."
            )
        )


# Singleton instance for application use
predictor = DifficultyPredictor()
