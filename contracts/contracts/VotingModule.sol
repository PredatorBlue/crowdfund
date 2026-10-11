// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MilestoneEscrow.sol";
import "./ReputationRegistry.sol";

/**
 * @title VotingModule
 * @dev Governs milestone approval using pledge-weighted voting with strict quorum and approval thresholds.
 */
contract VotingModule {
    struct VoteSession {
        uint256 milestoneId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotesFor;
        uint256 totalVotesAgainst;
        bool active;
        bool finalized;
        bool passed;
    }

    MilestoneEscrow public immutable escrow;
    address public immutable factory;
    uint256 public immutable campaignId;

    // Governance parameters
    uint256 public votingWindow; // Default 5 days in seconds
    uint256 public constant QUORUM_PERCENT = 40; // 40% of pledged capital must vote
    uint256 public constant APPROVAL_THRESHOLD_PERCENT = 66; // 66% of cast votes must be Approve

    // milestoneId => (backerAddress => hasVoted)
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    // milestoneId => (backerAddress => votedApproved)
    mapping(uint256 => mapping(address => bool)) public voteChoice;
    // milestoneId => VoteSession
    mapping(uint256 => VoteSession) public voteSessions;

    event VotingStarted(uint256 indexed milestoneId, uint256 startTime, uint256 endTime);
    event VoteCast(
        uint256 indexed milestoneId,
        address indexed voter,
        bool approve,
        uint256 weight,
        uint256 currentVotesFor,
        uint256 currentVotesAgainst
    );
    event VoteFinalized(
        uint256 indexed milestoneId,
        bool passed,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 totalPledged
    );

    modifier onlyEscrow() {
        require(msg.sender == address(escrow), "VotingModule: Only escrow can trigger");
        _;
    }

    constructor(
        uint256 _campaignId,
        address payable _escrowAddress,
        uint256 _votingWindowSeconds
    ) {
        require(_escrowAddress != address(0), "Invalid escrow address");
        campaignId = _campaignId;
        escrow = MilestoneEscrow(_escrowAddress);
        factory = msg.sender;
        votingWindow = _votingWindowSeconds > 0 ? _votingWindowSeconds : 5 days;
    }

    /**
     * @notice Initiates a voting session when creator submits milestone proof.
     */
    function startVoting(uint256 milestoneId) external onlyEscrow {
        VoteSession storage session = voteSessions[milestoneId];
        require(!session.active && !session.finalized, "Voting session already initiated");

        session.milestoneId = milestoneId;
        session.startTime = block.timestamp;
        session.endTime = block.timestamp + votingWindow;
        session.active = true;
        session.finalized = false;
        session.passed = false;

        emit VotingStarted(milestoneId, session.startTime, session.endTime);
    }

    /**
     * @notice Cast a pledge-weighted vote for a milestone.
     */
    function castVote(uint256 milestoneId, bool approve) external {
        VoteSession storage session = voteSessions[milestoneId];
        require(session.active, "Voting is not active for this milestone");
        require(block.timestamp <= session.endTime, "Voting window has closed");
        require(!hasVoted[milestoneId][msg.sender], "Already voted on this milestone");

        uint256 weight = escrow.getPledge(msg.sender);
        require(weight > 0, "No voting weight: Must be a contributor");

        hasVoted[milestoneId][msg.sender] = true;
        voteChoice[milestoneId][msg.sender] = approve;

        if (approve) {
            session.totalVotesFor += weight;
        } else {
            session.totalVotesAgainst += weight;
        }

        emit VoteCast(
            milestoneId,
            msg.sender,
            approve,
            weight,
            session.totalVotesFor,
            session.totalVotesAgainst
        );

        // Check if early unanimous / conclusive pass condition is satisfied (optional fast-path)
        uint256 totalPledged = escrow.totalPledged();
        if (totalPledged > 0 && session.totalVotesFor > (totalPledged * 66) / 100) {
            _finalize(milestoneId, true);
        }
    }

    /**
     * @notice Finalizes the vote after deadline or when conditions are met.
     */
    function finalizeVote(uint256 milestoneId) external {
        VoteSession storage session = voteSessions[milestoneId];
        require(session.active, "Voting is not active");
        require(block.timestamp > session.endTime, "Voting window still open");
        require(!session.finalized, "Vote already finalized");

        uint256 totalVotesCast = session.totalVotesFor + session.totalVotesAgainst;
        uint256 totalPledged = escrow.totalPledged();

        // 1. Quorum check: At least 40% of total pledged capital must participate
        bool quorumMet = (totalPledged > 0) &&
            ((totalVotesCast * 100) >= (totalPledged * QUORUM_PERCENT));

        // 2. Threshold check: At least 66% of votes cast must be 'Approve'
        bool thresholdMet = (totalVotesCast > 0) &&
            ((session.totalVotesFor * 100) >= (totalVotesCast * APPROVAL_THRESHOLD_PERCENT));

        bool passed = quorumMet && thresholdMet;
        _finalize(milestoneId, passed);
    }

    function _finalize(uint256 milestoneId, bool passed) internal {
        VoteSession storage session = voteSessions[milestoneId];
        session.active = false;
        session.finalized = true;
        session.passed = passed;

        emit VoteFinalized(
            milestoneId,
            passed,
            session.totalVotesFor,
            session.totalVotesAgainst,
            escrow.totalPledged()
        );

        if (passed) {
            escrow.releaseMilestone(milestoneId);
        } else {
            escrow.markMilestoneFailed(milestoneId);
        }
    }

    // View functions
    function getVoteProgress(uint256 milestoneId)
        external
        view
        returns (
            uint256 startTime,
            uint256 endTime,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 totalPledged,
            uint256 currentQuorumPercent,
            uint256 currentApprovalPercent,
            bool active,
            bool finalized,
            bool passed
        )
    {
        VoteSession memory session = voteSessions[milestoneId];
        uint256 pledged = escrow.totalPledged();
        uint256 totalCast = session.totalVotesFor + session.totalVotesAgainst;

        uint256 quorum = (pledged > 0) ? (totalCast * 100) / pledged : 0;
        uint256 approval = (totalCast > 0) ? (session.totalVotesFor * 100) / totalCast : 0;

        return (
            session.startTime,
            session.endTime,
            session.totalVotesFor,
            session.totalVotesAgainst,
            pledged,
            quorum,
            approval,
            session.active,
            session.finalized,
            session.passed
        );
    }
}
