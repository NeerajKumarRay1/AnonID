'use client'

import { WalletConnectButton } from "@/components/WalletConnectButton";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { NetworkStatus } from "@/components/NetworkStatus";
import { CredentialCard } from "@/components/CredentialCard";
import { useUserCredentials } from "@/hooks/useUserCredentials";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { isContractConfigured } from "@/lib/wagmi";

export default function Home() {
  const { address, isConnected } = useAccount()
  const { credentials, isLoading, error, refetch, removeCredential } = useUserCredentials()
  const router = useRouter()

  const handleProveClick = (commitment: string) => {
    router.push(`/prove/${commitment}`)
  }

  const handleRemoveCredential = (commitment: string) => {
    removeCredential(commitment)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Blockchain Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            {/* Blockchain Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AnonID
              </h1>
              <p className="text-slate-300 text-sm">
                Decentralized Identity Protocol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <DarkModeToggle />
            <WalletConnectButton />
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          {!isConnected ? (
            // Landing page for non-connected users
            <>
              <div className="text-center mb-16">
                <h2 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
                  Own Your Digital Identity
                </h2>
                <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Leverage blockchain technology and Zero Knowledge Proofs to create, manage, 
                  and verify credentials while maintaining complete privacy and control.
                </p>
              </div>

              {/* Blockchain Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Verifiable Credentials
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Immutable, cryptographically signed credentials stored on-chain. 
                    Tamper-proof verification from trusted institutions.
                  </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Zero Knowledge Proofs
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Prove credential validity without revealing sensitive data. 
                    Advanced cryptography ensures complete privacy.
                  </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:border-green-500/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Decentralized Control
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Self-sovereign identity management. You control access, 
                    revocation, and verification permissions.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-300 mb-8 text-lg">
                  Connect your Web3 wallet to access the decentralized identity protocol
                </p>
                <div className="flex justify-center">
                  <WalletConnectButton />
                </div>
              </div>
            </>
          ) : (
            // Blockchain Dashboard for connected users
            <>
              {!isContractConfigured() && (
                <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                      </svg>
                    </div>
                    <div className="text-amber-200">
                      <p className="font-semibold">Smart Contract Not Deployed</p>
                      <p className="text-sm opacity-90">Deploy the AnonID contract to activate the protocol.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Blockchain Stats Header */}
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Credentials</p>
                      <p className="text-2xl font-bold text-white">{credentials.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Credentials</p>
                      <p className="text-2xl font-bold text-white">{credentials.filter(c => !c.revoked).length}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Wallet Address</p>
                      <p className="text-lg font-mono text-white">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Network</p>
                      <p className="text-lg font-semibold text-white">Polygon Amoy</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      My Credentials
                    </h3>
                    <p className="text-slate-400">
                      Manage your on-chain verifiable credentials
                    </p>
                  </div>
                  <button
                    onClick={refetch}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 font-semibold"
                  >
                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isLoading ? 'Syncing...' : 'Sync Chain'}
                  </button>
                </div>

                {error && (
                  <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                        </svg>
                      </div>
                      <span className="text-red-200 font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center gap-4">
                      <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                      <p className="text-slate-300 text-lg">Scanning blockchain for credentials...</p>
                    </div>
                  </div>
                ) : credentials.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      No Credentials Found
                    </h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                      Your credential vault is empty. Connect with trusted issuers to receive your first verifiable credential.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {credentials.map((credential) => (
                      <CredentialCard
                        key={credential.commitment}
                        commitment={credential.commitment}
                        issuer={credential.issuer}
                        issuedAt={credential.issuedAt}
                        revoked={credential.revoked}
                        onProveClick={handleProveClick}
                        onRemove={handleRemoveCredential}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Action Grid */}
              <div className="mt-12 grid md:grid-cols-3 gap-6">
                <button
                  onClick={() => router.push('/credential-issuer')}
                  className="p-8 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl hover:border-cyan-400/50 transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Issue Credential</h4>
                  <p className="text-slate-400">Create new verifiable credentials on-chain</p>
                </button>
                
                <button
                  onClick={() => router.push('/verify')}
                  className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-2xl hover:border-green-400/50 transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Verify Proof</h4>
                  <p className="text-slate-400">Validate Zero Knowledge Proofs</p>
                </button>
                
                <button
                  onClick={refetch}
                  className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-2xl hover:border-purple-400/50 transition-all duration-300 group text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Sync Blockchain</h4>
                  <p className="text-slate-400">Refresh credential data from chain</p>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
