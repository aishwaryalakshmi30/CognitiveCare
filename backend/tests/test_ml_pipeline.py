import os
import pytest
import pandas as pd
from app.ml.baseline import rule_based_recommend, RuleBasedBaselineClassifier
from app.ml.predictor import DifficultyPredictor
from app.schemas.ml import DifficultyPredictionRequest


@pytest.fixture
def predictor_instance():
    return DifficultyPredictor()


def test_dataset_exists_and_valid():
    dataset_path = os.path.join(
        os.path.dirname(__file__), "..", "data", "cognitive_game_sessions.csv"
    )
    assert os.path.exists(dataset_path), "Synthetic dataset CSV must exist."
    
    df = pd.read_csv(dataset_path)
    assert len(df) >= 1000, "Dataset should have at least 1,000 samples."
    
    required_cols = [
        "game_type",
        "previous_difficulty",
        "accuracy_percentage",
        "avg_response_time_seconds",
        "hints_used",
        "recent_performance",
        "recommended_difficulty"
    ]
    for col in required_cols:
        assert col in df.columns, f"Missing column: {col}"
    
    assert df["accuracy_percentage"].between(0.0, 100.0).all()
    assert df["recommended_difficulty"].isin(["easy", "medium", "hard"]).all()
    assert not df.isnull().any().any(), "Dataset should not have null values."


def test_model_artifact_loaded(predictor_instance):
    assert predictor_instance.model is not None, "Trained model pipeline should be loaded."
    info = predictor_instance.get_model_info()
    assert info.is_loaded is True
    assert info.accuracy > 0.65
    assert info.macro_f1 > 0.65
    assert info.baseline_accuracy > 0.60


def test_prediction_high_proficiency(predictor_instance):
    req = DifficultyPredictionRequest(
        game_type="picture_matching",
        previous_difficulty="easy",
        accuracy_percentage=95.0,
        avg_response_time_seconds=2.2,
        hints_used=0,
        recent_performance=92.0
    )
    res = predictor_instance.predict(req)
    assert res.recommended_difficulty in ["medium", "hard"]
    assert res.confidence >= 0.5
    assert len(res.explanation) > 10
    assert res.can_override is True
    assert "diagnostic" in res.disclaimer.lower()


def test_prediction_cognitive_fatigue(predictor_instance):
    req = DifficultyPredictionRequest(
        game_type="sequence_memory",
        previous_difficulty="hard",
        accuracy_percentage=42.0,
        avg_response_time_seconds=9.5,
        hints_used=3,
        recent_performance=45.0
    )
    res = predictor_instance.predict(req)
    assert res.recommended_difficulty in ["easy", "medium"]
    assert res.can_override is True


def test_fallback_when_model_missing():
    # Instantiate predictor with non-existent model path
    fallback_predictor = DifficultyPredictor(model_path="non_existent_model_file.joblib")
    assert fallback_predictor.model is None

    req = DifficultyPredictionRequest(
        game_type="familiar_object",
        previous_difficulty="medium",
        accuracy_percentage=88.0,
        avg_response_time_seconds=3.0,
        hints_used=0,
        recent_performance=85.0
    )
    res = fallback_predictor.predict(req)
    assert res.method_used == "rule_fallback"
    assert res.recommended_difficulty in ["medium", "hard"]
    assert "[Rule Fallback]" in res.explanation


def test_rule_based_recommend_logic():
    # Very low accuracy should step down to easy
    diff_low, expl_low = rule_based_recommend(
        "picture_matching", "medium", 35.0, 10.0, 4, 30.0
    )
    assert diff_low == "easy"
    assert "frustration-free" in expl_low

    # Very high accuracy on easy should recommend medium
    diff_high, expl_high = rule_based_recommend(
        "picture_matching", "easy", 95.0, 2.5, 0, 92.0
    )
    assert diff_high == "medium"
    assert "positive stimulation" in expl_high


def test_baseline_classifier_sklearn_interface():
    baseline = RuleBasedBaselineClassifier()
    df = pd.DataFrame([{
        "game_type": "picture_matching",
        "previous_difficulty": "easy",
        "accuracy_percentage": 90.0,
        "avg_response_time_seconds": 2.5,
        "hints_used": 0,
        "recent_performance": 90.0
    }])
    preds = baseline.predict(df)
    assert len(preds) == 1
    assert preds[0] == "medium"
