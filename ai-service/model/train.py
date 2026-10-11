"""
Model training pipeline for Trust-Aware Decentralized Crowdfunding.
Trains:
1. Gradient Boosting Risk Scorer & Classifier
2. Random Forest Timeline Regressor
Evaluates on a 20% holdout set and saves model artifacts.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, f1_score

# Add parent directory to path to import generator
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from scripts.generate_synthetic_campaigns import generate_synthetic_data

def train_and_evaluate():
    print("=========================================================")
    print("Starting ML Pipeline Training: Risk & Timeline Models")
    print("=========================================================")

    data_dir = os.path.join(os.path.dirname(__file__), "../data")
    models_dir = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    csv_path = os.path.join(data_dir, "synthetic_campaigns.csv")
    if not os.path.exists(csv_path):
        print("Generating synthetic training data...")
        df = generate_synthetic_data(num_samples=1500)
        df.to_csv(csv_path, index=False)
    else:
        df = pd.read_csv(csv_path)

    # ==========================================
    # 1. RISK MODEL (Gradient Boosting)
    # ==========================================
    risk_features = [
        "creator_completion_rate",
        "milestone_specificity_score",
        "wallet_age_days",
        "wallet_tx_count",
        "funding_velocity_ratio",
        "backer_sentiment_score"
    ]

    X_risk = df[risk_features]
    y_risk_score = df["target_risk_score"]
    y_risk_class = df["risk_class"]

    X_train_r, X_test_r, y_train_score, y_test_score, y_train_cls, y_test_cls = train_test_split(
        X_risk, y_risk_score, y_risk_class, test_size=0.20, random_state=42
    )

    print("\n--- Training Gradient Boosting Risk Regressor ---")
    risk_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("gbr", GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=4,
            random_state=42
        ))
    ])
    risk_pipeline.fit(X_train_r, y_train_score)

    y_pred_score = risk_pipeline.predict(X_test_r)
    risk_mae = mean_absolute_error(y_test_score, y_pred_score)
    risk_r2 = r2_score(y_test_score, y_pred_score)

    # Classify predictions into tiers: 0: Low (<35), 1: Med (35-65), 2: High (>65)
    def map_to_class(scores):
        classes = []
        for s in scores:
            if s < 35.0:
                classes.append(0)
            elif s <= 65.0:
                classes.append(1)
            else:
                classes.append(2)
        return np.array(classes)

    y_pred_cls = map_to_class(y_pred_score)
    risk_acc = accuracy_score(y_test_cls, y_pred_cls)
    risk_f1 = f1_score(y_test_cls, y_pred_cls, average="weighted")

    print(f"[+] Risk Model MAE: {risk_mae:.2f} / 100")
    print(f"[+] Risk Model R^2: {risk_r2:.4f}")
    print(f"[+] Risk Tier Classification Accuracy: {risk_acc * 100:.2f}%")
    print(f"[+] Risk Tier Weighted F1-Score: {risk_f1:.4f}")

    # Feature Importance Breakdown
    gbr_model = risk_pipeline.named_steps["gbr"]
    importances = dict(zip(risk_features, gbr_model.feature_importances_))
    print("\nEngineered Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {feat:30s}: {imp * 100:.2f}%")

    # ==========================================
    # 2. TIMELINE MODEL (Random Forest)
    # ==========================================
    timeline_features = [
        "planned_duration_days",
        "task_complexity",
        "creator_pace_factor",
        "backer_blockers_count"
    ]

    X_time = df[timeline_features]
    y_time = df["actual_duration_days"]

    X_train_t, X_test_t, y_train_t, y_test_t = train_test_split(
        X_time, y_time, test_size=0.20, random_state=42
    )

    print("\n--- Training Random Forest Timeline Predictor ---")
    timeline_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestRegressor(
            n_estimators=150,
            max_depth=6,
            random_state=42
        ))
    ])
    timeline_pipeline.fit(X_train_t, y_train_t)

    y_pred_time = timeline_pipeline.predict(X_test_t)
    time_mae = mean_absolute_error(y_test_t, y_pred_time)
    time_rmse = np.sqrt(mean_squared_error(y_test_t, y_pred_time))
    time_r2 = r2_score(y_test_t, y_pred_time)

    print(f"[+] Timeline Predictor MAE: {time_mae:.2f} days")
    print(f"[+] Timeline Predictor RMSE: {time_rmse:.2f} days")
    print(f"[+] Timeline Predictor R^2: {time_r2:.4f}")

    # Save artifacts
    risk_model_file = os.path.join(models_dir, "risk_model.joblib")
    timeline_model_file = os.path.join(models_dir, "timeline_model.joblib")

    joblib.dump({
        "pipeline": risk_pipeline,
        "features": risk_features,
        "importances": importances,
        "metrics": {"mae": risk_mae, "accuracy": risk_acc, "f1": risk_f1}
    }, risk_model_file)

    joblib.dump({
        "pipeline": timeline_pipeline,
        "features": timeline_features,
        "metrics": {"mae": time_mae, "rmse": time_rmse, "r2": time_r2}
    }, timeline_model_file)

    print(f"\n[+] Saved Risk Model to {risk_model_file}")
    print(f"[+] Saved Timeline Model to {timeline_model_file}")
    print("=========================================================")

if __name__ == "__main__":
    train_and_evaluate()
