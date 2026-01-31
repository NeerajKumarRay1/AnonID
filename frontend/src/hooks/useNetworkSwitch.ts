'use client'

import { useSwitchChain, useChainId } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'
import { useCallback, useEffect } from 'react'

export function useNetworkSwitch() {
  const chainId = useChainId()
  const { switchChain, isPending, error } = useSwitchChain()

  const isCorrectNetwork = chainId === polygonAmoy.id
  const needsNetworkSwitch = !isCorrectNetwork

  const switchToAmoy = useCallback(() => {
    if (needsNetworkSwitch) {
      switchChain({ chainId: polygonAmoy.id })
    }
  }, [needsNetworkSwitch, switchChain])

  // Auto-switch on mount if connected to wrong network
  useEffect(() => {
    if (needsNetworkSwitch && !isPending) {
      switchToAmoy()
    }
  }, [needsNetworkSwitch, isPending, switchToAmoy])

  return {
    isCorrectNetwork,
    needsNetworkSwitch,
    switchToAmoy,
    isPending,
    error,
    currentChainId: chainId,
    targetChainId: polygonAmoy.id,
  }
}