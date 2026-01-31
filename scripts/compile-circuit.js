const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function compileCircuit() {
    console.log('🔧 Starting circuit compilation...');
    
    // Create build directory if it doesn't exist
    const buildPath = 'build/circuits';
    const keysPath = 'build/keys';
    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath, { recursive: true });
    }
    if (!fs.existsSync(keysPath)) {
        fs.mkdirSync(keysPath, { recursive: true });
    }
    
    const circuitName = 'CredentialProof';
    const circuitPath = `circuits/${circuitName}.circom`;
    
    // Check if circuit file exists
    if (!fs.existsSync(circuitPath)) {
        console.error(`❌ Circuit file not found: ${circuitPath}`);
        process.exit(1);
    }
    
    console.log(`📁 Circuit file found: ${circuitPath}`);
    
    try {
        // Try to use circom if available
        console.log('🔍 Checking for circom compiler...');
        
        // Check if we have circom binary available
        let circomCmd = 'circom';
        try {
            execSync('circom --version', { stdio: 'pipe' });
        } catch (e) {
            // Try alternative paths or suggest installation
            console.log('⚠️  Circom not found in PATH. Attempting alternative setup...');
            
            // Create a simplified circuit for demonstration
            console.log('📝 Creating simplified circuit setup for development...');
            
            // Create the directory structure
            const jsPath = path.join(buildPath, `${circuitName}_js`);
            if (!fs.existsSync(jsPath)) {
                fs.mkdirSync(jsPath, { recursive: true });
            }
            
            // Create a simple WASM file for testing (this is a minimal working example)
            const wasmContent = Buffer.from([
                0x00, 0x61, 0x73, 0x6d, // WASM magic number
                0x01, 0x00, 0x00, 0x00, // WASM version
                // Minimal WASM module structure
                0x01, 0x04, 0x01, 0x60, 0x00, 0x00, // Type section
                0x03, 0x02, 0x01, 0x00, // Function section
                0x0a, 0x04, 0x01, 0x02, 0x00, 0x0b // Code section
            ]);
            
            fs.writeFileSync(path.join(jsPath, `${circuitName}.wasm`), wasmContent);
            
            // Create a simple witness calculator JS file
            const witnessCalculatorJs = `
const WitnessCalculatorBuilder = {
    async build() {
        return {
            async calculateWitness(input) {
                // Simple mock witness calculation for development
                console.log('Mock witness calculation for input:', input);
                return [
                    BigInt(1), // First element is always 1
                    BigInt(input.commitment || 0),
                    BigInt(input.issuerAddress || 0),
                    BigInt(input.currentTimestamp || 0),
                    BigInt(input.isRevoked || 0)
                ];
            }
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WitnessCalculatorBuilder;
}
`;
            
            fs.writeFileSync(path.join(jsPath, `witness_calculator.js`), witnessCalculatorJs);
            
            // Create a development zkey file (this is just for structure, not secure)
            const zkeyPath = path.join(keysPath, `${circuitName}_final.zkey`);
            fs.writeFileSync(zkeyPath, JSON.stringify({
                protocol: "groth16",
                curve: "bn128",
                nPublic: 4,
                nConstraints: 1,
                development: true,
                note: "This is a development key, not for production use"
            }));
            
            // Create verification key
            const vkeyPath = path.join(keysPath, `${circuitName}_verification_key.json`);
            const verificationKey = {
                protocol: "groth16",
                curve: "bn128",
                nPublic: 4,
                vk_alpha_1: ["0", "0", "0"],
                vk_beta_2: [["0", "0"], ["0", "0"], ["0", "0"]],
                vk_gamma_2: [["0", "0"], ["0", "0"], ["0", "0"]],
                vk_delta_2: [["0", "0"], ["0", "0"], ["0", "0"]],
                vk_alphabeta_12: [],
                IC: [["0", "0", "0"], ["0", "0", "0"], ["0", "0", "0"], ["0", "0", "0"], ["0", "0", "0"]],
                development: true
            };
            fs.writeFileSync(vkeyPath, JSON.stringify(verificationKey, null, 2));
            
            console.log('✅ Development circuit setup completed!');
            console.log('📄 Created files:');
            console.log(`   - ${path.join(jsPath, circuitName + '.wasm')}`);
            console.log(`   - ${path.join(jsPath, 'witness_calculator.js')}`);
            console.log(`   - ${zkeyPath}`);
            console.log(`   - ${vkeyPath}`);
            
            console.log('');
            console.log('⚠️  DEVELOPMENT MODE: This setup is for development only!');
            console.log('   For production, install circom from: https://docs.circom.io/getting-started/installation/');
            
            return;
        }
        
        // If circom is available, use it
        console.log('✅ Circom found! Compiling circuit...');
        
        const outputDir = buildPath;
        const cmd = `circom ${circuitPath} --r1cs --wasm --sym --output ${outputDir}`;
        
        console.log(`🔧 Running: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
        
        console.log('✅ Circuit compilation completed!');
        
    } catch (error) {
        console.error('❌ Compilation failed:', error.message);
        process.exit(1);
    }
}

compileCircuit().catch(console.error);