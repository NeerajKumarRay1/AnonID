'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { useAnonIdContract } from '@/hooks/useAnonIdContract'
import { Address } from 'viem'

interface IssuedCredential {
  commitment: string
  issuer: string
  issuedAt: number
  revoked: boolean
  metadata?: {
    university?: string
    degree?: string
    studentId?: string
  }
}

interface TrustedIssuer {
  address: string
  name?: string
  isActive: boolean
}

export default function IssuerDashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { 
    useIsTrustedIssuer,
    revokeCredential,
    addTrustedIssuer,
    removeTrustedIssuer,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  } = useAnonIdContract()

  const [credentials, setCredentials] = useState<IssuedCredential[]>([])
  const [trustedIssuers, setTrustedIssuers] = useState<TrustedIssuer[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all')
  const [showAddIssuer, setShowAddIssuer] = useState(false)
  const [newIssuerAddress, setNewIssuerAddress] = useState('')
  const [newIssuerName, setNewIssuerName] = useState('')
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if current user is a trusted issuer
  const { data: isTrustedIssuer, isLoading: checkingIssuer } = useIsTrustedIssuer(address!)

  // Mock data for demonstration - in production, this would come from blockchain events
  useEffect(() => {
    if (isTrustedIssuer) {
      // Simulate loading credentials issued by this issuer
      const mockCredentials: IssuedCredential[] = [
        {
          commitment: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          issuer: address!,
          issuedAt: Date.now() - 86400000, // 1 day ago
          revoked: false,
          metadata: {
            university: 'MIT',
            degree: 'Computer Science',
            studentId: 'student001'
          }
        },
        {
          commitment: '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef1',
          issuer: address!,
          issuedAt: Date.now() - 172800000, // 2 days ago
          revoked: false,
          metadata: {
            university: 'Stanford',
            degree: 'Mathematics',
            studentId: 'student002'
          }
        },
        {
          commitment: '0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef12',
          issuer: address!,
          issuedAt: Date.now() - 259200000, // 3 days ago
          revoked: true,
          metadata: {
            university: 'Harvard',
            degree: 'Physics',
            studentId: 'student003'
          }
        }
      ]

      const mockTrustedIssuers: TrustedIssuer[] = [
        {
          address: address!,
          name: 'Current User',
          isActive: true
        },
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'MIT Registrar',
          isActive: true
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          name: 'Stanford Registrar',
          isActive: true
        }
      ]

      setCredentials(mockCredentials)
      setTrustedIssuers(mockTrustedIssuers)
      setIsLoading(false)
    }
  }, [isTrustedIssuer, address])

  const filteredCredentials = credentials.filter(cred => {
    if (filter === 'active') return !cred.revoked
    if (filter === 'revoked') return cred.revoked
    return true
  })

  const handleRevokeCredential = (commitment: string) => {
    setConfirmRevoke(commitment)
  }

  const confirmRevocation = () => {
    if (confirmRevoke) {
      revokeCredential(confirmRevoke)
      setConfirmRevoke(null)
    }
  }

  const handleAddTrustedIssuer = () => {
    if (newIssuerAddress && newIssuerAddress.startsWith('0x') && newIssuerAddress.length === 42) {
      addTrustedIssuer(newIssuerAddress as Address)
      setNewIssuerAddress('')
      setNewIssuerName('')
      setShowAddIssuer(false)
    } else {
      alert('Please enter a valid Ethereum address')
    }
  }

  const handleRemoveTrustedIssuer = (issuerAddress: string) => {
    if (confirm(`Are you sure you want to remove ${issuerAddress} as a trusted issuer?`)) {
      removeTrustedIssuer(issuerAddress as Address)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Wallet</h1>
          <WalletConnectButton />
        </div>
      </div>
    )
  }

  if (checkingIssuer || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isTrustedIssuer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-blue-100 mb-4">You are not authorized as a trusted issuer.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-amber-700">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Issuer Dashboard
            </h1>
            <p className="text-blue-100">
              Manage credentials and trusted issuers
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <WalletConnectButton />
          </div>
        </header>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => router.push('/issuer')}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ← Issue Credential
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Main Dashboard
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-100">{error.message}</span>
            </div>
          </div>
        )}

        {isConfirmed && hash && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-green-100">
                <p className="font-medium">Transaction successful!</p>
                <p className="text-sm opacity-80">Hash: {hash}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Credentials Management */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Issued Credentials</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filter === 'all' 
                        ? 'bg-amber-400 text-blue-900' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    All ({credentials.length})
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filter === 'active' 
                        ? 'bg-amber-400 text-blue-900' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Active ({credentials.filter(c => !c.revoked).length})
                  </button>
                  <button
                    onClick={() => setFilter('revoked')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filter === 'revoked' 
                        ? 'bg-amber-400 text-blue-900' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Revoked ({credentials.filter(c => c.revoked).length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredCredentials.map((credential) => (
                  <div
                    key={credential.commitment}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">
                            {credential.metadata?.university} - {credential.metadata?.degree}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            credential.revoked 
                              ? 'bg-red-500/20 text-red-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {credential.revoked ? 'Revoked' : 'Active'}
                          </span>
                        </div>
                        <p className="text-blue-100 text-sm">
                          Student ID: {credential.metadata?.studentId}
                        </p>
                        <p className="text-blue-200 text-xs">
                          Issued: {new Date(credential.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!credential.revoked && (
                        <button
                          onClick={() => handleRevokeCredential(credential.commitment)}
                          disabled={isPending || isConfirming}
                          className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-blue-300 font-mono break-all">
                      {credential.commitment}
                    </div>
                  </div>
                ))}

                {filteredCredentials.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-blue-200">No credentials found for the selected filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trusted Issuers Management */}
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Trusted Issuers</h2>
                <button
                  onClick={() => setShowAddIssuer(true)}
                  className="px-3 py-1 bg-amber-400 text-blue-900 rounded-lg hover:bg-amber-500 transition-colors text-sm"
                >
                  Add Issuer
                </button>
              </div>

              <div className="space-y-3">
                {trustedIssuers.map((issuer) => (
                  <div
                    key={issuer.address}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white text-sm">
                          {issuer.name || 'Unknown'}
                        </p>
                        <p className="text-blue-200 text-xs font-mono">
                          {issuer.address.slice(0, 6)}...{issuer.address.slice(-4)}
                        </p>
                      </div>
                      {issuer.address !== address && (
                        <button
                          onClick={() => handleRemoveTrustedIssuer(issuer.address)}
                          disabled={isPending || isConfirming}
                          className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Issuer Modal */}
        {showAddIssuer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-blue-900 rounded-2xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Add Trusted Issuer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Issuer Address *
                  </label>
                  <input
                    type="text"
                    value={newIssuerAddress}
                    onChange={(e) => setNewIssuerAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newIssuerName}
                    onChange={(e) => setNewIssuerName(e.target.value)}
                    placeholder="e.g., MIT Registrar"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddIssuer(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTrustedIssuer}
                  disabled={!newIssuerAddress || isPending || isConfirming}
                  className="flex-1 px-4 py-2 bg-amber-400 text-blue-900 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {isPending || isConfirming ? 'Adding...' : 'Add Issuer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        {confirmRevoke && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-blue-900 rounded-2xl p-6 w-full max-w-md border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Revocation</h3>
              
              <p className="text-blue-100 mb-6">
                Are you sure you want to revoke this credential? This action cannot be undone.
              </p>
              
              <div className="text-xs text-blue-300 font-mono break-all mb-6 p-3 bg-white/5 rounded">
                {confirmRevoke}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRevoke(null)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevocation}
                  disabled={isPending || isConfirming}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {isPending || isConfirming ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}