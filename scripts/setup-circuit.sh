#!/bin/bash

# Circuit Setup Script
# Generates proving and verification keys using Powers of Tau ceremony

set -e

echo "🔧 Starting circuit setup (Powers of Tau + Final setup)..."

# Circuit configuration
CIRCUIT_NAME="CredentialProof"
BUILD_PATH="build/circuits"
PTAU_PATH="build/powersOfTau"
KEYS_PATH="build/keys"

# Create directories
mkdir -p "$PTAU_PATH"
mkdir -p "$KEYS_PATH"

# Check if snarkjs is available
if ! command -v snarkjs &> /dev/null; then
    echo "❌ snarkjs is not installed globally. Using npx..."
    SNARKJS="npx snarkjs"
else
    SNARKJS="snarkjs"
fi

# Check if circuit is compiled
if [ ! -f "${BUILD_PATH}/${CIRCUIT_NAME}.r1cs" ]; then
    echo "❌ Circuit not compiled. Please run compile-circuit.sh first"
    exit 1
fi

echo "📊 Getting circuit info..."
$SNARKJS info -r "${BUILD_PATH}/${CIRCUIT_NAME}.r1cs"

# Determine the power of 2 needed for the circuit
# For small circuits, we'll use 2^12 (4096 constraints)
POWER=12
PTAU_FILE="${PTAU_PATH}/pot${POWER}_final.ptau"

echo ""
echo "🌟 Phase 1: Powers of Tau ceremony (2^${POWER})"

# Check if we already have the powers of tau file
if [ ! -f "$PTAU_FILE" ]; then
    echo "📥 Downloading powers of tau file..."
    
    # Try to download from Hermez ceremony (trusted setup)
    HERMEZ_URL="https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${POWER}.ptau"
    
    if curl -f -L "$HERMEZ_URL" -o "$PTAU_FILE"; then
        echo "✅ Downloaded trusted powers of tau file"
    else
        echo "⚠️  Download failed. Generating new powers of tau (less secure for production)..."
        
        # Generate new powers of tau
        $SNARKJS powersoftau new bn128 $POWER "${PTAU_PATH}/pot${POWER}_0000.ptau" -v
        
        # Contribute to the ceremony
        $SNARKJS powersoftau contribute "${PTAU_PATH}/pot${POWER}_0000.ptau" "${PTAU_PATH}/pot${POWER}_0001.ptau" \
            --name="First contribution" -v -e="random entropy"
        
        # Phase 2
        $SNARKJS powersoftau prepare phase2 "${PTAU_PATH}/pot${POWER}_0001.ptau" "$PTAU_FILE" -v
    fi
else
    echo "✅ Powers of tau file already exists"
fi

echo ""
echo "🔑 Phase 2: Circuit-specific setup"

# Generate the initial zkey
ZKEY_0="${KEYS_PATH}/${CIRCUIT_NAME}_0000.zkey"
ZKEY_FINAL="${KEYS_PATH}/${CIRCUIT_NAME}_final.zkey"

echo "📝 Generating initial zkey..."
$SNARKJS groth16 setup "${BUILD_PATH}/${CIRCUIT_NAME}.r1cs" "$PTAU_FILE" "$ZKEY_0"

echo "🎯 Contributing to phase 2..."
$SNARKJS zkey contribute "$ZKEY_0" "$ZKEY_FINAL" \
    --name="First contribution" -v -e="more random entropy"

echo "🔍 Verifying final zkey..."
$SNARKJS zkey verify "${BUILD_PATH}/${CIRCUIT_NAME}.r1cs" "$PTAU_FILE" "$ZKEY_FINAL"

echo ""
echo "📄 Generating verification key..."
VKEY_FILE="${KEYS_PATH}/${CIRCUIT_NAME}_verification_key.json"
$SNARKJS zkey export verificationkey "$ZKEY_FINAL" "$VKEY_FILE"

echo ""
echo "🔧 Generating Solidity verifier contract..."
VERIFIER_SOL="contracts/${CIRCUIT_NAME}Verifier.sol"
$SNARKJS zkey export solidityverifier "$ZKEY_FINAL" "$VERIFIER_SOL"

echo ""
echo "✅ Circuit setup completed successfully!"
echo ""
echo "📁 Generated files:"
echo "   - ${ZKEY_FINAL} (proving key)"
echo "   - ${VKEY_FILE} (verification key)"
echo "   - ${VERIFIER_SOL} (Solidity verifier contract)"
echo ""
echo "🚀 You can now:"
echo "   1. Generate proofs using the proving key"
echo "   2. Verify proofs using the verification key"
echo "   3. Deploy the Solidity verifier contract"
echo ""
echo "💡 Example proof generation:"
echo "   snarkjs groth16 fullprove input.json build/circuits/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm ${ZKEY_FINAL} proof.json public.json"