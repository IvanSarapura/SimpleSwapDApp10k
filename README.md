# SimpleSwap DEX

A simple decentralized exchange (DEX) implemented in Solidity that allows the exchange of ERC20 tokens with liquidity provision.

| **Component**           | **Links**                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Live Frontend**       | [https://simpleswap-dex-dapp.vercel.app/](https://simpleswap-dex-dapp.vercel.app/)                                            |
| **SimpleSwap Contract** | [0xD18BB389EF67b63311018E1A1C82f15Cf4b6Be2C](https://sepolia.etherscan.io/address/0xD18BB389EF67b63311018E1A1C82f15Cf4b6Be2C) |
| **Token A Contract**    | [0xcA558a17b881b6BF2BFAE80CfF4b53C8Db3cdf03](https://sepolia.etherscan.io/address/0xcA558a17b881b6BF2BFAE80CfF4b53C8Db3cdf03) |
| **Token B Contract**    | [0xF13995D4Dd7f5973681E568AF31E51E52bA6dcbB](https://sepolia.etherscan.io/address/0xF13995D4Dd7f5973681E568AF31E51E52bA6dcbB) |

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Deployment Instructions](#deployment-instructions)
3. [Smart Contract Documentation](#smart-contract-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Test Documentation](#test-documentation)
6. [Coverage Analysis](#coverage-analysis)
7. [Smart Contract Interface](#smart-contract-interface)
8. [Security Considerations](#security-considerations)

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

## Project Overview

SimpleSwap is a decentralized exchange (DEX) implementation built on Ethereum that provides:

- **Automated Market Maker (AMM)** functionality using constant product formula
- **Liquidity Provision** with LP token rewards
- **Token Swapping** with real-time price calculations
- **ERC20 Token Management** with minting capabilities
- **Modern Web3 Frontend** with MetaMask integration

### Key Features

- **Constant Product Formula**: Implements `x * y = k` for price discovery
- **LP Token System**: Mint/burn LP tokens for liquidity providers
- **Slippage Protection**: Minimum amount guarantees for all operations
- **Deadline Protection**: Transaction expiration timestamps
- **Token Sorting**: Consistent token pair ordering
- **Comprehensive Testing**: function coverage with edge cases and access control

---

## Smart Contract Documentation

### Architecture Overview

The project consists of three main smart contracts:

1. **SimpleSwap.sol** - Main DEX contract with AMM functionality
2. **TokenA.sol** - ERC20 token for testing and liquidity provision
3. **TokenB.sol** - ERC20 token for testing and liquidity provision

### SimpleSwap Contract

**Contract Address**: `0xD18BB389EF67b63311018E1A1C82f15Cf4b6Be2C`  
**Network**: Sepolia Testnet  
**Compiler Version**: Solidity ^0.8.28  
**License**: MIT

#### Core Functions

| Function                     | Description                       | Gas Usage (Avg) |
| ---------------------------- | --------------------------------- | --------------- |
| `addLiquidity()`             | Adds liquidity to token pair      | ~179,282        |
| `removeLiquidity()`          | Removes liquidity from token pair | ~64,513         |
| `swapExactTokensForTokens()` | Swaps exact input tokens          | ~69,405         |
| `getAmountOut()`             | Calculates output amount          | View Function   |
| `getPrice()`                 | Returns current token price       | View Function   |
| `getReserves()`              | Returns current reserves          | View Function   |

#### Technical Implementation

**State Variables**:

```solidity
mapping(address => mapping(address => TokenPairReserves)) private reserves;
```

**Key Algorithms**:

- **Liquidity Calculation**: `sqrt(amountA * amountB)` for initial liquidity
- **Swap Calculation**: `amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)`
- **Price Calculation**: `price = (reserveB * 10^18) / reserveA`

**Security Features**:

- Token address validation (zero address checks)
- Same token prevention
- Deadline validation
- Slippage protection

### Token Contracts

#### TokenA & TokenB

**Inheritance**: `ERC20, Ownable`  
**Initial Supply**: 1,000,000 tokens  
**Decimals**: 18

**Token A Address**: `0xcA558a17b881b6BF2BFAE80CfF4b53C8Db3cdf03`  
**Token B Address**: `0xF13995D4Dd7f5973681E568AF31E51E52bA6dcbB`

**Functions**:

- `mint(address to, uint256 amount)` - Only owner can mint (reverts with `OwnableUnauthorizedAccount` custom error)
- Standard ERC20 functions (transfer, approve, etc.)

#### Contract Specifications

| Property         | Value                      |
| ---------------- | -------------------------- |
| **Total Supply** | 1,000,000 tokens (initial) |
| **Mintable**     | Yes (owner only)           |
| **Burnable**     | No                         |
| **Pausable**     | No                         |
| **Upgradeable**  | No                         |

---

## Frontend Documentation

### Technology Stack

| Component              | Technology         | Version |
| ---------------------- | ------------------ | ------- |
| **Frontend Framework** | Vanilla JavaScript | ES6+    |
| **Blockchain Library** | Ethers.js          | v11.4.2 |
| **CSS Framework**      | Custom CSS         | -       |
| **Wallet Integration** | MetaMask           | Latest  |

### Architecture

The frontend follows a modular architecture with separation of concerns:

```
├── index.html          # Main HTML structure
├── styles.css          # Complete styling system
└── script.js           # Core application logic
```

### Core Features

#### 1. Wallet Management

- **MetaMask Integration**: Seamless wallet connection
- **Network Detection**: Automatic network switching
- **Account Monitoring**: Real-time balance updates

#### 2. Token Operations

- **Minting Interface**: Test token generation
- **Approval System**: Token spending permissions
- **Balance Display**: Real-time token balances

#### 3. DEX Operations

- **Token Swapping**: Bidirectional token exchange
- **Liquidity Management**: Add/remove liquidity
- **Price Discovery**: Real-time price calculations

#### 4. User Experience

- **Responsive Design**: Mobile-first approach
- **Loading States**: Transaction feedback
- **Error Handling**: Comprehensive error messages

### Key Functions

| Function          | Purpose            | Error Handling        |
| ----------------- | ------------------ | --------------------- |
| `connect()`       | Wallet connection  | MetaMask detection    |
| `calculateSwap()` | Price calculation  | Reserve validation    |
| `executeSwap()`   | Token swapping     | Approval checks       |
| `addLiquidity()`  | Liquidity addition | Balance validation    |
| `updatePrices()`  | Price updates      | Contract availability |

---

## Test Documentation

### Test Framework

- **Framework**: Hardhat + Chai
- **Language**: JavaScript
- **Coverage Tool**: solidity-coverage
- **Network**: Hardhat Network

### Test Structure

The test suite covers some contract functionality with comprehensive edge cases and security testing:

```javascript
describe("SimpleSwap Tests", function () {
  // Test setup and deployment
  // Individual test cases
  // Edge case testing
});

describe("Tokens Tests", function () {
  // Owner-only function testing
  // Access control validation
  // Permission testing
});
```

### Test Cases Overview

| Test Category          | Test Count | Description                                                                                    |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| **Input Validation**   | 3          | Zero amounts, invalid reserves, same tokens                                                    |
| **Core Functionality** | 5          | Add liquidity, swap, remove liquidity, price calculation, reserves                             |
| **Edge Cases**         | 15         | Insufficient amounts, expired deadlines, no liquidity, slippage, invalid paths, zero addresses |
| **Access Control**     | 2          | Owner-only functions, minting permissions                                                      |
| **Total**              | **25**     | **Complete test coverage**                                                                     |

### Detailed Test Cases

#### 1. Input Validation Tests

```javascript
✓ zero amount (getAmountOut validation)
✓ zero reserves (invalid reserves validation)
✓ same token (duplicate token prevention)
```

#### 2. Core Functionality Tests

```javascript
✓ mint LP tokens (add liquidity and mint LP tokens)
✓ get price (price calculation)
✓ swap tokens (swapExactTokensForTokens)
✓ liquidity out (removeLiquidity)
✓ get reserves (reserve tracking)
```

#### 3. Edge Cases

```javascript
✓ no liquidity (swap with no liquidity)
✓ low amountA (insufficient amountA)
✓ low amountB (insufficient amountB)
✓ optimal amount (optimal amount calculations)
✓ low amounts (insufficient amounts in removeLiquidity)
✓ expired deadline (deadline validation - 3 scenarios)
✓ zero address (zero address validation - 4 scenarios)
✓ slippage (slippage protection)
✓ invalid path (path validation)
✓ zero liquidity (zero liquidity prevention)
```

#### 4. Access Control Tests

```javascript
✓ not owner (TokenA mint access control with OwnableUnauthorizedAccount)
✓ not owner (TokenB mint access control with OwnableUnauthorizedAccount)
```

### Test Results

```bash
SimpleSwap Tests
  ✔ zero amount (102ms)
  ✔ zero reserves
  ✔ same token (57ms)
  ✔ mint LP tokens
  ✔ get price
  ✔ swap tokens (39ms)
  ✔ liquidity out (48ms)
  ✔ no liquidity (48ms)
  ✔ get reserves
  ✔ low amountA (75ms)
  ✔ low amountB (57ms)
  ✔ optimal amount (73ms)
  ✔ low amounts (81ms)
  ✔ expired deadline
  ✔ expired deadline (40ms)
  ✔ expired deadline (47ms)
  ✔ zero address
  ✔ zero address
  ✔ zero address
  ✔ zero address
  ✔ slippage (55ms)
  ✔ invalid path (64ms)
  ✔ zero liquidity

Tokens Tests
  ✔ not owner (42ms)
  ✔ not owner (59ms)

25 passing (5s)
```

---

## Coverage Analysis

### Coverage Summary

```bash
-----------------|----------|----------|----------|----------|----------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------|----------|----------|----------|----------|----------------|
contracts/       |    98.61 |    87.88 |      100 |    95.74 |                |
SimpleSwap.sol   |    98.53 |    87.10 |      100 |    95.56 |270,325,388,448 |
TokenA.sol       |      100 |      100 |      100 |      100 |                |
TokenB.sol       |      100 |      100 |      100 |      100 |                |
-----------------|----------|----------|----------|----------|----------------|
All files        |    98.61 |    87.88 |      100 |    95.74 |                |
-----------------|----------|----------|----------|----------|----------------|
```

### Gas Usage Analysis

#### Detailed Gas Usage Report

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

#### Deployment Costs

| Contract   | Gas Cost  | % of Block Limit | Description       |
| ---------- | --------- | ---------------- | ----------------- |
| SimpleSwap | 1,419,056 | 4.7%             | Main DEX contract |
| TokenA     | 644,865   | 2.1%             | Test token A      |
| TokenB     | 644,865   | 2.1%             | Test token B      |

#### Gas Optimization Notes

- **addLiquidity**: Variable gas cost (82K-196K) depends on whether it's initial or subsequent liquidity
- **Token Operations**: Consistent gas usage across TokenA/TokenB (~36K for mint, ~46K for approve)
- **Swap Operations**: Efficient gas usage (~69K) for token swaps
- **Total Deployment**: ~2.7M gas for complete system (9% of block limit)

---

## Smart Contract Interface

### Overview

This section provides the complete interface documentation for interacting with the SimpleSwap contracts. These functions can be called from the frontend, other smart contracts, or directly through tools like Etherscan.

### SimpleSwap Contract Functions

#### View Functions (No Gas Cost)

```solidity
/**
 * @notice Get current reserves for a token pair
 * @param tokenA First token address
 * @param tokenB Second token address
 * @return reserveA Reserve amount for tokenA
 * @return reserveB Reserve amount for tokenB
 */
function getReserves(address tokenA, address tokenB)
    external view returns (uint reserveA, uint reserveB)

/**
 * @notice Get current price of tokenA in terms of tokenB
 * @param tokenA Token to get price for
 * @param tokenB Token to price against
 * @return price Price scaled by 10^18
 */
function getPrice(address tokenA, address tokenB)
    external view returns (uint price)

/**
 * @notice Calculate output amount for a given input
 * @param amountIn Input token amount
 * @param reserveIn Reserve of input token
 * @param reserveOut Reserve of output token
 * @return amountOut Expected output amount
 */
function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
    external pure returns (uint amountOut)
```

#### State-Changing Functions (Requires Gas)

```solidity
/**
 * @notice Add liquidity to a token pair
 * @param tokenA First token address
 * @param tokenB Second token address
 * @param amountADesired Desired amount of tokenA
 * @param amountBDesired Desired amount of tokenB
 * @param amountAMin Minimum amount of tokenA (slippage protection)
 * @param amountBMin Minimum amount of tokenB (slippage protection)
 * @param to Address to receive LP tokens
 * @param deadline Transaction expiration timestamp
 * @return amountA Actual amount of tokenA added
 * @return amountB Actual amount of tokenB added
 * @return liquidity Amount of LP tokens minted
 */
function addLiquidity(
    address tokenA,
    address tokenB,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external returns (uint amountA, uint amountB, uint liquidity)

/**
 * @notice Remove liquidity from a token pair
 * @param tokenA First token address
 * @param tokenB Second token address
 * @param liquidity Amount of LP tokens to burn
 * @param amountAMin Minimum amount of tokenA to receive
 * @param amountBMin Minimum amount of tokenB to receive
 * @param to Address to receive tokens
 * @param deadline Transaction expiration timestamp
 * @return amountA Amount of tokenA received
 * @return amountB Amount of tokenB received
 */
function removeLiquidity(
    address tokenA,
    address tokenB,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external returns (uint amountA, uint amountB)

/**
 * @notice Swap exact input tokens for output tokens
 * @param amountIn Exact input amount
 * @param amountOutMin Minimum output amount (slippage protection)
 * @param path Token addresses [tokenIn, tokenOut]
 * @param to Address to receive output tokens
 * @param deadline Transaction expiration timestamp
 */
function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external
```

### Contract Events

Events emitted by the SimpleSwap contract for tracking transactions:

```solidity
/**
 * @notice Emitted when liquidity is added
 * @param tokenA First token address
 * @param tokenB Second token address
 * @param amountA Amount of tokenA added
 * @param amountB Amount of tokenB added
 * @param liquidity LP tokens minted
 */
event LiquidityAdded(
    address indexed tokenA,
    address indexed tokenB,
    uint amountA,
    uint amountB,
    uint liquidity
)

/**
 * @notice Emitted when liquidity is removed
 * @param tokenA First token address
 * @param tokenB Second token address
 * @param amountA Amount of tokenA removed
 * @param amountB Amount of tokenB removed
 * @param liquidity LP tokens burned
 */
event LiquidityRemoved(
    address indexed tokenA,
    address indexed tokenB,
    uint amountA,
    uint amountB,
    uint liquidity
)

/**
 * @notice Emitted when a swap occurs
 * @param tokenIn Input token address
 * @param tokenOut Output token address
 * @param amountIn Input amount
 * @param amountOut Output amount
 * @param to Recipient address
 */
event Swap(
    address indexed tokenIn,
    address indexed tokenOut,
    uint amountIn,
    uint amountOut,
    address indexed to
)
```

### Token Contracts Interface

#### TokenA & TokenB Functions

```solidity
/**
 * @notice Mint new tokens (owner only)
 * @param to Address to receive tokens
 * @param amount Amount of tokens to mint
 */
function mint(address to, uint256 amount) external onlyOwner

// Standard ERC20 functions
function transfer(address to, uint256 amount) external returns (bool)
function approve(address spender, uint256 amount) external returns (bool)
function balanceOf(address account) external view returns (uint256)
function allowance(address owner, address spender) external view returns (uint256)
```

### Error Handling

Common errors that may occur when interacting with the contracts:

| Error Message                     | Cause                                       | Solution                        |
| --------------------------------- | ------------------------------------------- | ------------------------------- |
| `"Same token"`                    | Trying to create pair with identical tokens | Use different token addresses   |
| `"Zero address"`                  | Using address(0) in parameters              | Provide valid token addresses   |
| `"Expired"`                       | Transaction deadline has passed             | Use current timestamp + buffer  |
| `"Low amountA"` / `"Low amountB"` | Slippage protection triggered               | Increase slippage tolerance     |
| `"No liquidity"`                  | Trying to swap with empty pool              | Add liquidity first             |
| `"Low output"`                    | Swap output below minimum                   | Adjust amountOutMin parameter   |
| `"Invalid path"`                  | Wrong path length for swap                  | Use exactly 2 addresses in path |
| `"Low liquidity"`                 | Trying to mint zero LP tokens               | Provide non-zero amounts        |

---

_Developed as part of ETH KIPU Module 4_
