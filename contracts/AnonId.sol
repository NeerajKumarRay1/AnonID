// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CredentialProofVerifier.sol";

/**
 * @title AnonId
 * @dev Self-sovereign digital identity system with privacy-preserving verification
 * @notice This contract manages verifiable credentials using cryptographic commitments
 */
contract AnonId is Ownable, ReentrancyGuard {
    
    // ZKP Verifier contract
    CredentialProofVerifier public immutable verifier;
    
    // Credential structure
    struct Credential {
        address issuer;        // Who issued this credential
        uint256 issuedAt;     // When it was issued
        bool revoked;         // Current status
        string schemaId;      // Schema identifier for this credential
    }
    
    // State mappings
    mapping(bytes32 => Credential) public credentials;
    mapping(bytes32 => mapping(address => bool)) public consents;
    mapping(address => bool) public trustedIssuers;
    
    // Events
    event CredentialIssued(bytes32 indexed commitment, address indexed issuer);
    event CredentialRevoked(bytes32 indexed commitment, address indexed issuer);
    event ConsentGiven(bytes32 indexed commitment, address indexed verifier);
    event ConsentRevoked(bytes32 indexed commitment, address indexed verifier);
    event TrustedIssuerAdded(address indexed issuer);
    event TrustedIssuerRemoved(address indexed issuer);
    
    // Custom errors
    error NotTrustedIssuer();
    error CredentialNotFound();
    error CredentialAlreadyRevoked();
    error NotCredentialOwner();
    error NotOriginalIssuer();
    error InvalidProof();
    error ConsentNotGranted();
    
    constructor(address _verifier) Ownable(msg.sender) {
        require(_verifier != address(0), "Invalid verifier address");
        verifier = CredentialProofVerifier(_verifier);
    }
    
    /**
     * @dev Add a trusted issuer (only owner)
     * @param issuer Address of the issuer to trust
     */
    function addTrustedIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(!trustedIssuers[issuer], "Issuer already trusted");
        
        trustedIssuers[issuer] = true;
        emit TrustedIssuerAdded(issuer);
    }
    
    /**
     * @dev Remove a trusted issuer (only owner)
     * @param issuer Address of the issuer to remove
     */
    function removeTrustedIssuer(address issuer) external onlyOwner {
        require(trustedIssuers[issuer], "Issuer not trusted");
        
        trustedIssuers[issuer] = false;
        emit TrustedIssuerRemoved(issuer);
    }
    
    /**
     * @dev Issue a new credential (only trusted issuers)
     * @param commitment Cryptographic commitment of the credential
     * @param schemaId Schema identifier for this credential type
     */
    function issueCredential(bytes32 commitment, string memory schemaId) external nonReentrant {
        if (!trustedIssuers[msg.sender]) revert NotTrustedIssuer();
        require(commitment != bytes32(0), "Invalid commitment");
        require(bytes(schemaId).length > 0, "Invalid schema ID");
        require(credentials[commitment].issuer == address(0), "Credential already exists");
        
        credentials[commitment] = Credential({
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            schemaId: schemaId
        });
        
        emit CredentialIssued(commitment, msg.sender);
    }
    
    /**
     * @dev Revoke a credential (only original issuer)
     * @param commitment Commitment of the credential to revoke
     */
    function revokeCredential(bytes32 commitment) external nonReentrant {
        Credential storage credential = credentials[commitment];
        if (credential.issuer == address(0)) revert CredentialNotFound();
        if (credential.issuer != msg.sender) revert NotOriginalIssuer();
        require(!credential.revoked, "Credential already revoked");
        
        credential.revoked = true;
        emit CredentialRevoked(commitment, msg.sender);
    }
    
    /**
     * @dev Give consent for verification (credential owner)
     * @param commitment Commitment of the credential
     * @param verifierAddress Address of the verifier to grant consent to
     */
    function giveConsent(bytes32 commitment, address verifierAddress) external nonReentrant {
        Credential storage credential = credentials[commitment];
        if (credential.issuer == address(0)) revert CredentialNotFound();
        if (credential.revoked) revert CredentialAlreadyRevoked();
        require(verifierAddress != address(0), "Invalid verifier address");
        require(!consents[commitment][verifierAddress], "Consent already granted");
        
        // In a full ZKP implementation, this would verify proof of ownership
        // For this implementation, we allow any address to give consent
        // This represents the credential holder's wallet address
        
        consents[commitment][verifierAddress] = true;
        emit ConsentGiven(commitment, verifierAddress);
    }
    
    /**
     * @dev Revoke consent for verification (credential owner)
     * @param commitment Commitment of the credential
     * @param verifierAddress Address of the verifier to revoke consent from
     */
    function revokeConsent(bytes32 commitment, address verifierAddress) external nonReentrant {
        Credential storage credential = credentials[commitment];
        if (credential.issuer == address(0)) revert CredentialNotFound();
        require(consents[commitment][verifierAddress], "Consent not granted");
        
        // In a full ZKP implementation, this would verify proof of ownership
        // For this implementation, we allow any address to revoke consent
        // This represents the credential holder's wallet address
        
        consents[commitment][verifierAddress] = false;
        emit ConsentRevoked(commitment, verifierAddress);
    }
    
    /**
     * @dev Verify a zero-knowledge proof using the integrated verifier
     * @param a First component of GROTH16 proof
     * @param b Second component of GROTH16 proof  
     * @param c Third component of GROTH16 proof
     * @param input Public input array [commitment, issuerAddress, currentTimestamp, isRevoked]
     * @return bool True if proof is valid
     */
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[256] memory input
    ) public view returns (bool) {
        // Extract commitment from public input
        bytes32 commitment = bytes32(input[0]);
        
        // Verify credential exists and is not revoked
        Credential storage credential = credentials[commitment];
        if (credential.issuer == address(0)) return false;
        if (credential.revoked) return false;
        
        // Verify issuer is trusted
        if (!trustedIssuers[credential.issuer]) return false;
        
        // Verify consent exists for the requesting verifier (msg.sender)
        if (!consents[commitment][msg.sender]) return false;
        
        // Convert input array to dynamic array for verifier
        uint256[] memory publicInputs = new uint256[](4);
        publicInputs[0] = input[0]; // commitment
        publicInputs[1] = input[1]; // issuerAddress
        publicInputs[2] = input[2]; // currentTimestamp
        publicInputs[3] = input[3]; // isRevoked
        
        // Verify the cryptographic proof using the verifier contract
        return verifier.verifyProof(
            [a[0], a[1]],
            [[b[0][0], b[0][1]], [b[1][0], b[1][1]]],
            [c[0], c[1]],
            publicInputs
        );
    }
    
    /**
     * @dev Check if an address is a trusted issuer
     * @param issuer Address to check
     * @return bool True if the address is a trusted issuer
     */
    function isTrustedIssuer(address issuer) external view returns (bool) {
        return trustedIssuers[issuer];
    }
    
    /**
     * @dev Get credential information
     * @param commitment Commitment to query
     * @return issuer Address of the issuer
     * @return issuedAt Timestamp when issued
     * @return revoked Whether the credential is revoked
     * @return schemaId Schema identifier for this credential
     */
    function getCredential(bytes32 commitment) external view returns (
        address issuer,
        uint256 issuedAt,
        bool revoked,
        string memory schemaId
    ) {
        Credential storage credential = credentials[commitment];
        return (credential.issuer, credential.issuedAt, credential.revoked, credential.schemaId);
    }
    
    /**
     * @dev Check if consent exists
     * @param commitment Commitment to check
     * @param verifierAddress Verifier to check consent for
     * @return bool True if consent exists
     */
    function hasConsent(bytes32 commitment, address verifierAddress) external view returns (bool) {
        return consents[commitment][verifierAddress];
    }
}