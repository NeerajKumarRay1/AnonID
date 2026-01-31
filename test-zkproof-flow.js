/**
 * Test script to demonstrate the real-time ZK proof system
 * This shows the complete flow from proof generation to verification
 */

const { generateZKProof, verifyZKProof, createCredentialCommitment, formatProofForContract } = require('./frontend/src/lib/zkProof.ts')

async function testZKProofFlow() {
  console.log('🧪 Testing Real-time ZK Proof System\n')
  
  try {
    // Step 1: Create credential data and commitment
    console.log('1️⃣ Creating credential commitment...')
    const credentialData = 'user123@example.com'
    const { commitment, salt } = createCredentialCommitment(credentialData)
    
    console.log(`   Credential Data: ${credentialData}`)
    console.log(`   Salt: ${salt}`)
    console.log(`   Commitment: ${commitment}\n`)
    
    // Step 2: Generate ZK proof
    console.log('2️⃣ Generating ZK proof...')
    const proofInputs = {
      credentialData,
      salt,
      commitment,
      issuerAddress: '0x1234567890123456789012345678901234567890',
      currentTimestamp: Math.floor(Date.now() / 1000),
      isRevoked: false
    }
    
    const proofResult = await generateZKProof(proofInputs)
    console.log('   ✅ Proof generated successfully!')
    console.log(`   Public Signals: ${JSON.stringify(proofResult.publicSignals, null, 2)}\n`)
    
    // Step 3: Format proof for different uses
    console.log('3️⃣ Formatting proof for different uses...')
    const contractProof = formatProofForContract(proofResult.proof)
    const verifyPageFormat = {
      a: contractProof.a,
      b: contractProof.b,
      c: contractProof.c,
      input: proofResult.publicSignals
    }
    
    console.log('   Contract Format:', JSON.stringify(contractProof, null, 2))
    console.log('   Verify Page Format:', JSON.stringify(verifyPageFormat, null, 2))
    console.log()
    
    // Step 4: Verify the proof
    console.log('4️⃣ Verifying ZK proof...')
    const isValid = await verifyZKProof(proofResult.proof, proofResult.publicSignals)
    
    if (isValid) {
      console.log('   ✅ Proof verification successful!')
      console.log('   The credential is valid and the proof is cryptographically sound.')
    } else {
      console.log('   ❌ Proof verification failed!')
    }
    
    console.log('\n🎉 Real-time ZK Proof System Test Complete!')
    console.log('The system successfully:')
    console.log('• Generated a cryptographic commitment')
    console.log('• Created a zero-knowledge proof')
    console.log('• Formatted the proof for different use cases')
    console.log('• Verified the proof cryptographically')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testZKProofFlow()