"""
Synthetic Campaign Data Generator for Trust-Aware Decentralized Crowdfunding.
Generates realistic multi-signal campaign data for training:
1. GradientBoosted Risk Classifier
2. RandomForest Timeline Regressor
"""

import os
import random
import numpy as np
import pandas as pd

def generate_synthetic_data(num_samples: int = 1500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    categories = [
        "Artificial Intelligence",
        "CleanTech / DePIN",
        "DeFi / Smart Contracts",
        "Zero Knowledge Proofs",
        "Open Source Hardware",
        "Gaming / Metaverse"
    ]

    for i in range(num_samples):
        # 1. Creator Profile Features
        # Creator completion rate (30% weight)
        is_reliable = np.random.rand() > 0.35
        if is_reliable:
            creator_completion_rate = float(np.clip(np.random.beta(8, 2), 0.5, 1.0))
            wallet_age_days = int(np.random.randint(180, 1800))
            wallet_tx_count = int(np.random.randint(50, 2500))
        else:
            creator_completion_rate = float(np.clip(np.random.beta(2, 5), 0.0, 0.65))
            wallet_age_days = int(np.random.randint(5, 150))
            wallet_tx_count = int(np.random.randint(2, 60))

        # 2. Milestone Description & Specificity (20% weight)
        milestone_length_words = int(np.random.randint(15, 300))
        has_quantifiables = int(np.random.rand() > 0.3)
        has_clear_dates = int(np.random.rand() > 0.25)
        # Specificity heuristic score (0.0 to 1.0)
        base_spec = min(1.0, milestone_length_words / 150.0) * 0.5 + (has_quantifiables * 0.25) + (has_clear_dates * 0.25)
        milestone_specificity_score = float(np.clip(base_spec + np.random.normal(0, 0.05), 0.05, 1.0))

        # 3. Market Velocity & Backer Engagement (15% + 15% weights)
        funding_velocity_ratio = float(np.clip(np.random.lognormal(0.0, 0.4), 0.2, 3.5))
        backer_sentiment_score = float(np.clip(
            (0.5 * creator_completion_rate) + (0.3 * milestone_specificity_score) + np.random.normal(0.1, 0.15),
            0.05, 0.98
        ))

        # 4. Milestone Timeline & Complexity Variables
        planned_duration_days = int(np.random.randint(10, 90))
        task_complexity = int(np.random.randint(1, 11)) # 1 to 10
        creator_pace_factor = float(np.clip(
            (0.8 + 0.4 * creator_completion_rate) + np.random.normal(0, 0.1),
            0.5, 1.5
        ))
        backer_blockers_count = int(np.random.poisson(lam=0.8 if is_reliable else 2.2))

        # Actual duration calculation with delay drift
        complexity_delay_pct = (task_complexity - 5) * 0.04
        blocker_delay_days = backer_blockers_count * np.random.uniform(2.0, 6.0)
        pace_multiplier = 1.0 / creator_pace_factor

        noise_days = np.random.normal(0, 2.5)
        actual_duration_days = max(
            5.0,
            (planned_duration_days * pace_multiplier * (1.0 + complexity_delay_pct)) + blocker_delay_days + noise_days
        )

        drift_days = actual_duration_days - planned_duration_days
        drift_percentage = (drift_days / planned_duration_days) * 100.0
        drift_alert = bool(drift_percentage > 12.0)

        # 5. Risk Score Ground Truth Calculation (0 - 100)
        risk_from_completion = (1.0 - creator_completion_rate) * 30.0
        risk_from_spec = (1.0 - milestone_specificity_score) * 20.0
        risk_from_wallet_age = max(0.0, 1.0 - (wallet_age_days / 365.0)) * 10.0
        risk_from_wallet_tx = max(0.0, 1.0 - (wallet_tx_count / 200.0)) * 10.0
        risk_from_velocity = max(0.0, 1.0 - (funding_velocity_ratio / 1.5)) * 15.0
        risk_from_sentiment = (1.0 - backer_sentiment_score) * 15.0

        raw_risk = (
            risk_from_completion
            + risk_from_spec
            + risk_from_wallet_age
            + risk_from_wallet_tx
            + risk_from_velocity
            + risk_from_sentiment
            + np.random.normal(0, 3.5)
        )
        target_risk_score = float(np.clip(raw_risk, 0.0, 100.0))

        if target_risk_score < 35.0:
            risk_tier = "LOW"
            risk_class = 0
        elif target_risk_score <= 65.0:
            risk_tier = "MEDIUM"
            risk_class = 1
        else:
            risk_tier = "HIGH"
            risk_class = 2

        records.append({
            "campaign_id": f"CAMP-{i+1:04d}",
            "category": random.choice(categories),
            "creator_completion_rate": round(creator_completion_rate, 4),
            "milestone_specificity_score": round(milestone_specificity_score, 4),
            "wallet_age_days": wallet_age_days,
            "wallet_tx_count": wallet_tx_count,
            "funding_velocity_ratio": round(funding_velocity_ratio, 4),
            "backer_sentiment_score": round(backer_sentiment_score, 4),
            "task_complexity": task_complexity,
            "creator_pace_factor": round(creator_pace_factor, 4),
            "backer_blockers_count": backer_blockers_count,
            "planned_duration_days": planned_duration_days,
            "actual_duration_days": round(actual_duration_days, 2),
            "drift_days": round(drift_days, 2),
            "drift_percentage": round(drift_percentage, 2),
            "drift_alert": drift_alert,
            "target_risk_score": round(target_risk_score, 2),
            "risk_class": risk_class,
            "risk_tier": risk_tier
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "../data")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "synthetic_campaigns.csv")

    df = generate_synthetic_data(num_samples=1500)
    df.to_csv(out_file, index=False)
    print(f"[+] Successfully generated {len(df)} synthetic campaigns to {out_file}")
    print(f"Risk Tier Distribution:\n{df['risk_tier'].value_counts(normalize=True).round(3)}")
    print(f"Drift Alert Frequency: {df['drift_alert'].mean() * 100:.1f}%")
