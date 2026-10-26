import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import settings
from app.ml.baseline import RuleBasedBaselineClassifier


def train_and_evaluate_model():
    """
    Trains a Random Forest difficulty recommendation pipeline using Scikit-learn,
    evaluates against held-out test data and a rule-based baseline, and saves the
    serialized pipeline artifact using Joblib.
    """
    print("=" * 70)
    print("CognitiveCare - Machine Learning Difficulty Adaptation Pipeline")
    print("=" * 70)

    dataset_path = os.path.join(os.path.dirname(__file__), "..", settings.DATASET_PATH)
    if not os.path.exists(dataset_path):
        print(f"[TRAIN ERROR] Dataset not found at: {dataset_path}")
        print("Please run `python scripts/generate_synthetic_data.py` first.")
        sys.exit(1)

    print(f"[TRAIN] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"[TRAIN] Total samples: {len(df)}")

    # Feature definitions
    categorical_features = ["game_type", "previous_difficulty"]
    numerical_features = [
        "accuracy_percentage",
        "avg_response_time_seconds",
        "hints_used",
        "recent_performance"
    ]
    target_column = "recommended_difficulty"

    X = df[categorical_features + numerical_features]
    y = df[target_column]

    # Split train and evaluation data (80% train, 20% test, stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"[TRAIN] Training set size: {len(X_train)}, Test set size: {len(X_test)}")

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", StandardScaler(), numerical_features)
        ]
    )

    # Full Model Pipeline
    rf_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=100,
                    max_depth=8,
                    min_samples_split=4,
                    min_samples_leaf=2,
                    class_weight="balanced",
                    random_state=42
                )
            )
        ]
    )

    print("\n[TRAIN] Fitting Random Forest Classifier Pipeline...")
    rf_pipeline.fit(X_train, y_train)
    print("[TRAIN SUCCESS] Model trained successfully.")

    # Predictions & Evaluation on Test Set
    y_pred_rf = rf_pipeline.predict(X_test)
    rf_accuracy = float(accuracy_score(y_test, y_pred_rf))
    rf_macro_f1 = float(f1_score(y_test, y_pred_rf, average="macro"))

    # Baseline Comparator
    baseline = RuleBasedBaselineClassifier()
    y_pred_baseline = baseline.predict(X_test)
    base_accuracy = float(accuracy_score(y_test, y_pred_baseline))
    base_macro_f1 = float(f1_score(y_test, y_pred_baseline, average="macro"))

    # Reports
    print("\n" + "=" * 50)
    print("EVALUATION & BASELINE COMPARISON REPORT")
    print("=" * 50)
    print(f"Random Forest Classifier Accuracy : {rf_accuracy * 100:.2f}%")
    print(f"Random Forest Classifier Macro F1 : {rf_macro_f1:.4f}")
    print(f"Rule-Based Baseline Accuracy      : {base_accuracy * 100:.2f}%")
    print(f"Rule-Based Baseline Macro F1      : {base_macro_f1:.4f}")

    labels = sorted(list(y.unique()))
    print("\n--- Random Forest Classification Report ---")
    print(classification_report(y_test, y_pred_rf, digits=4))

    print("--- Confusion Matrix (Labels: " + ", ".join(labels) + ") ---")
    conf_matrix = confusion_matrix(y_test, y_pred_rf, labels=labels)
    print(conf_matrix)

    # Save artifacts
    model_save_path = os.path.join(
        os.path.dirname(__file__), "..", settings.MODEL_PATH
    )
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(rf_pipeline, model_save_path)
    print(f"\n[ARTIFACT] Serialized model pipeline saved to: {os.path.abspath(model_save_path)}")

    # Save metrics JSON
    metrics_path = os.path.join(os.path.dirname(model_save_path), "model_metrics.json")
    metrics_payload = {
        "model_name": "CognitiveCare Difficulty Adaptation Recommender",
        "algorithm": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 8,
        "accuracy": round(rf_accuracy, 4),
        "macro_f1": round(rf_macro_f1, 4),
        "baseline_accuracy": round(base_accuracy, 4),
        "baseline_macro_f1": round(base_macro_f1, 4),
        "feature_names": categorical_features + numerical_features,
        "target_classes": labels,
        "confusion_matrix": conf_matrix.tolist(),
        "disclaimer": (
            "CognitiveCare difficulty recommendations are for adaptive cognitive exercise comfort only. "
            "They do not constitute medical diagnoses, clinical staging, or treatment recommendations."
        )
    }
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"[ARTIFACT] Evaluation metrics summary saved to: {os.path.abspath(metrics_path)}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    train_and_evaluate_model()
