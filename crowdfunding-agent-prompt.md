# Build Prompt: Trust-Aware Decentralized Crowdfunding Platform

Paste this into your AI coding agent (Claude Code, Cursor, etc.) as the initial task prompt. Adjust the `<PROJECT_ROOT>` and any stack preferences before running.

---

## Prompt

You are building **"Trust-Aware Decentralized Crowdfunding"** — a milestone-based crowdfunding platform that governs fund release through AI risk scoring, ML-based timeline prediction, and on-chain reputation, instead of releasing all funds upfront.

Build this as a monorepo with four layers. Work incrementally: scaffold each layer, get it running end-to-end with mock data first, then wire the layers together.

### 0. Repo structure

```
/contracts      - Solidity smart contracts (Hardhat)
/ai-service     - Python ML service (risk scoring + timeline prediction)
/oracle         - Node.js bridge between ai-service and contracts
/client         - React + Ethers.js dApp
/docs           - architecture notes, ADRs
```

### 1. Smart Contract Layer (`/contracts`, Solidity + Hardhat)

Implement four contracts with clean separation of concerns — no contract should read another's storage directly except through explicit calls:

- **`CampaignFactory.sol`**
  - `createCampaign(uint256 goal, Milestone[] milestones)` — deploys a new `MilestoneEscrow` + `VotingModule` pair per campaign, stores campaign metadata (creator address, goal, milestone count, IPFS metadata hash).
- **`MilestoneEscrow.sol`**
  - Holds pledged funds in per-milestone tranches.
  - `pledge()` payable, tracks contributor amounts for vote-weighting.
  - `releaseMilestone(uint256 id)` — callable only by `VotingModule` after a passed vote; transfers that milestone's tranche to the creator.
  - Failed milestone vote triggers a pro-rata refund path for that tranche.
  - Include reentrancy guards (OpenZeppelin `ReentrancyGuard`) and checks-effects-interactions ordering.
- **`VotingModule.sol`**
  - `castVote(uint256 campaignId, uint256 milestoneId, bool approve)` — vote weight = contributor's pledge amount.
  - Enforce: 5-day voting window, 40% of pledged capital as quorum, 66% approval threshold of votes cast.
  - On quorum+threshold met, calls `MilestoneEscrow.releaseMilestone`.
- **`ReputationRegistry.sol`**
  - `updateReputation(address creator, Outcome outcome)` — append-only ledger updated automatically after every milestone outcome (on-time delivery, late delivery, failed vote).
  - Exposes a view function returning a computed trust score (e.g. weighted: on-time rate, campaigns fully delivered, avg backer approval, disputes) mapped to Bronze (<3.5) / Silver (3.5–4.5) / Gold (>4.5) tiers.

Target an Ethereum-compatible testnet (Sepolia). Use OpenZeppelin contracts where applicable. Write Hardhat + Mocha/Chai tests covering create → pledge → vote → release and the refund path. Run **Slither** and fix findings before considering the layer done. Target ~90%+ statement coverage on the core paths.

### 2. AI / Off-chain Layer (`/ai-service`, Python + scikit-learn)

Two models, served via a small FastAPI (or Flask) service:

- **Risk classifier** (gradient-boosted, e.g. `GradientBoostingClassifier` or `xgboost`): outputs a 0–100 risk score from these weighted signals (use these as engineered features, don't hardcode the weights into the model — let it learn, but validate against this prior):
  - Creator's past campaign completion rate (~30%)
  - Milestone description specificity/feasibility (~20%) — start with a simple heuristic (length, presence of dates/quantities) since NLP feasibility scoring is a stretch goal
  - Wallet-level on-chain history: age, tx activity (~20%)
  - Funding velocity vs. category baseline (~15%)
  - Backer sentiment from update engagement, e.g. comment/upvote rate (~15%)
  - Re-score after every backer update or milestone submission.
- **Timeline predictor** (regression, e.g. `RandomForestRegressor` or linear baseline): forecasts each milestone's completion date from:
  - Milestone submission timestamps
  - Historical creator delivery pace
  - Task-complexity weighting per milestone
  - Backer-reported blockers
  - Emit a "drift alert" when predicted completion trails planned by a meaningful margin (e.g. >10–15%).
- Since there's no real dataset yet: build a **synthetic data generator** (`scripts/generate_synthetic_campaigns.py`) that produces plausible campaign/milestone/creator-history data with realistic noise, so both models can be trained and evaluated end-to-end before real data exists. Hold out 20% for evaluation; report accuracy/F1 for the classifier and MAE for the regressor. Set up a monthly retrain job stub (can be a manually-triggered script for now).
- Expose two endpoints: `POST /risk-score` and `POST /predict-timeline`.

### 3. Oracle Layer (`/oracle`, Node.js)

A bridge service that:
- Polls or is webhook-triggered by campaign/milestone events (new campaign created, backer update posted, milestone submitted).
- Calls the AI service for a fresh score/prediction.
- Writes only the resulting score/vote-relevant data on-chain (keep heavy computation and data off-chain to minimize gas — this is a deliberate cost tradeoff, not an oversight).
- Use `ethers.js` to sign and submit transactions via a designated oracle wallet with a restricted on-chain role (e.g. only the oracle address can call a `submitRiskScore` setter).

### 4. Client Layer (`/client`, React + Ethers.js)

- Wallet connection (MetaMask) tied to the on-chain reputation registry for identity.
- Campaign creation flow (goal, milestone list with descriptions/dates).
- Campaign detail page: live risk score badge, timeline chart (planned vs. predicted, mirror the "Cumulative Progress" chart from the deck), drift alert banner.
- Milestone voting UI: shows quorum/threshold progress, backer's own vote weight, time remaining in voting window.
- Creator reputation card: trust score, tier badge (Bronze/Silver/Gold), on-time rate, campaigns delivered, disputes.
- Milestone proof upload → pin to IPFS (e.g. via `web3.storage` or a local IPFS node for dev), store the resulting CID on-chain.

### 5. Sequencing (do this in order, confirm each step works before moving on)

1. Scaffold Hardhat project, write and test `CampaignFactory` + `MilestoneEscrow` with pledge/refund logic only (no voting yet). Get this fully tested on a local Hardhat network.
2. Add `VotingModule`, wire it to `MilestoneEscrow.releaseMilestone`. Test the full pledge → vote → release/refund cycle.
3. Add `ReputationRegistry`, hook `updateReputation` calls into milestone outcomes.
4. Build the synthetic data generator, then the two ML models in `ai-service`, evaluate offline.
5. Build the oracle bridge, deploy contracts to Sepolia testnet, connect oracle to live contract addresses.
6. Build the React client against the deployed testnet contracts + running ai-service.
7. Run Slither on final contracts, fix any findings, write up gas costs per milestone release.

### Constraints and conventions

- Prefer readability and test coverage over cleverness — this needs to hold up under scrutiny.
- Every on-chain state-changing function needs a corresponding Hardhat test for both success and failure paths.
- Don't put any AI computation on-chain — only scores/votes/proof hashes touch the chain.
- Comment non-obvious game-theoretic bits (quorum math, vote-weighting) since this is likely to be read/reviewed later.

Ask me before making assumptions about: which chain fork/RPC provider to target, how much time to spend on the NLP feasibility heuristic vs. stubbing it, and whether to include a dispute-resolution/arbitration stub now or leave it as future scope.
