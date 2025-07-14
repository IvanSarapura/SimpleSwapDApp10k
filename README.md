# SimpleSwap DApp

A simple decentralized exchange (DEX) implemented in Solidity that allows the exchange of ERC20 tokens with liquidity provision.

## 🚀 Live Demo

**Try the application live:** [https://simple-swap-d-app.vercel.app/](https://simple-swap-d-app.vercel.app/)

Experience the full functionality of SimpleSwap DEX including:

- 🔗 MetaMask wallet connection
- 🪙 Mint test tokens (Token A & Token B)
- 💧 Add/remove liquidity to pools
- 🔄 Swap tokens with real-time pricing
- 📊 View pool reserves and account balances

## Features

- **Token Exchange**: Exchange ERC20 tokens in a decentralized manner
- **Liquidity Provision**: Add and remove liquidity to earn fees
- **Price Calculation**: Get real-time prices based on reserves
- **LP Tokens**: Receive liquidity tokens as proof of your contribution

## Main Contracts

- `SimpleSwap.sol`: Main exchange contract
- `TokenA.sol`: Example ERC20 token
- `TokenB.sol`: Example ERC20 token

## Functionalities

### 1. Add Liquidity

```javascript
addLiquidity(
  tokenA,
  tokenB,
  amountA,
  amountB,
  amountAMin,
  amountBMin,
  to,
  deadline
);
```

- Adds liquidity to the exchange pool
- Receive LP tokens as reward
- Requires token approval before transaction

### 2. Remove Liquidity

```javascript
removeLiquidity(
  tokenA,
  tokenB,
  liquidity,
  amountAMin,
  amountBMin,
  to,
  deadline
);
```

- Removes liquidity from the pool
- Burns LP tokens and returns underlying tokens

### 3. Swap Tokens

```javascript
swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
```

- Swaps an exact amount of input tokens
- Automatically calculates output amount

### 4. Query Prices

```javascript
getPrice(tokenA, tokenB);
```

- Gets the current price of tokenA in terms of tokenB
- Based on reserve ratio

### 5. Calculate Outputs

```javascript
getAmountOut(amountIn, reserveIn, reserveOut);
```

- Calculates the amount of tokens you will receive for a given input
- Includes exchange fees

## Installation and Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile contracts:

   ```bash
   npx hardhat compile
   ```

4. Run tests:
   ```bash
   npx hardhat test
   npx hardhat coverage
   ```

### Test

SimpleSwap Tests
✔ testing getAmountOut with zero amountIn (260ms)
✔ testing getAmountOut with zero reserves (45ms)
✔ testing addLiquidity with same token (88ms)
✔ testing add liquidity and mint LP tokens (44ms)
✔ testing getPrice (66ms)
✔ testing swapExactTokensForTokens (44ms)
✔ testing removeLiquidity (60ms)
✔ testing swapExactTokensForTokens with no liquidity (57ms)
✔ testing getReserves

9 passing (5s)

### Gas Report

### Configuration

- **Solidity**: 0.8.28
- **Optimization**: true
- **Runs**: 200
- **viaIR**: true
- **Block limit**: 30,000,000 gas

### Methods

| Contract       | Method                   | Min     | Max     | Avg     | # calls | USD (avg) |
| -------------- | ------------------------ | ------- | ------- | ------- | ------- | --------- |
| **SimpleSwap** |                          |         |         |         |         |           |
|                | addLiquidity             | 196,467 | 196,498 | 196,475 | 4       | -         |
|                | approve                  | -       | -       | 46,012  | 1       | -         |
|                | removeLiquidity          | -       | -       | 64,129  | 1       | -         |
|                | swapExactTokensForTokens | -       | -       | 69,010  | 1       | -         |
| **TokenA**     |                          |         |         |         |         |           |
|                | approve                  | 45,962  | 45,974  | 45,967  | 7       | -         |
|                | mint                     | -       | -       | 36,086  | 9       | -         |
| **TokenB**     |                          |         |         |         |         |           |
|                | approve                  | 45,962  | 45,974  | 45,971  | 4       | -         |
|                | mint                     | -       | -       | 36,086  | 9       | -         |

### Deployments

| Contract   | Gas Used  | % of limit |
| ---------- | --------- | ---------- |
| SimpleSwap | 1,325,282 | 4.4%       |
| TokenA     | 644,865   | 2.1%       |
| TokenB     | 644,865   | 2.1%       |

### Notes

- ◯ Execution gas for this method does not include intrinsic gas overhead
- △ Cost was non-zero but below the precision setting for the currency display
- **Toolchain**: hardhat

## Coverage

### Version

> solidity-coverage: v0.8.16

### Instrumenting for coverage...

> SimpleSwap.sol
> TokenA.sol
> TokenB.sol

### Compilation:

Compiled 9 Solidity files successfully (evm target: paris).

### Network Info

> HardhatEVM: v2.25.0
> network: hardhat

SimpleSwap Tests
✔ testing getAmountOut with zero amountIn (117ms)
✔ testing getAmountOut with zero reserves
✔ testing addLiquidity with same token (63ms)
✔ testing add liquidity and mint LP tokens (188ms)
✔ testing getPrice (177ms)
✔ testing swapExactTokensForTokens (256ms)
✔ testing removeLiquidity (213ms)
✔ testing swapExactTokensForTokens with no liquidity (68ms)
✔ testing getReserves

9 passing (3s)

### Coverage Report

| File           | % Stmts   | % Branch  | % Funcs | % Lines | Uncovered Lines |
| -------------- | --------- | --------- | ------- | ------- | --------------- |
| **contracts/** | 84.72     | 54.55     | 100     | 83      |                 |
| SimpleSwap.sol | 83.82     | 54.84     | 100     | 82.29   | 383,439,440     |
| TokenA.sol     | 100       | 50        | 100     | 100     |                 |
| TokenB.sol     | 100       | 50        | 100     | 100     |                 |
| **All files**  | **84.72** | **54.55** | **100** | **83**  |                 |

## Included Tests

The project includes comprehensive tests that cover:

- ✅ Input parameter validation
- ✅ Successful liquidity provision
- ✅ Correct price calculation
- ✅ Functional token swapping
- ✅ Liquidity removal
- ✅ Error handling (empty reserves, identical tokens)

## Frontend Usage

The project includes a simple web interface in `index.html` that allows:

- Connect wallet
- Add liquidity
- Swap tokens
- View balances

## Technologies Used

- **Solidity**: For smart contracts
- **Hardhat**: Development framework
- **Ethers.js**: Library for interacting with Ethereum
- **Chai**: Testing framework
- **OpenZeppelin**: Secure contract standards

---

_Developed as part of ETH KIPU Module 4_
