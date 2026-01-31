# ZK Circuit Setup Guide

## Current Status
The ZK proof generation is currently using **mock proofs** for demonstration purposes because the circuit files need to be properly compiled with the actual circom compiler.

## Issue Explanation
The error you encountered:
```
WebAssembly.compile() expected magic word 00 61 73 6d, found 5c 30 61 73 @+0
```

This indicates that the WASM file is corrupted or not properly generated. The circuit files in `frontend/public/` were likely created with an incomplete setup.

## To Fix and Enable Real ZK Proofs

### 1. Install Required Tools
```bash
# Install circom compiler
npm install -g circom

# Install snarkjs
npm install -g snarkjs
```

### 2. Compile the Circuit
```bash
# From the project root
npm run compile:circuit
```

### 3. Set up the Trusted Setup
```bash
# Run the setup script
npm run setup:circuit
```

### 4. Copy Files to Frontend
```bash
# Copy the generated files to the frontend public directory
cp build/circuits/CredentialProof_js/CredentialProof.wasm frontend/public/proof.wasm
cp build/keys/CredentialProof_final.zkey frontend/public/trustid_final.zkey
cp build/keys/CredentialProof_verification_key.json frontend/public/verification_key.json
```

### 5. Update ProofGenerator Component
Once the circuit is properly compiled, uncomment the real ZK proof generation code in `frontend/src/components/ProofGenerator.tsx` (lines marked with TODO).

## Current Workaround
The application now uses **mock proofs** that:
- ✅ Demonstrate the UI flow
- ✅ Show the expected proof structure
- ✅ Allow testing of the frontend without ZK setup
- ⚠️ Are not cryptographically secure (for demo only)

## Circuit Definition
The circuit (`circuits/CredentialProof.circom`) expects:

**Private Inputs (Witness):**
- `credentialData`: The actual credential data
- `salt`: Random salt for commitment
- `issuedAt`: Timestamp when credential was issued

**Public Inputs:**
- `commitment`: Expected commitment hash
- `issuerAddress`: Trusted issuer address
- `currentTimestamp`: Current timestamp for validation
- `isRevoked`: Revocation status (0 = not revoked)

**Output:**
- `valid`: 1 if proof is valid, 0 otherwise

## Next Steps
1. Install circom and snarkjs
2. Run the circuit compilation and setup
3. Test with real ZK proofs
4. Deploy to production with proper trusted setup ceremony

## Security Note
For production use, the trusted setup ceremony should be performed with multiple participants to ensure security. The current setup is suitable for development and testing only.