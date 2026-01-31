import { ethers } from 'ethers'

/**
 * Generate a cryptographic commitment for credential data using keccak256
 * This simulates the same hash function used in the circom circuit
 * @param credentialData - The credential data to commit to
 * @param salt - Random salt for the commitment
 * @returns The commitment hash (as hex string)
 */
export function generateCommitment(credentialData: string, salt: string): string {
  // For development, we use keccak256 as a placeholder for Poseidon
  // In production, this would use the actual Poseidon hash function
  const combined = ethers.solidityPacked(['string', 'string'], [credentialData, salt])
  return ethers.keccak256(combined)
}

/**
 * Generate a random salt for commitment generation
 * @returns Random 32-byte salt as hex string
 */
export function generateSalt(): string {
  return '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create a credential data structure
 * @param params - Credential parameters
 * @returns JSON string of credential data
 */
export function createCredentialData(params: {
  university?: string
  studentId?: string
  degree?: string
  graduationYear?: number
  gpa?: number
}): string {
  const {
    university = 'MIT',
    studentId = 'student123',
    degree = 'Computer Science',
    graduationYear = 2023,
    gpa = 3.8
  } = params
  
  return JSON.stringify({
    university,
    studentId,
    degree,
    graduationYear,
    gpa,
    timestamp: Math.floor(Date.now() / 1000)
  })
}

/**
 * Generate a complete demo credential with commitment
 * @param params - Credential parameters
 * @returns Complete credential object with commitment
 */
export function generateDemoCredential(params: {
  university?: string
  studentId?: string
  degree?: string
  graduationYear?: number
  gpa?: number
} = {}) {
  const credentialData = createCredentialData(params)
  const salt = generateSalt()
  const commitment = generateCommitment(credentialData, salt)
  
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
  }
}

/**
 * Demo issuer addresses for testing
 */
export const DEMO_ISSUERS = {
  'MIT': '0x1234567890123456789012345678901234567890',
  'Stanford': '0x2345678901234567890123456789012345678901',
  'Harvard': '0x3456789012345678901234567890123456789012',
  'Berkeley': '0x4567890123456789012345678901234567890123',
  'CMU': '0x5678901234567890123456789012345678901234',
  'Caltech': '0x6789012345678901234567890123456789012345'
} as const

/**
 * Get demo issuer information
 * @returns Map of university names to issuer addresses
 */
export function getDemoIssuers() {
  return DEMO_ISSUERS
}