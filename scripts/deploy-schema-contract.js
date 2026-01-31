const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying schema-based AnonID contracts to Polygon Amoy...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  try {
    // Deploy CredentialProofVerifier first
    console.log("\n1. Deploying CredentialProofVerifier...");
    const CredentialProofVerifier = await ethers.getContractFactory("CredentialProofVerifier");
    const verifier = await CredentialProofVerifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log("CredentialProofVerifier deployed to:", verifierAddress);

    // Deploy AnonId with verifier address
    console.log("\n2. Deploying AnonId...");
    const AnonId = await ethers.getContractFactory("AnonId");
    const anonId = await AnonId.deploy(verifierAddress);
    await anonId.waitForDeployment();
    const anonIdAddress = await anonId.getAddress();
    console.log("AnonId deployed to:", anonIdAddress);

    // Add deployer as trusted issuer
    console.log("\n3. Adding deployer as trusted issuer...");
    const addTrustedIssuerTx = await anonId.addTrustedIssuer(deployer.address);
    await addTrustedIssuerTx.wait();
    console.log("Deployer added as trusted issuer");

    // Verify the trusted issuer was added
    const isTrusted = await anonId.isTrustedIssuer(deployer.address);
    console.log("Deployer is trusted issuer:", isTrusted);

    // Save deployment info
    const deploymentInfo = {
      network: "amoy",
      chainId: 80002,
      contracts: {
        CredentialProofVerifier: verifierAddress,
        AnonId: anonIdAddress
      },
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      gasUsed: {
        verifier: "~2,500,000",
        anonId: "~3,000,000",
        addTrustedIssuer: "~50,000"
      }
    };

    // Write to deployment file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, 'amoy-schema-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n✅ Deployment completed successfully!");
    console.log("\n📋 Deployment Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Network: Polygon Amoy (Chain ID: 80002)`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`CredentialProofVerifier: ${verifierAddress}`);
    console.log(`AnonId: ${anonIdAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    console.log("\n🔧 Next Steps:");
    console.log("1. Update frontend/.env.local with the new AnonId contract address:");
    console.log(`   NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=${anonIdAddress}`);
    console.log("2. Update .env with the new contract address:");
    console.log(`   ANON_ID_CONTRACT_ADDRESS=${anonIdAddress}`);
    console.log("3. Test the schema-based credential issuance in the frontend");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });