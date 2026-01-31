# AnonID Deployment Guide

This guide provides detailed instructions for deploying the AnonID smart contract system to various networks.

## Prerequisites

### Required Software
- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet

### Required Accounts
- Wallet with private key for deployment
- Polygonscan account for contract verification (optional)

### Required Tokens
- **Testnet**: 0.5+ MATIC for deployment and setup
- **Mainnet**: 2+ MATIC for deployment and initial operations

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd anon-id
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required: Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: API key for contract verification
POLYGONSCAN_API_KEY=your_api_key_here

# Optional: Custom RPC URLs
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_RPC_URL=https://polygon-rpc.com
```

### 3. Get Testnet Tokens

For testnet deployment, get MATIC from the [Polygon Faucet](https://faucet.polygon.technology):

1. Connect your MetaMask wallet
2. Select Amoy or Mumbai testnet
3. Request 0.5 MATIC
4. Wait for confirmation

## Deployment Process

### Step 1: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 4 Solidity files successfully (evm target: paris).
```

### Step 2: Deploy to Testnet

#### Deploy to Amoy (Recommended)
```bash
npm run deploy
```

#### Deploy to Mumbai (Legacy)
```bash
npm run deploy:mumbai
```

#### Deploy to Local Network
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to local
npm run deploy:local
```

### Step 3: Verify Contract (Optional)

```bash
# Verify on Amoy
npm run verify

# Verify on Mumbai
npm run verify:mumbai
```

### Step 4: Setup Demo Data (Optional)

```bash
# Setup demo credentials and consents
npm run setup-demo
```

## Deployment Output

### Successful Deployment

```
🚀 Starting AnonID deployment...
🌐 Network: amoy
⛓️  Chain ID: 80002
📝 Deploying contracts with account: 0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A
💰 Account balance: 1.5 MATIC
⛽ Estimated deployment gas: 2456789

📦 Deploying AnonId contract...
✅ AnonId deployed to: 0x1234567890123456789012345678901234567890
🔗 Transaction hash: 0xabcdef...

⏳ Waiting for block confirmations...
🔍 Verifying contract on block explorer...
✅ Contract verified successfully!

🏛️  Adding demo trusted issuers...
📋 Adding Demo University (Educational Institution)
   Address: 0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A
✅ Added successfully! Gas used: 48234

🔍 Verifying trusted issuer setup...
   Demo University: ✅ Trusted
   Demo Tech Company: ✅ Trusted
   Demo Medical Center: ✅ Trusted

🎉 Deployment completed successfully!
📋 Contract Details:
   - Address: 0x1234567890123456789012345678901234567890
   - Network: amoy
   - Chain ID: 80002
   - Owner: 0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A
   - Trusted Issuers: 3

💾 Deployment info saved to: deployments/amoy-deployment.json

🔗 Useful Links:
   Explorer: https://amoy.polygonscan.com/address/0x1234567890123456789012345678901234567890
   Transaction: https://amoy.polygonscan.com/tx/0xabcdef...
