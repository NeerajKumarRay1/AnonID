# 🚀 Production Deployment Guide

## Prerequisites

1. **Get Polygon Amoy MATIC**: Visit https://faucet.polygon.technology
   - Select "Polygon Amoy" network
   - Enter your wallet address
   - Request test MATIC (need ~0.1 MATIC for deployment)

2. **Get Your Private Key**:
   - Open MetaMask → Account Details → Export Private Key
   - ⚠️ **NEVER share this key or commit it to git**

3. **Get PolygonScan API Key** (optional, for contract verification):
   - Visit https://polygonscan.com/apis
   - Create free account and get API key

## Step 1: Configure Environment

```bash
# Copy and edit the .env file
cp .env .env.local

# Edit .env.local with your actual values:
PRIVATE_KEY=0x1234567890abcdef...  # Your wallet private key
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=ABC123...  # Optional, for verification
```

## Step 2: Deploy to Polygon Amoy

```bash
# Deploy contracts
npx hardhat run scripts/deploy.js --network amoy

# Expected output:
# ✅ AnonId deployed to: 0x1234567890123456789012345678901234567890
# ✅ Contract verified successfully!
```

## Step 3: Update Frontend Configuration

Copy the deployed contract address to frontend environment:

```bash
# Update frontend/.env.local
echo "NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=0xYourContractAddress" >> frontend/.env.local
echo "NEXT_PUBLIC_DEMO_MODE=false" >> frontend/.env.local
```

## Step 4: Test Production Mode

```bash
cd frontend
npm run dev

# Visit http://localhost:3000
# Connect MetaMask to Polygon Amoy network
# Test real blockchain interactions
```

## Verification

After deployment, verify:

1. **Contract on Explorer**: Visit https://amoy.polygonscan.com/address/YOUR_ADDRESS
2. **Trusted Issuers**: Check that demo issuers were added
3. **Frontend Connection**: Ensure MetaMask connects to Amoy
4. **Real Transactions**: Test issuing and verifying credentials

## Troubleshooting

### "Insufficient funds" error:
- Get more MATIC from https://faucet.polygon.technology

### "Invalid private key" error:
- Ensure private key starts with 0x
- Check for extra spaces or characters

### "Network not supported" error:
- Add Polygon Amoy to MetaMask:
  - Network Name: Polygon Amoy
  - RPC URL: https://rpc-amoy.polygon.technology
  - Chain ID: 80002
  - Currency: MATIC
  - Explorer: https://amoy.polygonscan.com

### Contract verification failed:
- Verify manually: `npx hardhat verify --network amoy YOUR_CONTRACT_ADDRESS`