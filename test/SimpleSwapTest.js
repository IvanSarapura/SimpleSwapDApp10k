const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * SimpleSwap Tests
 * This test suite covers the main functionality of the SimpleSwap contract
 * including liquidity management, token swapping, and price calculations
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
   * Setup function that runs before each test
   * Deploys fresh contract instances and mints initial tokens
   */
  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy token contracts
    TokenA = await ethers.getContractFactory("TokenA");
    TokenB = await ethers.getContractFactory("TokenB");
    tokenA = await TokenA.deploy();
    tokenB = await TokenB.deploy();

    // Deploy SimpleSwap contract
    SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    simpleSwap = await SimpleSwap.deploy();

    // Mint additional tokens for testing - each account gets 1000 tokens
    await tokenA.mint(owner.address, ethers.parseEther("1000"));
    await tokenB.mint(owner.address, ethers.parseEther("1000"));
  });

  /**
   * Test: getAmountOut function should revert when amountIn is zero
   * This ensures the function properly validates input parameters
   */
  it("testing getAmountOut with zero amountIn", async function () {
    await expect(simpleSwap.getAmountOut(0, 1, 1)).to.be.revertedWith(
      "Zero amount"
    );
  });

  /**
   * Test: getAmountOut function should revert when reserves are zero
   * This validates that the function checks for valid liquidity pools
   */
  it("testing getAmountOut with zero reserves", async function () {
    await expect(
      simpleSwap.getAmountOut(ethers.parseEther("1"), 0, 0)
    ).to.be.revertedWith("Invalid reserves");
  });

  /**
   * Test: addLiquidity should revert when both tokens are the same
   * This prevents invalid liquidity pools with identical tokens
   */
  it("testing addLiquidity with same token", async function () {
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
   * Test: Successfully add liquidity and mint LP tokens
   * Verifies that liquidity can be added and LP tokens are minted correctly
   */
  it("testing add liquidity and mint LP tokens", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve tokens for the swap contract
    await tokenA.approve(simpleSwap.target, amountA);
    await tokenB.approve(simpleSwap.target, amountB);

    // Add liquidity to the pool
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

    // Check reserve balances against input data
    let [aAdded, bAdded] = await simpleSwap.getReserves(
      tokenA.target,
      tokenB.target
    );
    expect(aAdded).to.equal(amountA);
    expect(bAdded).to.equal(amountB);

    // Check if LP tokens were minted to the liquidity provider
    let lpBalance = await simpleSwap.balanceOf(owner.address);
    expect(lpBalance).to.be.gt(0);
  });

  /**
   * Test: getPrice function returns correct price ratio
   * Verifies that the price calculation is accurate based on reserve ratios
   */
  it("testing getPrice", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Setup liquidity pool first
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

    // Check price calculation based on input amounts
    let price = await simpleSwap.getPrice(tokenA.target, tokenB.target);
    // Calculate expected price as tokenB per tokenA scaled to 18 decimals
    let expectedPrice = (amountB * 10n ** 18n) / amountA;
    expect(price).to.equal(expectedPrice);
  });

  /**
   * Test: swapExactTokensForTokens function works correctly
   * Verifies that token swapping works with proper amount calculations
   */
  it("testing swapExactTokensForTokens", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Setup liquidity pool first
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
    // Use getAmountOut to get the expected output
    let expectedOut = await simpleSwap.getAmountOut(amountIn, amountA, amountB);

    // Execute the token swap
    await simpleSwap.swapExactTokensForTokens(
      amountIn,
      expectedOut,
      [tokenA.target, tokenB.target],
      owner.address,
      deadline
    );

    // Verify that the address balance matches or exceeds the expected output
    let balanceB = await tokenB.balanceOf(owner.address);
    expect(balanceB).to.be.gte(expectedOut);
  });

  /**
   * Test: removeLiquidity function works correctly
   * Verifies that liquidity can be removed and tokens are returned to the provider
   */
  it("testing removeLiquidity", async function () {
    let amountA = ethers.parseEther("100");
    let amountB = ethers.parseEther("200");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve and add liquidity
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

    // Verify LP tokens were minted
    let lpBalance = await simpleSwap.balanceOf(owner.address);
    expect(lpBalance).to.be.gt(0);

    // Snapshot token balances before removing liquidity
    let beforeA = await tokenA.balanceOf(owner.address);
    let beforeB = await tokenB.balanceOf(owner.address);

    // Approve LP token and remove liquidity
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

    // Check that owner received tokenA and tokenB back
    let afterA = await tokenA.balanceOf(owner.address);
    let afterB = await tokenB.balanceOf(owner.address);

    // Verify that token balances increased after removing liquidity
    expect(afterA).to.be.gt(beforeA);
    expect(afterB).to.be.gt(beforeB);
  });

  /**
   * Test: swapExactTokensForTokens should revert when no liquidity exists
   * Verifies that swapping fails gracefully when there's no liquidity pool
   */
  it("testing swapExactTokensForTokens with no liquidity", async function () {
    let amountIn = ethers.parseEther("10");
    let deadline = (await ethers.provider.getBlock("latest")).timestamp + 1000;

    // Approve tokens for the swap
    await tokenA.approve(simpleSwap.target, amountIn);

    // Attempt to swap without any liquidity should fail
    await expect(
      simpleSwap.swapExactTokensForTokens(
        amountIn,
        0,
        [tokenA.target, tokenB.target],
        owner.address,
        deadline
      )
    ).to.be.revertedWith("No liquidity");
  });

  /**
   * Test: getReserves function returns correct initial state
   * Verifies that reserves are initially zero before any liquidity is added
   */
  it("testing getReserves", async function () {
    let [reserveA, reserveB] = await simpleSwap.getReserves(
      tokenA.target,
      tokenB.target
    );
    // Both reserves should be zero initially
    expect(reserveA).to.equal(0);
    expect(reserveB).to.equal(0);
  });
});
