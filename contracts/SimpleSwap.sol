// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleSwap Contract
 * @author Ivan Sarapura
 * @notice A simplified decentralized exchange (DEX) implementation
 * @dev This contract implements basic AMM (Automated Market Maker) functionality
 *      including liquidity provision, token swapping, and LP token management
 */
contract SimpleSwap is ERC20, Ownable {
    // ========== DATA STRUCTURES ==========

    /**
     * @notice Structure to store reserves for a token pair
     * @dev Reserves are stored in sorted order where token0 < token1 by address
     * @param reserve0: Reserve amount for the first token (lower address)
     * @param reserve1: Reserve amount for the second token (higher address)
     */
    struct TokenPairReserves {
        uint reserve0;
        uint reserve1;
    }

    /// @notice Mapping to store reserves for each token pair
    /// @dev Mapping structure: token0 => token1 => TokenPairReserves
    mapping(address => mapping(address => TokenPairReserves)) private reserves;

    // ========== EVENTS ==========

    /**
     * @notice Event emitted when liquidity is added to a token pair
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @param amountA Amount of tokenA added
     * @param amountB Amount of tokenB added
     * @param liquidity Amount of LP tokens minted
     */
    event LiquidityAdded(
        address indexed tokenA,
        address indexed tokenB,
        uint amountA,
        uint amountB,
        uint liquidity
    );

    /**
     * @notice Event emitted when liquidity is removed from a token pair
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @param amountA Amount of tokenA removed
     * @param amountB Amount of tokenB removed
     * @param liquidity Amount of LP tokens burned
     */
    event LiquidityRemoved(
        address indexed tokenA,
        address indexed tokenB,
        uint amountA,
        uint amountB,
        uint liquidity
    );

    /**
     * @notice Event emitted when a swap is executed
     * @param tokenIn Address of the input token
     * @param tokenOut Address of the output token
     * @param amountIn Amount of input tokens swapped
     * @param amountOut Amount of output tokens received
     * @param to Address to receive the output tokens
     */
    event Swap(
        address indexed tokenIn,
        address indexed tokenOut,
        uint amountIn,
        uint amountOut,
        address indexed to
    );

    // ========== CONSTRUCTOR ==========

    /**
     * @notice Constructor that initializes the LP token with name "TokenLP" and symbol "TLP"
     * @dev Sets the contract deployer as the initial owner
     */
    constructor() ERC20("TokenLP", "TLP") Ownable(msg.sender) {}

    // ========== FUNCTIONS ==========

    /**
     * @notice Gets the current reserves for a token pair
     * @dev Public function that calls internal _getReserves
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @return reserveA Current reserve amount for tokenA
     * @return reserveB Current reserve amount for tokenB
     */
    function getReserves(
        address tokenA,
        address tokenB
    ) public view returns (uint reserveA, uint reserveB) {
        // Call internal function to get reserves
        (reserveA, reserveB) = _getReserves(tokenA, tokenB);
    }

    /**
     * @notice Internal function to get reserves for a token pair
     * @dev Handles token sorting and reserve mapping retrieval
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @return reserveA Current reserve amount for tokenA
     * @return reserveB Current reserve amount for tokenB
     */
    function _getReserves(
        address tokenA,
        address tokenB
    ) internal view returns (uint reserveA, uint reserveB) {
        // Call internal function to sort tokens
        (address token0, address token1) = sortTokens(tokenA, tokenB);

        // Get reserves for the token pair
        TokenPairReserves memory pairReserves = reserves[token0][token1];

        (reserveA, reserveB) = tokenA == token0
            ? (pairReserves.reserve0, pairReserves.reserve1)
            : (pairReserves.reserve1, pairReserves.reserve0);
    }

    /**
     * @notice Sorts two token addresses in ascending order
     * @dev Ensures consistent ordering for token pair storage
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @return token0 Lower address token
     * @return token1 Higher address token
     */
    function sortTokens(
        address tokenA,
        address tokenB
    ) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "Same token");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");

        // Sort tokens in ascending order
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
    }

    /**
     * @notice Adds liquidity to a token pair
     * @dev Transfers tokens from user, mints LP tokens, and updates reserves
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @param amountADesired Desired amount of tokenA to add
     * @param amountBDesired Desired amount of tokenB to add
     * @param amountAMin Minimum amount of tokenA to add (slippage protection)
     * @param amountBMin Minimum amount of tokenB to add (slippage protection)
     * @param to Address to receive the LP tokens
     * @param deadline Transaction deadline timestamp
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
    ) public returns (uint amountA, uint amountB, uint liquidity) {
        // Check if transaction has expired
        require(block.timestamp <= deadline, "Expired");

        // Sort tokens in ascending order
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        TokenPairReserves memory pairReserves = reserves[token0][token1]; // SLOAD unique

        // Get reserves for the token pair
        uint reserve0 = pairReserves.reserve0;
        uint reserve1 = pairReserves.reserve1;

        (uint reserveA, uint reserveB) = tokenA == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        // Calculate optimal amounts to maintain price ratio
        (amountA, amountB) = _calculateOptimalAmounts(
            reserveA,
            reserveB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );

        // Transfer tokens from user to contract
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        // Calculate liquidity to mint
        liquidity = calculateLPTokensToMint(
            amountA,
            amountB,
            reserveA,
            reserveB
        );
        _mint(to, liquidity);

        // Update reserves for the token pair
        if (tokenA == token0) {
            reserves[token0][token1] = TokenPairReserves(
                reserveA + amountA,
                reserveB + amountB
            ); // SSTORE unique
        } else {
            reserves[token0][token1] = TokenPairReserves(
                reserveB + amountB,
                reserveA + amountA
            ); // SSTORE unique
        }

        emit LiquidityAdded(tokenA, tokenB, amountA, amountB, liquidity);
    }

    /**
     * @notice Calculates optimal token amounts to maintain price ratio
     * @dev For existing pools, amounts are adjusted to maintain the current price ratio
     * @param reserveA Current reserve of tokenA
     * @param reserveB Current reserve of tokenB
     * @param amountADesired Desired amount of tokenA
     * @param amountBDesired Desired amount of tokenB
     * @param amountAMin Minimum acceptable amount of tokenA
     * @param amountBMin Minimum acceptable amount of tokenB
     * @return amountA Optimal amount of tokenA to add
     * @return amountB Optimal amount of tokenB to add
     */
    function _calculateOptimalAmounts(
        uint reserveA,
        uint reserveB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal pure returns (uint amountA, uint amountB) {
        // For new pools, use desired amounts
        if (reserveA == 0 && reserveB == 0) {
            return (amountADesired, amountBDesired);
        }

        // Calculate optimal amountB based on amountADesired
        uint amountBOptimal = (amountADesired * reserveB) / reserveA;

        if (amountBOptimal <= amountBDesired) {
            // Check if amountB is sufficient
            require(amountBOptimal >= amountBMin, "Low amountB");
            return (amountADesired, amountBOptimal);
        }

        // Calculate optimal amountA based on amountBDesired
        uint amountAOptimal = (amountBDesired * reserveA) / reserveB;

        require(amountAOptimal >= amountAMin, "Low amountA");
        return (amountAOptimal, amountBDesired);
    }

    /**
     * @notice Calculates the amount of LP tokens to mint for provided liquidity
     * @dev Uses geometric mean for initial liquidity, proportional for subsequent additions
     * @param amountA Amount of tokenA being added
     * @param amountB Amount of tokenB being added
     * @param reserveA Current reserve of tokenA
     * @param reserveB Current reserve of tokenB
     * @return liquidity Amount of LP tokens to mint
     */
    function calculateLPTokensToMint(
        uint amountA,
        uint amountB,
        uint reserveA,
        uint reserveB
    ) private view returns (uint liquidity) {
        // Get total supply of LP tokens
        uint _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // For initial liquidity, use geometric mean: sqrt(amountA * amountB)
            liquidity = _sqrt(amountA * amountB);
        } else {
            // Check if reserves are valid
            require(reserveA > 0 && reserveB > 0, "Invalid reserves");

            // For subsequent liquidity, use proportional minting
            uint liquidityA = (amountA * _totalSupply) / reserveA;
            uint liquidityB = (amountB * _totalSupply) / reserveB;

            // Use the minimum to maintain proportionality
            liquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        }

        // Check if liquidity is valid
        require(liquidity > 0, "Low liquidity");
    }

    /**
     * @notice Calculates the integer square root using Babylonian method
     * @dev Implementation of the Babylonian method for square root calculation
     * @param y Input value to calculate square root for
     * @return z Square root of y
     */
    function _sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        } else {
            z = 0; // In case y == 0
        }
    }

    /**
     * @notice Removes liquidity from a token pair
     * @dev Burns LP tokens and transfers proportional amounts of both tokens to user
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @param liquidity Amount of LP tokens to burn
     * @param amountAMin Minimum amount of tokenA to receive (slippage protection)
     * @param amountBMin Minimum amount of tokenB to receive (slippage protection)
     * @param to Address to receive the tokens
     * @param deadline Transaction deadline timestamp
     * @return amountA Amount of tokenA returned
     * @return amountB Amount of tokenB returned
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB) {
        require(block.timestamp <= deadline, "Expired");

        // Get total supply of LP tokens
        uint _totalSupply = totalSupply();

        (address token0, address token1) = sortTokens(tokenA, tokenB);
        TokenPairReserves memory pairReserves = reserves[token0][token1]; // SLOAD unique

        uint reserve0 = pairReserves.reserve0;
        uint reserve1 = pairReserves.reserve1;

        (uint reserveA, uint reserveB) = tokenA == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        // Calculate proportional amounts based on LP token share
        amountA = (liquidity * reserveA) / _totalSupply;
        amountB = (liquidity * reserveB) / _totalSupply;

        require(amountA >= amountAMin, "Low amountA");
        require(amountB >= amountBMin, "Low amountB");

        // Burn LP tokens
        _burn(msg.sender, liquidity);

        // Transfer tokens to user
        IERC20(tokenA).transfer(to, amountA);
        IERC20(tokenB).transfer(to, amountB);

        if (tokenA == token0) {
            reserves[token0][token1] = TokenPairReserves(
                reserveA - amountA,
                reserveB - amountB
            ); // SSTORE unique
        } else {
            reserves[token0][token1] = TokenPairReserves(
                reserveB - amountB,
                reserveA - amountA
            ); // SSTORE unique
        }

        emit LiquidityRemoved(tokenA, tokenB, amountA, amountB, liquidity);
    }

    /**
     * @notice Swaps an exact amount of input tokens for output tokens
     * @dev Implements constant product formula (x * y = k) for token swapping
     * @param amountIn Exact amount of input tokens to swap
     * @param amountOutMin Minimum amount of output tokens expected (slippage protection)
     * @param path Array containing [tokenIn, tokenOut] addresses
     * @param to Address to receive the output tokens
     * @param deadline Transaction deadline timestamp
     */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external {
        require(block.timestamp <= deadline, "Expired");
        require(path.length == 2, "Invalid path");

        // Get token addresses
        address tokenIn = path[0];
        address tokenOut = path[1];

        (address token0, address token1) = sortTokens(tokenIn, tokenOut);
        TokenPairReserves memory pairReserves = reserves[token0][token1]; // SLOAD unique

        uint reserve0 = pairReserves.reserve0;
        uint reserve1 = pairReserves.reserve1;

        (uint reserveIn, uint reserveOut) = tokenIn == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        require(reserveIn > 0 && reserveOut > 0, "No liquidity");

        // Calculate amount out
        uint amountOut = _getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut >= amountOutMin, "Low output");

        // Transfer tokens from user to contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        // Transfer tokens to user
        IERC20(tokenOut).transfer(to, amountOut);

        // Update reserves for the token pair
        if (tokenIn == token0) {
            reserves[token0][token1] = TokenPairReserves(
                reserveIn + amountIn,
                reserveOut - amountOut
            ); // SSTORE unique
        } else {
            reserves[token0][token1] = TokenPairReserves(
                reserveOut - amountOut,
                reserveIn + amountIn
            ); // SSTORE
        }

        emit Swap(tokenIn, tokenOut, amountIn, amountOut, to);
    }

    /**
     * @notice Gets the current price of tokenA in terms of tokenB
     * @dev Returns the price scaled by 10^18 for precision
     * @param tokenA Address of the token to get price for
     * @param tokenB Address of the token to price against
     * @return price Price of tokenA in tokenB (scaled by 10^18)
     */
    function getPrice(
        address tokenA,
        address tokenB
    ) external view returns (uint price) {
        // Get reserves for the token pair
        (uint reserveA, uint reserveB) = _getReserves(tokenA, tokenB);

        require(reserveA > 0, "No liquidity");

        // Calculate price
        price = (reserveB * 10 ** 18) / reserveA;
    }

    /**
     * @notice Calculates the output amount for a given input amount
     * @dev Public wrapper for _getAmountOut function
     * @param amountIn Amount of input tokens
     * @param reserveIn Reserve of input token
     * @param reserveOut Reserve of output token
     * @return amountOut Amount of output tokens
     */
    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) external pure returns (uint amountOut) {
        amountOut = _getAmountOut(amountIn, reserveIn, reserveOut);
    }

    /**
     * @notice Internal function that implements the constant product formula
     * @dev Uses simplified formula: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
     * @param amountIn Amount of input tokens
     * @param reserveIn Current reserve of input token
     * @param reserveOut Current reserve of output token
     * @return amountOut Amount of output tokens that will be received
     */
    function _getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) internal pure returns (uint amountOut) {
        require(amountIn > 0, "Zero amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");

        // Calculate amount out
        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
    }
}
