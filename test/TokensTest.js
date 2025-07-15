const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Tokens Tests
 * @notice Test suite for TokenA and TokenB contracts
 * @dev Tests the basic functionality and access control of token contracts
 */
describe("Tokens Tests", function () {
  let owner;
  let nonOwner;
  let TokenA;
  let TokenB;
  let tokenA;
  let tokenB;

  /**
   * @notice Set up test environment before each test
   * @dev Deploys TokenA and TokenB contracts and mints initial tokens to owner
   */
  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();

    TokenA = await ethers.getContractFactory("TokenA");
    TokenB = await ethers.getContractFactory("TokenB");
    tokenA = await TokenA.deploy();
    tokenB = await TokenB.deploy();

    await tokenA.mint(owner.address, ethers.parseEther("1000"));
    await tokenB.mint(owner.address, ethers.parseEther("1000"));
  });

  /**
   * @notice Test TokenA mint function access control
   * @dev Verifies that only the owner can mint tokens
   * @dev Should succeed when called by owner and revert when called by non-owner
   */
  it("not owner", async function () {
    const amount = ethers.parseEther("1000");

    // Should succeed when called by owner
    await expect(tokenA.mint(owner.address, amount)).to.not.be.reverted;

    // Should revert when called by non-owner
    await expect(
      tokenA.connect(nonOwner).mint(nonOwner.address, amount)
    ).to.be.revertedWithCustomError(tokenA, "OwnableUnauthorizedAccount");
  });

  /**
   * @notice Test TokenB mint function access control
   * @dev Verifies that only the owner can mint tokens
   * @dev Should succeed when called by owner and revert when called by non-owner
   */
  it("not owner", async function () {
    const amount = ethers.parseEther("1000");

    // Should succeed when called by owner
    await expect(tokenB.mint(owner.address, amount)).to.not.be.reverted;

    // Should revert when called by non-owner
    await expect(
      tokenB.connect(nonOwner).mint(nonOwner.address, amount)
    ).to.be.revertedWithCustomError(tokenB, "OwnableUnauthorizedAccount");
  });
});
