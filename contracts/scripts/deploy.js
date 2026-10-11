const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying Trust-Aware Decentralized Crowdfunding...");
  console.log("----------------------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  // 1. Deploy ReputationRegistry
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy();
  await reputationRegistry.waitForDeployment();
  const reputationAddress = await reputationRegistry.getAddress();
  console.log(`✓ ReputationRegistry deployed at: ${reputationAddress}`);

  // 2. Deploy CampaignFactory (using deployer as default oracle for local dev)
  const oracleAddress = process.env.ORACLE_ADDRESS || deployer.address;
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy(reputationAddress, oracleAddress);
  await campaignFactory.waitForDeployment();
  const factoryAddress = await campaignFactory.getAddress();
  console.log(`✓ CampaignFactory deployed at: ${factoryAddress}`);

  // 3. Authorize CampaignFactory on ReputationRegistry
  const authTx = await reputationRegistry.setCallerAuthorization(factoryAddress, true);
  await authTx.wait();
  console.log(`✓ CampaignFactory authorized in ReputationRegistry`);

  // 4. Save deployment artifact info for Client and Oracle
  const deploymentData = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    reputationRegistry: reputationAddress,
    campaignFactory: factoryAddress,
    oracle: oracleAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const sharedDir = path.join(__dirname, "../../shared");
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(sharedDir, "deployments.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log(`✓ Deployment addresses saved to shared/deployments.json`);

  return deploymentData;
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
