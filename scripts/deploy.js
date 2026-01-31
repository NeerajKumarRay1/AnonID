const { ethers, network, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting AnonID deployment...");
  console.log("🌐 Network:", network.name);
  console.log("⛓️  Chain ID:", network.config.chainId);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
  
  // Network-specific balance requirements
  const minBalance = network.name === "hardhat" || network.name === "localhost" 
    ? ethers.parseEther("0.001") 
    : ethers.parseEther("0.1");
    
  if (balance < minBalance) {
    console.warn(`⚠️  Warning: Low balance. Minimum recommended: ${ethers.formatEther(minBalance)} MATIC`);
    if (network.name === "mumbai" || network.name === "amoy") {
      console.log("💧 Get testnet MATIC from: https://faucet.polygon.technology");
    }
  }
  
  // Deploy AnonId contract
  console.log("\n📦 Deploying AnonId contract...");
  const AnonId = await ethers.getContractFactory("AnonId");
  
  // Estimate gas for deployment
  const deploymentData = AnonId.bytecode;
  const gasEstimate = await ethers.provider.estimateGas({
    data: deploymentData
  });
  console.log("⛽ Estimated deployment gas:", gasEstimate.toString());
  
  const anonId = await AnonId.deploy();
  await anonId.waitForDeployment();
  const contractAddress = await anonId.getAddress();
  
  console.log("✅ AnonId deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", anonId.deploymentTransaction().hash);
  
  // Wait for confirmations before verification (only on testnets/mainnet)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await anonId.deploymentTransaction().wait(5);
    
    // Attempt contract verification
    if (process.env.POLYGONSCAN_API_KEY) {
      console.log("\n🔍 Verifying contract on block explorer...");
      try {
        await run("verify:verify", {
          address: contractAddress,
          constructorArguments: [],
        });
        console.log("✅ Contract verified successfully!");
      } catch (error) {
        console.warn("⚠️  Contract verification failed:", error.message);
        console.log("💡 You can verify manually later using:");
        console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
      }
    } else {
      console.log("⚠️  POLYGONSCAN_API_KEY not set, skipping verification");
    }
  }
  
  // Configure demo trusted issuers with realistic addresses
  console.log("\n🏛️  Adding demo trusted issuers...");
  
  const demoIssuers = [
    {
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A", // Demo University
      name: "Demo University",
      type: "Educational Institution"
    },
    {
      address: "0x8ba1f109551bD432803012645Hac136c9.slice(0, 42)", // Demo Company
      name: "Demo Tech Company", 
      type: "Corporate Issuer"
    },
    {
      address: "0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC", // Demo Hospital
      name: "Demo Medical Center",
      type: "Healthcare Provider"
    }
  ];
  
  // Fix the demo company address
  demoIssuers[1].address = "0x8ba1f109551bD432803012645Hac136c9c563B266";
  
  const addedIssuers = [];
  for (let i = 0; i < demoIssuers.length; i++) {
    try {
      const issuer = demoIssuers[i];
      console.log(`\n📋 Adding ${issuer.name} (${issuer.type})`);
      console.log(`   Address: ${issuer.address}`);
      
      const tx = await anonId.addTrustedIssuer(issuer.address);
      const receipt = await tx.wait();
      
      console.log(`✅ Added successfully! Gas used: ${receipt.gasUsed.toString()}`);
      addedIssuers.push(issuer);
    } catch (error) {
      console.error(`❌ Failed to add ${demoIssuers[i].name}:`, error.message);
    }
  }
  
  // Verify issuer setup
  console.log("\n🔍 Verifying trusted issuer setup...");
  for (const issuer of addedIssuers) {
    const isTrusted = await anonId.isTrustedIssuer(issuer.address);
    console.log(`   ${issuer.name}: ${isTrusted ? '✅ Trusted' : '❌ Not trusted'}`);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Details:");
  console.log("   - Address:", contractAddress);
  console.log("   - Network:", network.name);
  console.log("   - Chain ID:", network.config.chainId);
  console.log("   - Owner:", deployer.address);
  console.log("   - Trusted Issuers:", addedIssuers.length);
  
  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    transactionHash: anonId.deploymentTransaction().hash,
    blockNumber: anonId.deploymentTransaction().blockNumber,
    trustedIssuers: addedIssuers,
    timestamp: new Date().toISOString(),
    gasUsed: {
      deployment: gasEstimate.toString(),
      issuerSetup: addedIssuers.length * 50000 // Approximate
    }
  };
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n💾 Deployment info saved to:", deploymentFile);
  console.log("\n📄 Frontend Integration:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.config.chainId);
  
  if (network.name === "mumbai" || network.name === "amoy") {
    console.log("\n🔗 Useful Links:");
    const explorerUrl = network.name === "mumbai" 
      ? "https://mumbai.polygonscan.com" 
      : "https://amoy.polygonscan.com";
    console.log(`   Explorer: ${explorerUrl}/address/${contractAddress}`);
    console.log(`   Transaction: ${explorerUrl}/tx/${anonId.deploymentTransaction().hash}`);
  }
  
  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });