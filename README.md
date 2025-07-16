# SimpleSwap DEX

A decentralized exchange (DEX) implementation built on Ethereum that enables seamless token swapping and liquidity provision using an Automated Market Maker (AMM) with constant product formula.

| **Component**           | **Links**                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Live Frontend**       | [https://simpleswap-dex-dapp.vercel.app/](https://simpleswap-dex-dapp.vercel.app/)                                            |
| **SimpleSwap Contract** | [0xD18BB389EF67b63311018E1A1C82f15Cf4b6Be2C](https://sepolia.etherscan.io/address/0xD18BB389EF67b63311018E1A1C82f15Cf4b6Be2C) |
| **Token A Contract**    | [0xcA558a17b881b6BF2BFAE80CfF4b53C8Db3cdf03](https://sepolia.etherscan.io/address/0xcA558a17b881b6BF2BFAE80CfF4b53C8Db3cdf03) |
| **Token B Contract**    | [0xF13995D4Dd7f5973681E568AF31E51E52bA6dcbB](https://sepolia.etherscan.io/address/0xF13995D4Dd7f5973681E568AF31E51E52bA6dcbB) |

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [How to Use](#how-to-use)
3. [Deployment Instructions](#deployment-instructions)
4. [Smart Contract Documentation](#smart-contract-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Test Documentation](#test-documentation)
7. [Coverage Analysis](#coverage-analysis)
8. [Error Handling](#error-handling)

---

## Project Overview

SimpleSwap is a decentralized exchange (DEX) implementation built on Ethereum that provides:

- **Automated Market Maker (AMM)** functionality using constant product formula (`x * y = k`)
- **Liquidity Provision** with LP token rewards for liquidity providers
- **Token Swapping** with real-time price calculations and slippage protection
- **ERC20 Token Management** with minting capabilities for testing
- **Modern Web3 Frontend** with MetaMask integration and responsive design

### Key Features

- **Constant Product Formula**: Implements `x * y = k` for automatic price discovery
- **LP Token System**: Mint/burn LP tokens representing liquidity pool shares
- **Slippage Protection**: Minimum amount guarantees for all operations
- **Deadline Protection**: Transaction expiration timestamps prevent stale trades
- **Token Sorting**: Consistent token pair ordering prevents duplicate pools
- **Comprehensive Testing**: Function coverage with edge cases and access control

---

## How to Use

### 1. Connect Your Wallet

- Click "Connect MetaMask" in the top navigation
- Approve the connection request in your wallet
- Ensure you're on Sepolia testnet

### 2. Get Test Tokens

- Click "Mint 1000 Token A" or "Mint 1000 Token B"
- Confirm the transaction in MetaMask
- Your balance will update automatically

### 3. Approve Tokens

- Click "Approve All Tokens" to enable swapping
- This allows the DEX to spend your tokens

### 4. Swap Tokens

- Enter the amount you want to swap
- Select source and destination tokens
- Review the exchange rate and expected output
- Click "Execute Swap" and confirm transaction

### 5. Add Liquidity

- Enter amounts for both Token A and Token B
- The system will optimize amounts to maintain pool ratio
- Click "Add Liquidity" to receive LP tokens
- Earn fees from future swaps proportional to your share

### 6. Remove Liquidity

- Enter the amount of LP tokens to remove
- Preview shows the tokens you'll receive
- Click "Remove Liquidity" to get back your tokens plus earned fees

---

## Deployment Instructions

### Clone repository

```bash
git clone git@github.com:IvanSarapura/SimpleSwapDApp.git
```

### Prerequisites

```bash
npm install
```

### Compilation

```bash
npx hardhat compile
```

### Testing

```bash
npx hardhat test
npx hardhat coverage
```

---

## Smart Contract Documentation

### Architecture Overview

The project consists of three main smart contracts:

1. **SimpleSwap.sol** - Main DEX contract with AMM functionality
2. **TokenA.sol** - ERC20 token for testing and liquidity provision
3. **TokenB.sol** - ERC20 token for testing and liquidity provision

### SimpleSwap Contract

**Network**: Sepolia Testnet | **Compiler**: Solidity ^0.8.28 | **License**: MIT

#### Core Functions

| Function                     | Description                       | Gas Usage     |
| ---------------------------- | --------------------------------- | ------------- |
| `addLiquidity()`             | Adds liquidity to token pair      | ~179,282      |
| `removeLiquidity()`          | Removes liquidity from token pair | ~64,513       |
| `swapExactTokensForTokens()` | Swaps exact input tokens          | ~69,405       |
| `getAmountOut()`             | Calculates output amount          | View Function |
| `getReserves()`              | Returns current reserves          | View Function |
| `getPrice()`                 | Returns current token price       | View Function |

#### Key Implementation Details

- **Liquidity Calculation**: `sqrt(amountA * amountB)` for initial liquidity
- **Swap Calculation**: `amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)`
- **Price Calculation**: `price = (reserveB * 10^18) / reserveA`

**Security Features**:

- Zero address validation
- Same token prevention
- Deadline validation
- Slippage protection with minimum amounts
- Token sorting for consistent pair ordering

### Token Contracts (TokenA & TokenB)

**Properties**:

- **Initial Supply**: 1,000,000 tokens each
- **Symbols**: "TACC" and "TBCC"
- **Decimals**: 18
- **Mintable**: Yes (owner only)

**Key Functions**:

- `mint(address to, uint256 amount)` - Owner-only minting
- Standard ERC20 functions (transfer, approve, etc.)

---

## Frontend Documentation

### Technology Stack

| Component      | Technology         | Version |
| -------------- | ------------------ | ------- |
| **Frontend**   | Vanilla JavaScript | ES6+    |
| **Blockchain** | Ethers.js          | v5.7.2  |
| **Styling**    | Custom CSS         | -       |
| **Wallet**     | MetaMask           | Latest  |

### Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Complete styling system
├── script.js           # Core application logic
└── contracts/          # Smart contract files
```

### Key Features

#### Core Functionality

- **Wallet Integration**: MetaMask connection and account management
- **Token Operations**: Minting, approval, and balance tracking
- **DEX Operations**: Swapping and liquidity management
- **Price Display**: Real-time price feeds and reserve information
- **Responsive Design**: Mobile-first approach with modern UI

#### User Experience

- **Loading States**: Visual feedback during transactions
- **Error Handling**: Comprehensive error messages and recovery guidance
- **Real-time Updates**: Automatic balance and price updates
- **Slippage Protection**: 5% default slippage tolerance for liquidity operations

### Blockchain Integration Functions

#### Wallet Management

- `connect()`: Initializes Web3Provider with MetaMask, creates contract instances, sets up event listeners
- `disconnect()`: Resets global variables, clears UI state, disconnects from blockchain
- `updateBalances()`: Fetches token balances (TokenA, TokenB, LP) from contracts and updates UI display

#### Swap Operations

- `calculateSwap()`: Real-time price calculation using `getReserves()` and `getAmountOut()` from SimpleSwap contract
- `checkApproval()`: Validates token allowance against SimpleSwap contract before swaps
- `approveToken()`: Approves specific token amount for SimpleSwap contract spending
- `executeSwap()`: Executes `swapExactTokensForTokens()` with **⚠️ No slippage protection** (uses `amountOutMin = 0`)
- `swapAddress()`: UI function to reverse token selection direction

#### Liquidity Operations

- `addLiquidity()`: Calls `addLiquidity()` contract function with 5% slippage protection, validates positive amounts
- `removeLiquidity()`: Calls `removeLiquidity()` contract function with 5% slippage protection, validates LP token balance
- `calculateRemoveLiquidityPreview()`: Estimates withdrawal amounts using pool reserves and total supply (view only)

#### Token Management

- `mintTokenA()/mintTokenB()`: Calls `mint()` function to mint 1000 tokens (owner only), updates UI with loading states
- `approveAllTokens()`: Sets maximum allowance (`MaxUint256`) for both tokens to SimpleSwap contract

#### Price and Reserve Functions

- `updatePrices()`: Fetches current reserves using `getReserves()`, calculates and displays exchange rates
- Real-time price updates in navigation bar showing Token A to Token B ratio

#### Contract Interaction Map

**Core Contract Calls:**

- `SimpleSwap`: `getReserves()`, `getAmountOut()`, `swapExactTokensForTokens()`, `addLiquidity()`, `removeLiquidity()`, `balanceOf()`
- `TokenA/TokenB`: `balanceOf()`, `allowance()`, `approve()`, `mint()`

**Transaction Flow:**

1. **User Input** → Basic validation (amount > 0, sufficient balance)
2. **Approval Check** → `allowance()` vs required amount
3. **Contract Call** → Direct smart contract interaction with proper parameters
4. **Transaction Wait** → `await tx.wait()` for confirmation
5. **UI Update** → Balance refresh, notification display, loading state management

**Error Handling:**

- MetaMask detection and connection errors
- Transaction rejection handling
- Contract revert messages display
- Network validation and switching

---

## Test Documentation

### Test Framework

- **Framework**: Hardhat + Chai
- **Language**: JavaScript
- **Coverage**: solidity-coverage
- **Network**: Hardhat Network

### Test Folder Structure

```
test/
├── SimpleSwapTest.js        # Core DEX functionality tests
└── TokensTest.js            # Token contract access control tests
```

#### SimpleSwapTest.js

**Primary test file covering complete SimpleSwap contract functionality**

**Test Categories:**

- **Input Validation Tests** (3 tests)

  - Zero amount validation in `getAmountOut()`
  - Invalid reserves handling
  - Same token prevention in `addLiquidity()`

- **Core Functionality Tests** (5 tests)

  - LP token minting via `addLiquidity()`
  - Price calculations using `getPrice()`
  - Token swapping with `swapExactTokensForTokens()`
  - Liquidity removal with `removeLiquidity()`
  - Reserve tracking via `getReserves()`

- **Edge Case Tests** (15 tests)
  - No liquidity scenarios
  - Insufficient amount validations
  - Deadline expiration (3 scenarios)
  - Zero address validation (4 scenarios)
  - Slippage protection testing
  - Invalid path validation
  - Zero liquidity prevention

#### TokensTest.js

**Access control tests for token contracts**

**Test Categories:**

- **Access Control Tests** (2 tests)
  - TokenA mint function - owner-only access with `OwnableUnauthorizedAccount` error
  - TokenB mint function - owner-only access with `OwnableUnauthorizedAccount` error

### Test Coverage Overview

| Test Category          | Count  | Description                                       |
| ---------------------- | ------ | ------------------------------------------------- |
| **Input Validation**   | 3      | Zero amounts, invalid reserves, same tokens       |
| **Core Functionality** | 5      | Add/remove liquidity, swap, price calculation     |
| **Edge Cases**         | 15     | Insufficient amounts, expired deadlines, slippage |
| **Access Control**     | 2      | Owner-only functions, permission validation       |
| **Total**              | **25** | **Complete test coverage**                        |

### Key Test Scenarios

**Core Functionality**:

- ✓ Add liquidity and mint LP tokens
- ✓ Remove liquidity and burn LP tokens
- ✓ Execute token swaps with proper price calculation
- ✓ Calculate exchange rates and reserves

**Edge Cases**:

- ✓ Handle insufficient liquidity scenarios
- ✓ Validate slippage protection mechanisms
- ✓ Test deadline expiration handling
- ✓ Verify zero address validation

**Security Tests**:

- ✓ Owner-only mint function access control
- ✓ Proper error handling for invalid inputs

---

## Coverage Analysis

### Coverage Summary

```bash
File             |  % Stmts | % Branch |  % Funcs |  % Lines |
-----------------|----------|----------|----------|----------|
SimpleSwap.sol   |    98.53 |    87.10 |      100 |    95.56 |
TokenA.sol       |      100 |      100 |      100 |      100 |
TokenB.sol       |      100 |      100 |      100 |      100 |
All files        |    98.61 |    87.88 |      100 |    95.74 |
```

### Gas Usage Analysis

#### Average Gas Costs

```bash
| Contract / Method          | Min Gas | Max Gas | Avg Gas | # Calls | Description                  |
| -------------------------- | ------- | ------- | ------- | ------- | ---------------------------- |
| **SimpleSwap**             |         |         |         |         |                              |
| `addLiquidity`             | 82,480  | 196,896 | 179,282 | 13      | Add liquidity to token pairs |
| `approve`                  | -       | -       | 46,012  | 1       | Approve LP token spending    |
| `removeLiquidity`          | -       | -       | 64,513  | 1       | Remove liquidity from pairs  |
| `swapExactTokensForTokens` | -       | -       | 69,405  | 1       | Execute token swaps          |
| **TokenA**                 |         |         |         |         |                              |
| `approve`                  | 45,962  | 45,974  | 45,970  | 20      | Approve token spending       |
| `mint`                     | -       | -       | 36,086  | 27      | Mint new tokens (owner only) |
| **TokenB**                 |         |         |         |         |                              |
| `approve`                  | 45,962  | 45,974  | 45,973  | 15      | Approve token spending       |
| `mint`                     | -       | -       | 36,086  | 27      | Mint new tokens (owner only) |
```

#### Deployment Costs

```bash
| Contract   | Gas Cost  | % of Block Limit | Description       |
| ---------- | --------- | ---------------- | ----------------- |
| SimpleSwap | 1,419,056 | 4.7%             | Main DEX contract |
| TokenA     | 644,865   | 2.1%             | Test token A      |
| TokenB     | 644,865   | 2.1%             | Test token B      |
```

---

## Error Handling

Common errors that may occur when interacting with the contracts:

| Error Message                     | Cause                         | Solution                            |
| --------------------------------- | ----------------------------- | ----------------------------------- |
| `"Same token"`                    | Identical token addresses     | Use different token addresses       |
| `"Zero address"`                  | Using address(0)              | Provide valid token addresses       |
| `"Expired"`                       | Transaction deadline passed   | Use current timestamp + buffer      |
| `"Low amountA"` / `"Low amountB"` | Slippage protection triggered | Increase slippage tolerance         |
| `"No liquidity"`                  | Empty liquidity pool          | Add liquidity first                 |
| `"Low output"`                    | Swap output below minimum     | Adjust amountOutMin parameter       |
| `"Invalid path"`                  | Wrong path length             | Use exactly 2 addresses in path     |
| `"Low liquidity"`                 | Trying to mint zero LP tokens | Provide non-zero amounts            |
| `"Invalid reserves"`              | Pool reserves are zero        | Ensure pool is properly initialized |
| `"Zero amount"`                   | Input amount is zero          | Enter valid amount > 0              |

---

_Developed as part of ETH KIPU Module 4_
