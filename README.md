# AnonID - Self-Sovereign Digital Identity System

🔐 **Privacy-Preserving Identity Verification with Zero Knowledge Proofs**

AnonID is a blockchain-based self-sovereign identity platform that enables users to own their digital identity, receive verifiable credentials from trusted issuers, and prove claims using Zero Knowledge Proofs while maintaining complete privacy.

## 🌟 Key Features

- **🔑 Wallet-Based Identity**: No passwords, just cryptographic control via MetaMask
- **🏛️ Trusted Issuers**: Universities, companies, and institutions can issue verifiable credentials
- **🔒 Zero Knowledge Proofs**: Prove claims without revealing personal data
- **⛓️ Blockchain Consent**: Explicit on-chain consent management with full user control
- **🚫 No Personal Data**: Only cryptographic commitments stored on-chain
- **🔄 Revocation Control**: Users and issuers can revoke access at any time

## 🏗️ Architecture

```
Issuer (Institution)
        ↓
    Credential Issuance (MetaMask tx)
        ↓
Blockchain (Smart Contracts)
        ↓
    Verifiable commitments
        ↓
User Identity Wallet (Frontend)
        ↓
    ZKP + Consent Transaction
        ↓
Verifier (Organization / App)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **MetaMask wallet** or compatible Web3 wallet
- **MATIC tokens** for Polygon testnet (Amoy or Mumbai)
- **Polygonscan API key** (optional, for contract verification)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd anon-id

# Install dependencies
npm install

# Compile smart contracts
npm run compile

# Compile ZKP circuits (requires circom)
npm run compile:circuit

# Setup ZKP proving/verification keys
npm run setup:circuit

# Copy environment file
cp .env.example .env

# Edit .env with your private key and API keys
nano .env
```

### Environment Configuration

Add to your `.env` file:

```env
# Required: Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_without_0x_prefix

# Optional: Polygonscan API key for contract verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Optional: Custom RPC URLs (defaults provided)
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

### Deployment

```bash
# Compile contracts
npm run compile

# Deploy to Polygon Amoy testnet (recommended)
npm run deploy

# Deploy to Mumbai testnet (legacy support)
npm run deploy:mumbai

# Deploy to local network (for development)
npm run node  # In one terminal
npm run deploy:local  # In another terminal

# Deploy to Polygon mainnet (production)
npm run deploy:polygon
```

### Post-Deployment Setup

```bash
# Verify contract on block explorer (optional)
npm run verify

# Set up demo data for testing
npm run setup-demo

# Run tests to verify everything works
npm test
```

## 📋 Smart Contract API Reference

### Core Data Structures

#### Credential Struct
```solidity
struct Credential {
    address issuer;        // Who issued this credential
    uint256 issuedAt;     // When it was issued (block timestamp)
    bool revoked;         // Current revocation status
}
```

### Administrative Functions

#### `addTrustedIssuer(address issuer)`
**Access**: Owner only  
**Purpose**: Authorize an address to issue credentials  
**Gas Cost**: ~50,000  
**Events**: `TrustedIssuerAdded(address indexed issuer)`

```solidity
// Example usage
anonId.addTrustedIssuer("0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A");
```

#### `removeTrustedIssuer(address issuer)`
**Access**: Owner only  
**Purpose**: Revoke issuer authorization  
**Gas Cost**: ~30,000  
**Events**: `TrustedIssuerRemoved(address indexed issuer)`

### Credential Management Functions

#### `issueCredential(bytes32 commitment)`
**Access**: Trusted issuers only  
**Purpose**: Issue a new verifiable credential  
**Gas Cost**: ~80,000  
**Events**: `CredentialIssued(bytes32 indexed commitment, address indexed issuer)`

```solidity
// Example: Issue a university degree credential
bytes32 commitment = keccak256(abi.encodePacked(
    userAddress,
    "university_degree",
    "Computer_Science",
    block.timestamp
));
anonId.issueCredential(commitment);
```

#### `revokeCredential(bytes32 commitment)`
**Access**: Original issuer only  
**Purpose**: Permanently revoke a credential  
**Gas Cost**: ~30,000  
**Events**: `CredentialRevoked(bytes32 indexed commitment, address indexed issuer)`

### Consent Management Functions

#### `giveConsent(bytes32 commitment, address verifier)`
**Access**: Any address (represents credential holder)  
**Purpose**: Grant verification permission to a verifier  
**Gas Cost**: ~70,000  
**Events**: `ConsentGiven(bytes32 indexed commitment, address indexed verifier)`

```solidity
// Example: Grant consent to a job portal
anonId.giveConsent(credentialCommitment, jobPortalAddress);
```

#### `revokeConsent(bytes32 commitment, address verifier)`
**Access**: Any address (represents credential holder)  
**Purpose**: Withdraw verification permission  
**Gas Cost**: ~30,000  
**Events**: `ConsentRevoked(bytes32 indexed commitment, address indexed verifier)`

### Verification Functions

#### `verifyProof(uint[2] a, uint[2][2] b, uint[2] c, uint[256] input)`
**Access**: Public (read-only)  
**Purpose**: Verify a zero-knowledge proof  
**Gas Cost**: ~150,000  
**Returns**: `bool` - true if proof is valid

```solidity
// Example ZKP verification
uint[2] memory a = [/* proof component a */];
uint[2][2] memory b = [/* proof component b */];
uint[2] memory c = [/* proof component c */];
uint[256] memory input = [uint256(commitment)];

