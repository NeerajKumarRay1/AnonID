# ZKP Circuits

This directory contains the Zero Knowledge Proof circuits for the AnonID system.

## Circuit Overview

### CredentialProof.circom

The main circuit that proves credential validity without revealing personal data.

**Private Inputs (Witness):**
- `credentialData`: The actual credential data
- `salt`: Random salt for commitment generation
- `issuedAt`: Timestamp when credential was issued

**Public Inputs:**
- `commitment`: Expected commitment hash
- `issuerAddress`: Trusted issuer address
- `currentTimestamp`: Current timestamp for validation
- `isRevoked`: Revocation status (0 = not revoked)

**Output:**
- `valid`: 1 if proof is valid, 0 otherwise

**Constraints:**
1. Commitment matches hash of credential data + salt
2. Credential is not revoked (isRevoked === 0)
3. Credential was issued before current time
4. Issuer validation (verified on-chain)

## Compilation and Setup

### Prerequisites

Install required tools:
```bash
npm install -g circom
npm install -g snarkjs
```

### Step 1: Compile Circuit

**Linux/Mac:**
```bash
./scripts/compile-circuit.sh
```

**Windows:**
```cmd
scripts\compile-circuit.bat
```

This generates:
- `build/circuits/CredentialProof.r1cs` - Constraint system
- `build/circuits/CredentialProof_js/CredentialProof.wasm` - WebAssembly for proof generation
- `build/circuits/CredentialProof.sym` - Symbol file for debugging

### Step 2: Setup Proving/Verification Keys

**Linux/Mac:**
```bash
./scripts/setup-circuit.sh
```

**Windows:**
```cmd
scripts\setup-circuit.bat
```

This generates:
- `build/keys/CredentialProof_final.zkey` - Proving key
- `build/keys/CredentialProof_verification_key.json` - Verification key
- `contracts/CredentialProofVerifier.sol` - Solidity verifier contract

## Testing the Circuit

### Generate a Proof

```bash
snarkjs groth16 fullprove \
  circuits/input.json \
  build/circuits/CredentialProof_js/CredentialProof.wasm \
  build/keys/CredentialProof_final.zkey \
  proof.json \
  public.json
```

### Verify the Proof

```bash
snarkjs groth16 verify \
  build/keys/CredentialProof_verification_key.json \
  public.json \
  proof.json
```

## Integration with Smart Contract

The generated `CredentialProofVerifier.sol` contract can be deployed and integrated with the main AnonId contract to verify proofs on-chain.

## Security Considerations

- The Powers of Tau ceremony files are downloaded from the Hermez trusted setup
- For production use, participate in or verify the trusted setup ceremony
- Keep proving keys secure - they can generate valid proofs
- Verification keys are public and safe to share

## File Structure

```
circuits/
├── CredentialProof.circom     # Main circuit
├── input.json                 # Sample input for testing
└── README.md                  # This file

build/
├── circuits/                  # Compiled circuit files
├── powersOfTau/              # Powers of Tau ceremony files
└── keys/                     # Proving and verification keys

contracts/
└── CredentialProofVerifier.sol # Generated Solidity verifier
```