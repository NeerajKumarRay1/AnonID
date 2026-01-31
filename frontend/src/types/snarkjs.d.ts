declare module 'snarkjs' {
  export interface SnarkJSProof {
    pi_a: string[]
    pi_b: string[][]
    pi_c: string[]
    protocol: string
    curve: string
  }

  export interface SnarkJSPublicSignals {
    [key: string]: string
  }

  export interface SnarkJSGroth16 {
    fullProve: (
      input: Record<string, unknown>,
      wasmPath: string,
      zkeyPath: string
    ) => Promise<{
      proof: SnarkJSProof
      publicSignals: SnarkJSPublicSignals
    }>
    
    verify: (
      vKey: Record<string, unknown>,
      publicSignals: SnarkJSPublicSignals,
      proof: SnarkJSProof
    ) => Promise<boolean>
  }

  export const groth16: SnarkJSGroth16
}