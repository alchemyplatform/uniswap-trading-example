require("dotenv").config();
const { MNEMONIC, ALCHEMY_MAINNET_URL, MAINNET_FROM_ADDRESS } = process.env; // When you are ready to use a testnet add ALCHEMY_RINKEBY_URL and RINKEBY_FROM_ADDRESS

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 5777,
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 5777,
    },
    /*
    // Use when you are ready to deploy to a testnet! 
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          MNEMONIC,
          ALCHEMY_RINKEBY_URL
        );
      },
      network_id: 4,
      from: RINKEBY_FROM_ADDRESS,
    },
    */
  },
  mocha: {
    enableTimeouts: false,
    before_timeout: 120000 // Here is 2min but can be whatever timeout is suitable for you.
  }, 
  compilers: {
    solc: {
      version: "0.6.6",
    },
  },
  live: {
    provider: function () {
      return new HDWalletProvider(
        MNEMONIC,
        ALCHEMY_MAINNET_URL
      );
    },
    network_id: 1,
    from: MAINNET_FROM_ADDRESS,
  },
};
