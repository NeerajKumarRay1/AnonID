const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xc92439aBb98bB8337076e6800904168E7fad9e7D";
  
  console.log("🏛️  Adding trusted issuer...");
  
  // Get the deployer account (contract owner)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);
  
  // Get contract instance
  const AnonId = await ethers.getContractFactory("AnonId");
  const anonId = AnonId.attach(contractAddress);
  
  try {
    // Add the deployer as a trusted issuer
    console.log("➕ Adding", deployer.address, "as trusted issuer...");
    const tx = await anonId.addTrustedIssuer(deployer.address);
    console.log("⏳ Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed! Gas used:", receipt.gasUsed.toString());
    
    // Verify the issuer was added
    const isTrusted = await anonId.isTrustedIssuer(deployer.address);
    console.log("🔍 Verification:", isTrusted ? "✅ Trusted" : "❌ Not trusted");
    
    console.log("\n🎉 Successfully added trusted issuer!");
    
  } catch (error) {
    console.error("❌ Failed to add trusted issuer:", error.message);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Trusted issuer setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });