# Trust-Aware Decentralized Crowdfunding Platform

A milestone-governed Web3 crowdfunding platform that protects contributor capital through **smart contract escrows**, **AI risk scoring**, **ML timeline prediction**, and **on-chain creator reputation registries**.

---

## 🌟 Key Highlights

- **Milestone-Based Escrow Tranches**: Capital is held on-chain in `MilestoneEscrow.sol` and released only when milestones pass backer voting.
- **Pledge-Weighted Governance**: Contributor voting weight is directly proportional to pledged capital. Strict enforcement of **40% Quorum** and **66% Supermajority Threshold** (`VotingModule.sol`).
- **Pro-Rata Backer Refunds**: If a milestone is rejected by backers or expires without quorum, contributors claim pro-rata refunds for that tranche.
- **On-Chain Reputation Registry**: Tracks on-time vs late deliveries and failed votes, computing dynamic trust scores mapped to **Bronze (<3.5)**, **Silver (3.5–4.5)**, and **Gold (>4.5)** tiers (`ReputationRegistry.sol`).
- **AI Risk Classifier & Timeline Predictor**: Gradient Boosting model ($>95\%$ accuracy) evaluating multi-signal risk, paired with a Random Forest timeline regressor emitting automated **Drift Alerts** ($>12\%$ delay).
- **Oracle Event Bridge**: Node.js service synchronizing off-chain AI inference results with on-chain escrow contracts.
- **Modern React + Vite dApp**: Interactive charts, wallet connectivity, real-time voting progress meters, and AI risk simulators.

---

## 📁 Repository Structure

```
dltproj/
├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── contracts/      # ReputationRegistry, MilestoneEscrow, VotingModule, CampaignFactory
│   ├── test/           # Comprehensive Mocha/Chai test suite (15 passing tests)
│   └── scripts/        # Deployment and seed scripts
├── ai-service/         # Python ML Microservice (FastAPI + Scikit-learn)
│   ├── scripts/        # Synthetic campaign generator (1,500+ samples)
│   ├── model/          # Model training pipeline (GBR + RF)
│   └── main.py         # REST API endpoints (/risk-score, /predict-timeline, /retrain)
├── oracle/             # Node.js event bridge (Ethers.js)
│   ├── src/            # OracleService listener and on-chain score submitter
│   └── index.js        # Oracle background daemon
├── client/             # React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts dApp
├── docs/               # Architecture specifications and ADRs
└── shared/             # Deployment addresses and shared artifacts
```

---

## 🚀 Quickstart Guide

### 1. Smart Contracts (`/contracts`)

```bash
cd contracts
npm install
npx hardhat test
```

To run a local node and deploy:
```bash
# Terminal 1: Start local Hardhat EVM node
npx hardhat node

# Terminal 2: Deploy & seed contracts
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/seed.js --network localhost
```

---

### 2. AI / ML Service (`/ai-service`)

```bash
cd ai-service
pip install -r requirements.txt

# Train models and generate synthetic data:
python model/train.py

# Start FastAPI server (runs on http://127.0.0.1:8000):
python -m uvicorn main:app --port 8000 --reload
```

---

### 3. Oracle Bridge (`/oracle`)

```bash
cd oracle
npm install

# Start Oracle listener daemon:
npm start
```

---

### 4. Client dApp (`/client`)

```bash
cd client
npm install

# Start Vite dev server (runs on http://localhost:5173):
npm run dev
```

---

## 📊 Evaluation & Machine Learning Metrics

| Model | Algorithm | Primary Metric | Holdout Evaluation |
| :--- | :--- | :--- | :--- |
| **Risk Scorer & Classifier** | Gradient Boosting Regressor | Classification Accuracy / MAE | **95.00% Accuracy**, **3.17 MAE**, **0.948 F1** |
| **Timeline Predictor** | Random Forest Regressor | Mean Absolute Error (MAE) | **4.81 days MAE**, **0.947 $R^2$** |

---

## 📄 Architecture Decisions & Docs

- [System Architecture](docs/architecture.md)
- [ADR-001: Off-Chain AI & Oracle Pattern](docs/ADR-001-offchain-ai-oracle-pattern.md)
- [ADR-002: Milestone Escrow & Governance](docs/ADR-002-milestone-escrow-quorum-governance.md)