bool isValid = anonId.verifyProof(a, b, c, input);
```

### Query Functions (View/Pure)

#### `isTrustedIssuer(address issuer) → bool`
Check if an address is authorized to issue credentials

#### `getCredential(bytes32 commitment) → (address issuer, uint256 issuedAt, bool revoked)`
Get credential information

#### `hasConsent(bytes32 commitment, address verifier) → bool`
Check if consent exists for verification

### Events

```solidity
event CredentialIssued(bytes32 indexed commitment, address indexed issuer);
event CredentialRevoked(bytes32 indexed commitment, address indexed issuer);
event ConsentGiven(bytes32 indexed commitment, address indexed verifier);
event ConsentRevoked(bytes32 indexed commitment, address indexed verifier);
event TrustedIssuerAdded(address indexed issuer);
event TrustedIssuerRemoved(address indexed issuer);
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run gas-report

# Run tests with coverage
npm run coverage

# Run specific test file
npx hardhat test test/AnonId.integration.test.js
```

### Test Structure

- **Unit Tests**: Test individual functions and edge cases
- **Integration Tests**: Test complete workflows
- **Property Tests**: Test universal properties with fuzzing
- **Gas Tests**: Measure and optimize gas consumption

## 📊 Gas Cost Analysis

| Operation | Gas Cost | USD Cost* | Notes |
|-----------|----------|-----------|-------|
| **Contract Deployment** | ~2,500,000 | $0.75 | One-time cost |
| **Add Trusted Issuer** | ~50,000 | $0.015 | Admin operation |
| **Issue Credential** | ~80,000 | $0.024 | Per credential |
| **Give Consent** | ~70,000 | $0.021 | Per consent |
| **Revoke Credential** | ~30,000 | $0.009 | Per revocation |
| **Revoke Consent** | ~30,000 | $0.009 | Per consent revocation |
| **Verify Proof** | ~150,000 | $0.045 | Per verification |

*Based on 30 gwei gas price and $0.50 MATIC price

### Gas Optimization Features

- **Efficient Storage**: Minimal on-chain data storage
- **Batch Operations**: Support for multiple operations in single transaction
- **Optimized Compiler**: Uses Solidity 0.8.24 with IR optimization
- **OpenZeppelin**: Battle-tested, gas-optimized implementations

## 🔒 Security Features

### Access Control
- **Owner-Only Functions**: Critical admin functions restricted to contract owner
- **Issuer Authorization**: Only trusted issuers can create credentials
- **Signature Verification**: All operations require valid wallet signatures

### Reentrancy Protection
```solidity
// All state-changing functions use ReentrancyGuard
function issueCredential(bytes32 commitment) external nonReentrant {
    // Function implementation
}
```

### Input Validation
- **Zero Address Checks**: Prevent invalid address parameters
- **Duplicate Prevention**: Prevent duplicate credentials and consents
- **State Validation**: Ensure valid state transitions

### Privacy Protection
- **No Personal Data**: Only cryptographic commitments stored on-chain
- **Zero Knowledge Proofs**: Prove claims without revealing data
- **Explicit Consent**: All verifications require user authorization

## 🔐 Zero Knowledge Proof (ZKP) System

AnonID uses GROTH16 zero-knowledge proofs to enable privacy-preserving credential verification. Users can prove they possess valid credentials without revealing any personal information.

### ZKP Circuit Overview

The `CredentialProof.circom` circuit validates:
1. **Commitment Integrity**: Proves the user knows the credential data that hashes to the public commitment
2. **Revocation Status**: Ensures the credential is not revoked
3. **Timestamp Validity**: Verifies the credential was issued before the current time
4. **Issuer Trust**: Validates the issuer is trusted (checked on-chain)

### Circuit Interface

**Private Inputs (Witness):**
```javascript
{
  "credentialData": "12345678901234567890",  // Actual credential data
  "salt": "98765432109876543210",            // Random salt for commitment
  "issuedAt": "1640995200"                   // Timestamp when issued
}
```

**Public Inputs:**
```javascript
{
  "commitment": "123456789012345678901234567890123456789012345678901234567890",
  "issuerAddress": "0x1234567890123456789012345678901234567890",
  "currentTimestamp": "1672531200",
  "isRevoked": "0"  // 0 = not revoked, 1 = revoked
}
```

### ZKP Development Workflow

#### 1. Install Prerequisites

```bash
# Install circom compiler (choose one method):

