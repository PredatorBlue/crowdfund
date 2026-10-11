// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @dev Append-only on-chain ledger tracking creator reputation, milestone outcomes, and trust tiers.
 */
contract ReputationRegistry is Ownable {
    enum Outcome {
        OnTime,
        Late,
        FailedVote,
        Dispute
    }

    enum Tier {
        Bronze, // < 3.5
        Silver, // 3.5 - 4.5
        Gold    // > 4.5
    }

    struct CreatorStats {
        uint256 onTimeDeliveries;
        uint256 lateDeliveries;
        uint256 failedVotes;
        uint256 totalCampaigns;
        uint256 disputes;
        uint256 computedScore; // Scaled by 100 (e.g., 350 = 3.50 / 5.00)
        bool initialized;
    }

    struct OutcomeRecord {
        address campaign;
        uint256 milestoneId;
        Outcome outcome;
        uint256 timestamp;
    }

    // Mapping from creator address to their statistics
    mapping(address => CreatorStats) public creatorStats;
    // Mapping from creator address to historical outcome records
    mapping(address => OutcomeRecord[]) private _outcomeHistory;
    // Whitelist of authorized caller contracts (Escrows, Factory)
    mapping(address => bool) public authorizedCallers;

    // Base score for new creators (3.50 / 5.00 scaled by 100)
    uint256 public constant BASE_SCORE = 350;
    uint256 public constant MAX_SCORE = 500;
    uint256 public constant MIN_SCORE = 100;

    event ReputationUpdated(
        address indexed creator,
        address indexed campaign,
        uint256 milestoneId,
        Outcome outcome,
        uint256 newScore,
        Tier tier
    );
    event CallerAuthorizationChanged(address indexed caller, bool isAuthorized);
    event CampaignRegistered(address indexed creator, address indexed campaign);

    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || msg.sender == owner(),
            "ReputationRegistry: Caller is not authorized"
        );
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Authorizes or deauthorizes a contract address (e.g. factory/escrow) to update reputation.
     */
    function setCallerAuthorization(address caller, bool isAuthorized) external onlyAuthorized {
        require(caller != address(0), "Invalid caller address");
        authorizedCallers[caller] = isAuthorized;
        emit CallerAuthorizationChanged(caller, isAuthorized);
    }

    /**
     * @notice Registers a new campaign for a creator to track total campaigns.
     */
    function registerCampaign(address creator) external onlyAuthorized {
        CreatorStats storage stats = creatorStats[creator];
        if (!stats.initialized) {
            stats.computedScore = BASE_SCORE;
            stats.initialized = true;
        }
        stats.totalCampaigns += 1;
        emit CampaignRegistered(creator, msg.sender);
    }

    /**
     * @notice Records a milestone outcome and recalibrates creator's trust score.
     */
    function updateReputation(
        address creator,
        uint256 milestoneId,
        Outcome outcome
    ) external onlyAuthorized {
        CreatorStats storage stats = creatorStats[creator];
        if (!stats.initialized) {
            stats.computedScore = BASE_SCORE;
            stats.initialized = true;
        }

        if (outcome == Outcome.OnTime) {
            stats.onTimeDeliveries += 1;
            // Reward on-time delivery (+25 points, capped at MAX_SCORE)
            if (stats.computedScore + 25 <= MAX_SCORE) {
                stats.computedScore += 25;
            } else {
                stats.computedScore = MAX_SCORE;
            }
        } else if (outcome == Outcome.Late) {
            stats.lateDeliveries += 1;
            // Minor deduction for late delivery (-10 points)
            if (stats.computedScore > MIN_SCORE + 10) {
                stats.computedScore -= 10;
            } else {
                stats.computedScore = MIN_SCORE;
            }
        } else if (outcome == Outcome.FailedVote) {
            stats.failedVotes += 1;
            // Significant penalty for failed milestone vote (-60 points)
            if (stats.computedScore > MIN_SCORE + 60) {
                stats.computedScore -= 60;
            } else {
                stats.computedScore = MIN_SCORE;
            }
        } else if (outcome == Outcome.Dispute) {
            stats.disputes += 1;
            // Heavy penalty for disputes (-100 points)
            if (stats.computedScore > MIN_SCORE + 100) {
                stats.computedScore -= 100;
            } else {
                stats.computedScore = MIN_SCORE;
            }
        }

        _outcomeHistory[creator].push(
            OutcomeRecord({
                campaign: msg.sender,
                milestoneId: milestoneId,
                outcome: outcome,
                timestamp: block.timestamp
            })
        );

        Tier currentTier = getTier(stats.computedScore);
        emit ReputationUpdated(
            creator,
            msg.sender,
            milestoneId,
            outcome,
            stats.computedScore,
            currentTier
        );
    }

    /**
     * @notice Helper to convert a numeric score to its Tier.
     */
    function getTier(uint256 score) public pure returns (Tier) {
        if (score < 350) {
            return Tier.Bronze;
        } else if (score <= 450) {
            return Tier.Silver;
        } else {
            return Tier.Gold;
        }
    }

    /**
     * @notice Returns comprehensive reputation stats and trust tier for a given creator.
     */
    function getTrustScore(address creator)
        external
        view
        returns (
            uint256 score,
            Tier tier,
            uint256 onTimeDeliveries,
            uint256 lateDeliveries,
            uint256 failedVotes,
            uint256 totalCampaigns,
            uint256 disputes,
            uint256 onTimeRatePercent
        )
    {
        CreatorStats memory stats = creatorStats[creator];
        uint256 currentScore = stats.initialized ? stats.computedScore : BASE_SCORE;
        Tier currentTier = getTier(currentScore);

        uint256 totalDeliveries = stats.onTimeDeliveries + stats.lateDeliveries;
        uint256 rate = 0;
        if (totalDeliveries > 0) {
            rate = (stats.onTimeDeliveries * 100) / totalDeliveries;
        } else if (stats.initialized) {
            rate = 100;
        }

        return (
            currentScore,
            currentTier,
            stats.onTimeDeliveries,
            stats.lateDeliveries,
            stats.failedVotes,
            stats.totalCampaigns,
            stats.disputes,
            rate
        );
    }

    /**
     * @notice Returns full outcome history count for a creator.
     */
    function getOutcomeHistoryCount(address creator) external view returns (uint256) {
        return _outcomeHistory[creator].length;
    }

    /**
     * @notice Returns an outcome history record by index.
     */
    function getOutcomeRecord(address creator, uint256 index)
        external
        view
        returns (
            address campaign,
            uint256 milestoneId,
            Outcome outcome,
            uint256 timestamp
        )
    {
        OutcomeRecord memory rec = _outcomeHistory[creator][index];
        return (rec.campaign, rec.milestoneId, rec.outcome, rec.timestamp);
    }
}
