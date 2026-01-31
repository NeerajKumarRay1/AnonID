# AnonID Frontend

This is the frontend application for the AnonID self-sovereign digital identity platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Network Switching**: Automatic switching to Polygon Amoy testnet
- **Smart Contract Integration**: Interact with AnonID smart contracts using wagmi and viem
- **Zero Knowledge Proofs**: Generate and verify ZKPs using snarkjs
- **Responsive Design**: Modern UI with Tailwind CSS and dark mode support

## Tech Stack

- **Next.js 15** with App Router and TypeScript
- **wagmi 2.0** for Ethereum interactions
- **viem** for low-level Ethereum utilities
- **@tanstack/react-query** for data fetching and caching
- **snarkjs** for Zero Knowledge Proof generation
- **ethers 6.0** for additional blockchain utilities
- **Tailwind CSS** for styling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your contract address:
```
NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=80002
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   └── WalletConnectButton.tsx
├── hooks/              # Custom React hooks
│   ├── useAnonIdContract.ts
│   └── useNetworkSwitch.ts
├── lib/                # Utilities and configurations
│   └── wagmi.ts
└── providers/          # React context providers
    └── Providers.tsx
```

## Key Components

### WalletConnectButton
Handles MetaMask connection and network switching to Polygon Amoy testnet.

### useAnonIdContract
Custom hook providing access to all AnonID smart contract functions:
- Read functions: `useGetCredential`, `useHasConsent`, `useIsTrustedIssuer`
- Write functions: `issueCredential`, `giveConsent`, `revokeCredential`, etc.

### useNetworkSwitch
Manages network switching and ensures users are on the correct network.

## Environment Variables

- `NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS`: The deployed AnonID contract address
- `NEXT_PUBLIC_CHAIN_ID`: The chain ID (80002 for Polygon Amoy)

## Building for Production

```bash
npm run build
npm start
```

## Development Notes

- The app automatically switches users to Polygon Amoy testnet
- All contract interactions require wallet connection
- ZKP generation happens client-side for privacy
- The UI is responsive and supports dark mode