// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ReputationRegistry.sol";

interface IVotingModule {
    function startVoting(uint256 milestoneId) external;
}

/**
 * @title MilestoneEscrow
 * @dev Holds pledged funds in tranches and releases funds upon successful milestone voting.
 */
contract MilestoneEscrow is ReentrancyGuard {
    struct Milestone {
        uint256 id;
        string title;
        string description;
        uint256 targetDate; // Unix timestamp
        uint256 trancheBasisPoints; // Basis points of total goal (e.g. 3000 = 30%)
        uint256 targetAmount; // Exact ETH allocated to this milestone
        uint256 amountReleased;
        string proofIpfsHash;
        bool proofSubmitted;
        bool completed;
        bool failed;
    }

    address public immutable creator;
    address public votingModule;
    ReputationRegistry public immutable reputationRegistry;
    address public oracle;
    address public factory;

    uint256 public immutable goal;
    uint256 public immutable deadline;
    string public metadataIpfsHash;
    uint256 public totalPledged;
    bool public isFinalized;

    // AI and Risk Metrics
    uint8 public currentRiskScore; // 0 - 100
    bool public hasDriftAlert;
    uint256 public lastScoreUpdate;

    Milestone[] public milestones;
    mapping(address => uint256) public pledges;
    address[] public contributors;
    mapping(address => bool) private _isContributor;

    // milestoneId => (backer => hasClaimedRefund)
    mapping(uint256 => mapping(address => bool)) public milestoneRefundClaimed;

    event Pledged(address indexed backer, uint256 amount, uint256 newTotal);
    event ProofSubmitted(uint256 indexed milestoneId, string ipfsHash, uint256 timestamp);
    event MilestoneReleased(uint256 indexed milestoneId, uint256 amount, address indexed recipient, bool onTime);
    event MilestoneFailed(uint256 indexed milestoneId, uint256 refundAmountTotal);
    event RefundClaimed(uint256 indexed milestoneId, address indexed backer, uint256 amount);
    event RiskScoreUpdated(uint8 riskScore, bool driftAlert, uint256 timestamp);
    event OracleUpdated(address indexed newOracle);
    event VotingModuleAttached(address indexed module);

    modifier onlyCreator() {
        require(msg.sender == creator, "MilestoneEscrow: Only creator");
        _;
    }

    modifier onlyVotingModule() {
        require(msg.sender == votingModule, "MilestoneEscrow: Only voting module");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle || msg.sender == factory, "MilestoneEscrow: Only oracle or factory");
        _;
    }

    constructor(
        address _creator,
        uint256 _goal,
        uint256 _deadline,
        string memory _metadataIpfsHash,
        address _reputationRegistry,
        address _oracle,
        string[] memory _titles,
        string[] memory _descriptions,
        uint256[] memory _targetDates,
        uint256[] memory _trancheBps
    ) {
        require(_creator != address(0), "Invalid creator");
        require(_reputationRegistry != address(0), "Invalid registry");
        require(_goal > 0, "Goal must be > 0");
        require(_titles.length > 0, "Must have milestones");
        require(
            _titles.length == _descriptions.length &&
            _titles.length == _targetDates.length &&
            _titles.length == _trancheBps.length,
            "Array length mismatch"
        );

        creator = _creator;
        goal = _goal;
        deadline = _deadline;
        metadataIpfsHash = _metadataIpfsHash;
        reputationRegistry = ReputationRegistry(_reputationRegistry);
        oracle = _oracle;
        factory = msg.sender;

        uint256 totalBps = 0;
        for (uint256 i = 0; i < _titles.length; i++) {
            totalBps += _trancheBps[i];
            uint256 milestoneAmount = (_goal * _trancheBps[i]) / 10000;
            milestones.push(
                Milestone({
                    id: i,
                    title: _titles[i],
                    description: _descriptions[i],
                    targetDate: _targetDates[i],
                    trancheBasisPoints: _trancheBps[i],
                    targetAmount: milestoneAmount,
                    amountReleased: 0,
                    proofIpfsHash: "",
                    proofSubmitted: false,
                    completed: false,
                    failed: false
                })
            );
        }
        require(totalBps == 10000, "Tranche basis points must sum to 10000 (100%)");
    }

    /**
     * @notice Set voting module address. Can only be done once by factory.
     */
    function setVotingModule(address _votingModule) external {
        require(msg.sender == factory, "Only factory can set voting module");
        require(votingModule == address(0), "Voting module already set");
        require(_votingModule != address(0), "Invalid voting module");
        votingModule = _votingModule;
        emit VotingModuleAttached(_votingModule);
    }

    /**
     * @notice Set new oracle address.
     */
    function setOracle(address _oracle) external {
        require(msg.sender == factory || msg.sender == oracle, "Unauthorized");
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /**
     * @notice Pledge ETH to the campaign. Contributor balance directly determines voting weight.
     */
    function pledge() external payable nonReentrant {
        require(msg.value > 0, "Pledge amount must be > 0");
        require(block.timestamp <= deadline || totalPledged < goal, "Campaign pledge window closed");

        pledges[msg.sender] += msg.value;
        totalPledged += msg.value;

        if (!_isContributor[msg.sender]) {
            _isContributor[msg.sender] = true;
            contributors.push(msg.sender);
        }

        emit Pledged(msg.sender, msg.value, totalPledged);
    }

    /**
     * @notice Creator submits milestone proof of work and triggers voting session.
     */
    function submitMilestoneProof(uint256 milestoneId, string calldata proofHash) external onlyCreator {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage m = milestones[milestoneId];
        require(!m.completed && !m.failed, "Milestone already finalized");
        require(bytes(proofHash).length > 0, "Proof hash cannot be empty");

        m.proofIpfsHash = proofHash;
        m.proofSubmitted = true;

        emit ProofSubmitted(milestoneId, proofHash, block.timestamp);

        if (votingModule != address(0)) {
            IVotingModule(votingModule).startVoting(milestoneId);
        }
    }

    /**
     * @notice Releases milestone funds to creator upon passed vote. Callable only by VotingModule.
     */
    function releaseMilestone(uint256 milestoneId) external onlyVotingModule nonReentrant {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage m = milestones[milestoneId];
        require(!m.completed, "Milestone already completed");
        require(!m.failed, "Milestone marked failed");

        // Calculate tranche amount based on pledged funds or target amount (whichever is smaller)
        uint256 trancheAmount = (totalPledged * m.trancheBasisPoints) / 10000;
        require(address(this).balance >= trancheAmount, "Insufficient escrow balance");

        // Checks-Effects-Interactions
        m.completed = true;
        m.amountReleased = trancheAmount;

        bool onTime = block.timestamp <= m.targetDate;
        ReputationRegistry.Outcome outcome = onTime
            ? ReputationRegistry.Outcome.OnTime
            : ReputationRegistry.Outcome.Late;

        // Update reputation
        try reputationRegistry.updateReputation(creator, milestoneId, outcome) {} catch {}

        // Transfer funds to creator
        (bool success, ) = payable(creator).call{value: trancheAmount}("");
        require(success, "ETH transfer to creator failed");

        emit MilestoneReleased(milestoneId, trancheAmount, creator, onTime);
    }

    /**
     * @notice Marks a milestone as failed. Callable only by VotingModule.
     */
    function markMilestoneFailed(uint256 milestoneId) external onlyVotingModule {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage m = milestones[milestoneId];
        require(!m.completed, "Milestone already completed");
        require(!m.failed, "Milestone already marked failed");

        m.failed = true;

        uint256 failedTrancheAmount = (totalPledged * m.trancheBasisPoints) / 10000;

        try reputationRegistry.updateReputation(
            creator,
            milestoneId,
            ReputationRegistry.Outcome.FailedVote
        ) {} catch {}

        emit MilestoneFailed(milestoneId, failedTrancheAmount);
    }

    /**
     * @notice Contributors claim pro-rata refund for a failed milestone tranche.
     */
    function claimRefund(uint256 milestoneId) external nonReentrant {
        require(milestoneId < milestones.length, "Invalid milestone ID");
        Milestone storage m = milestones[milestoneId];
        require(m.failed, "Milestone has not failed");
        require(!milestoneRefundClaimed[milestoneId][msg.sender], "Refund already claimed for this milestone");
        require(pledges[msg.sender] > 0, "No pledges found for sender");

        milestoneRefundClaimed[milestoneId][msg.sender] = true;

        // Pro-rata tranche share: (senderPledge * trancheBasisPoints) / 10000
        uint256 refundAmount = (pledges[msg.sender] * m.trancheBasisPoints) / 10000;
        require(address(this).balance >= refundAmount, "Insufficient escrow balance for refund");

        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(milestoneId, msg.sender, refundAmount);
    }

    /**
     * @notice Oracle submits AI risk score and timeline drift alert.
     */
    function submitRiskScore(uint8 score, bool driftAlert) external onlyOracle {
        require(score <= 100, "Score must be 0-100");
        currentRiskScore = score;
        hasDriftAlert = driftAlert;
        lastScoreUpdate = block.timestamp;
        emit RiskScoreUpdated(score, driftAlert, block.timestamp);
    }

    // View functions
    function getMilestonesCount() external view returns (uint256) {
        return milestones.length;
    }

    function getMilestone(uint256 id)
        external
        view
        returns (
            uint256 milestoneId,
            string memory title,
            string memory description,
            uint256 targetDate,
            uint256 trancheBasisPoints,
            uint256 targetAmount,
            uint256 amountReleased,
            string memory proofIpfsHash,
            bool proofSubmitted,
            bool completed,
            bool failed
        )
    {
        require(id < milestones.length, "Invalid milestone ID");
        Milestone memory m = milestones[id];
        return (
            m.id,
            m.title,
            m.description,
            m.targetDate,
            m.trancheBasisPoints,
            m.targetAmount,
            m.amountReleased,
            m.proofIpfsHash,
            m.proofSubmitted,
            m.completed,
            m.failed
        );
    }

    function getPledge(address backer) external view returns (uint256) {
        return pledges[backer];
    }

    function getContributorsCount() external view returns (uint256) {
        return contributors.length;
    }
}
