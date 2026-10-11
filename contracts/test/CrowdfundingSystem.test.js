const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Trust-Aware Decentralized Crowdfunding System", function () {
  let ReputationRegistry, reputationRegistry;
  let CampaignFactory, campaignFactory;
  let MilestoneEscrow, VotingModule;
  let owner, creator, backer1, backer2, backer3, oracle, nonBacker;

  const GOAL = ethers.parseEther("10.0"); // 10 ETH
  const ONE_DAY = 24 * 60 * 60;
  const FIVE_DAYS = 5 * ONE_DAY;

  beforeEach(async function () {
    [owner, creator, backer1, backer2, backer3, oracle, nonBacker] =
      await ethers.getSigners();

    // 1. Deploy Reputation Registry
    ReputationRegistry = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();

    // 2. Deploy Campaign Factory
    CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    campaignFactory = await CampaignFactory.deploy(
      await reputationRegistry.getAddress(),
      oracle.address
    );
    await campaignFactory.waitForDeployment();

    // Authorize CampaignFactory in ReputationRegistry
    await reputationRegistry.setCallerAuthorization(
      await campaignFactory.getAddress(),
      true
    );

    MilestoneEscrow = await ethers.getContractFactory("MilestoneEscrow");
    VotingModule = await ethers.getContractFactory("VotingModule");
  });

  describe("1. ReputationRegistry Unit Tests", function () {
    it("Should return default trust score 3.50 (Silver tier) for uninitialized creator", async function () {
      const [score, tier, onTime, late, failed, total, disputes, rate] =
        await reputationRegistry.getTrustScore(creator.address);

      expect(score).to.equal(350n);
      expect(tier).to.equal(1n); // Tier.Silver
      expect(onTime).to.equal(0n);
      expect(late).to.equal(0n);
      expect(failed).to.equal(0n);
      expect(total).to.equal(0n);
      expect(disputes).to.equal(0n);
    });

    it("Should prevent unauthorized callers from updating reputation", async function () {
      await expect(
        reputationRegistry
          .connect(nonBacker)
          .updateReputation(creator.address, 0, 0)
      ).to.be.revertedWith("ReputationRegistry: Caller is not authorized");
    });

    it("Should increase score towards Gold tier on consecutive OnTime deliveries", async function () {
      await reputationRegistry.setCallerAuthorization(owner.address, true);

      // 5 on-time deliveries: +25 * 5 = +125 -> score 475 -> Tier.Gold
      await reputationRegistry.updateReputation(creator.address, 0, 0);
      await reputationRegistry.updateReputation(creator.address, 1, 0);
      await reputationRegistry.updateReputation(creator.address, 2, 0);
      await reputationRegistry.updateReputation(creator.address, 3, 0);
      await reputationRegistry.updateReputation(creator.address, 4, 0);

      const [score, tier, onTime, , , , , rate] =
        await reputationRegistry.getTrustScore(creator.address);
      expect(score).to.equal(475n);
      expect(tier).to.equal(2n); // Tier.Gold
      expect(onTime).to.equal(5n);
      expect(rate).to.equal(100n);
      expect(await reputationRegistry.getOutcomeHistoryCount(creator.address)).to.equal(5n);
    });

    it("Should decrease score towards Bronze on FailedVote and Disputes", async function () {
      await reputationRegistry.setCallerAuthorization(owner.address, true);

      // FailedVote: -60 -> 290 (<350 = Bronze)
      await reputationRegistry.updateReputation(creator.address, 0, 2);

      const [score, tier, , , failed] =
        await reputationRegistry.getTrustScore(creator.address);
      expect(score).to.equal(290n);
      expect(tier).to.equal(0n); // Tier.Bronze
      expect(failed).to.equal(1n);

      // Dispute: -100 -> 190
      await reputationRegistry.updateReputation(creator.address, 1, 3);
      const [scoreAfterDispute, tierAfterDispute, , , , , disputes] =
        await reputationRegistry.getTrustScore(creator.address);
      expect(scoreAfterDispute).to.equal(190n);
      expect(tierAfterDispute).to.equal(0n);
      expect(disputes).to.equal(1n);
    });

    it("Should properly deduct points for Late deliveries", async function () {
      await reputationRegistry.setCallerAuthorization(owner.address, true);
      // Late: -10 -> 340 (Bronze)
      await reputationRegistry.updateReputation(creator.address, 0, 1);
      const [score, tier, onTime, late] =
        await reputationRegistry.getTrustScore(creator.address);
      expect(score).to.equal(340n);
      expect(tier).to.equal(0n); // Tier.Bronze (<350)
      expect(late).to.equal(1n);
      expect(onTime).to.equal(0n);
    });
  });

  describe("2. Campaign Creation via CampaignFactory", function () {
    it("Should deploy Escrow and VotingModule and configure authorizations correctly", async function () {
      const now = await time.latest();
      const deadline = now + 30 * ONE_DAY;
      const targetDate1 = now + 10 * ONE_DAY;
      const targetDate2 = now + 20 * ONE_DAY;

      const titles = ["Milestone 1: Prototype", "Milestone 2: Production"];
      const descriptions = [
        "Deliver alpha build with basic features",
        "Deliver scalable production deployment",
      ];
      const targetDates = [targetDate1, targetDate2];
      const trancheBps = [4000, 6000]; // 40% and 60%

      const tx = await campaignFactory
        .connect(creator)
        .createCampaign(
          GOAL,
          deadline,
          "ipfs://QmCampaignMetadataHash123",
          titles,
          descriptions,
          targetDates,
          trancheBps,
          FIVE_DAYS
        );

      await expect(tx).to.emit(campaignFactory, "CampaignCreated");

      expect(await campaignFactory.getCampaignCount()).to.equal(1n);
      const campaignInfo = await campaignFactory.getCampaign(0);

      expect(campaignInfo.creator).to.equal(creator.address);
      expect(campaignInfo.goal).to.equal(GOAL);
      expect(campaignInfo.milestoneCount).to.equal(2n);

      // Check Escrow contract state
      const escrow = await MilestoneEscrow.attach(campaignInfo.escrowAddress);
      expect(await escrow.creator()).to.equal(creator.address);
      expect(await escrow.votingModule()).to.equal(
        campaignInfo.votingModuleAddress
      );
      expect(await escrow.getMilestonesCount()).to.equal(2n);

      // Escrow should be authorized in ReputationRegistry
      expect(
        await reputationRegistry.authorizedCallers(campaignInfo.escrowAddress)
      ).to.be.true;

      // Creator campaigns query
      const creatorCampaigns = await campaignFactory.getCreatorCampaigns(creator.address);
      expect(creatorCampaigns.length).to.equal(1);
      expect(creatorCampaigns[0]).to.equal(0n);
    });

    it("Should reject campaign creation with invalid basis points total", async function () {
      const now = await time.latest();
      const titles = ["M1", "M2"];
      const descriptions = ["D1", "D2"];
      const targetDates = [now + 10 * ONE_DAY, now + 20 * ONE_DAY];
      const invalidBps = [5000, 4000]; // 90% != 100%

      await expect(
        campaignFactory
          .connect(creator)
          .createCampaign(
            GOAL,
            now + 30 * ONE_DAY,
            "ipfs://hash",
            titles,
            descriptions,
            targetDates,
            invalidBps,
            FIVE_DAYS
          )
      ).to.be.revertedWith(
        "Tranche basis points must sum to 10000 (100%)"
      );
    });
  });

  describe("3. Full Lifecycle: Pledge -> Submit Proof -> Vote -> Release Tranche", function () {
    let escrow, votingModule, campaignInfo;
    let targetDate1, targetDate2;

    beforeEach(async function () {
      const now = await time.latest();
      const deadline = now + 30 * ONE_DAY;
      targetDate1 = now + 10 * ONE_DAY;
      targetDate2 = now + 25 * ONE_DAY;

      const titles = ["Milestone 1: UI/UX & AI API", "Milestone 2: Mainnet Launch"];
      const descriptions = ["Complete API scaffolding", "Full release & audit"];
      const targetDates = [targetDate1, targetDate2];
      const trancheBps = [5000, 5000]; // 50% / 50%

      await campaignFactory
        .connect(creator)
        .createCampaign(
          GOAL,
          deadline,
          "ipfs://QmMetadataCID",
          titles,
          descriptions,
          targetDates,
          trancheBps,
          FIVE_DAYS
        );

      campaignInfo = await campaignFactory.getCampaign(0);
      escrow = await MilestoneEscrow.attach(campaignInfo.escrowAddress);
      votingModule = await VotingModule.attach(campaignInfo.votingModuleAddress);
    });

    it("Should accept pledges and track voting weights proportionally", async function () {
      // backer1 pledges 4 ETH (40%)
      await escrow.connect(backer1).pledge({ value: ethers.parseEther("4.0") });
      // backer2 pledges 3 ETH (30%)
      await escrow.connect(backer2).pledge({ value: ethers.parseEther("3.0") });
      // backer3 pledges 3 ETH (30%)
      await escrow.connect(backer3).pledge({ value: ethers.parseEther("3.0") });

      expect(await escrow.totalPledged()).to.equal(ethers.parseEther("10.0"));
      expect(await escrow.getPledge(backer1.address)).to.equal(
        ethers.parseEther("4.0")
      );
      expect(await escrow.getPledge(backer2.address)).to.equal(
        ethers.parseEther("3.0")
      );
      expect(await escrow.getContributorsCount()).to.equal(3n);
    });

    it("Should allow creator to submit proof and backers to vote with weight", async function () {
      await escrow.connect(backer1).pledge({ value: ethers.parseEther("4.0") });
      await escrow.connect(backer2).pledge({ value: ethers.parseEther("3.0") });
      await escrow.connect(backer3).pledge({ value: ethers.parseEther("3.0") });

      // Non-creator cannot submit proof
      await expect(
        escrow.connect(nonBacker).submitMilestoneProof(0, "ipfs://QmFake")
      ).to.be.revertedWith("MilestoneEscrow: Only creator");

      // Creator submits proof for Milestone 0
      const proofTx = await escrow
        .connect(creator)
        .submitMilestoneProof(0, "ipfs://QmProofOfWork1");
      await expect(proofTx).to.emit(escrow, "ProofSubmitted");

      // Non-backer cannot vote
      await expect(
        votingModule.connect(nonBacker).castVote(0, true)
      ).to.be.revertedWith("No voting weight: Must be a contributor");

      // Backer1 votes Approve (4 ETH weight)
      await votingModule.connect(backer1).castVote(0, true);
      expect(await votingModule.hasVoted(0, backer1.address)).to.be.true;

      // Double vote prevented
      await expect(
        votingModule.connect(backer1).castVote(0, true)
      ).to.be.revertedWith("Already voted on this milestone");

      // Backer2 votes Approve (3 ETH weight) -> Total 7 ETH (70% > 66% early threshold!)
      const creatorBalanceBefore = await ethers.provider.getBalance(
        creator.address
      );
      await votingModule.connect(backer2).castVote(0, true);

      // Milestone 0 (50% tranche = 5 ETH) released to creator
      const creatorBalanceAfter = await ethers.provider.getBalance(
        creator.address
      );
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(
        ethers.parseEther("5.0")
      );

      const m0 = await escrow.getMilestone(0);
      expect(m0.completed).to.be.true;
      expect(m0.amountReleased).to.equal(ethers.parseEther("5.0"));

      // Creator reputation upgraded
      const [score, , onTime] = await reputationRegistry.getTrustScore(
        creator.address
      );
      expect(score).to.equal(375n); // 350 + 25
      expect(onTime).to.equal(1n);
    });

    it("Should prevent unauthorized calls to releaseMilestone directly", async function () {
      await expect(
        escrow.connect(creator).releaseMilestone(0)
      ).to.be.revertedWith("MilestoneEscrow: Only voting module");
    });
  });

  describe("4. Governance: Quorum & Threshold Edge Cases and Milestone Rejection Refund", function () {
    let escrow, votingModule, campaignInfo;

    beforeEach(async function () {
      const now = await time.latest();
      const deadline = now + 30 * ONE_DAY;

      const titles = ["Milestone 1: Alpha", "Milestone 2: Beta"];
      const descriptions = ["Alpha build", "Beta build"];
      const targetDates = [now + 10 * ONE_DAY, now + 20 * ONE_DAY];
      const trancheBps = [5000, 5000];

      await campaignFactory
        .connect(creator)
        .createCampaign(
          GOAL,
          deadline,
          "ipfs://QmMeta",
          titles,
          descriptions,
          targetDates,
          trancheBps,
          FIVE_DAYS
        );

      campaignInfo = await campaignFactory.getCampaign(0);
      escrow = await MilestoneEscrow.attach(campaignInfo.escrowAddress);
      votingModule = await VotingModule.attach(campaignInfo.votingModuleAddress);

      // Backers pledge
      await escrow.connect(backer1).pledge({ value: ethers.parseEther("5.0") }); // 50%
      await escrow.connect(backer2).pledge({ value: ethers.parseEther("3.0") }); // 30%
      await escrow.connect(backer3).pledge({ value: ethers.parseEther("2.0") }); // 20%

      // Creator submits proof for Milestone 0
      await escrow.connect(creator).submitMilestoneProof(0, "ipfs://QmProof0");
    });

    it("Should fail milestone vote if approval is below 66% threshold after window closes", async function () {
      // backer2 (30%) votes Approve, backer3 (20%) votes Reject. Total cast: 50% (quorum > 40% met)
      // Approval: 3 / 5 = 60% < 66% threshold!
      await votingModule.connect(backer2).castVote(0, true);
      await votingModule.connect(backer3).castVote(0, false);

      // Fast forward past 5 days voting window
      await time.increase(FIVE_DAYS + 10);

      // Finalize vote
      await votingModule.finalizeVote(0);

      const m0 = await escrow.getMilestone(0);
      expect(m0.failed).to.be.true;
      expect(m0.completed).to.be.false;

      // Creator reputation penalized
      const [score, , , , failed] = await reputationRegistry.getTrustScore(
        creator.address
      );
      expect(score).to.equal(290n); // 350 - 60
      expect(failed).to.equal(1n);

      // Backer 1 can claim pro-rata refund for Milestone 0 tranche (50% tranche of 5 ETH pledge = 2.5 ETH)
      const b1BalBefore = await ethers.provider.getBalance(backer1.address);
      const refundTx = await escrow.connect(backer1).claimRefund(0);
      const receipt = await refundTx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const b1BalAfter = await ethers.provider.getBalance(backer1.address);
      expect(b1BalAfter + gasSpent - b1BalBefore).to.equal(
        ethers.parseEther("2.5")
      );

      // Cannot claim twice
      await expect(
        escrow.connect(backer1).claimRefund(0)
      ).to.be.revertedWith("Refund already claimed for this milestone");
    });

    it("Should fail milestone vote if quorum (40%) is not met after window closes", async function () {
      // Only backer3 (20% < 40% quorum) votes Approve
      await votingModule.connect(backer3).castVote(0, true);

      // Fast forward past voting window
      await time.increase(FIVE_DAYS + 10);

      // Finalize vote
      await votingModule.finalizeVote(0);

      const m0 = await escrow.getMilestone(0);
      expect(m0.failed).to.be.true;
    });

    it("Should prevent finalizing vote while voting window is still open", async function () {
      await votingModule.connect(backer2).castVote(0, true);
      await expect(
        votingModule.finalizeVote(0)
      ).to.be.revertedWith("Voting window still open");
    });
  });

  describe("5. Oracle AI Risk Score Integration", function () {
    let escrow, campaignInfo;

    beforeEach(async function () {
      const now = await time.latest();
      await campaignFactory
        .connect(creator)
        .createCampaign(
          GOAL,
          now + 30 * ONE_DAY,
          "ipfs://QmMeta",
          ["M1"],
          ["D1"],
          [now + 10 * ONE_DAY],
          [10000],
          FIVE_DAYS
        );

      campaignInfo = await campaignFactory.getCampaign(0);
      escrow = await MilestoneEscrow.attach(campaignInfo.escrowAddress);
    });

    it("Should allow designated oracle to update risk score and drift alert", async function () {
      const tx = await escrow.connect(oracle).submitRiskScore(28, true);
      await expect(tx).to.emit(escrow, "RiskScoreUpdated");

      expect(await escrow.currentRiskScore()).to.equal(28);
      expect(await escrow.hasDriftAlert()).to.be.true;
    });

    it("Should reject non-oracle updates to risk score", async function () {
      await expect(
        escrow.connect(nonBacker).submitRiskScore(45, false)
      ).to.be.revertedWith("MilestoneEscrow: Only oracle or factory");
    });
  });
});
