pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

// Real production circuit for credential commitment proofs
template CommitmentProof() {
    // Private inputs (known only to prover)
    signal private input credentialData;  // Hash of credential data
    signal private input salt;            // Random salt for commitment
    signal private input issuerAddress;   // Address of trusted issuer
    
    // Public inputs (known to verifier)
    signal input commitment;              // Public commitment hash
    signal input trustedIssuerHash;       // Hash of trusted issuer address
    
    // Output signal
    signal output valid;
    
    // Component to hash credential data + salt
    component poseidon1 = Poseidon(2);
    poseidon1.inputs[0] <== credentialData;
    poseidon1.inputs[1] <== salt;
    
    // Verify commitment matches hash(credentialData + salt)
    component commitmentCheck = IsEqual();
    commitmentCheck.in[0] <== poseidon1.out;
    commitmentCheck.in[1] <== commitment;
    
    // Component to hash issuer address
    component poseidon2 = Poseidon(1);
    poseidon2.inputs[0] <== issuerAddress;
    
    // Verify issuer is trusted
    component issuerCheck = IsEqual();
    issuerCheck.in[0] <== poseidon2.out;
    issuerCheck.in[1] <== trustedIssuerHash;
    
    // Both checks must pass
    component and = AND();
    and.a <== commitmentCheck.out;
    and.b <== issuerCheck.out;
    
    valid <== and.out;
    
    // Constraint: valid must be 1
    valid === 1;
}

// AND gate component
template AND() {
    signal input a;
    signal input b;
    signal output out;
    
    out <== a * b;
}

component main = CommitmentProof();