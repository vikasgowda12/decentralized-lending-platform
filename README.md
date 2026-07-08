# 💰 Decentralized Lending Platform

A blockchain-based decentralized finance (DeFi) application that enables users to lend and borrow digital assets using smart contracts.

The platform demonstrates the core concepts of decentralized lending, collateral management, interest calculation, loan health monitoring, and blockchain-based financial transactions.

## 📌 Project Overview

Traditional lending platforms depend on centralized financial institutions to manage loans and transactions.

This project explores a decentralized lending system where smart contracts manage lending and borrowing operations on the blockchain.

Users can deposit assets, earn interest, provide collateral, and borrow funds through blockchain-based smart contracts.

## 🚀 Features

- Decentralized lending and borrowing
- Smart contract-based transactions
- ETH deposits for lenders
- Interest earning mechanism
- Collateral-based borrowing
- Loan health factor monitoring
- Borrowing limits based on collateral value
- Smart contract-based interest calculation
- Liquidation mechanism
- MetaMask wallet integration
- Blockchain-based transaction processing

## 🛠️ Tech Stack

### Blockchain

- Solidity
- Ethereum
- Smart Contracts
- Hardhat
- OpenZeppelin
- Chainlink Price Oracle

### Frontend

- React.js
- JavaScript
- HTML
- CSS
- Ethers.js

### Wallet Integration

- MetaMask

### Development Tools

- Node.js
- npm
- Git
- GitHub

## ⚙️ How It Works

1. The user connects a MetaMask wallet to the application.
2. Lenders deposit ETH into the lending pool.
3. Deposited assets can earn interest.
4. Borrowers provide ETH as collateral.
5. The smart contract determines the borrowing limit based on the collateral value.
6. The health factor is used to monitor the safety of the loan.
7. Smart contracts manage lending, borrowing, repayment, and liquidation operations.

## 🧠 Smart Contract Components

The project includes smart contract functionality for:

- Lending Pool Management
- Collateral Management
- Interest Calculation
- Loan Health Monitoring
- Liquidation
- Blockchain Transactions

## 📂 Project Structure

```text
decentralized-lending-platform/
│
├── contracts/
│   ├── LendingPool.sol
│   ├── CollateralManager.sol
│   ├── InterestModel.sol
│   └── Liquidator.sol
│
├── frontend/
│
├── scripts/
│
├── test/
│
├── package.json
└── README.md

💻 Running the Project Locally
Clone the repository:
git clone https://github.com/vikasgowda12/decentralized-lending-platform.git

Navigate to the project directory:
cd decentralized-lending-platform

Install dependencies:
npm install

Compile the smart contracts:
npx hardhat compile
\
tart a local blockchain network:
npx hardhat node

Deploy the smart contracts:
npx hardhat run scripts/deploy.js --network localhost

 💡 Skills Demonstrated
Blockchain Development
Solidity Programming
Smart Contract Development
Decentralized Finance (DeFi)
Ethereum
React.js
Web3 Integration
MetaMask Integration
Ethers.js
Git and GitHub

🔐 Security Considerations

Smart contract-based financial applications require careful security testing and auditing before real-world use.
This project is intended for educational and portfolio purposes and should not be used with real financial assets without additional testing and professional smart contract auditing.

👨‍💻 Author

Vikas Gowda

GitHub: https://github.com/vikasgowda12

📄 Disclaimer
This project is intended for educational and portfolio purposes only. It is not intended for production use or real financial transactions.