```

### Deployment Artifacts

After successful deployment, the following files are created:

```
deployments/
├── amoy-deployment.json      # Deployment info for Amoy
├── mumbai-deployment.json    # Deployment info for Mumbai
└── amoy-demo-data.json       # Demo data (if setup-demo was run)
```

## Network-Specific Configuration

### Polygon Amoy Testnet (Recommended)

```javascript
amoy: {
  url: "https://rpc-amoy.polygon.technology",
  chainId: 80002,
  gasPrice: 30000000000, // 30 gwei
  gas: 6000000,
  confirmations: 2,
}
```

**Features:**
- Latest Polygon testnet
- Fast block times (~2 seconds)
- Reliable faucet
- Active block explorer

### Mumbai Testnet (Legacy)

```javascript
mumbai: {
  url: "https://rpc-mumbai.maticvigil.com",
  chainId: 80001,
  gasPrice: 30000000000, // 30 gwei
  gas: 6000000,
  confirmations: 2,
}
```

**Features:**
- Legacy Polygon testnet
- Still supported but deprecated
- Use for compatibility testing

### Polygon Mainnet (Production)

```javascript
polygon: {
  url: "https://polygon-rpc.com",
  chainId: 137,
  gasPrice: 50000000000, // 50+ gwei (check current rates)
  gas: 6000000,
}
```

**Important for Mainnet:**
- Use higher gas prices (check [Polygon Gas Tracker](https://polygonscan.com/gastracker))
- Test thoroughly on testnet first
- Consider using a hardware wallet
- Have sufficient MATIC for deployment (~2 MATIC recommended)

## Troubleshooting

### Common Issues

#### 1. Insufficient Balance
```
Error: insufficient funds for intrinsic transaction cost
```

**Solution:**
- Get more MATIC from faucet (testnet) or exchange (mainnet)
- Check balance: `npm run deploy` shows current balance

#### 2. Network Connection Issues
```
Error: could not detect network
```

**Solutions:**
- Check internet connection
- Try alternative RPC URL in `.env`
- Wait and retry (RPC endpoints can be temporarily unavailable)

#### 3. Private Key Issues
```
Error: invalid private key
```

**Solutions:**
- Ensure private key is without `0x` prefix
- Check for extra spaces or characters
- Verify the key is for the correct account

#### 4. Contract Verification Fails
```
Error: Contract verification failed
```

**Solutions:**
- Wait 5-10 minutes after deployment
- Check Polygonscan API key is valid
- Retry verification: `npm run verify`
- Verify manually on Polygonscan

#### 5. Gas Estimation Fails
```
Error: cannot estimate gas
```

**Solutions:**
- Check contract code compiles correctly
- Ensure sufficient balance for gas
- Try with higher gas limit
- Check network congestion

### Debug Commands

```bash
# Check compilation
npm run compile

# Run tests locally
npm test

# Check gas usage
npm run gas-report

# Clean and rebuild
npm run clean
npm run compile
```

## Security Considerations

### Private Key Management
- **Never commit private keys to version control**
- Use environment variables only
- Consider using hardware wallets for mainnet
- Rotate keys regularly

### Deployment Security
- Verify contract source code after deployment
- Test all functions on testnet first
- Use multi-signature wallets for admin functions
- Monitor contract activity after deployment

### Network Security
- Use official RPC endpoints
- Verify transaction details before signing
- Monitor gas prices to avoid overpaying
- Keep deployment artifacts secure

## Post-Deployment Checklist

### Immediate Actions
- [ ] Verify contract on block explorer
- [ ] Test basic functions (add issuer, issue credential)
- [ ] Save deployment artifacts securely
- [ ] Update frontend configuration with contract address

### Integration Testing
- [ ] Run full test suite against deployed contract
- [ ] Test with frontend application
- [ ] Verify all events are emitted correctly
- [ ] Test error conditions and edge cases

### Production Readiness
- [ ] Security audit (for mainnet)
- [ ] Performance testing
- [ ] Documentation updates
- [ ] Monitoring setup
- [ ] Backup and recovery procedures

## Mainnet Deployment

### Additional Considerations

1. **Security Audit**: Get professional security audit before mainnet
2. **Gas Optimization**: Optimize for mainnet gas costs
3. **Monitoring**: Set up contract monitoring and alerts
4. **Upgrades**: Plan for future upgrades (proxy patterns)
5. **Governance**: Consider decentralized governance for admin functions

### Mainnet Deployment Command

```bash
# Deploy to Polygon mainnet
npm run deploy:polygon

# Verify on mainnet
npm run verify:polygon
```

### Mainnet Costs (Estimated)

| Operation | Gas | Cost (50 gwei) | Cost (100 gwei) |
|-----------|-----|----------------|-----------------|
| Deploy | 2.5M | ~$0.25 | ~$0.50 |
| Add Issuer | 50K | ~$0.005 | ~$0.01 |
| Issue Credential | 80K | ~$0.008 | ~$0.016 |

*Costs based on MATIC price of $0.50*

## Support

For deployment issues:
1. Check this guide first
2. Review error messages carefully
3. Test on local network
4. Create GitHub issue with full error details
5. Join community Discord for real-time help

---

**Remember**: Always test thoroughly on testnet before mainnet deployment!