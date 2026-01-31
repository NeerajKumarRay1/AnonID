'use client'

import { useState } from 'react'
import { Address } from 'viem'
import { detectCredentialType, renderCredentialIcon } from '@/lib/credentialTypes'

interface CredentialCardProps {
  commitment: string
  issuer: Address
  issuedAt: bigint
  revoked: boolean
  onProveClick?: (commitment: string) => void
  onRemove?: (commitment: string) => void
}

export function CredentialCard({ 
  commitment, 
  issuer, 
  issuedAt, 
  revoked, 
  onProveClick,
  onRemove
}: CredentialCardProps) {
  const [showFullCommitment, setShowFullCommitment] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true)
  }

  const handleConfirmRemove = () => {
    if (onRemove) {
      onRemove(commitment)
    }
    setShowRemoveConfirm(false)
  }

  const handleCancelRemove = () => {
    setShowRemoveConfirm(false)
  }
  
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatCommitment = (commitment: string) => {
    if (showFullCommitment) {
      return commitment
    }
    return `${commitment.slice(0, 10)}...${commitment.slice(-8)}`
  }

  const getCredentialType = () => {
    return detectCredentialType(issuer, commitment)
  }

  const credentialType = getCredentialType()

  const getCredentialTitle = () => {
    return credentialType.title
  }

  const getCredentialDescription = () => {
    return credentialType.description
  }

  const getCredentialIcon = () => {
    return renderCredentialIcon(credentialType.iconName)
  }

  const getCredentialColor = () => {
    return credentialType.color
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${getCredentialColor()} rounded-xl flex items-center justify-center text-xl`}>
              {getCredentialIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">
                      {getCredentialTitle()}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getCredentialColor()} text-white`}>
                      {credentialType.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{getCredentialDescription()}</p>
                </div>
                {onRemove && (
                  <button
                    onClick={handleRemoveClick}
                    className="ml-3 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    title="Remove credential from dashboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Credential Type</span>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCredentialColor()}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-200 font-medium">{credentialType.type.charAt(0).toUpperCase() + credentialType.type.slice(1)}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded bg-gradient-to-r ${getCredentialColor()} text-white`}>
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Commitment Hash</span>
                <button
                  onClick={() => navigator.clipboard.writeText(commitment)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Copy commitment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <code 
                className="text-sm font-mono text-cyan-300 cursor-pointer hover:text-cyan-200 transition-colors block"
                onClick={() => setShowFullCommitment(!showFullCommitment)}
                title="Click to toggle full commitment"
              >
                {formatCommitment(commitment)}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Issuer</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(issuer)}
                    className="text-slate-400 hover:text-purple-400 transition-colors"
                    title="Copy issuer address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <code className="text-sm font-mono text-purple-300">
                  {formatAddress(issuer)}
                </code>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                <span className="text-sm font-medium text-slate-300 block mb-2">Issued</span>
                <span className="text-sm text-slate-200">
                  {formatDate(issuedAt)}
                </span>
              </div>
            </div>

            {/* Generate ZK Proof Button */}
            {!revoked && onProveClick && (
              <div className="pt-4 border-t border-slate-700/30">
                <button
                  onClick={() => onProveClick(commitment)}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${getCredentialColor()} text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Generate ZK Proof
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-200 mb-2">Remove Credential</h4>
              <p className="text-sm text-red-300 mb-4">
                Are you sure you want to remove this credential from your dashboard? This will only hide it from view - the credential will remain on the blockchain.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmRemove}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={handleCancelRemove}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {revoked && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <span className="text-sm text-red-200 font-medium">
              This credential has been revoked and cannot be used for verification.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}