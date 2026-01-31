'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePublicClient, useAccount } from 'wagmi'

export function NetworkStatus() {
  const publicClient = usePublicClient()
  const { isConnected } = useAccount()
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'good' | 'slow' | 'error'>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkNetworkHealth = useCallback(async () => {
    if (!publicClient || !isConnected) {
      setNetworkStatus('checking')
      return
    }

    const startTime = Date.now()
    try {
      await Promise.race([
        publicClient.getBlockNumber(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 5000)
        )
      ])
      
      const responseTime = Date.now() - startTime
      setNetworkStatus(responseTime > 3000 ? 'slow' : 'good')
      setLastCheck(new Date())
    } catch (error) {
      console.error('Network health check failed:', error)
      setNetworkStatus('error')
      setLastCheck(new Date())
    }
  }, [publicClient, isConnected])

  useEffect(() => {
    if (isConnected) {
      checkNetworkHealth()
      const interval = setInterval(checkNetworkHealth, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isConnected, checkNetworkHealth])

  if (!isConnected || networkStatus === 'checking') {
    return null
  }

  const getStatusColor = () => {
    switch (networkStatus) {
      case 'good': return 'text-green-600 dark:text-green-400'
      case 'slow': return 'text-yellow-600 dark:text-yellow-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusText = () => {
    switch (networkStatus) {
      case 'good': return 'Network: Good'
      case 'slow': return 'Network: Slow'
      case 'error': return 'Network: Issues'
      default: return 'Network: Checking'
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        networkStatus === 'good' ? 'bg-green-500' :
        networkStatus === 'slow' ? 'bg-yellow-500' :
        'bg-red-500'
      }`} />
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {lastCheck && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({lastCheck.toLocaleTimeString()})
        </span>
      )}
    </div>
  )
}