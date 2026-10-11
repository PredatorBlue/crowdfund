"""
FastAPI Microservice for Trust-Aware Decentralized Crowdfunding.
Exposes ML Risk Scoring and Timeline Drift Prediction endpoints.
"""

import os
import re
import joblib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model.train import train_and_evaluate

app = FastAPI(
    title="Trust-Aware Crowdfunding AI Service",
    description="ML-powered risk scoring and milestone timeline prediction for decentralized crowdfunding",
    version="1.0.0"
)

# Enable CORS for dApp frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
risk_model_data = None
timeline_model_data = None

def load_models():
    global risk_model_data, timeline_model_data
    risk_file = os.path.join(MODELS_DIR, "risk_model.joblib")
    timeline_file = os.path.join(MODELS_DIR, "timeline_model.joblib")

    if not os.path.exists(risk_file) or not os.path.exists(timeline_file):
        print("Model files not found. Initiating training...")
        train_and_evaluate()

    risk_model_data = joblib.load(risk_file)
    timeline_model_data = joblib.load(timeline_file)
    print("[+] Successfully loaded Risk and Timeline models into memory.")

@app.on_event("startup")
def startup_event():
    load_models()

# ==========================================
# Pydantic Request/Response Schemas
# ==========================================

class RiskScoreRequest(BaseModel):
    creator_completion_rate: float = Field(0.85, ge=0.0, le=1.0, description="Past campaign completion rate (0.0 - 1.0)")
    milestone_description: Optional[str] = Field(None, description="Raw milestone text to evaluate specificity heuristic")
    milestone_specificity_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Optional precomputed specificity (0.0 - 1.0)")
    wallet_age_days: int = Field(365, ge=0, description="Creator on-chain wallet age in days")
    wallet_tx_count: int = Field(150, ge=0, description="Creator on-chain transaction count")
    funding_velocity_ratio: float = Field(1.1, ge=0.0, description="Funding velocity vs category baseline (e.g. 1.0 = average)")
    backer_sentiment_score: float = Field(0.75, ge=0.0, le=1.0, description="Backer sentiment from update engagement (0.0 - 1.0)")

class FeatureContribution(BaseModel):
    feature: str
    weight_importance: float
    value: float
    risk_impact: str

class RiskScoreResponse(BaseModel):
    risk_score: float
    risk_score_int: int
    risk_tier: str  # LOW, MEDIUM, HIGH
    confidence: float
    specificity_score_used: float
    signals_breakdown: List[FeatureContribution]
    timestamp: str

class TimelinePredictRequest(BaseModel):
    planned_duration_days: int = Field(30, ge=1, le=365, description="Planned duration in days")
    task_complexity: int = Field(5, ge=1, le=10, description="Complexity scale from 1 (trivial) to 10 (hard)")
    creator_pace_factor: float = Field(1.0, ge=0.2, le=3.0, description="Historical creator velocity multiplier (1.0 = baseline)")
    backer_blockers_count: int = Field(0, ge=0, le=20, description="Number of unresolved backer blockers reported")
    start_date_iso: Optional[str] = Field(None, description="Optional start date ISO string")

class TimelinePredictResponse(BaseModel):
    planned_duration_days: int
    predicted_duration_days: float
    drift_days: float
    drift_percentage: float
    drift_alert: bool
    confidence_interval_days: float
    planned_completion_date: str
    predicted_completion_date: str
    timestamp: str

# ==========================================
# Specificity NLP Heuristic
# ==========================================

def compute_specificity_score(text: str) -> float:
    """
    Computes heuristic specificity from description length, presence of metrics/dates/quantities.
    """
    if not text or len(text.strip()) == 0:
        return 0.1

    words = text.split()
    word_count = len(words)
    length_score = min(1.0, word_count / 80.0) * 0.45

    # Check for quantitative indicators (numbers, percentages, version numbers)
    has_numbers = bool(re.search(r'\b\d+(\.\d+)?%?\b', text))
    has_dates = bool(re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|week|day|month|202[4-9])\b', text, re.I))
    has_deliverables = bool(re.search(r'\b(deploy|release|api|sdk|smart contract|audit|testnet|mainnet|prototype|mvp)\b', text, re.I))

    metric_score = (0.20 if has_numbers else 0.0) + (0.15 if has_dates else 0.0) + (0.20 if has_deliverables else 0.0)
    final_score = float(np.clip(length_score + metric_score, 0.05, 1.0))
    return round(final_score, 3)

