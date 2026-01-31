const fs = require('fs');
const { execSync } = require('child_process');

async function verifyProof() {
    console.log('🔧 Verifying ZKP proof...');
    
    const circuitName = 'CredentialProof';
    const proofFile = process.argv[2] || 'proof.json';
    const publicFile = process.argv[3] || 'public.json';
    
    // Required files
    const vkeyFile = `build/keys/${circuitName}_verification_key.json`;
    
    // Check if required files exist
    if (!fs.existsSync(vkeyFile)) {
        console.error(`❌ Verification key not found: ${vkeyFile}`);
        console.error('Please run circuit setup first: npm run setup:circuit');
        process.exit(1);
    }
    
    if (!fs.existsSync(proofFile)) {
        console.error(`❌ Proof file not found: ${proofFile}`);
        console.error('Usage: node scripts/verify-proof.js [proof.json] [public.json]');
        process.exit(1);
    }
    
    if (!fs.existsSync(publicFile)) {
        console.error(`❌ Public inputs file not found: ${publicFile}`);
        console.error('Usage: node scripts/verify-proof.js [proof.json] [public.json]');
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
        console.log(`🔑 Verification key: ${vkeyFile}`);
        console.log(`📄 Proof file: ${proofFile}`);
        console.log(`📄 Public inputs: ${publicFile}`);
        
        console.log('🔍 Verifying proof...');
        execSync(`${snarkjs} groth16 verify "${vkeyFile}" "${publicFile}" "${proofFile}"`, { stdio: 'inherit' });
        
        console.log('✅ Proof verification completed!');
        console.log('');
        console.log('If the verification was successful, the proof is valid.');
        console.log('If it failed, the proof is invalid or the inputs are incorrect.');
        
    } catch (error) {
        console.error('❌ Proof verification failed:', error.message);
        console.error('');
        console.error('This might be because:');
        console.error('1. The proof is invalid');
        console.error('2. The public inputs are incorrect');
        console.error('3. The verification key is corrupted');
        console.error('4. The files are in the wrong format');
        process.exit(1);
    }
}

verifyProof().catch(console.error);