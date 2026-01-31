'use client'

import { useState, useEffect } from 'react'
import { verifyZKProof, type ZKProof } from '@/lib/zkProof'

interface SimpleVerificationResultProps {
  proof?: {
    a: [string, string]
    b: [[string, string], [string, string]]
    c: [string, string]
  }
  publicSignals?: string[]
}

export function SimpleVerificationResult({ proof, publicSignals }: SimpleVerificationResultProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const verifyProof = async () => {
    if (!proof || !publicSignals) {
      setError('No proof data to verify')
      return
    }

    setIsVerifying(true)
    setError('')
    setVerificationResult(null)

    try {
      console.log('🔍 Verifying ZK proof...')
      console.log('Proof:', proof)
      console.log('Public signals:', publicSignals)

      // Convert proof to the expected format
      const zkProof: ZKProof = {
        a: [BigInt(proof.a[0]), BigInt(proof.a[1])],
        b: [
          [BigInt(proof.b[0][0]), BigInt(proof.b[0][1])],
          [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])]
        ],
        c: [BigInt(proof.c[0]), BigInt(proof.c[1])]
      }

      const isValid = await verifyZKProof(zkProof, publicSignals)
      setVerificationResult(isValid)

      if (isValid) {
        console.log('✅ Proof verification successful!')
      } else {
        console.log('❌ Proof verification failed!')
      }

    } catch (err) {
      console.error('Verification error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown verification error'
      setError(`Verification failed: ${errorMessage}`)
      setVerificationResult(false)
    }

    setIsVerifying(false)
  }

  // Auto-verify when proof data is provided
  useEffect(() => {
    if (proof && publicSignals && verificationResult === null) {
      verifyProof()
    }
  }, [proof, publicSignals]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!proof || !publicSignals) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Proof to Verify</h3>
          <p className="text-slate-400">Generate a proof first to see verification results here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Proof Verification
        </h3>
        
        <button
          onClick={verifyProof}
          disabled={isVerifying}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Verifying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-verify
            </>
          )}
        </button>
      </div>

      {/* Verification Status */}
      {verificationResult !== null && (
        <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm ${
          verificationResult 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              verificationResult ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {verificationResult ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            <div>
              <h4 className={`font-semibold ${
                verificationResult ? 'text-green-200' : 'text-red-200'
              }`}>
                {verificationResult ? 'Proof Valid ✅' : 'Proof Invalid ❌'}
              </h4>
              <p className={`text-sm ${
                verificationResult ? 'text-green-300' : 'text-red-300'
              }`}>
                {verificationResult 
                  ? 'The zero-knowledge proof has been successfully verified. The credential is valid.'
                  : 'The proof verification failed. The credential may be invalid or tampered with.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <p className="text-sm text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Proof Details */}
      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <h4 className="text-sm font-semibold text-white mb-3">Public Signals</h4>
          <div className="space-y-2">
            {publicSignals.map((signal, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">
                  {['Commitment', 'Issuer Address', 'Timestamp', 'Revocation Status'][index]}:
                </span>
                <code className="text-slate-300 font-mono text-xs bg-slate-800/50 px-2 py-1 rounded">
                  {signal.length > 20 ? `${signal.slice(0, 10)}...${signal.slice(-6)}` : signal}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <h4 className="text-sm font-semibold text-white mb-3">Proof Structure</h4>
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Proof Type: Groth16 zk-SNARK</div>
            <div>• Curve: BN128</div>
            <div>• Components: a, b, c (elliptic curve points)</div>
            <div>• Security: Cryptographically secure zero-knowledge proof</div>
          </div>
        </div>

        {verificationResult && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-blue-200">Verification Complete</span>
            </div>
            <p className="text-sm text-blue-300">
              The proof has been cryptographically verified using elliptic curve operations. 
              This confirms the credential&apos;s authenticity without revealing sensitive data.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}