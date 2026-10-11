# Architecture Decision Record (ADR-002)

## Title: Milestone-Based Capital Escrow, 40% Quorum, 66% Supermajority Threshold, and Pro-Rata Refunds

- **Status**: Accepted
- **Date**: 2026-08-30

---

## Context
Traditional crowdfunding platforms release 100% of pledged capital upfront, exposing contributors to severe counterparty risk, project abandonment, and unaccountable timeline delays. A decentralized mechanism is needed to release capital conditionally while preventing low-turnout voter attacks or sybil exploitation.

---

## Decision
1. **Per-Milestone Escrow Tranches**: Campaign capital is divided into discrete basis-point tranches (e.g. 30%, 40%, 30%).
2. **Pledge-Weighted Voting**: Contributor vote weight is strictly proportional to their pledged ETH amount (`escrow.getPledge(backer)`). Non-contributors have zero voting power.
3. **40% Quorum Requirement**: A vote is invalid unless at least 40% of the total pledged capital actively casts a ballot within the 5-day window.
4. **66% Approval Threshold**: Of the votes cast, at least 66% must be `Approve` to trigger fund release.
5. **Checks-Effects-Interactions & ReentrancyGuard**: All fund releases and refunds enforce strict CEI ordering and OpenZeppelin ReentrancyGuard.
6. **Pro-Rata Refund Guarantee**: If a milestone is rejected or fails quorum after window expiration, contributors can invoke `claimRefund()` for their exact pro-rata tranche share:
   $$\text{Refund} = \frac{\text{pledge} \times \text{trancheBasisPoints}}{10000}$$

---

## Consequences
- Protects contributor funds throughout the multi-stage lifecycle of the project.
- Guarantees financial accountability and incentivizes creators to maintain high reputation tiers in the `ReputationRegistry`.
