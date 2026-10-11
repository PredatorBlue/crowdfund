const OracleService = require("./src/oracleService");

async function main() {
  console.log("=================================================");
  console.log("Trust-Aware Crowdfunding: Oracle Bridge Service");
  console.log("=================================================");

  const oracle = new OracleService();
  await oracle.init();
  oracle.startListener();

  console.log("\n[Oracle Daemon] Active and listening for on-chain events...");
  console.log("Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("[Oracle Daemon Error]", err);
  process.exit(1);
});
