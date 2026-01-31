const { ethers, network } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple AnonID deployment...");
  console.log("🌐 Network:", network.name);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
  
  try {
    // First deploy the CredentialProofVerifier
    console.log("\n📦 Deploying CredentialProofVerifier contract...");
    const CredentialProofVerifier = await ethers.getContractFactory("CredentialProofVerifier");
    const verifier = await CredentialProofVerifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log("✅ CredentialProofVerifier deployed to:", verifierAddress);
    
    // Then deploy AnonId contract with verifier address
    console.log("\n📦 Deploying AnonId contract...");
    const AnonId = await ethers.getContractFactory("AnonId");
    
    // Deploy with verifier address as constructor parameter
    const anonId = await AnonId.deploy(verifierAddress);
    
    console.log("⏳ Waiting for deployment...");
    await anonId.waitForDeployment();
    
    const contractAddress = await anonId.getAddress();
    console.log("✅ AnonId deployed to:", contractAddress);
    console.log("🔗 Transaction hash:", anonId.deploymentTransaction().hash);
    
    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    await anonId.deploymentTransaction().wait(2);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📋 CredentialProofVerifier Address:", verifierAddress);
    console.log("📋 AnonId Contract Address:", contractAddress);
    console.log("🌐 Network:", network.name);
    console.log("🔗 AnonId Explorer:", `https://amoy.polygonscan.com/address/${contractAddress}`);
    console.log("🔗 Verifier Explorer:", `https://amoy.polygonscan.com/address/${verifierAddress}`);
    
    return { anonId: contractAddress, verifier: verifierAddress };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment successful!");
    console.log("AnonId Contract Address:", addresses.anonId);
    console.log("Verifier Contract Address:", addresses.verifier);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });