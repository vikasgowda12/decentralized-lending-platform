# Decentralized Voting System

A full starter project for a blockchain-based voting platform with:

- `blockchain/`: Solidity smart contract and Hardhat tests
- `server/`: Express API for election config and voter registry
- `client/`: React + Vite frontend with MetaMask integration

## Features

- Election owner can authorize voters on-chain
- Registered voters can cast exactly one vote
- Votes are stored on-chain and counted transparently
- Frontend shows candidates, wallet status, and live results
- Backend keeps lightweight off-chain voter profile records

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create these files:

`blockchain/.env`

```env
PRIVATE_KEY=your_wallet_private_key
RPC_URL=http://127.0.0.1:8545
```

`server/.env`

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

`client/.env`

```env
VITE_API_URL=http://localhost:4000/api
VITE_CONTRACT_ADDRESS=deployed_contract_address
```

### 3. Start local blockchain

```bash
cd blockchain
npx hardhat node
```

### 4. Deploy contract

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed address into `client/.env` and `server/data/store.json`.

### 5. Start backend

```bash
npm run dev:server
```

### 6. Start frontend

```bash
npm run dev:client
```

## Future Improvements

- Secret-ballot privacy with zero-knowledge proofs
- Multiple elections support
- Production database and identity verification
- IPFS storage for election manifests
