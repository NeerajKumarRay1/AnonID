const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');
const { ethers } = require('ethers');

/**
 * Generate a cryptographic commitment for credential data
 * @param {string} credentialData - The credential data to commit to
 * @param {string} salt - Random salt for the commitment
 * @returns {string} The commitment hash
 */
function generateCommitment(credentialData, salt) {
    // Use keccak256 hash for Ethereum compatibility
    const combined = ethers.solidityPacked(['string', 'string'], [credentialData, salt]);
    return ethers.keccak256(combined);
}

/**
 * Generate demo credential data for testing
 * @param {string} university - University name
 * @param {string} studentId - Student ID
 * @param {string} degree - Degree type
 * @returns {object} Demo credential object
 */
function generateDemoCredential(university = 'MIT', studentId = 'student123', degree = 'Computer Science') {
    const credentialData = JSON.stringify({
        university,
        studentId,
        degree,
        graduationYear: 2023,
        gpa: 3.8
    });
    
    const salt = crypto.randomBytes(32).toString('hex');
    const commitment = generateCommitment(credentialData, salt);
    
    return {
        credentialData,
        salt,
        commitment,
        issuedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        currentTimestamp: Math.floor(Date.now() / 1000),
        isRevoked: 0
    };
}

/**
 * Create demo issuers for testing
 * @returns {object} Demo issuer addresses and names
 */
function getDemoIssuers() {
    return {
        'MIT': '0x1234567890123456789012345678901234567890',
        'Stanford': '0x2345678901234567890123456789012345678901',
        'Harvard': '0x3456789012345678901234567890123456789012',
        'Berkeley': '0x4567890123456789012345678901234567890123'
    };
}

/**
 * Generate circuit input from credential data
 * @param {object} credential - Credential object
 * @param {string} issuerAddress - Issuer's Ethereum address
 * @returns {object} Circuit input object
 */
function generateCircuitInput(credential, issuerAddress) {
    return {
        // Private inputs (witness)
        credentialData: credential.credentialData,
        salt: credential.salt,
        issuedAt: credential.issuedAt.toString(),
        
        // Public inputs
        commitment: credential.commitment,
        issuerAddress: issuerAddress,
        currentTimestamp: credential.currentTimestamp.toString(),
        isRevoked: credential.isRevoked.toString()
    };
}

async function generateProof() {
    console.log('🔧 Generating ZKP proof...');
    
    const circuitName = 'CredentialProof';
    let inputFile = process.argv[2] || 'circuits/input.json';
    const outputProof = process.argv[3] || 'proof.json';
    const outputPublic = process.argv[4] || 'public.json';
    
    // Check for demo mode
    if (process.argv.includes('--demo')) {
        console.log('🎓 Demo mode: Generating sample university credential...');
        
        const demoIssuers = getDemoIssuers();
        const university = process.argv[process.argv.indexOf('--demo') + 1] || 'MIT';
        
        if (!demoIssuers[university]) {
            console.error(`❌ Unknown university: ${university}`);
            console.error('Available universities:', Object.keys(demoIssuers).join(', '));
            process.exit(1);
        }
        
        const demoCredential = generateDemoCredential(university, 'demo_student_123', 'Computer Science');
        const circuitInput = generateCircuitInput(demoCredential, demoIssuers[university]);
        
        // Write demo input to file
        const demoInputFile = `demo_input_${university.toLowerCase()}.json`;
        fs.writeFileSync(demoInputFile, JSON.stringify(circuitInput, null, 2));
        
        console.log('📝 Generated demo credential:');
        console.log(`   University: ${university}`);
        console.log(`   Issuer: ${demoIssuers[university]}`);
        console.log(`   Commitment: ${demoCredential.commitment}`);
        console.log(`   Input file: ${demoInputFile}`);
        console.log('');
        
        // Use the demo input file
        inputFile = demoInputFile;
    }
    
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Input file not found: ${inputFile}`);
        console.error('Usage: node scripts/generate-proof.js [input.json] [proof.json] [public.json]');
        process.exit(1);
    }
    
    // Required files
    const wasmFile = `build/circuits/${circuitName}_js/${circuitName}.wasm`;
    const zkeyFile = `build/keys/${circuitName}_final.zkey`;
    
    // Check if required files exist
    if (!fs.existsSync(wasmFile)) {
        console.error(`❌ WASM file not found: ${wasmFile}`);
        console.error('Please compile the circuit first: npm run compile:circuit');
        process.exit(1);
    }
    
    if (!fs.existsSync(zkeyFile)) {
        console.error(`❌ Proving key not found: ${zkeyFile}`);
        console.error('Please run circuit setup first: npm run setup:circuit');
        process.exit(1);
    }
    
    // Check if snarkjs is available
    let snarkjs;
    try {
        execSync('snarkjs --version', { stdio: 'ignore' });
        snarkjs = 'snarkjs';
    } catch {
        snarkjs = 'npx snarkjs';
    }
    
    try {
        console.log(`📄 Input file: ${inputFile}`);
        console.log(`🔧 WASM file: ${wasmFile}`);
        console.log(`🔑 Proving key: ${zkeyFile}`);
        console.log(`📤 Output proof: ${outputProof}`);
        console.log(`📤 Output public: ${outputPublic}`);
        
        console.log('⚡ Generating proof...');
        execSync(`${snarkjs} groth16 fullprove "${inputFile}" "${wasmFile}" "${zkeyFile}" "${outputProof}" "${outputPublic}"`, { stdio: 'inherit' });
        
        console.log('✅ Proof generated successfully!');
        console.log('');
        console.log('📁 Generated files:');
        console.log(`   - ${outputProof} (ZKP proof)`);
        console.log(`   - ${outputPublic} (public inputs)`);
        console.log('');
        console.log('🔍 To verify the proof:');
        console.log(`   ${snarkjs} groth16 verify build/keys/${circuitName}_verification_key.json ${outputPublic} ${outputProof}`);
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Use the proof in your smart contract verification');
        console.log('2. Submit the proof to the AnonId contract');
        console.log('3. Verify the proof on-chain');
        
    } catch (error) {
        console.error('❌ Proof generation failed:', error.message);
        console.error('');
        console.error('This might be because:');
        console.error('1. The input file format is incorrect');
        console.error('2. The circuit was not properly compiled');
        console.error('3. The proving key is invalid');
        console.error('');
        console.error('Please check:');
        console.error('- Input file matches the circuit interface');
        console.error('- Circuit compilation completed successfully');
        console.error('- Setup process completed without errors');
        process.exit(1);
    }
}

// Export utility functions for use in other scripts
module.exports = {
    generateCommitment,
    generateDemoCredential,
    getDemoIssuers,
    generateCircuitInput,
    generateProof
};

// Run if called directly
if (require.main === module) {
    generateProof().catch(console.error);
}