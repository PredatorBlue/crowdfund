const { ethers } = require("ethers");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Contract ABIs
const ReputationRegistryABI = [
  "function getTrustScore(address creator) external view returns (uint256 score, uint8 tier, uint256 onTimeDeliveries, uint256 lateDeliveries, uint256 failedVotes, uint256 totalCampaigns, uint256 disputes, uint256 onTimeRatePercent)"
];

const CampaignFactoryABI = [
  "event CampaignCreated(uint256 indexed campaignId, address indexed creator, address escrowAddress, address votingModuleAddress, uint256 goal, uint256 milestoneCount, string metadataIpfsHash)",
  "function getCampaignCount() external view returns (uint256)",
  "function getCampaign(uint256 campaignId) external view returns (tuple(uint256 campaignId, address creator, address escrowAddress, address votingModuleAddress, uint256 goal, uint256 deadline, uint256 milestoneCount, string metadataIpfsHash, uint256 createdAt))"
];

const MilestoneEscrowABI = [
  "function submitRiskScore(uint8 score, bool driftAlert) external",
  "function getMilestonesCount() external view returns (uint256)",
  "function getMilestone(uint256 id) external view returns (uint256 milestoneId, string title, string description, uint256 targetDate, uint256 trancheBasisPoints, uint256 targetAmount, uint256 amountReleased, string proofIpfsHash, bool proofSubmitted, bool completed, bool failed)",
  "function currentRiskScore() external view returns (uint8)",
  "function hasDriftAlert() external view returns (bool)",
  "event ProofSubmitted(uint256 indexed milestoneId, string ipfsHash, uint256 timestamp)"
];

class OracleService {
  constructor(config = {}) {
    this.rpcUrl = config.rpcUrl || process.env.RPC_URL || "http://127.0.0.1:8545";
    this.aiServiceUrl = config.aiServiceUrl || process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
    
    // Load default deployments if available
    let deployments = {};
    const depPath = path.join(__dirname, "../../shared/deployments.json");
    if (fs.existsSync(depPath)) {
      try {
        deployments = JSON.parse(fs.readFileSync(depPath, "utf8"));
      } catch (err) {}
    }

    this.factoryAddress = config.factoryAddress || process.env.FACTORY_ADDRESS || deployments.campaignFactory;
    this.reputationAddress = config.reputationAddress || process.env.REPUTATION_ADDRESS || deployments.reputationRegistry;
    
    // Setup ethers provider and wallet
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    
    // Hardhat Account #5 or env private key
    const privateKey = config.privateKey || process.env.ORACLE_PRIVATE_KEY || "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e";
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async init() {
    console.log(`[Oracle] Initializing connection to RPC: ${this.rpcUrl}`);
    console.log(`[Oracle] Signer Address: ${this.wallet.address}`);
    console.log(`[Oracle] Factory Address: ${this.factoryAddress}`);
    console.log(`[Oracle] AI Service URL: ${this.aiServiceUrl}`);

    if (this.factoryAddress) {
      this.factoryContract = new ethers.Contract(this.factoryAddress, CampaignFactoryABI, this.wallet);
    }
    if (this.reputationAddress) {
      this.reputationContract = new ethers.Contract(this.reputationAddress, ReputationRegistryABI, this.provider);
    }
  }

  /**
   * Evaluates AI risk score and timeline for a given campaign and writes to on-chain escrow
   */
  async evaluateAndSubmitScore(escrowAddress, creatorAddress, metadata = {}) {
    try {
      console.log(`\n[Oracle] Evaluating risk for Escrow: ${escrowAddress}, Creator: ${creatorAddress}`);

      // 1. Fetch on-chain creator history
      let creatorCompletionRate = 0.85;
      let walletAgeDays = 365;
      let walletTxCount = 120;

      if (this.reputationContract) {
        try {
          const stats = await this.reputationContract.getTrustScore(creatorAddress);
          const onTime = Number(stats[2]);
          const late = Number(stats[3]);
          const failed = Number(stats[4]);
          const totalMilestones = onTime + late + failed;

          if (totalMilestones > 0) {
            creatorCompletionRate = (onTime + late) / totalMilestones;
          }
          const txCount = await this.provider.getTransactionCount(creatorAddress);
          walletTxCount = txCount;
        } catch (err) {
          console.warn(`[Oracle] Could not read reputation stats, using defaults: ${err.message}`);
        }
      }

      // 2. Call AI Service for Risk Score
      const riskPayload = {
        creator_completion_rate: creatorCompletionRate,
        milestone_description: metadata.description || "Milestone description with concrete goals and timeline",
        wallet_age_days: walletAgeDays,
        wallet_tx_count: Math.max(10, walletTxCount),
        funding_velocity_ratio: 1.15,
        backer_sentiment_score: 0.80
      };

      console.log("[Oracle] Requesting Risk Score from AI microservice...");
      const riskRes = await axios.post(`${this.aiServiceUrl}/risk-score`, riskPayload);
      const { risk_score_int, risk_tier } = riskRes.data;
      console.log(`[Oracle] Received Risk Score: ${risk_score_int} (${risk_tier})`);

      // 3. Call AI Service for Timeline Drift Check
      const timePayload = {
        planned_duration_days: 30,
        task_complexity: 5,
        creator_pace_factor: 1.0,
        backer_blockers_count: 0
      };

      const timeRes = await axios.post(`${this.aiServiceUrl}/predict-timeline`, timePayload);
      const { drift_alert, drift_percentage } = timeRes.data;
      console.log(`[Oracle] Timeline Prediction: Drift=${drift_percentage}%, Alert=${drift_alert}`);

      // 4. Submit Risk Score on-chain via Escrow contract
      const escrowContract = new ethers.Contract(escrowAddress, MilestoneEscrowABI, this.wallet);
      console.log(`[Oracle] Submitting score on-chain to ${escrowAddress}...`);
      
      const tx = await escrowContract.submitRiskScore(risk_score_int, drift_alert);
      const receipt = await tx.wait();
      console.log(`[Oracle] ✓ On-chain submission confirmed! Block: ${receipt.blockNumber}, Hash: ${receipt.hash}`);

      return {
        success: true,
        riskScore: risk_score_int,
        riskTier: risk_tier,
        driftAlert: drift_alert,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error(`[Oracle] Error during evaluation/submission: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Starts listening to CampaignCreated events on CampaignFactory
   */
  startListener() {
    if (!this.factoryContract) {
      console.warn("[Oracle] Factory contract not configured, cannot start listener.");
      return;
    }

    console.log("[Oracle] Starting event listener for CampaignCreated...");

    this.factoryContract.on(
      "CampaignCreated",
      async (campaignId, creator, escrowAddress, votingModuleAddress, goal, milestoneCount, metadataIpfsHash) => {
        console.log(`\n[Oracle Event] New Campaign #${campaignId} Created!`);
        console.log(`  - Creator: ${creator}`);
        console.log(`  - Escrow: ${escrowAddress}`);
        console.log(`  - Goal: ${ethers.formatEther(goal)} ETH`);

        let meta = {};
        try {
          meta = JSON.parse(metadataIpfsHash);
        } catch (e) {
          meta = { description: metadataIpfsHash };
        }

        await this.evaluateAndSubmitScore(escrowAddress, creator, meta);
      }
    );
  }
}

module.exports = OracleService;