# Method 1: Download binary from GitHub releases
# https://github.com/iden3/circom/releases

# Method 2: Build from source (requires Rust)
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# Install snarkjs globally
npm install -g snarkjs
```

#### 2. Compile Circuit

```bash
# Compile the circuit to generate constraint system and WASM
npm run compile:circuit

# This creates:
# - build/circuits/CredentialProof.r1cs (constraint system)
# - build/circuits/CredentialProof_js/CredentialProof.wasm (WebAssembly)
# - build/circuits/CredentialProof.sym (symbol file)
```

#### 3. Setup Proving/Verification Keys

```bash
# Generate proving and verification keys
npm run setup:circuit

# This creates:
# - build/keys/CredentialProof_final.zkey (proving key)
# - build/keys/CredentialProof_verification_key.json (verification key)
# - contracts/CredentialProofVerifier.sol (Solidity verifier)
```

#### 4. Generate Proofs

```bash
# Generate a proof using sample input
npm run generate:proof circuits/input.json proof.json public.json

# Verify the proof
npm run verify:proof proof.json public.json
```

### ZKP Integration with Smart Contract

The setup process generates a Solidity verifier contract that can be integrated with the main AnonId contract:

```solidity
// Generated verifier contract
contract CredentialProofVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public view returns (bool);
}

// Integration in AnonId contract
function verifyCredentialProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    bytes32 commitment
) external view returns (bool) {
    // Extract public inputs
    uint[1] memory publicInputs = [uint256(commitment)];
    
    // Verify the proof
    bool proofValid = verifier.verifyProof(a, b, c, publicInputs);
    
    // Additional on-chain validations
    Credential memory cred = credentials[commitment];
    require(cred.issuer != address(0), "Credential does not exist");
    require(!cred.revoked, "Credential is revoked");
    require(trustedIssuers[cred.issuer], "Issuer not trusted");
    require(hasConsent[commitment][msg.sender], "No consent given");
    
    return proofValid;
}
```

### Client-Side Proof Generation

```javascript
// Example: Generate proof in browser/Node.js
const snarkjs = require("snarkjs");

async function generateCredentialProof(credentialData, salt, commitment) {
    // Prepare circuit inputs
    const input = {
        credentialData: credentialData,
        salt: salt,
        issuedAt: Math.floor(Date.now() / 1000) - 86400, // Yesterday
        commitment: commitment,
        issuerAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5A",
        currentTimestamp: Math.floor(Date.now() / 1000),
        isRevoked: 0
    };
    
    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "build/circuits/CredentialProof_js/CredentialProof.wasm",
        "build/keys/CredentialProof_final.zkey"
    );
    
    // Format for smart contract
    const solidityProof = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
        c: [proof.pi_c[0], proof.pi_c[1]]
    };
    
    return { solidityProof, publicSignals };
}
```

### ZKP Security Considerations

1. **Trusted Setup**: The circuit uses a Powers of Tau ceremony for security
   - Download from trusted sources (Hermez ceremony)
   - Verify the ceremony parameters
   - For production, participate in or audit the ceremony

2. **Circuit Security**: 
   - All constraints are properly enforced
   - No information leakage through circuit design
   - Proper input validation and range checks

3. **Key Management**:
   - Proving keys must be kept secure
   - Verification keys are public and safe to share
   - Rotate keys if compromised

4. **Implementation Security**:
   - Validate all public inputs on-chain
   - Check credential existence and revocation status
   - Verify issuer trust and user consent

### ZKP Performance Metrics

| Operation | Time | Size | Notes |
|-----------|------|------|-------|
| **Circuit Compilation** | ~30s | - | One-time setup |
| **Key Generation** | ~60s | 50MB | One-time setup |
| **Proof Generation** | ~2s | 128 bytes | Client-side |
| **Proof Verification** | ~10ms | - | On-chain |
| **WASM File** | - | ~2MB | Downloaded once |

### Troubleshooting ZKP Setup

#### Circuit Compilation Issues
```bash
# Ensure circom is properly installed
circom --version

# Check circuit syntax
circom circuits/CredentialProof.circom --info

# Clean and recompile
rm -rf build/circuits
npm run compile:circuit
```

#### Key Generation Issues
```bash
# Verify Powers of Tau file
snarkjs powersoftau verify build/powersOfTau/pot12_final.ptau

# Regenerate keys
rm -rf build/keys
npm run setup:circuit
```

#### Proof Generation Issues
```bash
# Validate input format
node -e "console.log(JSON.parse(require('fs').readFileSync('circuits/input.json')))"

