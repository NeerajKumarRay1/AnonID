#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AnonID Production Deployment Pipeline');
console.log('========================================\n');

async function deployProduction() {
    try {
        // Step 1: Check prerequisites
        console.log('📋 Step 1: Checking prerequisites...');
        
        // Check if .env exists
        if (!fs.existsSync('.env')) {
            console.error('❌ .env file not found!');
            console.log('📝 Please create .env file with:');
            console.log('   PRIVATE_KEY=your_private_key_here');
            console.log('   AMOY_RPC_URL=https://rpc-amoy.polygon.technology');
            console.log('   POLYGONSCAN_API_KEY=your_api_key_here');
            process.exit(1);
        }
        
        // Check if private key is set
        require('dotenv').config();
        if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
            console.error('❌ PRIVATE_KEY not set in .env file!');
            console.log('💡 Get your private key from MetaMask:');
            console.log('   1. Open MetaMask');
            console.log('   2. Click Account Details');
            console.log('   3. Export Private Key');
            console.log('   4. Add to .env file');
            process.exit(1);
        }
        
        console.log('✅ Prerequisites check passed');
        
        // Step 2: Generate production circuit files
        console.log('\\n🔧 Step 2: Generating production circuit files...');
        try {
            execSync('node scripts/generate-production-circuit.js', { stdio: 'inherit' });
            console.log('✅ Circuit files generated');
        } catch (error) {
            console.warn('⚠️  Circuit generation failed, using existing files');
        }
        
        // Step 3: Deploy smart contracts
        console.log('\\n📦 Step 3: Deploying smart contracts to Polygon Amoy...');
        console.log('💡 Make sure you have test MATIC: https://faucet.polygon.technology');
        
        const deployResult = execSync('npx hardhat run scripts/deploy.js --network amoy', { 
            stdio: 'pipe',
            encoding: 'utf8'
        });
        
        console.log(deployResult);
        
        // Extract contract address from deployment output
        const addressMatch = deployResult.match(/AnonId deployed to: (0x[a-fA-F0-9]{40})/);
        if (!addressMatch) {
            console.error('❌ Could not extract contract address from deployment');
            process.exit(1);
        }
        
        const contractAddress = addressMatch[1];
        console.log(`✅ Contract deployed: ${contractAddress}`);
        
        // Step 4: Update frontend environment
        console.log('\\n⚙️  Step 4: Updating frontend configuration...');
        
        const frontendEnvPath = 'frontend/.env.local';
        let envContent = '';
        
        if (fs.existsSync(frontendEnvPath)) {
            envContent = fs.readFileSync(frontendEnvPath, 'utf8');
        }
        
        // Update or add contract address
        if (envContent.includes('NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(
                /NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=.*/,
                `NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=${contractAddress}`
            );
        } else {
            envContent += `\\nNEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=${contractAddress}`;
        }
        
        // Set production mode to false by default (user can toggle)
        if (envContent.includes('NEXT_PUBLIC_DEMO_MODE=')) {
            envContent = envContent.replace(
                /NEXT_PUBLIC_DEMO_MODE=.*/,
                'NEXT_PUBLIC_DEMO_MODE=false'
            );
        } else {
            envContent += '\\nNEXT_PUBLIC_DEMO_MODE=false';
        }
        
        // Add network configuration
        if (!envContent.includes('NEXT_PUBLIC_NETWORK_NAME=')) {
            envContent += '\\nNEXT_PUBLIC_NETWORK_NAME=polygon-amoy';
        }
        if (!envContent.includes('NEXT_PUBLIC_RPC_URL=')) {
            envContent += '\\nNEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology';
        }
        
        fs.writeFileSync(frontendEnvPath, envContent);
        console.log('✅ Frontend configuration updated');
        
        // Step 5: Final verification
        console.log('\\n🔍 Step 5: Final verification...');
        
        console.log('📋 Deployment Summary:');
        console.log('======================');
        console.log(`📍 Contract Address: ${contractAddress}`);
        console.log('🌐 Network: Polygon Amoy (Chain ID: 80002)');
        console.log('🔗 Explorer: https://amoy.polygonscan.com/address/' + contractAddress);
        console.log('💰 Faucet: https://faucet.polygon.technology');
        
        console.log('\\n🎉 Production deployment completed successfully!');
        console.log('\\n📱 Next Steps:');
        console.log('1. Start the frontend: cd frontend && npm run dev');
        console.log('2. Connect MetaMask to Polygon Amoy network');
        console.log('3. Use the production mode toggle in the UI');
        console.log('4. Test real blockchain interactions');
        
        console.log('\\n🔧 MetaMask Network Configuration:');
        console.log('   Network Name: Polygon Amoy');
        console.log('   RPC URL: https://rpc-amoy.polygon.technology');
        console.log('   Chain ID: 80002');
        console.log('   Currency: MATIC');
        console.log('   Explorer: https://amoy.polygonscan.com');
        
    } catch (error) {
        console.error('❌ Production deployment failed:', error.message);
        console.log('\\n🔧 Troubleshooting:');
        console.log('1. Check your .env file configuration');
        console.log('2. Ensure you have test MATIC in your wallet');
        console.log('3. Verify MetaMask is connected to Polygon Amoy');
        console.log('4. Check network connectivity');
        process.exit(1);
    }
}

deployProduction();