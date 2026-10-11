const OracleService = require("../src/oracleService");
const path = require("path");
const fs = require("fs");

async function simulate() {
  console.log("=================================================");
  console.log("Running Oracle End-to-End Simulation Test");
  console.log("=================================================");

  const depPath = path.join(__dirname, "../../shared/deployments.json");
  if (!fs.existsSync(depPath)) {
    console.error("Error: shared/deployments.json not found. Run hardhat deploy first!");
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync(depPath, "utf8"));
  const oracle = new OracleService({
    rpcUrl: "http://127.0.0.1:8545",
    factoryAddress: deployments.campaignFactory,
    reputationAddress: deployments.reputationRegistry
  });

  await oracle.init();

  // Test with mock creator address
  const mockCreator = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const mockMetadata = {
    title: "Autonomous Drone Delivery Protocol",
    description: "Milestone 1: Deliver hardware telemetry board with 4G LTE failover and encrypted GPS by Oct 2026."
  };

  console.log("\nSimulating Oracle Risk Evaluation for Creator:", mockCreator);
  const result = await oracle.evaluateAndSubmitScore(
    deployments.campaignFactory, // test run
    mockCreator,
    mockMetadata
  );

  console.log("\nSimulation Result:", result);
}

if (require.main === module) {
  simulate().catch(console.error);
}
