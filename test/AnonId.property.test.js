const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnonId Property Tests", function () {
  let anonId;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  // Helper function to create GROTH16 input array
  function createProofInput(commitment) {
    const input = Array(256).fill(0);
    input[0] = commitment;
    return input;
  }

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    const AnonId = await ethers.getContractFactory("AnonId");
    anonId = await AnonId.deploy();
    await anonId.waitForDeployment();
  });

  describe("Property 12: GROTH16 Proof Validation", function () {
    /**
     * Feature: anon-id, Property 12: GROTH16 Proof Validation
     * Validates: Requirements 4.1
     * 
     * Property: For any proof verification request, the system should properly 
     * validate all GROTH16 proof parameters (a, b, c, input)
     */
    it("should validate GROTH16 proof parameters correctly", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("groth16_test"));
      await anonId.connect(addr1).issueCredential(commitment);
      await anonId.connect(owner).giveConsent(commitment, addr2.address);
      
      // Valid proof parameters (non-zero)
      const validProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        input: createProofInput(commitment)
      };
      
      // Should return true for valid proof parameters
      const result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        validProof.input
      );
      expect(result).to.be.true;
    });

    it("should reject proofs with zero parameters", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("zero_proof_test"));
      await anonId.connect(addr1).issueCredential(commitment);
      await anonId.connect(owner).giveConsent(commitment, addr2.address);
      
      // Test zero 'a' parameter
      const zeroAProof = {
        a: [0, 0],
        b: [[1, 2], [3, 4]],
        c: [5, 6],
        input: createProofInput(commitment)
      };
      
      let result = await anonId.connect(addr2).verifyProof(
        zeroAProof.a,
        zeroAProof.b,
        zeroAProof.c,
        zeroAProof.input
      );
      expect(result).to.be.false;
      
      // Test zero 'b' parameter
      const zeroBProof = {
        a: [1, 2],
        b: [[0, 0], [0, 0]],
        c: [5, 6],
        input: createProofInput(commitment)
      };
      
      result = await anonId.connect(addr2).verifyProof(
        zeroBProof.a,
        zeroBProof.b,
        zeroBProof.c,
        zeroBProof.input
      );
      expect(result).to.be.false;
      
      // Test zero 'c' parameter
      const zeroCProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [0, 0],
        input: createProofInput(commitment)
      };
      
      result = await anonId.connect(addr2).verifyProof(
        zeroCProof.a,
        zeroCProof.b,
        zeroCProof.c,
        zeroCProof.input
      );
      expect(result).to.be.false;
    });
  });

  describe("Property 13: Credential Existence and Status Check", function () {
    /**
     * Feature: anon-id, Property 13: Credential Existence and Status Check
     * Validates: Requirements 4.2
     * 
     * Property: For any proof verification, the system should verify the 
     * credential exists and is not revoked
     */
    it("should verify credential existence before proof validation", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const existingCommitment = ethers.keccak256(ethers.toUtf8Bytes("existing_credential"));
      const nonExistentCommitment = ethers.keccak256(ethers.toUtf8Bytes("non_existent_credential"));
      
      // Issue only one credential
      await anonId.connect(addr1).issueCredential(existingCommitment);
      await anonId.connect(owner).giveConsent(existingCommitment, addr2.address);
      
      const validProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8]
      };
      
      // Existing credential should pass
      const existingResult = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(existingCommitment)
      );
      expect(existingResult).to.be.true;
      
      // Non-existent credential should fail
      const nonExistentResult = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(nonExistentCommitment)
      );
      expect(nonExistentResult).to.be.false;
    });

    it("should reject verification for revoked credentials", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const activeCommitment = ethers.keccak256(ethers.toUtf8Bytes("active_credential"));
      const revokedCommitment = ethers.keccak256(ethers.toUtf8Bytes("revoked_credential"));
      
      // Issue both credentials
      await anonId.connect(addr1).issueCredential(activeCommitment);
      await anonId.connect(addr1).issueCredential(revokedCommitment);
      
      // Give consent for both
      await anonId.connect(owner).giveConsent(activeCommitment, addr2.address);
      await anonId.connect(owner).giveConsent(revokedCommitment, addr2.address);
      
      // Revoke one credential
      await anonId.connect(addr1).revokeCredential(revokedCommitment);
      
      const validProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8]
      };
      
      // Active credential should pass
      const activeResult = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(activeCommitment)
      );
      expect(activeResult).to.be.true;
      
      // Revoked credential should fail
      const revokedResult = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(revokedCommitment)
      );
      expect(revokedResult).to.be.false;
    });
  });

  describe("Property 14: Issuer Trust Verification", function () {
    /**
     * Feature: anon-id, Property 14: Issuer Trust Verification
     * Validates: Requirements 4.3
     * 
     * Property: For any proof verification, the system should confirm the 
     * credential issuer is trusted
     */
    it("should verify issuer trust status during proof validation", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const trustedIssuerCommitment = ethers.keccak256(ethers.toUtf8Bytes("trusted_issuer_credential"));
      await anonId.connect(addr1).issueCredential(trustedIssuerCommitment);
      await anonId.connect(owner).giveConsent(trustedIssuerCommitment, addr2.address);
      
      const validProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8]
      };
      
      // Should pass with trusted issuer
      let result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(trustedIssuerCommitment)
      );
      expect(result).to.be.true;
      
      // Remove issuer from trusted list
      await anonId.connect(owner).removeTrustedIssuer(addr1.address);
      
      // Should fail after issuer is no longer trusted
      result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(trustedIssuerCommitment)
      );
      expect(result).to.be.false;
    });
  });

  describe("Property 15: Consent Verification", function () {
    /**
     * Feature: anon-id, Property 15: Consent Verification
     * Validates: Requirements 4.4
     * 
     * Property: For any proof verification request, the system should check 
     * that consent exists for the requesting verifier
     */
    it("should verify consent exists for requesting verifier", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("consent_verification_test"));
      await anonId.connect(addr1).issueCredential(commitment);
      
      const validProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8]
      };
      
      // Should fail without consent
      let result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(commitment)
      );
      expect(result).to.be.false;
      
      // Give consent to addr2
      await anonId.connect(owner).giveConsent(commitment, addr2.address);
      
      // Should pass with consent
      result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(commitment)
      );
      expect(result).to.be.true;
      
      // addr3 should still fail (no consent)
      result = await anonId.connect(addr3).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(commitment)
      );
      expect(result).to.be.false;
    });
  });

  describe("Property 24: Revoked Credential Rejection", function () {
    /**
     * Feature: anon-id, Property 24: Revoked Credential Rejection
     * Validates: Requirements 6.4
     * 
     * Property: For any verification attempt on a revoked credential, the 
     * system should reject the verification
     */
    it("should reject all verification attempts for revoked credentials", async function () {
      await anonId.connect(owner).addTrustedIssuer(addr1.address);
      
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("revoked_rejection_test"));
      await anonId.connect(addr1).issueCredential(commitment);
      await anonId.connect(owner).giveConsent(commitment, addr2.address);
      
      const validProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8]
      };
      
      // Should pass initially
      let result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(commitment)
      );
      expect(result).to.be.true;
      
      // Revoke credential
      await anonId.connect(addr1).revokeCredential(commitment);
      
      // Should fail after revocation regardless of proof parameters
      result = await anonId.connect(addr2).verifyProof(
        validProof.a,
        validProof.b,
        validProof.c,
        createProofInput(commitment)
      );
      expect(result).to.be.false;
    });
  });

  describe("Property Tests Setup Validation", function () {
    it("should deploy contract with correct initial state", async function () {
      // Contract should be deployed
      expect(await anonId.getAddress()).to.be.properAddress;
      
      // Owner should be set correctly
      expect(await anonId.owner()).to.equal(owner.address);
      
      // No issuers should be trusted initially
      expect(await anonId.isTrustedIssuer(addr1.address)).to.be.false;
      expect(await anonId.isTrustedIssuer(addr2.address)).to.be.false;
      expect(await anonId.isTrustedIssuer(owner.address)).to.be.false;
    });

    it("should have correct contract interface", async function () {
      // Check that all required functions exist
      expect(typeof anonId.addTrustedIssuer).to.equal("function");
      expect(typeof anonId.removeTrustedIssuer).to.equal("function");
      expect(typeof anonId.isTrustedIssuer).to.equal("function");
      expect(typeof anonId.issueCredential).to.equal("function");
      expect(typeof anonId.revokeCredential).to.equal("function");
      expect(typeof anonId.giveConsent).to.equal("function");
      expect(typeof anonId.revokeConsent).to.equal("function");
      expect(typeof anonId.verifyProof).to.equal("function");
    });
  });
});