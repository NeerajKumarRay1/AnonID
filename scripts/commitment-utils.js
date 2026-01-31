const crypto = require('crypto');
const { ethers } = require('ethers');
const fs = require('fs');

/**
 * Commitment Utilities for AnonID System
 * 
 * This module provides utilities for generating cryptographic commitments,
 * creating demo credentials, and managing proof generation inputs.
 */

/**
 * Generate a cryptographic commitment for credential data using Poseidon hash
 * This simulates the same hash function used in the circom circuit
 * @param {string} credentialData - The credential data to commit to
 * @param {string} salt - Random salt for the commitment
 * @returns {string} The commitment hash (as hex string)
 */
function generateCommitment(credentialData, salt) {
    // For development, we use keccak256 as a placeholder for Poseidon
    // In production, this would use the actual Poseidon hash function
    const combined = ethers.solidityPacked(['string', 'string'], [credentialData, salt]);
    return ethers.keccak256(combined);
}

/**
 * Generate a random salt for commitment generation
 * @returns {string} Random 32-byte salt as hex string
 */
function generateSalt() {
    return '0x' + crypto.randomBytes(32).toString('hex');
}

/**
 * Create a credential data structure
 * @param {object} params - Credential parameters
 * @param {string} params.university - University name
 * @param {string} params.studentId - Student identifier
 * @param {string} params.degree - Degree program
 * @param {number} params.graduationYear - Year of graduation
 * @param {number} params.gpa - Grade point average
 * @returns {string} JSON string of credential data
 */
function createCredentialData(params) {
    const {
        university = 'MIT',
        studentId = 'student123',
        degree = 'Computer Science',
        graduationYear = 2023,
        gpa = 3.8
    } = params;
    
    return JSON.stringify({
        university,
        studentId,
        degree,
        graduationYear,
        gpa,
        timestamp: Math.floor(Date.now() / 1000)
    });
}

/**
 * Generate a complete demo credential with commitment
 * @param {object} params - Credential parameters
 * @returns {object} Complete credential object with commitment
 */
function generateDemoCredential(params = {}) {
    const credentialData = createCredentialData(params);
    const salt = generateSalt();
    const commitment = generateCommitment(credentialData, salt);
    
    return {
        credentialData,
        salt,
        commitment,
        issuedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        currentTimestamp: Math.floor(Date.now() / 1000),
        isRevoked: 0,
        metadata: {
            university: params.university || 'MIT',
            degree: params.degree || 'Computer Science',
            studentId: params.studentId || 'student123'
        }
    };
}

/**
 * Demo issuer addresses for testing
 */
const DEMO_ISSUERS = {
    'MIT': '0x1234567890123456789012345678901234567890',
    'Stanford': '0x2345678901234567890123456789012345678901',
    'Harvard': '0x3456789012345678901234567890123456789012',
    'Berkeley': '0x4567890123456789012345678901234567890123',
    'CMU': '0x5678901234567890123456789012345678901234',
    'Caltech': '0x6789012345678901234567890123456789012345'
};

/**
 * Get demo issuer information
 * @returns {object} Map of university names to issuer addresses
 */
function getDemoIssuers() {
    return DEMO_ISSUERS;
}

/**
 * Generate circuit input from credential data
 * @param {object} credential - Credential object from generateDemoCredential
 * @param {string} issuerAddress - Issuer's Ethereum address
 * @returns {object} Circuit input object ready for proof generation
 */
function generateCircuitInput(credential, issuerAddress) {
    return {
        // Private inputs (witness) - these are kept secret during proof generation
        credentialData: credential.credentialData,
        salt: credential.salt,
        issuedAt: credential.issuedAt.toString(),
        
        // Public inputs - these are revealed during verification
        commitment: credential.commitment,
        issuerAddress: issuerAddress,
        currentTimestamp: credential.currentTimestamp.toString(),
        isRevoked: credential.isRevoked.toString()
    };
}

/**
 * Create a complete demo scenario with multiple credentials
 * @param {number} count - Number of credentials to generate
 * @returns {object} Demo scenario with credentials and issuers
 */
