'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useAnonIdContract } from '@/hooks/useAnonIdContract'
import { ProofGenerator } from '@/components/ProofGenerator'
import { SimpleVerificationResult } from '@/components/SimpleVerificationResult'
import { Address } from 'viem'

interface ProofResult {
  proof: {
    a: [string, string]
    b: [[string, string], [string, string]]
    c: [string, string]
  }
  publicSignals: string[]
  rawProof: {
    a: [bigint, bigint]
    b: [[bigint, bigint], [bigint, bigint]]
    c: [bigint, bigint]
  }
  verifyPageFormat?: {
    a: [string, string]
    b: [[string, string], [string, string]]
    c: [string, string]
    input: string[]
  }
}

export default function ProvePage() {
  const params = useParams()
  const router = useRouter()
  const { isConnected } = useAccount()
  const { useGetCredential } = useAnonIdContract()
  
  const commitment = params.commitment as string
  const { data: credentialData, isLoading, error } = useGetCredential(commitment)
  const [generatedProof, setGeneratedProof] = useState<ProofResult | null>(null)

  const handleProofGenerated = (proof: ProofResult) => {
    setGeneratedProof(proof)
  }

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <p className="text-slate-300 text-lg">Loading credential...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !credentialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-200 mb-2">
                    Credential Not Found
                  </h3>
                  <p className="text-red-300 mb-6">
                    The credential with this commitment hash could not be found or has been revoked.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [issuer, issuedAt, revoked] = credentialData as [Address, bigint, boolean]

  if (revoked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-200 mb-2">
                    Credential Revoked
                  </h3>
                  <p className="text-amber-300 mb-6">
                    This credential has been revoked and cannot be used to generate proofs.
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.push('/')}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Generate Zero Knowledge Proof
                </h1>
                <p className="text-slate-300 text-lg mt-2">
                  Create a privacy-preserving proof for your credential
                </p>
              </div>
            </div>

            {/* Credential Info */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Credential Details
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <span className="text-sm font-medium text-slate-300 block mb-2">Issuer</span>
                  <code className="text-sm font-mono text-purple-300">
                    {issuer.slice(0, 6)}...{issuer.slice(-4)}
                  </code>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <span className="text-sm font-medium text-slate-300 block mb-2">Issued</span>
                  <span className="text-sm text-slate-200">
                    {new Date(Number(issuedAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <span className="text-sm font-medium text-slate-300 block mb-2">Status</span>
                  <span className="inline-flex items-center gap-1 text-sm text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <ProofGenerator
                commitment={commitment}
                issuer={issuer}
                issuedAt={issuedAt}
                onProofGenerated={handleProofGenerated}
              />
            </div>
            
            <div>
              <SimpleVerificationResult 
                proof={generatedProof?.proof}
                publicSignals={generatedProof?.publicSignals}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}