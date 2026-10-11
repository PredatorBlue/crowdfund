const hre = require("hardhat");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Seeding Demo Campaigns and Initial Pledges...");
  console.log("----------------------------------------------------");

  const [deployer, creator1, creator2, backer1, backer2, backer3, oracle] =
    await hre.ethers.getSigners();

  // Load deployed factory & registry
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const MilestoneEscrow = await hre.ethers.getContractFactory("MilestoneEscrow");

  // Read deployment
  const shared = require("../../shared/deployments.json");
  const factory = CampaignFactory.attach(shared.campaignFactory);
  const registry = ReputationRegistry.attach(shared.reputationRegistry);

  const ONE_DAY = 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);

  // Campaign 1: Decentralized Neural Network Inference Marketplace
  console.log("\nCreating Campaign 1: Decentralized AI Inference Network...");
  const c1Tx = await factory.connect(creator1).createCampaign(
    hre.ethers.parseEther("5.0"), // 5 ETH goal
    now + 30 * ONE_DAY,
    JSON.stringify({
      title: "Decentralized AI Inference Network",
      category: "Artificial Intelligence",
      description:
        "High-performance peer-to-peer compute layer enabling trustless inference for open-weights LLMs.",
      banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    }),
    [
      "M1: Compute Node Protocol & Testnet",
      "M2: Zero-Knowledge Verification Engine",
      "M3: Mainnet Launch & Developer SDK",
    ],
    [
      "Implement worker node discovery and heartbeat consensus.",
      "Integrate Halo2 zk-SNARK verifier contract for proof of compute.",
      "Deploy production smart contracts and TypeScript client SDK.",
    ],
    [now + 10 * ONE_DAY, now + 20 * ONE_DAY, now + 30 * ONE_DAY],
    [3000, 4000, 3000], // 30%, 40%, 30%
    5 * ONE_DAY
  );
  await c1Tx.wait();

  const c1Info = await factory.getCampaign(0);
  const escrow1 = MilestoneEscrow.attach(c1Info.escrowAddress);

  // Backers pledge to Campaign 1
  console.log("Pledging to Campaign 1...");
  await (await escrow1.connect(backer1).pledge({ value: hre.ethers.parseEther("2.5") })).wait();
  await (await escrow1.connect(backer2).pledge({ value: hre.ethers.parseEther("1.5") })).wait();
  await (await escrow1.connect(backer3).pledge({ value: hre.ethers.parseEther("1.0") })).wait();

  // Oracle sets risk score
  await (await escrow1.connect(oracle).submitRiskScore(18, false)).wait();
  console.log("✓ Campaign 1 seeded (5.0 ETH pledged, Risk Score: 18, No drift)");

  // Campaign 2: Renewable Energy Microgrid DAO
  console.log("\nCreating Campaign 2: Solar Energy Microgrid IoT...");
  const c2Tx = await factory.connect(creator2).createCampaign(
    hre.ethers.parseEther("8.0"),
    now + 45 * ONE_DAY,
    JSON.stringify({
      title: "Solar Energy Microgrid IoT",
      category: "CleanTech / DePIN",
      description:
        "Autonomous IoT smart meters trading surplus solar energy across local neighborhood nodes.",
      banner: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
    }),
    [
      "M1: Smart Meter Hardware Prototype",
      "M2: Local Grid P2P Settlement",
      "M3: Pilot Deployment in 50 Homes",
    ],
    [
      "Design ESP32 hardware and firmware with signed telemetry.",
      "Build Layer-2 state channel for high-frequency energy settlements.",
      "Install and monitor physical pilot nodes across community.",
    ],
    [now + 12 * ONE_DAY, now + 25 * ONE_DAY, now + 45 * ONE_DAY],
    [3500, 3500, 3000],
    5 * ONE_DAY
  );
  await c2Tx.wait();

  const c2Info = await factory.getCampaign(1);
  const escrow2 = MilestoneEscrow.attach(c2Info.escrowAddress);

  await (await escrow2.connect(backer1).pledge({ value: hre.ethers.parseEther("4.0") })).wait();
  await (await escrow2.connect(backer2).pledge({ value: hre.ethers.parseEther("2.0") })).wait();

  // Oracle sets risk score and drift alert for Campaign 2
  await (await escrow2.connect(oracle).submitRiskScore(54, true)).wait();
  console.log("✓ Campaign 2 seeded (6.0 ETH pledged, Risk Score: 54, Drift Alert: Active)");

  console.log("\n====================================================");
  console.log("Seeding complete! 2 campaigns deployed and funded.");
  console.log("====================================================");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
