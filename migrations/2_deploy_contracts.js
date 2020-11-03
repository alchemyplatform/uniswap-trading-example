const BetterUniswap  = artifacts.require("BetterUniswap");

// Factory address is the same for mainnet and all testnets
const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

module.exports = function (deployer) {
  deployer.deploy(
    BetterUniswap,
    UniswapFactoryAddress,
  );
  // https://ethereum.stackexchange.com/questions/34570/how-to-know-the-contract-address-which-truffle-is-deploying-with
  // https://ethereum.stackexchange.com/questions/18432/truffle-migrate-fails
};