function createDemoScenario(count = 3) {
    const universities = Object.keys(DEMO_ISSUERS);
    const degrees = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Biology'];
    const scenario = {
        credentials: [],
        issuers: DEMO_ISSUERS,
        timestamp: Math.floor(Date.now() / 1000)
    };
    
    for (let i = 0; i < count; i++) {
        const university = universities[i % universities.length];
        const degree = degrees[i % degrees.length];
        const studentId = `demo_student_${i + 1}`;
        
        const credential = generateDemoCredential({
            university,
            degree,
            studentId,
            graduationYear: 2020 + (i % 4),
            gpa: 3.0 + Math.random() * 1.0
        });
        
        const circuitInput = generateCircuitInput(credential, DEMO_ISSUERS[university]);
        
        scenario.credentials.push({
            ...credential,
            circuitInput,
            issuerAddress: DEMO_ISSUERS[university]
        });
    }
    
    return scenario;
}

/**
 * Save demo scenario to files
 * @param {object} scenario - Demo scenario from createDemoScenario
 * @param {string} outputDir - Directory to save files (default: 'demo')
 */
function saveDemoScenario(scenario, outputDir = 'demo') {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save complete scenario
    fs.writeFileSync(
        `${outputDir}/scenario.json`,
        JSON.stringify(scenario, null, 2)
    );
    
    // Save individual credential inputs
    scenario.credentials.forEach((cred, index) => {
        fs.writeFileSync(
            `${outputDir}/input_${cred.metadata.university.toLowerCase()}_${index}.json`,
            JSON.stringify(cred.circuitInput, null, 2)
        );
    });
    
    console.log(`📁 Demo scenario saved to ${outputDir}/`);
    console.log(`   - scenario.json (complete scenario)`);
    scenario.credentials.forEach((cred, index) => {
        console.log(`   - input_${cred.metadata.university.toLowerCase()}_${index}.json`);
    });
}

/**
 * Command line interface for commitment utilities
 */
function cli() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'generate':
            const university = args[1] || 'MIT';
            const degree = args[2] || 'Computer Science';
            const studentId = args[3] || 'demo_student';
            
            const credential = generateDemoCredential({ university, degree, studentId });
            const issuerAddress = DEMO_ISSUERS[university];
            
            if (!issuerAddress) {
                console.error(`❌ Unknown university: ${university}`);
                console.error('Available:', Object.keys(DEMO_ISSUERS).join(', '));
                process.exit(1);
            }
            
            const input = generateCircuitInput(credential, issuerAddress);
            
            console.log('🎓 Generated credential:');
            console.log(`   University: ${university}`);
            console.log(`   Degree: ${degree}`);
            console.log(`   Student ID: ${studentId}`);
            console.log(`   Commitment: ${credential.commitment}`);
            console.log(`   Issuer: ${issuerAddress}`);
            
            fs.writeFileSync('generated_input.json', JSON.stringify(input, null, 2));
            console.log('📄 Saved to: generated_input.json');
            break;
            
        case 'scenario':
            const count = parseInt(args[1]) || 3;
            const scenario = createDemoScenario(count);
            saveDemoScenario(scenario);
            break;
            
        case 'issuers':
            console.log('🏛️  Demo Issuers:');
            Object.entries(DEMO_ISSUERS).forEach(([name, address]) => {
                console.log(`   ${name}: ${address}`);
            });
            break;
            
        default:
            console.log('🔧 AnonID Commitment Utilities');
            console.log('');
            console.log('Usage:');
            console.log('  node commitment-utils.js generate [university] [degree] [studentId]');
            console.log('  node commitment-utils.js scenario [count]');
            console.log('  node commitment-utils.js issuers');
            console.log('');
            console.log('Examples:');
            console.log('  node commitment-utils.js generate MIT "Computer Science" student123');
            console.log('  node commitment-utils.js scenario 5');
            console.log('  node commitment-utils.js issuers');
    }
}

module.exports = {
    generateCommitment,
    generateSalt,
    createCredentialData,
    generateDemoCredential,
    getDemoIssuers,
    generateCircuitInput,
    createDemoScenario,
    saveDemoScenario,
    DEMO_ISSUERS
};

// Run CLI if called directly
if (require.main === module) {
    cli();
}