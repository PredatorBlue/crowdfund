# Architecture Decision Record (ADR-001)

## Title: Off-Chain ML Model Computation with Cryptographically Signed Oracle Updates

- **Status**: Accepted
- **Date**: 2026-08-30

---

## Context
Running machine learning inference (such as Gradient Boosting decision trees, Random Forests, or NLP heuristics) directly inside Ethereum Virtual Machine (EVM) smart contracts is prohibitively expensive in terms of gas and constrained by EVM compute limits. However, on-chain smart contracts require verified risk scores and timeline drift flags to govern milestones and inform backers before capital release.

---

## Decision
We adopt a decoupled **Off-Chain AI + On-Chain Oracle Bridge** pattern:
1. All intensive ML training and inference are executed in a Python microservice (`/ai-service`) running FastAPI and scikit-learn.
2. The Node.js Oracle bridge (`/oracle`) subscribes to on-chain lifecycle events (`CampaignCreated`, `ProofSubmitted`).
3. The Oracle queries the AI microservice for risk evaluation and signs an on-chain transaction calling `MilestoneEscrow.submitRiskScore(uint8 score, bool driftAlert)`.
4. Only designated Oracle wallets are authorized to call `submitRiskScore`.

---

## Consequences
- **Gas Efficiency**: Zero ML inference math on-chain; gas cost per campaign creation and milestone update is reduced by >98%.
- **Separation of Concerns**: Smart contracts strictly handle funds custody, vote counting, and pro-rata refunds.
- **Upgradability**: ML models can be retrained and calibrated monthly without requiring smart contract migrations or breaking changes.
