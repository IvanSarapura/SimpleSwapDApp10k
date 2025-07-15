const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title SimpleSwap Tests
 * @notice Comprehensive test suite for the SimpleSwap contract functionality
 * @dev This test suite covers liquidity management, token swapping, price calculations,
 *      slippage protection, and error handling for the SimpleSwap AMM contract
 */
describe("SimpleSwap Tests", function () {
  // Contract factories and instances
  let SimpleSwap;
  let simpleSwap;
  let TokenA;
  let tokenA;
  let TokenB;
  let tokenB;
  let owner;

  /**
   * @notice Setup function that runs before each test
   * @dev Deploys fresh contract instances and mints initial tokens
   *      Each account gets 1000 tokens to ensure sufficient balance for all tests
   *      This prevents "insufficient balance" errors during testing
   */
  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy token contracts - These are ERC20 tokens with mint functionality
    TokenA = await ethers.getContractFactory("TokenA");
    TokenB = await ethers.getContractFactory("TokenB");
    tokenA = await TokenA.deploy();
    tokenB = await TokenB.deploy();

    // Deploy SimpleSwap contract - The main AMM contract
    SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    simpleSwap = await SimpleSwap.deploy();

    // Mint additional tokens for testing
    // Each account gets 1000 tokens to ensure sufficient balance for all tests
    // This prevents "insufficient balance" errors during testing
    await tokenA.mint(owner.address, ethers.parseEther("1000"));
    await tokenB.mint(owner.address, ethers.parseEther("1000"));
  });

  /**
   * @notice Test getAmountOut function with zero input amount
   * @dev Verifies that the function properly validates input parameters
   *      Should revert when amountIn is zero
   */
  it("zero amount", async function () {
    await expect(simpleSwap.getAmountOut(0, 1, 1)).to.be.revertedWith(
      "Zero amount"
    );
  });

  /**
   * @notice Test getAmountOut function with zero reserves
   * @dev Validates that the function checks for valid liquidity pools
   *      Should revert when reserves are zero
   */
  it("zero reserves", async function () {
    await expect(
      simpleSwap.getAmountOut(ethers.parseEther("1"), 0, 0)
    ).to.be.revertedWith("Invalid reserves");
  });

  /**
   * @notice Test addLiquidity with identical tokens
   * @dev Prevents invalid liquidity pools with identical tokens
   *      Should revert when both tokens are the same
   */
  it("same token", async function () {
    let amount = ethers.parseEther("1");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve tokens for the swap contract
    await tokenA.approve(simpleSwap.target, amount);

    // Attempt to add liquidity with the same token should fail
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        tokenA.target, // Both tokens have the same address
        amount,
        amount,
        0,
        0,
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Same token");
  });

  /**
   * @notice Test successful liquidity addition and LP token minting
   * @dev Verifies that liquidity can be added and LP tokens are minted correctly
   *      Creates initial liquidity pool with specified amounts and validates reserves
   */
  it("mint LP tokens", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve tokens for the swap contract
    // This allows the contract to transfer tokens from the user's account
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);

    // Add liquidity to the pool
    // This creates the initial liquidity pool with the specified amounts
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA, // Amount of tokenA to add
      amountB, // Amount of tokenB to add
      amountA, // Minimum amount of tokenA (slippage protection)
      amountB, // Minimum amount of tokenB (slippage protection)
      owner.address, // Recipient of LP tokens
      deadline
    );

    // Verify that reserves match the input amounts
    // This confirms the liquidity was added correctly
    let [aAdded, bAdded] = await simpleSwap.getReserves(
      tokenA.target,
      tokenB.target
    );
    expect(aAdded).to.equal(amountA);
    expect(bAdded).to.equal(amountB);

    // Verify that LP tokens were minted to the liquidity provider
    // LP tokens represent ownership stake in the pool
    let lpBalance = await simpleSwap.balanceOf(owner.address);
    expect(lpBalance).to.be.gt(0);
  });

  /**
   * @notice Test getPrice function returns correct price ratio
   * @dev Verifies that the price calculation is accurate based on reserve ratios
   *      Sets up 1:2 ratio and validates price returns correct value
   */
  it("get price", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Setup liquidity pool with 1:2 ratio (1 tokenA = 2 tokenB)
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      deadline
    );

    // Get price from contract
    let price = await simpleSwap.getPrice(tokenA.target, tokenB.target);

    // Calculate expected price as tokenB per tokenA scaled to 18 decimals
    let expectedPrice = (amountB * 10n ** 18n) / amountA;
    expect(price).to.equal(expectedPrice);

    // Verify the price makes sense: 1 tokenA should equal 2 tokenB
    expect(price).to.equal(ethers.parseEther("2"));
  });

  /**
   * @notice Test token swapping functionality works correctly (swapExactTokensForTokens)
   * @dev Verifies that token swapping works with proper amount calculations
   *      Uses AMM formula to calculate expected output and validates swap execution
   */
  it("swap tokens", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Setup liquidity pool with 100:200 reserves (1:2 ratio)
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      deadline
    );

    // Approve tokens for the swap
    await tokenA.approve(simpleSwap.target, amountIn);

    // Calculate expected output using the AMM formula
    // This uses the same calculation as the contract
    let expectedOut = await simpleSwap.getAmountOut(amountIn, amountA, amountB);

    // Execute the token swap
    // Trading 10 tokenA for tokenB
    await simpleSwap.swapExactTokensForTokens(
      amountIn, // Exact amount to swap in (10 tokenA)
      expectedOut, // Minimum amount to receive (slippage protection)
      [tokenA.target, tokenB.target], // Trading path [tokenIn, tokenOut]
      owner.address, // Recipient of output tokens
      deadline
    );

    // Verify that the user received the expected amount of tokens
    let balanceB = await tokenB.balanceOf(owner.address);
    expect(balanceB).to.be.gte(expectedOut);
  });

  /**
   * @notice Test liquidity removal functionality (removeLiquidity)
   * @dev Verifies that liquidity can be removed and tokens are returned to the provider
   *      Validates that token balances increase after liquidity removal
   */
  it("liquidity out", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve tokens
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);

    // Add liquidity
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      deadline
    );

    // Verify LP tokens were minted
    let lpBalance = await simpleSwap.balanceOf(owner.address);
    expect(lpBalance).to.be.gt(0);

    // Record token balances before removal
    // This helps verify that tokens are returned correctly
    let beforeA = await tokenA.balanceOf(owner.address);
    let beforeB = await tokenB.balanceOf(owner.address);

    // Approve LP tokens for burning and remove liquidity
    await simpleSwap.approve(simpleSwap.target, lpBalance);
    await simpleSwap.removeLiquidity(
      tokenA.target,
      tokenB.target,
      lpBalance,
      0,
      0,
      owner.address,
      deadline
    );

    // Verify that tokens were returned to the user
    let afterA = await tokenA.balanceOf(owner.address);
    let afterB = await tokenB.balanceOf(owner.address);

    // Both token balances should increase after liquidity removal
    expect(afterA).to.be.gt(beforeA);
    expect(afterB).to.be.gt(beforeB);
  });

  /**
   * @notice Test swap failure when no liquidity exists (swapExactTokensForTokens)
   * @dev Verifies that swapping fails gracefully when there's no liquidity pool
   *      Should revert with "No liquidity" error
   */
  it("no liquidity", async function () {
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve tokens
    await tokenA.approve(simpleSwap.target, amountIn);

    // Attempt to swap without liquidity should fail
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        0, // Even with 0 minimum, should still fail
        [tokenA.target, tokenB.target],
        owner.address,
        deadline
      )
    ).to.be.revertedWith("No liquidity");
  });

  /**
   * @notice Test getReserves function returns correct initial state
   * @dev Verifies that reserves are initially zero before any liquidity is added
   *      Both reserves should return zero when no liquidity exists
   */
  it("get reserves", async function () {
    let [reserveA, reserveB] = await simpleSwap.getReserves(
      tokenA.target,
      tokenB.target
    );
    // Both reserves should be zero initially
    expect(reserveA).to.equal(0);
    expect(reserveB).to.equal(0);
  });

  /**
   * @notice Test addLiquidity failure with insufficient amountA
   * @dev Verifies that adding liquidity fails when optimal amountA is less than minimum
   *      Tests slippage protection for tokenA in liquidity addition
   */
  it("low amountA", async function () {
    let initialAmountA = ethers.parseEther("100"); // reserveA = 100
    let initialAmountB = ethers.parseEther("200"); // reserveB = 200 (ratio 1:2)
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Create initial liquidity pool with 1:2 ratio
    await tokenA.approve(simpleSwap.target, initialAmountA);
    await tokenB.approve(simpleSwap.target, initialAmountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      initialAmountA,
      initialAmountB,
      initialAmountA,
      initialAmountB,
      owner.address,
      deadline
    );

    // Attempt to add liquidity with unrealistic minimum amountA
    let newAmountADesired = ethers.parseEther("50"); // Desired: 50 tokenA
    let newAmountBDesired = ethers.parseEther("80"); // Desired: 80 tokenB
    let unrealAmountAMin = ethers.parseEther("60"); // Minimum: 60 tokenA (too high)

    await tokenA.approve(simpleSwap.target, newAmountADesired);
    await tokenB.approve(simpleSwap.target, newAmountBDesired);

    // This should fail because optimal amountA (40) < minimum amountA (60)
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        tokenB.target,
        newAmountADesired, // 50 tokenA desired
        newAmountBDesired, // 80 tokenB desired
        unrealAmountAMin, // 60 tokenA minimum (higher than optimal 40)
        0, // No minimum for tokenB
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Low amountA");
  });

  /**
   * @notice Test addLiquidity failure with insufficient amountB
   * @dev Verifies that adding liquidity fails when optimal amountB is less than minimum
   *      Tests slippage protection for tokenB in liquidity addition
   */
  it("low amountB", async function () {
    let initialAmountA = ethers.parseEther("100"); // reserveA = 100
    let initialAmountB = ethers.parseEther("200"); // reserveB = 200 (ratio 1:2)
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Create initial liquidity pool with 1:2 ratio
    await tokenA.approve(simpleSwap.target, initialAmountA);
    await tokenB.approve(simpleSwap.target, initialAmountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      initialAmountA,
      initialAmountB,
      initialAmountA,
      initialAmountB,
      owner.address,
      deadline
    );

    // Attempt to add liquidity with unrealistic minimum for tokenB
    let newAmountADesired = ethers.parseEther("50"); // Desired: 50 tokenA
    let newAmountBDesired = ethers.parseEther("150"); // Desired: 150 tokenB
    let unrealAmountBMin = ethers.parseEther("120"); // Minimum: 120 tokenB (too high)

    await tokenA.approve(simpleSwap.target, newAmountADesired);
    await tokenB.approve(simpleSwap.target, newAmountBDesired);

    // This should fail because optimal amountB (100) < minimum amountB (120)
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        tokenB.target,
        newAmountADesired, // 50 tokenA desired
        newAmountBDesired, // 150 tokenB desired
        0, // No minimum for tokenA
        unrealAmountBMin, // 120 tokenB minimum (higher than optimal 100)
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Low amountB");
  });

  /**
   * @notice Test optimal amount calculations (addLiquidity)
   * @dev Verifies that optimal amount calculations work correctly
   *      Helps debug the slippage protection logic with reasonable parameters
   */
  it("optimal amount", async function () {
    let initialA = ethers.parseEther("100");
    let initialB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Create initial pool
    await tokenA.approve(simpleSwap.target, initialA);
    await tokenB.approve(simpleSwap.target, initialB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      initialA,
      initialB,
      initialA,
      initialB,
      owner.address,
      deadline
    );

    // Add liquidity with correct ratio and reasonable slippage tolerance
    let goodAmountA = ethers.parseEther("50");
    let goodAmountB = ethers.parseEther("100"); // Perfect 1:2 ratio

    await tokenA.approve(simpleSwap.target, goodAmountA);
    await tokenB.approve(simpleSwap.target, goodAmountB);

    // This should succeed without any issues
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        tokenB.target,
        goodAmountA,
        goodAmountB,
        ethers.parseEther("45"), // 10% slippage tolerance for A
        ethers.parseEther("95"), // 5% slippage tolerance for B
        owner.address,
        deadline
      )
    ).to.not.be.reverted;
  });

  /**
   * @notice Test removeLiquidity failure with insufficient output amounts
   * @dev Verifies that removing liquidity fails when output amounts are less than minimums
   *      Tests slippage protection for both tokens in liquidity removal
   */
  it("low amounts", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Add liquidity first
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      deadline
    );

    let lpBalance = await simpleSwap.balanceOf(owner.address);

    // Test unrealistic minimum for tokenA
    await expect(
      simpleSwap.removeLiquidity(
        tokenA.target,
        tokenB.target,
        lpBalance,
        ethers.parseEther("1000"), // Unrealistic minimum for tokenA
        0,
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Low amountA");

    // Test unrealistic minimum for tokenB
    await expect(
      simpleSwap.removeLiquidity(
        tokenA.target,
        tokenB.target,
        lpBalance,
        0,
        ethers.parseEther("1000"), // Unrealistic minimum for tokenB
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Low amountB");
  });

  /**
   * @notice Test addLiquidity failure with expired deadline
   * @dev Verifies that adding liquidity fails when the deadline is in the past
   *      Tests deadline protection mechanism
   */
  it("expired deadline", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");

    // Set deadline in the past (expired)
    let expiredDeadline =
      (await ethers.provider.getBlock("latest")).timestamp - 1000;

    // Approve tokens
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);

    // Transaction should fail due to expired deadline
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        tokenB.target,
        amountA,
        amountB,
        amountA,
        amountB,
        owner.address,
        expiredDeadline
      )
    ).to.be.revertedWith("Expired");
  });

  /**
   * @notice Test removeLiquidity failure with expired deadline
   * @dev Verifies that removing liquidity fails when the deadline is in the past
   *      Tests deadline protection in liquidity removal
   */
  it("expired deadline", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let validDeadline =
      (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Add liquidity with valid deadline
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      validDeadline
    );

    let lpBalance = await simpleSwap.balanceOf(owner.address);
    let expiredDeadline =
      (await ethers.provider.getBlock("latest")).timestamp - 1000;

    // Removal should fail with expired deadline
    await expect(
      simpleSwap.removeLiquidity(
        tokenA.target,
        tokenB.target,
        lpBalance,
        0,
        0,
        owner.address,
        expiredDeadline
      )
    ).to.be.revertedWith("Expired");
  });

  /**
   * @notice Test swapExactTokensForTokens failure with expired deadline
   * @dev Verifies that swapping fails when the deadline is in the past
   *      Tests deadline protection in token swapping
   */
  it("expired deadline", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let amountIn = ethers.parseEther("10");
    let validDeadline =
      (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Setup liquidity pool
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      validDeadline
    );

    let expiredDeadline =
      (await ethers.provider.getBlock("latest")).timestamp - 1000;
    await tokenA.approve(simpleSwap.target, amountIn);

    // Swap should fail with expired deadline
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        0,
        [tokenA.target, tokenB.target],
        owner.address,
        expiredDeadline
      )
    ).to.be.revertedWith("Expired");
  });

  /**
   * @notice Test addLiquidity failure with zero address for tokenA
   * @dev Verifies zero address protection for tokenA parameter
   *      Should revert when tokenA is zero address
   */
  it("zero address", async function () {
    let amount = ethers.parseEther("100");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Attempt to use zero address as tokenA
    await expect(
      simpleSwap.addLiquidity(
        ethers.ZeroAddress, // Invalid tokenA address
        tokenB.target,
        amount,
        amount,
        0,
        0,
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Zero address");
  });

  /**
   * @notice Test addLiquidity failure with zero address for tokenB
   * @dev Verifies zero address protection for tokenB parameter
   *      Should revert when tokenB is zero address
   */
  it("zero address", async function () {
    let amount = ethers.parseEther("100");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Attempt to use zero address as tokenB
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        ethers.ZeroAddress, // Invalid tokenB address
        amount,
        amount,
        0,
        0,
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Zero address");
  });

  /**
   * @notice Test getReserves failure with zero address
   * @dev Verifies zero address protection in view functions
   *      Should revert when querying reserves with zero address
   */
  it("zero address", async function () {
    // getReserves should also validate addresses
    await expect(
      simpleSwap.getReserves(ethers.ZeroAddress, tokenB.target)
    ).to.be.revertedWith("Zero address");
  });

  /**
   * @notice Test swapExactTokensForTokens failure with zero address in path
   * @dev Verifies zero address protection in swap function
   *      Should revert when swap path contains zero address
   */
  it("zero address", async function () {
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Attempt to swap with zero address in path
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        0,
        [ethers.ZeroAddress, tokenB.target], // Invalid token in path
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Zero address");
  });

  /**
   * @notice Test swapExactTokensForTokens failure with insufficient output
   * @dev Verifies slippage protection in swap function
   *      Should revert when expected output is less than minimum required
   */
  it("slippage", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Setup liquidity pool with 100:200 reserves
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);
    await simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      amountA,
      amountB,
      owner.address,
      deadline
    );

    // Approve tokens for swap
    await tokenA.approve(simpleSwap.target, amountIn);

    // Attempt swap with unrealistic minimum output (slippage protection)
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        ethers.parseEther("50"), // Unrealistic minimum output
        [tokenA.target, tokenB.target],
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Low output");
  });

  /**
   * @notice Test path validation in swap function
   * @dev Verifies that swap path must contain exactly 2 addresses
   *      Should revert with invalid path length (not equal to 2)
   */
  it("invalid path", async function () {
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Test path with only 1 address
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        0,
        [tokenA.target], // Invalid: only 1 address
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Invalid path");

    // Test path with 3 addresses (invalid for this contract)
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        0,
        [tokenA.target, tokenB.target, tokenA.target], // Invalid: 3 addresses
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Invalid path");
  });

  /**
   * @notice Test zero liquidity protection
   * @dev Verifies protection against zero liquidity minting
   *      Should revert when attempting to add zero liquidity
   */
  it("zero liquidity", async function () {
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Attempt to add zero liquidity
    await expect(
      simpleSwap.addLiquidity(
        tokenA.target,
        tokenB.target,
        0, // Zero amount A
        0, // Zero amount B
        0,
        0,
        owner.address,
        deadline
      )
    ).to.be.revertedWith("Low liquidity");
  });
});
