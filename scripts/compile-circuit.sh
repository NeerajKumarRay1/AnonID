#!/bin/bash

# Circuit Compilation Script
# Compiles circom circuit to r1cs, wasm, and sym files

set -e

echo "🔧 Starting circuit compilation..."

# Create build directory if it doesn't exist
mkdir -p build/circuits

# Circuit name
CIRCUIT_NAME="CredentialProof"
CIRCUIT_PATH="circuits/${CIRCUIT_NAME}.circom"
BUILD_PATH="build/circuits"

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ circom is not installed. Please install it first:"
    echo "   npm install -g circom"
    echo "   Or download from: https://github.com/iden3/circom"
    exit 1
fi

echo "📁 Compiling circuit: $CIRCUIT_PATH"

# Compile the circuit
circom "$CIRCUIT_PATH" \
    --r1cs \
    --wasm \
    --sym \
    --c \
    --output "$BUILD_PATH"

echo "✅ Circuit compilation completed!"
echo "📄 Generated files:"
echo "   - ${BUILD_PATH}/${CIRCUIT_NAME}.r1cs"
echo "   - ${BUILD_PATH}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo "   - ${BUILD_PATH}/${CIRCUIT_NAME}.sym"
echo "   - ${BUILD_PATH}/${CIRCUIT_NAME}_cpp/ (C++ files)"

echo ""
echo "🔍 Circuit info:"
circom "$CIRCUIT_PATH" --info

echo ""
echo "✨ Next step: Run setup script to generate proving and verification keys"
echo "   ./scripts/setup-circuit.sh"