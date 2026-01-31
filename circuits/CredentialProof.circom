/*
 * Simple CredentialProof Circuit
 * 
 * This circuit proves that a user has a valid credential commitment
 * without revealing the actual credential data.
 */

template CredentialProof() {
    // Private inputs (witness)
    signal private input credentialData;      // The actual credential data
    signal private input salt;                // Random salt for commitment
    
    // Public inputs
    signal input commitment;                  // Expected commitment hash (public)
    signal input issuerAddress;              // Trusted issuer address (public)
    signal input currentTimestamp;           // Current timestamp for validation (public)
    signal input isRevoked;                  // Revocation status (0 = not revoked, 1 = revoked)
    
    // Output
    signal output valid;                     // 1 if proof is valid, 0 otherwise
    
    // Simple hash: just add the inputs (for development only)
    signal hash;
    hash <== credentialData + salt;
    
    // The computed hash must equal the public commitment
    commitment === hash;
    
    // Credential must not be revoked
    isRevoked === 0;
    
    // Output is always 1 if constraints are satisfied
    valid <== 1;
}

// Main component
component main = CredentialProof();