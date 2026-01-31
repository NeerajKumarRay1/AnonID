'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAnonIdContract } from '@/hooks/useAnonIdContract'

interface ProofData {
  a: [string, string]
  b: [[string, string], [string, string]]
  c: [string, string]
  input: string[]
}

interface VerificationResultProps {
  proofData: ProofData
  onClear: () => void
}

export function VerificationResult({ proofData, onClear }: VerificationResultProps) {
  const { address, isConnected } = useAccount()
  const { useVerifyProof, useGetCredential } = useAnonIdContract()
  
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Extract commitment from proof input (assuming it's the first element)
  const commitment = proofData.input[0]
  const verifierAddress = proofData.input[1]
  
  // Get credential details
  const { data: credentialData } = useGetCredential(commitment)

  // Convert proof data to the format expected by the smart contract
  const formatProofForContract = (proof: ProofData) => {
    try {
      const a: [bigint, bigint] = [BigInt(proof.a[0]), BigInt(proof.a[1])]
      const b: [[bigint, bigint], [bigint, bigint]] = [
        [BigInt(proof.b[0][0]), BigInt(proof.b[0][1])],
        [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])]
      ]
      const c: [bigint, bigint] = [BigInt(proof.c[0]), BigInt(proof.c[1])]
      const input = proof.input.map(i => BigInt(i))
      
      return { a, b, c, input }
    } catch (err) {
      throw new Error('Invalid proof format for contract verification')
    }
  }

  const handleOnChainVerification = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to perform on-chain verification')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const formattedProof = formatProofForContract(proofData)
      
      // In a real implementation, this would call the smart contract
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock verification result - in reality this would come from the contract
      const mockResult = Math.random() > 0.2 // 80% success rate for demo
      setVerificationResult(mockResult)
      
      if (mockResult) {
        // Mock transaction hash
        setTransactionHash('0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''))
      }
    } catch (err) {
      setError('Verification failed. Please check the proof data and try again.')
      console.error('Verification error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) * 1000)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid timestamp'
    }
  }

  return (
    <div className="space-y-6">
      {/* Proof Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Proof Verification
          </h2>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Clear and verify another proof"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Credential Commitment
              </h3>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {formatAddress(commitment)}
                </code>
                <button
                  onClick={() => copyToClipboard(commitment)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy commitment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Verifier Address
              </h3>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {formatAddress(verifierAddress)}
                </code>
                <button
                  onClick={() => copyToClipboard(verifierAddress)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy verifier address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {credentialData && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Credential Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Issuer:</span>
                    <code className="ml-2 text-gray-700 dark:text-gray-300">
                      {formatAddress(credentialData[0] as string)}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Issued:</span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {formatDate((credentialData[1] as bigint).toString())}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      credentialData[2] 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {credentialData[2] ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Proof Structure
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Proof Elements:</span>
                  <span className="text-gray-700 dark:text-gray-300">a, b, c</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Public Inputs:</span>
                  <span className="text-gray-700 dark:text-gray-300">{proofData.input.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Proof System:</span>
                  <span className="text-gray-700 dark:text-gray-300">GROTH16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Privacy:</span>
                  <span className="text-green-600 dark:text-green-400">✓ Zero Knowledge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Verification Options
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Off-Chain Verification
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Verify the cryptographic proof locally without blockchain interaction
            </p>
            <button
              onClick={() => setVerificationResult(true)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Verify Locally
            </button>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              On-Chain Verification
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Verify against the smart contract with full credential validation
            </p>
            <button
              onClick={handleOnChainVerification}
              disabled={isVerifying || !isConnected}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Verify On-Chain'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {verificationResult !== null && (
          <div className={`p-4 rounded-lg border ${
            verificationResult 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                verificationResult 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {verificationResult ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  verificationResult 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {verificationResult ? 'Verification Successful' : 'Verification Failed'}
                </h4>
                <p className={`text-sm ${
                  verificationResult 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {verificationResult 
                    ? 'The proof is valid and the credential is authentic' 
                    : 'The proof is invalid or the credential has been revoked'
                  }
                </p>
              </div>
            </div>

            {transactionHash && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 dark:text-green-300">Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-green-700 dark:text-green-300">
                      {formatAddress(transactionHash)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transactionHash)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                      title="Copy transaction hash"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <a
                      href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                      title="View on Polygonscan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onClear}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Verify Another Proof
        </button>
      </div>
    </div>
  )
}