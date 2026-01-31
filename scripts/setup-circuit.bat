@echo off
REM Circuit Setup Script for Windows
REM Generates proving and verification keys using Powers of Tau ceremony

echo 🔧 Starting circuit setup (Powers of Tau + Final setup)...

REM Circuit configuration
set CIRCUIT_NAME=CredentialProof
set BUILD_PATH=build\circuits
set PTAU_PATH=build\powersOfTau
set KEYS_PATH=build\keys

REM Create directories
if not exist "%PTAU_PATH%" mkdir "%PTAU_PATH%"
if not exist "%KEYS_PATH%" mkdir "%KEYS_PATH%"

REM Check if snarkjs is available
where snarkjs >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ snarkjs is not installed globally. Using npx...
    set SNARKJS=npx snarkjs
) else (
    set SNARKJS=snarkjs
)

REM Check if circuit is compiled
if not exist "%BUILD_PATH%\%CIRCUIT_NAME%.r1cs" (
    echo ❌ Circuit not compiled. Please run compile-circuit.bat first
    exit /b 1
)

echo 📊 Getting circuit info...
%SNARKJS% info -r "%BUILD_PATH%\%CIRCUIT_NAME%.r1cs"

REM Determine the power of 2 needed for the circuit
REM For small circuits, we'll use 2^12 (4096 constraints)
set POWER=12
set PTAU_FILE=%PTAU_PATH%\pot%POWER%_final.ptau

echo.
echo 🌟 Phase 1: Powers of Tau ceremony (2^%POWER%)

REM Check if we already have the powers of tau file
if not exist "%PTAU_FILE%" (
    echo 📥 Downloading powers of tau file...
    
    REM Try to download from Hermez ceremony (trusted setup)
    set HERMEZ_URL=https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_%POWER%.ptau
    
    curl -f -L "%HERMEZ_URL%" -o "%PTAU_FILE%"
    if %ERRORLEVEL% NEQ 0 (
        echo ⚠️  Download failed. Generating new powers of tau (less secure for production)...
        
        REM Generate new powers of tau
        %SNARKJS% powersoftau new bn128 %POWER% "%PTAU_PATH%\pot%POWER%_0000.ptau" -v
        
        REM Contribute to the ceremony
        %SNARKJS% powersoftau contribute "%PTAU_PATH%\pot%POWER%_0000.ptau" "%PTAU_PATH%\pot%POWER%_0001.ptau" --name="First contribution" -v -e="random entropy"
        
        REM Phase 2
        %SNARKJS% powersoftau prepare phase2 "%PTAU_PATH%\pot%POWER%_0001.ptau" "%PTAU_FILE%" -v
    ) else (
        echo ✅ Downloaded trusted powers of tau file
    )
) else (
    echo ✅ Powers of tau file already exists
)

echo.
echo 🔑 Phase 2: Circuit-specific setup

REM Generate the initial zkey
set ZKEY_0=%KEYS_PATH%\%CIRCUIT_NAME%_0000.zkey
set ZKEY_FINAL=%KEYS_PATH%\%CIRCUIT_NAME%_final.zkey

echo 📝 Generating initial zkey...
%SNARKJS% groth16 setup "%BUILD_PATH%\%CIRCUIT_NAME%.r1cs" "%PTAU_FILE%" "%ZKEY_0%"

echo 🎯 Contributing to phase 2...
%SNARKJS% zkey contribute "%ZKEY_0%" "%ZKEY_FINAL%" --name="First contribution" -v -e="more random entropy"

echo 🔍 Verifying final zkey...
%SNARKJS% zkey verify "%BUILD_PATH%\%CIRCUIT_NAME%.r1cs" "%PTAU_FILE%" "%ZKEY_FINAL%"

echo.
echo 📄 Generating verification key...
set VKEY_FILE=%KEYS_PATH%\%CIRCUIT_NAME%_verification_key.json
%SNARKJS% zkey export verificationkey "%ZKEY_FINAL%" "%VKEY_FILE%"

echo.
echo 🔧 Generating Solidity verifier contract...
set VERIFIER_SOL=contracts\%CIRCUIT_NAME%Verifier.sol
%SNARKJS% zkey export solidityverifier "%ZKEY_FINAL%" "%VERIFIER_SOL%"

echo.
echo ✅ Circuit setup completed successfully!
echo.
echo 📁 Generated files:
echo    - %ZKEY_FINAL% (proving key)
echo    - %VKEY_FILE% (verification key)
echo    - %VERIFIER_SOL% (Solidity verifier contract)
echo.
echo 🚀 You can now:
echo    1. Generate proofs using the proving key
echo    2. Verify proofs using the verification key
echo    3. Deploy the Solidity verifier contract
echo.
echo 💡 Example proof generation:
echo    snarkjs groth16 fullprove input.json build\circuits\%CIRCUIT_NAME%_js\%CIRCUIT_NAME%.wasm %ZKEY_FINAL% proof.json public.json