# ==========================================
# Endpoints
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Trust-Aware Crowdfunding AI Service",
        "models_loaded": {
            "risk_model": risk_model_data is not None,
            "timeline_model": timeline_model_data is not None
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/risk-score", response_model=RiskScoreResponse)
def get_risk_score(req: RiskScoreRequest):
    if risk_model_data is None:
        raise HTTPException(status_code=503, detail="Risk model is not loaded")

    # Determine specificity
    if req.milestone_specificity_score is not None:
        spec_score = req.milestone_specificity_score
    elif req.milestone_description:
        spec_score = compute_specificity_score(req.milestone_description)
    else:
        spec_score = 0.5

    input_df = pd.DataFrame([{
        "creator_completion_rate": req.creator_completion_rate,
        "milestone_specificity_score": spec_score,
        "wallet_age_days": req.wallet_age_days,
        "wallet_tx_count": req.wallet_tx_count,
        "funding_velocity_ratio": req.funding_velocity_ratio,
        "backer_sentiment_score": req.backer_sentiment_score
    }])

    pipeline = risk_model_data["pipeline"]
    raw_pred = pipeline.predict(input_df)[0]
    risk_score = float(np.clip(raw_pred, 0.0, 100.0))

    if risk_score < 35.0:
        tier = "LOW"
    elif risk_score <= 65.0:
        tier = "MEDIUM"
    else:
        tier = "HIGH"

    importances = risk_model_data.get("importances", {})
    breakdown = []
    features_map = {
        "creator_completion_rate": (req.creator_completion_rate, "Reduces Risk" if req.creator_completion_rate > 0.75 else "Increases Risk"),
        "milestone_specificity_score": (spec_score, "Reduces Risk" if spec_score > 0.6 else "Increases Risk"),
        "wallet_age_days": (float(req.wallet_age_days), "Reduces Risk" if req.wallet_age_days > 180 else "Increases Risk"),
        "wallet_tx_count": (float(req.wallet_tx_count), "Reduces Risk" if req.wallet_tx_count > 50 else "Increases Risk"),
        "funding_velocity_ratio": (req.funding_velocity_ratio, "Reduces Risk" if req.funding_velocity_ratio > 0.9 else "Increases Risk"),
        "backer_sentiment_score": (req.backer_sentiment_score, "Reduces Risk" if req.backer_sentiment_score > 0.65 else "Increases Risk"),
    }

    for feat, (val, impact) in features_map.items():
        imp = importances.get(feat, 0.16)
        breakdown.append(FeatureContribution(
            feature=feat,
            weight_importance=round(float(imp), 4),
            value=round(val, 2),
            risk_impact=impact
        ))

    return RiskScoreResponse(
        risk_score=round(risk_score, 2),
        risk_score_int=int(round(risk_score)),
        risk_tier=tier,
        confidence=0.92,
        specificity_score_used=spec_score,
        signals_breakdown=breakdown,
        timestamp=datetime.utcnow().isoformat()
    )

@app.post("/predict-timeline", response_model=TimelinePredictResponse)
def predict_timeline(req: TimelinePredictRequest):
    if timeline_model_data is None:
        raise HTTPException(status_code=503, detail="Timeline model is not loaded")

    input_df = pd.DataFrame([{
        "planned_duration_days": req.planned_duration_days,
        "task_complexity": req.task_complexity,
        "creator_pace_factor": req.creator_pace_factor,
        "backer_blockers_count": req.backer_blockers_count
    }])

    pipeline = timeline_model_data["pipeline"]
    predicted_duration = float(pipeline.predict(input_df)[0])
    predicted_duration = max(1.0, round(predicted_duration, 1))

    drift_days = round(predicted_duration - req.planned_duration_days, 1)
    drift_percentage = round((drift_days / req.planned_duration_days) * 100.0, 1)
    drift_alert = bool(drift_percentage > 12.0)

    # Dates calculation
    if req.start_date_iso:
        try:
            start_dt = datetime.fromisoformat(req.start_date_iso.replace("Z", "+00:00"))
        except Exception:
            start_dt = datetime.utcnow()
    else:
        start_dt = datetime.utcnow()

    planned_comp = start_dt + timedelta(days=req.planned_duration_days)
    predicted_comp = start_dt + timedelta(days=predicted_duration)

    return TimelinePredictResponse(
        planned_duration_days=req.planned_duration_days,
        predicted_duration_days=predicted_duration,
        drift_days=drift_days,
        drift_percentage=drift_percentage,
        drift_alert=drift_alert,
        confidence_interval_days=2.5,
        planned_completion_date=planned_comp.isoformat(),
        predicted_completion_date=predicted_comp.isoformat(),
        timestamp=datetime.utcnow().isoformat()
    )

@app.post("/retrain")
def retrain():
    train_and_evaluate()
    load_models()
    return {"status": "success", "message": "Models successfully retrained and reloaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
