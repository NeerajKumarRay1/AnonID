const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setupCircuit() {
    console.log('🔧 Starting circuit setup (Powers of Tau + Final setup)...');
    
    const circuitName = 'CredentialProof';
    const buildPath = 'build/circuits';
    const ptauPath = 'build/powersOfTau';
    const keysPath = 'build/keys';
    
    // Create directories
    [ptauPath, keysPath].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    // Check if snarkjs is available
    let snarkjs;
    try {
        execSync('snarkjs --version', { stdio: 'ignore' });
        snarkjs = 'snarkjs';
        console.log('✅ Using global snarkjs');
    } catch {
        snarkjs = 'npx snarkjs';
        console.log('✅ Using npx snarkjs');
    }
    
    // Check if circuit is compiled
    const r1csFile = `${buildPath}/${circuitName}.r1cs`;
    if (!fs.existsSync(r1csFile)) {
        console.error('❌ Circuit not compiled. Please run npm run compile:circuit first');
        console.error('   Note: You need the actual circom compiler for real compilation');
        process.exit(1);
    }
    
    console.log('📊 Circuit file found, proceeding with setup...');
    
    // Configuration
    const power = 12; // 2^12 = 4096 constraints
    const ptauFile = `${ptauPath}/pot${power}_final.ptau`;
    
    console.log(`🌟 Phase 1: Powers of Tau ceremony (2^${power})`);
    
    // Check if we already have the powers of tau file
    if (!fs.existsSync(ptauFile)) {
        console.log('📥 Attempting to download powers of tau file...');
        
        const hermezUrl = `https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${power}.ptau`;
        
        try {
            // Try to download using curl or similar
            execSync(`curl -f -L "${hermezUrl}" -o "${ptauFile}"`, { stdio: 'inherit' });
            console.log('✅ Downloaded trusted powers of tau file');
        } catch (error) {
            console.log('⚠️  Download failed. Creating placeholder for manual setup...');
            
            // Create placeholder file with instructions
            const instructions = `
# Powers of Tau File Required

This file should contain the Powers of Tau ceremony result.

To complete the setup:

1. Download the trusted setup file:
   curl -L "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${power}.ptau" -o "${ptauFile}"

2. Or generate your own (less secure for production):
   ${snarkjs} powersoftau new bn128 ${power} ${ptauPath}/pot${power}_0000.ptau -v
   ${snarkjs} powersoftau contribute ${ptauPath}/pot${power}_0000.ptau ${ptauPath}/pot${power}_0001.ptau --name="First contribution" -v
   ${snarkjs} powersoftau prepare phase2 ${ptauPath}/pot${power}_0001.ptau ${ptauFile} -v

3. Then run this setup script again.
`;
            
            fs.writeFileSync(ptauFile + '.instructions', instructions);
            console.log(`📄 Created instructions file: ${ptauFile}.instructions`);
            console.log('⚠️  Please complete the Powers of Tau setup manually and run this script again.');
            return;
        }
    } else {
        console.log('✅ Powers of tau file already exists');
    }
    
    console.log('🔑 Phase 2: Circuit-specific setup');
    
    // Generate keys
    const zkey0 = `${keysPath}/${circuitName}_0000.zkey`;
    const zkeyFinal = `${keysPath}/${circuitName}_final.zkey`;
    const vkeyFile = `${keysPath}/${circuitName}_verification_key.json`;
    const verifierSol = `contracts/${circuitName}Verifier.sol`;
    
    try {
        console.log('📝 Generating initial zkey...');
        execSync(`${snarkjs} groth16 setup "${r1csFile}" "${ptauFile}" "${zkey0}"`, { stdio: 'inherit' });
        
        console.log('🎯 Contributing to phase 2...');
        execSync(`${snarkjs} zkey contribute "${zkey0}" "${zkeyFinal}" --name="First contribution" -v`, { stdio: 'inherit' });
        
        console.log('🔍 Verifying final zkey...');
        execSync(`${snarkjs} zkey verify "${r1csFile}" "${ptauFile}" "${zkeyFinal}"`, { stdio: 'inherit' });
        
        console.log('📄 Generating verification key...');
        execSync(`${snarkjs} zkey export verificationkey "${zkeyFinal}" "${vkeyFile}"`, { stdio: 'inherit' });
        
        console.log('🔧 Generating Solidity verifier contract...');
        execSync(`${snarkjs} zkey export solidityverifier "${zkeyFinal}" "${verifierSol}"`, { stdio: 'inherit' });
        
        console.log('');
        console.log('✅ Circuit setup completed successfully!');
        console.log('');
        console.log('📁 Generated files:');
        console.log(`   - ${zkeyFinal} (proving key)`);
        console.log(`   - ${vkeyFile} (verification key)`);
        console.log(`   - ${verifierSol} (Solidity verifier contract)`);
        console.log('');
        console.log('🚀 You can now:');
        console.log('   1. Generate proofs using the proving key');
        console.log('   2. Verify proofs using the verification key');
        console.log('   3. Deploy the Solidity verifier contract');
        console.log('');
        console.log('💡 Example proof generation:');
        console.log(`   ${snarkjs} groth16 fullprove input.json build/circuits/${circuitName}_js/${circuitName}.wasm ${zkeyFinal} proof.json public.json`);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('');
        console.error('This might be because:');
        console.error('1. The circuit was not properly compiled with circom');
        console.error('2. snarkjs is not properly installed');
        console.error('3. The powers of tau file is corrupted');
        console.error('');
        console.error('Please ensure you have:');
        console.error('- Compiled the circuit with the actual circom compiler');
        console.error('- Installed snarkjs: npm install -g snarkjs');
        console.error('- A valid powers of tau file');
        process.exit(1);
    }
}

setupCircuit().catch(console.error);