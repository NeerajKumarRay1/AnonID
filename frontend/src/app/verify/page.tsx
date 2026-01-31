'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { VerificationResult } from '@/components/VerificationResult'

interface ProofData {
  a: [string, string]
  b: [[string, string], [string, string]]
  c: [string, string]
  input: string[]
}

export default function VerifyPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [proofInput, setProofInput] = useState('')
  const [proofData, setProofData] = useState<ProofData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!proofInput.trim()) {
      setError('Please enter proof data')
      return
    }

    try {
      const parsed = JSON.parse(proofInput.trim())
      
      // Validate proof structure
      if (!parsed.a || !parsed.b || !parsed.c || !parsed.input) {
        throw new Error('Invalid proof structure')
      }
      
      if (!Array.isArray(parsed.a) || parsed.a.length !== 2) {
        throw new Error('Invalid proof.a format')
      }
      
      if (!Array.isArray(parsed.b) || parsed.b.length !== 2 || 
          !Array.isArray(parsed.b[0]) || parsed.b[0].length !== 2 ||
          !Array.isArray(parsed.b[1]) || parsed.b[1].length !== 2) {
        throw new Error('Invalid proof.b format')
      }
      
      if (!Array.isArray(parsed.c) || parsed.c.length !== 2) {
        throw new Error('Invalid proof.c format')
      }
      
      if (!Array.isArray(parsed.input)) {
        throw new Error('Invalid proof.input format')
      }

      setProofData(parsed)
    } catch (err) {
      setError('Invalid JSON format or proof structure')
      console.error('Proof parsing error:', err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setProofInput(content)
    }
    reader.readAsText(file)
  }

  const clearProof = () => {
    setProofData(null)
    setProofInput('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Verify Zero Knowledge Proof
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Validate credential proofs while preserving user privacy
                </p>
              </div>
            </div>
          </header>

          {!proofData ? (
            // Proof Input Form
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Submit Proof for Verification
              </h2>
              
              <div className="mb-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">Privacy Preserved</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      No personal data is revealed during verification
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="font-medium text-green-900 dark:text-green-100">Fast Verification</h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Cryptographic proofs verify instantly
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <h3 className="font-medium text-purple-900 dark:text-purple-100">Tamper Proof</h3>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Blockchain-backed credential integrity
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProofSubmit} className="space-y-6">
                <div>
                  <label htmlFor="proof" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proof Data (JSON)
                  </label>
                  <textarea
                    id="proof"
                    value={proofInput}
                    onChange={(e) => setProofInput(e.target.value)}
                    placeholder='{"a": [...], "b": [...], "c": [...], "input": [...]}'
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Paste the JSON proof data or upload a proof file
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Proof File
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {proofInput && (
                    <button
                      type="button"
                      onClick={() => setProofInput('')}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!proofInput.trim() || isVerifying}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isVerifying ? 'Verifying Proof...' : 'Verify Proof'}
                </button>
              </form>

              {!isConnected && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">Wallet Not Connected</p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        Connect your wallet to perform on-chain verification
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Verification Result
            <VerificationResult 
              proofData={proofData} 
              onClear={clearProof}
            />
          )}
        </div>
      </div>
    </div>
  )
}