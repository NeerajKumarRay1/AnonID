'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useAnonIdContract } from '@/hooks/useAnonIdContract';
import { isContractConfigured } from '@/lib/wagmi';
import { generateCommitment, generateSalt } from '@/lib/commitmentUtils';

export default function CredentialIssuerPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { issueCredential, isPending, isConfirmed, error } = useAnonIdContract();

  const [formData, setFormData] = useState({
    credentialType: 'identity',
    holderName: '',
    holderEmail: '',
    issuerName: '',
    description: '',
    validUntil: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle transaction completion
  useEffect(() => {
    if (isConfirmed) {
      alert('Credential issued successfully!');
      setFormData({
        credentialType: 'identity',
        holderName: '',
        holderEmail: '',
        issuerName: '',
        description: '',
        validUntil: ''
      });
      setIsSubmitting(false);
    }
    if (error) {
      console.error('Transaction error:', error);
      alert('Failed to issue credential: ' + error.message);
      setIsSubmitting(false);
    }
  }, [isConfirmed, error]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isContractConfigured()) {
      alert('Contract address not configured. Please deploy the AnonID contract and update the NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS environment variable.');
      return;
    }

    // Basic validation
    if (!formData.holderName || !formData.issuerName) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create simple credential data string
      const credentialData = JSON.stringify({
        type: formData.credentialType,
        holder: formData.holderName,
        email: formData.holderEmail,
        issuer: formData.issuerName,
        description: formData.description,
        validUntil: formData.validUntil,
        issuedAt: new Date().toISOString(),
        issuerAddress: address
      });

      // Generate salt and commitment
      const salt = generateSalt();
      const commitment = generateCommitment(credentialData, salt);
      
      console.log('Issuing credential:', {
        commitment,
        credentialData: JSON.parse(credentialData)
      });
      
      // Issue credential on blockchain
      issueCredential(commitment);
      
    } catch (err) {
      console.error('Failed to issue credential:', err);
      setIsSubmitting(false);
      alert('Failed to generate credential commitment: ' + (err as Error).message);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  AnonID Issuer
                </h1>
                <p className="text-slate-300 text-sm">Issue Verifiable Credentials</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NetworkStatus />
              <DarkModeToggle />
              <WalletConnectButton />
            </div>
          </header>
          
          <main className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-slate-300 mb-6">Connect your MetaMask wallet to access the credential issuer portal.</p>
              <WalletConnectButton />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AnonID Issuer
              </h1>
              <p className="text-slate-300 text-sm">Issue Verifiable Credentials</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <div className="text-sm text-slate-300">
              Issuer: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <DarkModeToggle />
            <WalletConnectButton />
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
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
                  <p className="text-sm opacity-90">Deploy the AnonID contract to activate credential issuance.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Issue New Credential</h2>
                <p className="text-slate-400">Create a verifiable credential on the blockchain</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Credential Type *
                  </label>
                  <select
                    value={formData.credentialType}
                    onChange={(e) => handleInputChange('credentialType', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  >
                    <option value="identity">Identity Verification</option>
                    <option value="education">Educational Certificate</option>
                    <option value="employment">Employment Verification</option>
                    <option value="skill">Skill Certification</option>
                    <option value="membership">Membership Proof</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.holderName}
                    onChange={(e) => handleInputChange('holderName', e.target.value)}
                    placeholder="Enter credential holder's name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Holder Email
                  </label>
                  <input
                    type="email"
                    value={formData.holderEmail}
                    onChange={(e) => handleInputChange('holderEmail', e.target.value)}
                    placeholder="holder@example.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Issuer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.issuerName}
                    onChange={(e) => handleInputChange('issuerName', e.target.value)}
                    placeholder="Your organization name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about this credential..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-colors"
                >
                  ← Back to Dashboard
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isPending || !isContractConfigured()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isPending ? 'Confirming Transaction...' : 'Generating Credential...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Issue Credential
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Credentials are stored on-chain and can be verified using Zero Knowledge Proofs
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}