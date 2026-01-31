import { useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { ANON_ID_CONTRACT_ADDRESS, ANON_ID_ABI, isContractConfigured } from '@/lib/wagmi'
import { Address } from 'viem'

export interface Credential {
  commitment: string
  issuer: Address
  issuedAt: bigint
  revoked: boolean
}

export function useUserCredentials() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredentials = useCallback(async () => {
    console.log('fetchCredentials called', { isConnected, address, contractConfigured: isContractConfigured() })
    
    if (!isConnected || !address || !isContractConfigured()) {
      console.log('Early return - not connected or contract not configured')
      setCredentials([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (!publicClient) {
        console.log('No public client available')
        setCredentials([])
        setIsLoading(false)
        return
      }

      console.log('Starting credential fetch...')

      // Helper function for exponential backoff retry
      const retryWithBackoff = async <T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
      ): Promise<T> => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await operation()
          } catch (error) {
            console.log(`Retry attempt ${attempt + 1} failed:`, error)
            if (attempt === maxRetries - 1) throw error
            
            const delay = baseDelay * Math.pow(2, attempt)
            console.log(`Retry attempt ${attempt + 1} after ${delay}ms delay`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
        throw new Error('Max retries exceeded')
      }

      // Get all CredentialIssued events with optimized block range
      console.log('Fetching credential events...')
      const logs = await retryWithBackoff(async () => {
        // Get current block number first
        const currentBlock = await publicClient.getBlockNumber()
        console.log('Current block:', currentBlock)
        // Only look back 100,000 blocks (roughly 2-3 days on Polygon) for better performance
        const fromBlock = currentBlock > BigInt(100000) ? currentBlock - BigInt(100000) : BigInt(0)
        console.log('Scanning from block:', fromBlock, 'to latest')
        
        return await Promise.race([
          publicClient.getLogs({
            address: ANON_ID_CONTRACT_ADDRESS as Address,
            event: {
              type: 'event',
              name: 'CredentialIssued',
              inputs: [
                { name: 'commitment', type: 'bytes32', indexed: true },
                { name: 'issuer', type: 'address', indexed: true }
              ]
            },
            fromBlock,
            toBlock: 'latest'
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('RPC request timeout')), 10000)
          )
        ]) as unknown[]
      })

      console.log('Found', logs.length, 'credential events')

      // For each credential, get the current state with retry logic
      const credentialPromises = logs.map(async (log: unknown) => {
        const logData = log as { args: { commitment: string } }
        const commitment = logData.args.commitment

        try {
          // Get credential details from contract with retry and timeout
          const credentialData = await retryWithBackoff(async () => {
            return await Promise.race([
              publicClient.readContract({
                address: ANON_ID_CONTRACT_ADDRESS as Address,
                abi: ANON_ID_ABI,
                functionName: 'getCredential',
                args: [commitment as `0x${string}`]
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Contract read timeout')), 5000)
              )
            ]) as [Address, bigint, boolean]
          })

          return {
            commitment,
            issuer: credentialData[0],
            issuedAt: credentialData[1],
            revoked: credentialData[2]
          } as Credential
        } catch (err) {
          console.error('Error fetching credential details:', err)
          return null
        }
      })

      const credentialResults = await Promise.all(credentialPromises)
      const validCredentials: Credential[] = credentialResults.filter(cred => cred !== null) as Credential[]
      
      console.log('Final credentials:', validCredentials.length)
      setCredentials(validCredentials)
    } catch (err) {
      console.error('Error fetching credentials:', err)
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          setError('Network timeout - the blockchain network is slow. Please try again in a moment.')
        } else if (err.message.includes('fetch')) {
          setError('Network connection error - please check your internet connection and try again.')
        } else if (err.message.includes('rate limit')) {
          setError('Too many requests - please wait a moment and try again.')
        } else {
          setError(`Failed to fetch credentials: ${err.message}`)
        }
      } else {
        setError('An unexpected error occurred while fetching credentials.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, publicClient])

  useEffect(() => {
    fetchCredentials()
  }, [fetchCredentials])

  const refetch = () => {
    fetchCredentials()
  }

  const removeCredential = useCallback((commitment: string) => {
    setCredentials(prevCredentials => 
      prevCredentials.filter(credential => credential.commitment !== commitment)
    )
  }, [])

  return {
    credentials,
    isLoading,
    error,
    refetch,
    removeCredential
  }
}