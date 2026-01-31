const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  
  // Check if we have enough for deployment (estimate ~0.01 MATIC)
  const minRequired = ethers.parseEther("0.01");
  if (balance < minRequired) {
    console.log("❌ Insufficient balance for deployment");
    console.log("💧 Get testnet MATIC from: https://faucet.polygon.technology");
  } else {
    console.log("✅ Sufficient balance for deployment");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});