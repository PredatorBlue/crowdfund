# System Architecture: Trust-Aware Decentralized Crowdfunding

Trust-Aware Decentralized Crowdfunding is a milestone-governed capital formation platform that coordinates smart contract escrows with off-chain machine learning risk classifiers, timeline predictors, and on-chain creator reputation registries.

---

## 1. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|   React 18 + Vite + Tailwind CSS + Ethers.js                                    |
|   - Campaign Discovery & Filter by Risk Tier                                    |
|   - Milestone Tranche Voting UI (Quorum & Threshold Meters)                    |
|   - Planned vs. Predicted Cumulative Progress Charts                            |
|   - Creator On-Chain Reputation Profile & Trust Scores                          |
+------------------------+------------------------------------+-------------------+
                         |                                    |
                         | Transactions & Views               | REST API
                         v                                    v
+------------------------------------+   +----------------------------------------+
|       SMART CONTRACT LAYER         |   |          AI / ML SERVICE               |
|       (Solidity 0.8.24)            |   |          (Python + FastAPI)            |
|                                    |   |                                        |
|  1. CampaignFactory.sol            |   |  1. Gradient Boosting Risk Scorer      |
|     - Deploys Escrow + Voting pair |   |     (Creator history, specificity,     |
|     - Authorizes Escrow in Reg.    |   |      wallet metrics, velocity, backer) |
|                                    |   |                                        |
|  2. MilestoneEscrow.sol            |   |  2. Random Forest Timeline Predictor   |
|     - Holds funds in tranches      |   |     (Complexity, pace, blockers,       |
|     - Pro-rata refund mechanism    |   |      emits >12% drift alert)           |
|     - ReentrancyGuard              |   |                                        |
|                                    |   |  3. Synthetic Campaign Generator       |
|  3. VotingModule.sol               |   |     (1,500+ realistic noise samples)   |
|     - 40% Pledged Capital Quorum   |   +-------------------+--------------------+
|     - 66% Approval Supermajority   |                       |
|     - 5-Day Voting Window          |                       | Queries & Forecasts
|                                    |                       v
|  4. ReputationRegistry.sol         |   +----------------------------------------+
|     - Append-only outcome ledger   |   |            ORACLE LAYER                |
|     - Dynamic trust score (0.0-5.0)|<--+   |            (Node.js Bridge)            |
|     - Bronze/Silver/Gold tiers     |   |                                        |
+------------------------------------+   |  - Listens to CampaignCreated events   |
                                         |  - Calls AI endpoints                  |
                                         |  - Signs & submits submitRiskScore()   |
                                         +----------------------------------------+
```

---

## 2. Layer Specifications

### 2.1 Smart Contract Layer (`/contracts`)
- **`CampaignFactory.sol`**: Responsible for the deterministic deployment and wiring of each campaign's `MilestoneEscrow` and `VotingModule`. Whitelists newly deployed escrows in the central `ReputationRegistry`.
- **`MilestoneEscrow.sol`**: Custodies pledged ETH in basis-point tranches (e.g. 30%, 40%, 30%). Only the linked `VotingModule` can trigger `releaseMilestone()` to the creator or `markMilestoneFailed()`. If a milestone vote fails or times out without quorum/threshold, backers can invoke `claimRefund()` for their exact pro-rata tranche share.
- **`VotingModule.sol`**: Implements capital-weighted governance where 1 ETH pledged = 1 unit of vote weight. Requires a minimum **40% quorum of total pledged capital** and a **66% approval threshold of cast votes** within a 5-day window.
- **`ReputationRegistry.sol`**: Central append-only ledger that tracks historical milestone outcomes (`OnTime`, `Late`, `FailedVote`, `Dispute`). Calculates trust scores scaled from 1.0 to 5.0 and maps creators to **Bronze (<3.5)**, **Silver (3.5–4.5)**, and **Gold (>4.5)** tiers.

### 2.2 AI / ML Service (`/ai-service`)
- **Risk Classifier**: Gradient Boosting Regressor and Classifier predicting prospective campaign failure/default risk (0 to 100). Trained on 6 core engineered signals:
  1. Creator past milestone completion rate (30% weight)
  2. Milestone description specificity heuristic (20% weight)
  3. Wallet on-chain age (10% weight)
  4. Wallet transaction activity (10% weight)
  5. Funding velocity vs. category baseline (15% weight)
  6. Backer update sentiment & engagement (15% weight)
- **Timeline Regressor**: Random Forest Regressor predicting the true expected delivery duration based on task complexity (1–10), historical creator pace multiplier, and backer-reported blockers. Emits an automated **Drift Alert** when predicted duration trails planned schedule by $>12\%$.

### 2.3 Oracle Bridge Layer (`/oracle`)
- Serves as an event bridge between the off-chain Python inference models and EVM smart contracts.
- Polls or listens to `CampaignCreated` and `ProofSubmitted` events, requests inference from the FastAPI service, and executes signed transactions to `escrow.submitRiskScore(score, driftAlert)`.

### 2.4 Client dApp Layer (`/client`)
- Modern React 18 interface with responsive Tailwind CSS components, Lucide icons, and Recharts interactive progress curves.
- Integrates MetaMask/injected Web3 providers alongside comprehensive mock fallbacks for standalone presentations.
