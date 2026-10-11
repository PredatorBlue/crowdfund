// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MilestoneEscrow.sol";
import "./VotingModule.sol";
import "./ReputationRegistry.sol";

/**
 * @title CampaignFactory
 * @dev Deploys and manages MilestoneEscrow and VotingModule pairs for decentralized crowdfunding campaigns.
 */
contract CampaignFactory is Ownable {
    struct CampaignInfo {
        uint256 campaignId;
        address creator;
        address escrowAddress;
        address votingModuleAddress;
        uint256 goal;
        uint256 deadline;
        uint256 milestoneCount;
        string metadataIpfsHash;
        uint256 createdAt;
    }

    ReputationRegistry public immutable reputationRegistry;
    address public oracle;
    CampaignInfo[] public campaigns;
    mapping(address => uint256[]) public creatorCampaigns;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        address escrowAddress,
        address votingModuleAddress,
        uint256 goal,
        uint256 milestoneCount,
        string metadataIpfsHash
    );
    event OracleUpdated(address indexed newOracle);

    constructor(address _reputationRegistry, address _oracle) Ownable(msg.sender) {
        require(_reputationRegistry != address(0), "Invalid registry");
        reputationRegistry = ReputationRegistry(_reputationRegistry);
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /**
     * @notice Deploys a new Campaign with dedicated Escrow and Voting contracts.
     */
    function createCampaign(
        uint256 _goal,
        uint256 _deadline,
        string calldata _metadataIpfsHash,
        string[] calldata _titles,
        string[] calldata _descriptions,
        uint256[] calldata _targetDates,
        uint256[] calldata _trancheBps,
        uint256 _votingWindow
    ) external returns (uint256 campaignId, address escrowAddress, address votingAddress) {
        require(_goal > 0, "Goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_titles.length > 0, "Must specify milestones");

        campaignId = campaigns.length;

        // 1. Deploy MilestoneEscrow
        MilestoneEscrow escrow = new MilestoneEscrow(
            msg.sender,
            _goal,
            _deadline,
            _metadataIpfsHash,
            address(reputationRegistry),
            oracle,
            _titles,
            _descriptions,
            _targetDates,
            _trancheBps
        );
        escrowAddress = address(escrow);

        // 2. Deploy VotingModule
        VotingModule voting = new VotingModule(
            campaignId,
            payable(escrowAddress),
            _votingWindow
        );
        votingAddress = address(voting);

        // 3. Link VotingModule to Escrow
        escrow.setVotingModule(votingAddress);

        // 4. Authorize Escrow in Reputation Registry
        reputationRegistry.setCallerAuthorization(escrowAddress, true);
        reputationRegistry.registerCampaign(msg.sender);

        // 5. Store campaign records
        CampaignInfo memory info = CampaignInfo({
            campaignId: campaignId,
            creator: msg.sender,
            escrowAddress: escrowAddress,
            votingModuleAddress: votingAddress,
            goal: _goal,
            deadline: _deadline,
            milestoneCount: _titles.length,
            metadataIpfsHash: _metadataIpfsHash,
            createdAt: block.timestamp
        });

        campaigns.push(info);
        creatorCampaigns[msg.sender].push(campaignId);

        emit CampaignCreated(
            campaignId,
            msg.sender,
            escrowAddress,
            votingAddress,
            _goal,
            _titles.length,
            _metadataIpfsHash
        );

        return (campaignId, escrowAddress, votingAddress);
    }

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaign(uint256 campaignId) external view returns (CampaignInfo memory) {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        return campaigns[campaignId];
    }

    function getCreatorCampaigns(address creator) external view returns (uint256[] memory) {
        return creatorCampaigns[creator];
    }
}
