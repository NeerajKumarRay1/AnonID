# AnonID Setup Guide

This guide will help you deploy and configure the AnonID smart contract for production use.

## Prerequisites

- Node.js and npm installed
- MetaMask wallet with Polygon Amoy testnet configured
- Some MATIC tokens for gas fees (get from [Polygon Faucet](https://faucet.polygon.technology))

## Step 1: Deploy the Smart Contract

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your private key:**
   Create a `.env` file in the root directory:
   ```bash
   PRIVATE_KEY=your_wallet_private_key_here
   ```

3. **Deploy to Polygon Amoy:**
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```

4. **Save the contract address** from the deployment output.

## Step 2: Configure the Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Update the environment file:**
   Edit `frontend/.env.local` and replace the placeholder address:
   ```bash
   NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Step 3: Set Up ZK Circuit Files

1. **Generate circuit files:**
   ```bash
   cd circuits
   ./setup-circuit.sh  # On Linux/Mac
   # or
   setup-circuit.bat   # On Windows
   ```

2. **Copy files to frontend:**
   ```bash
   cp credential_proof_js/proof.wasm ../frontend/public/
   cp trustid_final.zkey ../frontend/public/
   cp verification_key.json ../frontend/public/
   ```

## Step 4: Configure Trusted Issuers

1. **Add your wallet as a trusted issuer:**
   ```bash
   npx hardhat run scripts/add-trusted-issuer.js --network amoy
   ```

## Verification

1. Open your browser to `http://localhost:3001`
2. Connect your MetaMask wallet
3. You should see no configuration warnings
4. Try issuing a test credential

## Troubleshooting

### "Contract address not configured" error
- Make sure `NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS` is set in `frontend/.env.local`
- Verify the address is a valid Ethereum address (42 characters, starts with 0x)
- Restart the development server after changing environment variables

### "Failed to fetch" errors
- Ensure you're connected to Polygon Amoy network in MetaMask
- Check that you have MATIC tokens for gas fees
- Verify the contract is deployed at the specified address

### ZK Proof generation fails
- Make sure circuit files are in `frontend/public/`
- Check browser console for specific error messages
- Verify circuit files are not corrupted

## Production Deployment

For production deployment:

1. Deploy to Polygon mainnet instead of Amoy
2. Update RPC URLs in wagmi configuration
3. Use environment variables for sensitive data
4. Set up proper domain and SSL certificates
5. Configure proper CORS settings

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your wallet is connected to the correct network
4. Check that the contract is deployed and accessible