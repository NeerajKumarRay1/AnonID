'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { useNetworkSwitch } from '@/hooks/useNetworkSwitch'

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { isCorrectNetwork, switchToAmoy, isPending: isSwitching } = useNetworkSwitch()

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        
        {!isCorrectNetwork && (
          <button
            onClick={switchToAmoy}
            disabled={isSwitching}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSwitching ? 'Switching...' : 'Switch to Amoy'}
          </button>
        )}
        
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      disabled={isPending}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Connecting...' : 'Connect MetaMask'}
    </button>
  )
}