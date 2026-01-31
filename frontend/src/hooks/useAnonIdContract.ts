import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ANON_ID_CONTRACT_ADDRESS, ANON_ID_ABI, isContractConfigured } from '@/lib/wagmi'
import { Address } from 'viem'

export function useAnonIdContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read functions with enhanced error handling and retry logic
  const useGetCredential = (commitment: string) => {
    return useReadContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'getCredential',
      args: [commitment as `0x${string}`],
      query: {
        enabled: !!commitment && isContractConfigured(),
        retry: (failureCount, error) => {
          // Retry up to 3 times for network errors, but not for contract errors
          if (failureCount < 3) {
            const errorMessage = error?.message?.toLowerCase() || ''
            return errorMessage.includes('timeout') || 
                   errorMessage.includes('fetch') || 
                   errorMessage.includes('network')
          }
          return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 30000, // 30 seconds
        gcTime: 60000, // 1 minute
      },
    })
  }

  const useHasConsent = (commitment: string, verifier: Address) => {
    return useReadContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'hasConsent',
      args: [commitment as `0x${string}`, verifier],
      query: {
        enabled: !!commitment && !!verifier && isContractConfigured(),
        retry: (failureCount, error) => {
          if (failureCount < 3) {
            const errorMessage = error?.message?.toLowerCase() || ''
            return errorMessage.includes('timeout') || 
                   errorMessage.includes('fetch') || 
                   errorMessage.includes('network')
          }
          return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 30000,
        gcTime: 60000,
      },
    })
  }

  const useIsTrustedIssuer = (issuer: Address) => {
    return useReadContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'isTrustedIssuer',
      args: [issuer],
      query: {
        enabled: !!issuer && isContractConfigured(),
        retry: (failureCount, error) => {
          if (failureCount < 3) {
            const errorMessage = error?.message?.toLowerCase() || ''
            return errorMessage.includes('timeout') || 
                   errorMessage.includes('fetch') || 
                   errorMessage.includes('network')
          }
          return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 60000, // 1 minute - this doesn't change often
        gcTime: 300000, // 5 minutes
      },
    })
  }

  // Write functions
  const issueCredential = (commitment: string) => {
    if (!isContractConfigured()) {
      throw new Error('Contract address not configured')
    }
    
    writeContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'issueCredential',
      args: [commitment as `0x${string}`],
    })
  }

  const giveConsent = (commitment: string, verifier: Address) => {
    if (!isContractConfigured()) {
      throw new Error('Contract address not configured')
    }

    writeContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'giveConsent',
      args: [commitment as `0x${string}`, verifier],
    })
  }

  const revokeConsent = (commitment: string, verifier: Address) => {
    if (!isContractConfigured()) {
      throw new Error('Contract address not configured')
    }

    writeContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'revokeConsent',
      args: [commitment as `0x${string}`, verifier],
    })
  }

  const revokeCredential = (commitment: string) => {
    if (!isContractConfigured()) {
      throw new Error('Contract address not configured')
    }

    writeContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'revokeCredential',
      args: [commitment as `0x${string}`],
    })
  }

  const addTrustedIssuer = (issuer: Address) => {
    if (!isContractConfigured()) {
      throw new Error('Contract address not configured')
    }

    writeContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'addTrustedIssuer',
      args: [issuer],
    })
  }

  const removeTrustedIssuer = (issuer: Address) => {
    if (!isContractConfigured()) {
      throw new Error('Contract address not configured')
    }

    writeContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'removeTrustedIssuer',
      args: [issuer],
    })
  }

  const useVerifyProof = (
    a: [bigint, bigint],
    b: [[bigint, bigint], [bigint, bigint]],
    c: [bigint, bigint],
    input: bigint[]
  ) => {
    return useReadContract({
      address: ANON_ID_CONTRACT_ADDRESS as Address,
      abi: ANON_ID_ABI,
      functionName: 'verifyProof',
      args: [a, b, c, input],
      query: {
        enabled: !!a && !!b && !!c && !!input && isContractConfigured(),
        retry: (failureCount, error) => {
          if (failureCount < 3) {
            const errorMessage = error?.message?.toLowerCase() || ''
            return errorMessage.includes('timeout') || 
                   errorMessage.includes('fetch') || 
                   errorMessage.includes('network')
          }
          return false
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 10000, // 10 seconds - proof verification results can be cached briefly
        gcTime: 30000, // 30 seconds
      },
    })
  }

  return {
    // Read hooks
    useGetCredential,
    useHasConsent,
    useIsTrustedIssuer,
    useVerifyProof,
    
    // Write functions
    issueCredential,
    giveConsent,
    revokeConsent,
    revokeCredential,
    addTrustedIssuer,
    removeTrustedIssuer,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}