const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnonId Integration Tests", function () {
  let anonId;
  let owner;
  let issuer1;
  let issuer2;
  let user1;
  let user2;
  let verifier1;
  let verifier2;
  let unauthorizedUser;

  // Helper function to create GROTH16 input array
  function createProofInput(commitment) {
    const input = Array(256).fill(0);
    input[0] = commitment;
    return input;
  }

  // Helper function to create valid proof parameters
  function createValidProof() {
    return {
      a: [1, 2],
      b: [[3, 4], [5, 6]],
      c: [7, 8]
    };
  }

  beforeEach(async function () {
    [owner, issuer1, issuer2, user1, user2, verifier1, verifier2, unauthorizedUser] = await ethers.getSigners();
    
    const AnonId = await ethers.getContractFactory("AnonId");
    anonId = await AnonId.deploy();
    await anonId.waitForDeployment();
  });

  describe("Complete Workflow: Credential Issuance → Consent → Verification", function () {
    it("should complete full workflow from credential issuance to successful verification", async function () {
      // Step 1: Setup - Add trusted issuer
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      
      // Verify issuer is trusted
      expect(await anonId.isTrustedIssuer(issuer1.address)).to.be.true;
      
      // Step 2: Credential Issuance
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("university_degree_2024"));
      
      const issueTx = await anonId.connect(issuer1).issueCredential(commitment);
      await expect(issueTx)
        .to.emit(anonId, "CredentialIssued")
        .withArgs(commitment, issuer1.address);
      
      // Verify credential was stored correctly
      const [credIssuer, issuedAt, revoked] = await anonId.getCredential(commitment);
      expect(credIssuer).to.equal(issuer1.address);
      expect(issuedAt).to.be.gt(0);
      expect(revoked).to.be.false;
      
      // Step 3: Consent Management
      const consentTx = await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      await expect(consentTx)
        .to.emit(anonId, "ConsentGiven")
        .withArgs(commitment, verifier1.address);
      
      // Verify consent was recorded
      expect(await anonId.hasConsent(commitment, verifier1.address)).to.be.true;
      expect(await anonId.hasConsent(commitment, verifier2.address)).to.be.false;
      
      // Step 4: Proof Verification
      const proof = createValidProof();
      const verificationResult = await anonId.connect(verifier1).verifyProof(
        proof.a,
        proof.b,
        proof.c,
        createProofInput(commitment)
      );
      
      expect(verificationResult).to.be.true;
      
      // Step 5: Verify unauthorized verifier cannot verify
      const unauthorizedResult = await anonId.connect(verifier2).verifyProof(
        proof.a,
        proof.b,
        proof.c,
        createProofInput(commitment)
      );
      
      expect(unauthorizedResult).to.be.false;
    });

    it("should handle multiple credentials and verifiers in complex workflow", async function () {
      // Setup multiple trusted issuers
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      await anonId.connect(owner).addTrustedIssuer(issuer2.address);
      
      // Issue multiple credentials
      const degreeCommitment = ethers.keccak256(ethers.toUtf8Bytes("university_degree"));
      const certCommitment = ethers.keccak256(ethers.toUtf8Bytes("professional_cert"));
      
      await anonId.connect(issuer1).issueCredential(degreeCommitment);
      await anonId.connect(issuer2).issueCredential(certCommitment);
      
      // Grant different consents to different verifiers
      await anonId.connect(user1).giveConsent(degreeCommitment, verifier1.address);
      await anonId.connect(user1).giveConsent(certCommitment, verifier2.address);
      await anonId.connect(user1).giveConsent(degreeCommitment, verifier2.address);
      
      const proof = createValidProof();
      
      // Verifier1 can verify degree but not cert
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(degreeCommitment)
      )).to.be.true;
      
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(certCommitment)
      )).to.be.false;
      
      // Verifier2 can verify both
      expect(await anonId.connect(verifier2).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(degreeCommitment)
      )).to.be.true;
      
      expect(await anonId.connect(verifier2).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(certCommitment)
      )).to.be.true;
    });

    it("should handle consent revocation in workflow", async function () {
      // Setup
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("revocable_consent_test"));
      
      // Issue credential and give consent
      await anonId.connect(issuer1).issueCredential(commitment);
      await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      
      const proof = createValidProof();
      
      // Verification should work initially
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.true;
      
      // Revoke consent
      const revokeTx = await anonId.connect(user1).revokeConsent(commitment, verifier1.address);
      await expect(revokeTx)
        .to.emit(anonId, "ConsentRevoked")
        .withArgs(commitment, verifier1.address);
      
      // Verification should fail after consent revocation
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.false;
      
      // Verify consent status
      expect(await anonId.hasConsent(commitment, verifier1.address)).to.be.false;
    });
  });

  describe("Revocation Scenarios and Error Conditions", function () {
    beforeEach(async function () {
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
    });

    it("should handle credential revocation workflow", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("revocation_test"));
      
      // Issue credential and give consent
      await anonId.connect(issuer1).issueCredential(commitment);
      await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      
      const proof = createValidProof();
      
      // Verify initially works
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.true;
      
      // Revoke credential
      const revokeTx = await anonId.connect(issuer1).revokeCredential(commitment);
      await expect(revokeTx)
        .to.emit(anonId, "CredentialRevoked")
        .withArgs(commitment, issuer1.address);
      
      // Verify credential is marked as revoked
      const [, , revoked] = await anonId.getCredential(commitment);
      expect(revoked).to.be.true;
      
      // Verification should fail after revocation
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.false;
      
      // Cannot give new consent to revoked credential
      await expect(
        anonId.connect(user2).giveConsent(commitment, verifier2.address)
      ).to.be.revertedWithCustomError(anonId, "CredentialAlreadyRevoked");
    });

    it("should prevent unauthorized credential revocation", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("unauthorized_revocation_test"));
      
      await anonId.connect(issuer1).issueCredential(commitment);
      
      // Only original issuer can revoke
      await expect(
        anonId.connect(issuer2).revokeCredential(commitment)
      ).to.be.revertedWithCustomError(anonId, "NotOriginalIssuer");
      
      await expect(
        anonId.connect(user1).revokeCredential(commitment)
      ).to.be.revertedWithCustomError(anonId, "NotOriginalIssuer");
      
      await expect(
        anonId.connect(unauthorizedUser).revokeCredential(commitment)
      ).to.be.revertedWithCustomError(anonId, "NotOriginalIssuer");
      
      // Original issuer should succeed
      await expect(
        anonId.connect(issuer1).revokeCredential(commitment)
      ).to.emit(anonId, "CredentialRevoked");
    });

    it("should handle double revocation attempts", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("double_revocation_test"));
      
      await anonId.connect(issuer1).issueCredential(commitment);
      await anonId.connect(issuer1).revokeCredential(commitment);
      
      // Second revocation should fail
      await expect(
        anonId.connect(issuer1).revokeCredential(commitment)
      ).to.be.revertedWith("Credential already revoked");
    });

    it("should handle operations on non-existent credentials", async function () {
      const nonExistentCommitment = ethers.keccak256(ethers.toUtf8Bytes("non_existent"));
      
      // Cannot revoke non-existent credential
      await expect(
        anonId.connect(issuer1).revokeCredential(nonExistentCommitment)
      ).to.be.revertedWithCustomError(anonId, "CredentialNotFound");
      
      // Cannot give consent for non-existent credential
      await expect(
        anonId.connect(user1).giveConsent(nonExistentCommitment, verifier1.address)
      ).to.be.revertedWithCustomError(anonId, "CredentialNotFound");
      
      // Cannot revoke consent for non-existent credential
      await expect(
        anonId.connect(user1).revokeConsent(nonExistentCommitment, verifier1.address)
      ).to.be.revertedWithCustomError(anonId, "CredentialNotFound");
      
      // Verification should fail for non-existent credential
      const proof = createValidProof();
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(nonExistentCommitment)
      )).to.be.false;
    });

    it("should handle invalid proof parameters", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("invalid_proof_test"));
      
      await anonId.connect(issuer1).issueCredential(commitment);
      await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      
      // Test various invalid proof parameters
      const invalidProofs = [
        { a: [0, 0], b: [[1, 2], [3, 4]], c: [5, 6] }, // Zero a
        { a: [1, 2], b: [[0, 0], [0, 0]], c: [5, 6] }, // Zero b
        { a: [1, 2], b: [[3, 4], [5, 6]], c: [0, 0] }  // Zero c
      ];
      
      for (const invalidProof of invalidProofs) {
        expect(await anonId.connect(verifier1).verifyProof(
          invalidProof.a,
          invalidProof.b,
          invalidProof.c,
          createProofInput(commitment)
        )).to.be.false;
      }
    });
  });

  describe("Access Control Across All Functions", function () {
    it("should enforce trusted issuer access control", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("access_control_test"));
      
      // Untrusted issuer cannot issue credentials
      await expect(
        anonId.connect(issuer1).issueCredential(commitment)
      ).to.be.revertedWithCustomError(anonId, "NotTrustedIssuer");
      
      // Add issuer to trusted list
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      
      // Now issuer can issue credentials
      await expect(
        anonId.connect(issuer1).issueCredential(commitment)
      ).to.emit(anonId, "CredentialIssued");
      
      // Remove issuer from trusted list
      await anonId.connect(owner).removeTrustedIssuer(issuer1.address);
      
      // Issuer can still revoke previously issued credentials
      await expect(
        anonId.connect(issuer1).revokeCredential(commitment)
      ).to.emit(anonId, "CredentialRevoked");
      
      // But cannot issue new credentials
      const newCommitment = ethers.keccak256(ethers.toUtf8Bytes("new_credential"));
      await expect(
        anonId.connect(issuer1).issueCredential(newCommitment)
      ).to.be.revertedWithCustomError(anonId, "NotTrustedIssuer");
    });

    it("should enforce owner-only trusted issuer management", async function () {
      // Non-owners cannot add trusted issuers
      await expect(
        anonId.connect(issuer1).addTrustedIssuer(issuer2.address)
      ).to.be.revertedWithCustomError(anonId, "OwnableUnauthorizedAccount");
      
      await expect(
        anonId.connect(user1).addTrustedIssuer(issuer1.address)
      ).to.be.revertedWithCustomError(anonId, "OwnableUnauthorizedAccount");
      
      // Non-owners cannot remove trusted issuers
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      
      await expect(
        anonId.connect(issuer2).removeTrustedIssuer(issuer1.address)
      ).to.be.revertedWithCustomError(anonId, "OwnableUnauthorizedAccount");
      
      await expect(
        anonId.connect(user1).removeTrustedIssuer(issuer1.address)
      ).to.be.revertedWithCustomError(anonId, "OwnableUnauthorizedAccount");
      
      // Only owner can manage trusted issuers
      await expect(
        anonId.connect(owner).removeTrustedIssuer(issuer1.address)
      ).to.emit(anonId, "TrustedIssuerRemoved");
    });

    it("should handle consent management access patterns", async function () {
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("consent_access_test"));
      
      await anonId.connect(issuer1).issueCredential(commitment);
      
      // Any address can give consent (representing credential holder)
      await expect(
        anonId.connect(user1).giveConsent(commitment, verifier1.address)
      ).to.emit(anonId, "ConsentGiven");
      
      await expect(
        anonId.connect(user2).giveConsent(commitment, verifier2.address)
      ).to.emit(anonId, "ConsentGiven");
      
      // Any address can revoke consent they have access to
      await expect(
        anonId.connect(user1).revokeConsent(commitment, verifier1.address)
      ).to.emit(anonId, "ConsentRevoked");
      
      // Cannot revoke non-existent consent
      await expect(
        anonId.connect(user1).revokeConsent(commitment, verifier1.address)
      ).to.be.revertedWith("Consent not granted");
    });

    it("should validate input parameters across all functions", async function () {
      // Cannot add zero address as trusted issuer
      await expect(
        anonId.connect(owner).addTrustedIssuer(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid issuer address");
      
      // Cannot issue credential with zero commitment
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      await expect(
        anonId.connect(issuer1).issueCredential(ethers.ZeroHash)
      ).to.be.revertedWith("Invalid commitment");
      
      // Cannot give consent to zero address verifier
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("validation_test"));
      await anonId.connect(issuer1).issueCredential(commitment);
      
      await expect(
        anonId.connect(user1).giveConsent(commitment, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid verifier address");
    });

    it("should prevent duplicate operations", async function () {
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      
      // Cannot add same issuer twice
      await expect(
        anonId.connect(owner).addTrustedIssuer(issuer1.address)
      ).to.be.revertedWith("Issuer already trusted");
      
      // Cannot issue same credential twice
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("duplicate_test"));
      await anonId.connect(issuer1).issueCredential(commitment);
      
      await expect(
        anonId.connect(issuer1).issueCredential(commitment)
      ).to.be.revertedWith("Credential already exists");
      
      // Cannot give same consent twice
      await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      
      await expect(
        anonId.connect(user1).giveConsent(commitment, verifier1.address)
      ).to.be.revertedWith("Consent already granted");
    });
  });

  describe("Complex Integration Scenarios", function () {
    it("should handle issuer trust status changes during active credentials", async function () {
      // Setup: Add issuer and issue credential
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("trust_change_test"));
      
      await anonId.connect(issuer1).issueCredential(commitment);
      await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      
      const proof = createValidProof();
      
      // Verification works initially
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.true;
      
      // Remove issuer from trusted list
      await anonId.connect(owner).removeTrustedIssuer(issuer1.address);
      
      // Verification should fail after issuer becomes untrusted
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.false;
      
      // Re-add issuer to trusted list
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      
      // Verification should work again
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.true;
    });

    it("should handle multiple concurrent operations", async function () {
      // Setup multiple issuers
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      await anonId.connect(owner).addTrustedIssuer(issuer2.address);
      
      // Issue multiple credentials concurrently
      const commitments = [
        ethers.keccak256(ethers.toUtf8Bytes("concurrent_1")),
        ethers.keccak256(ethers.toUtf8Bytes("concurrent_2")),
        ethers.keccak256(ethers.toUtf8Bytes("concurrent_3"))
      ];
      
      // Issue credentials from different issuers
      await Promise.all([
        anonId.connect(issuer1).issueCredential(commitments[0]),
        anonId.connect(issuer2).issueCredential(commitments[1]),
        anonId.connect(issuer1).issueCredential(commitments[2])
      ]);
      
      // Grant consents to different verifiers
      await Promise.all([
        anonId.connect(user1).giveConsent(commitments[0], verifier1.address),
        anonId.connect(user1).giveConsent(commitments[1], verifier2.address),
        anonId.connect(user2).giveConsent(commitments[2], verifier1.address)
      ]);
      
      const proof = createValidProof();
      
      // Verify all credentials work as expected
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitments[0])
      )).to.be.true;
      
      expect(await anonId.connect(verifier2).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitments[1])
      )).to.be.true;
      
      expect(await anonId.connect(verifier1).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitments[2])
      )).to.be.true;
      
      // Cross-verifier access should fail
      expect(await anonId.connect(verifier2).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitments[0])
      )).to.be.false;
    });

    it("should maintain state consistency across complex operations", async function () {
      await anonId.connect(owner).addTrustedIssuer(issuer1.address);
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("consistency_test"));
      
      // Issue credential
      await anonId.connect(issuer1).issueCredential(commitment);
      
      // Multiple consent operations
      await anonId.connect(user1).giveConsent(commitment, verifier1.address);
      await anonId.connect(user1).giveConsent(commitment, verifier2.address);
      
      // Verify state
      expect(await anonId.hasConsent(commitment, verifier1.address)).to.be.true;
      expect(await anonId.hasConsent(commitment, verifier2.address)).to.be.true;
      
      // Partial consent revocation
      await anonId.connect(user1).revokeConsent(commitment, verifier1.address);
      
      // Verify partial state change
      expect(await anonId.hasConsent(commitment, verifier1.address)).to.be.false;
      expect(await anonId.hasConsent(commitment, verifier2.address)).to.be.true;
      
      // Credential revocation should not affect consent records
      await anonId.connect(issuer1).revokeCredential(commitment);
      
      // Consent records should still exist but verification should fail
      expect(await anonId.hasConsent(commitment, verifier2.address)).to.be.true;
      
      const proof = createValidProof();
      expect(await anonId.connect(verifier2).verifyProof(
        proof.a, proof.b, proof.c, createProofInput(commitment)
      )).to.be.false; // Fails due to revoked credential
    });
  });
});