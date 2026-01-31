const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification...");
  console.log("🌐 Network:", network.name);
  
  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.log("💡 Please deploy the contract first using: npm run deploy");
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("📋 Contract Address:", contractAddress);
  
  if (!process.env.POLYGONSCAN_API_KEY) {
    console.error("❌ POLYGONSCAN_API_KEY not set in environment variables");
    console.log("💡 Please add your Polygonscan API key to .env file");
    process.exit(1);
  }
  
  try {
    console.log("⏳ Verifying contract...");
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // AnonId constructor takes no arguments
    });
    
    console.log("✅ Contract verified successfully!");
    
    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    const explorerUrl = network.name === "mumbai" 
      ? "https://mumbai.polygonscan.com" 
      : network.name === "amoy"
      ? "https://amoy.polygonscan.com"
      : "https://polygonscan.com";
      
    console.log(`🔗 View on explorer: ${explorerUrl}/address/${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.log("\n💡 Troubleshooting tips:");
      console.log("   - Make sure the contract is deployed and confirmed");
      console.log("   - Check that your API key is valid");
      console.log("   - Wait a few minutes and try again");
      console.log("   - Ensure you're using the correct network");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification script failed:", error);
    process.exit(1);
  });