# Test with sample input
npm run generate:proof
npm run verify:proof
```

### Audit Considerations

1. **Access Control**: Thoroughly tested with property-based tests
2. **Integer Overflow**: Protected by Solidity 0.8+ built-in checks
3. **Reentrancy**: Protected by OpenZeppelin's ReentrancyGuard
4. **Front-Running**: Minimal impact due to commitment-based design
5. **Gas Limit**: All functions designed to stay under block gas limit

## 🌐 Network Configuration

### Polygon Amoy Testnet (Recommended)
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Explorer**: https://amoy.polygonscan.com
- **Faucet**: https://faucet.polygon.technology
- **Gas Price**: 30 gwei (recommended)

### Mumbai Testnet (Legacy Support)
- **Chain ID**: 80001
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology
- **Gas Price**: 30 gwei (recommended)

### Polygon Mainnet (Production)
- **Chain ID**: 137
- **RPC URL**: https://polygon-rpc.com
- **Explorer**: https://polygonscan.com
- **Gas Price**: 50+ gwei (check current rates)

### Getting Testnet MATIC

1. Visit [Polygon Faucet](https://faucet.polygon.technology)
2. Connect your MetaMask wallet
3. Select Amoy or Mumbai testnet
4. Request testnet MATIC (0.5 MATIC per request)
5. Wait for confirmation (usually 1-2 minutes)

## 🔧 Development

### Project Structure

```
anon-id/
├── contracts/              # Solidity smart contracts
│   └── AnonId.sol         # Main identity contract
├── scripts/               # Deployment and utility scripts
│   ├── deploy.js          # Main deployment script
│   ├── verify.js          # Contract verification
│   └── setup-demo.js      # Demo data setup
├── test/                  # Test files
│   ├── AnonId.integration.test.js  # Integration tests
│   └── AnonId.property.test.js     # Property-based tests
├── deployments/           # Deployment artifacts (created after deploy)
├── artifacts/             # Compiled contract artifacts
├── cache/                 # Hardhat cache
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

### Development Workflow

1. **Setup**: Install dependencies and configure environment
2. **Development**: Write and test smart contracts
3. **Testing**: Run comprehensive test suite
4. **Deployment**: Deploy to testnet for integration testing
5. **Verification**: Verify contracts on block explorer
6. **Demo Setup**: Create demo data for frontend integration
7. **Production**: Deploy to mainnet after thorough testing

### Adding New Features

1. **Smart Contract**: Add new functions to `contracts/AnonId.sol`
2. **Tests**: Add corresponding tests in `test/` directory
3. **Documentation**: Update this README with new functions
4. **Gas Analysis**: Measure gas costs for new operations
5. **Security Review**: Consider security implications

## 🤝 Contributing

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/anon-id.git
cd anon-id

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
npm test

# Submit a pull request
```

### Contribution Guidelines

1. **Code Quality**: Follow Solidity best practices
2. **Testing**: Add tests for all new functionality
3. **Documentation**: Update README and code comments
4. **Gas Optimization**: Consider gas costs in implementation
5. **Security**: Follow security best practices

### Code Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **JavaScript**: Use ESLint configuration
- **Comments**: Use NatSpec for contract documentation
- **Naming**: Use descriptive variable and function names

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support and Troubleshooting

### Common Issues

#### Deployment Fails
```bash
# Check your balance
npm run deploy:mumbai  # Try Mumbai if Amoy fails

# Verify your private key is correct (without 0x prefix)
# Ensure you have enough MATIC for gas fees
```

#### Contract Verification Fails
```bash
# Wait a few minutes after deployment
npm run verify:mumbai

# Check your Polygonscan API key is valid
# Ensure you're using the correct network
```

#### Tests Fail
```bash
# Clean and recompile
npm run clean
npm run compile
npm test
```

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and code comments
- **Test Examples**: Review test files for usage examples
- **Community**: Join blockchain development communities

## 🔮 Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Smart contract implementation
- [x] Deployment scripts
- [x] Comprehensive testing
- [x] Documentation

### Phase 2: ZKP Integration (In Progress)
- [x] Circom circuit development
- [x] Circuit compilation and setup scripts
- [x] GROTH16 proof generation utilities
- [ ] Verifier contract integration
- [ ] Client-side proof generation library

### Phase 3: Frontend Development
- [ ] Next.js dashboard
- [ ] MetaMask integration
- [ ] Credential management UI
- [ ] Proof generation interface

### Phase 4: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Multi-chain support
- [ ] Advanced privacy features
- [ ] Governance mechanisms

### Phase 5: Production
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Performance optimization
- [ ] Enterprise features

---

**Built with ❤️ for a privacy-first digital identity future**

*AnonID enables true self-sovereign identity where users control their data, issuers provide verifiable credentials, and verifiers can trust without compromising privacy.*