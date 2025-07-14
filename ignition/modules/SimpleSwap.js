const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const SimpleSwapModule = buildModule("SimpleSwapModule", (deployer) => {
  const tokenA = deployer.contract("TokenA");
  const tokenB = deployer.contract("TokenB");

  const simpleSwap = deployer.contract("SimpleSwap");

  return { simpleSwap, tokenA, tokenB };
});

module.exports = SimpleSwapModule;
