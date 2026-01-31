@echo off
REM Circuit Compilation Script for Windows
REM Compiles circom circuit to r1cs, wasm, and sym files

echo 🔧 Starting circuit compilation...

REM Create build directory if it doesn't exist
if not exist "build\circuits" mkdir "build\circuits"

REM Circuit configuration
set CIRCUIT_NAME=CredentialProof
set CIRCUIT_PATH=circuits\%CIRCUIT_NAME%.circom
set BUILD_PATH=build\circuits

REM Check if circom is installed
where circom >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ circom is not installed. Please install it first:
    echo    npm install -g circom
    echo    Or download from: https://github.com/iden3/circom
    exit /b 1
)

echo 📁 Compiling circuit: %CIRCUIT_PATH%

REM Compile the circuit
circom "%CIRCUIT_PATH%" --r1cs --wasm --sym --c --output "%BUILD_PATH%"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Circuit compilation failed
    exit /b 1
)

echo ✅ Circuit compilation completed!
echo 📄 Generated files:
echo    - %BUILD_PATH%\%CIRCUIT_NAME%.r1cs
echo    - %BUILD_PATH%\%CIRCUIT_NAME%_js\%CIRCUIT_NAME%.wasm
echo    - %BUILD_PATH%\%CIRCUIT_NAME%.sym
echo    - %BUILD_PATH%\%CIRCUIT_NAME%_cpp\ (C++ files)

echo.
echo 🔍 Circuit info:
circom "%CIRCUIT_PATH%" --info

echo.
echo ✨ Next step: Run setup script to generate proving and verification keys
echo    scripts\setup-circuit.bat