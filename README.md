# Uniswap Trading!

## Getting setup

1. Clone this Repo

2. Create a [free Alchemy account](https://dashboard.alchemyapi.io/signup/)

3. Create a mainnet Alchemy app called `uniswap trading`
   - You can make the description whatever you want
   - Let's keep our app in development for now
   - Make sure you select "mainnet" for your network so we pull real data from the blockchian
   - Once your app is created you can view your API key anytime by selecting your app and clicking "view key" in the top right corner
4. Install Yarn if you don't have it:

   ```
   npm install -g yarn
   ```

## Running the trading script

1. Navigate to the `trading_scripts` directory

   ```
   cd trading_scripts
   ```

2. Install the dependencies of all packages:

   ```
   yarn
   ```

3. Generate the contract types:

   ```
   yarn generate-contract-types
   ```

4. Run the trading script

   ```
   yarn trade --api_url=YOUR_ALCHEMY_API_URL
   ```

## [BONUS] Smart Contract Development

1. Install Truffle

   ```
   yarn global add truffle
   ```

2. Install Ganache by using [their download link](https://www.trufflesuite.com/ganache).

3. In Ganache, select the Ethereum quick start, then connect it to your project by [following the instructions here](https://www.trufflesuite.com/docs/ganache/truffle-projects/linking-a-truffle-project).

4. While in the setting view, select the server tab to enable chain forking with the latest mainnet block:

   - Toggle the chain forking switch
   - Paste your Alchemy API key under the custom url: https://eth-mainnet.alchemyapi.io/v2/{YOUR_API_KEY}
   - Set the block number to the latest number found [using our composer](https://composer.alchemyapi.io?composer_state=%7B%22network%22%3A0%2C%22methodName%22%3A%22eth_blockNumber%22%2C%22paramValues%22%3A%5B%5D%7D). Hit "send request" to view the latest block number in hex format, you'll have to convert it to decimal when inputting it into ganache.

5. In your project directory, install the Contract dependencies:

   ```
   yarn
   ```

6. Instal the dotenv package (to store sensative data)

   ```
   yarn add -D dotenv
   ```

7. In your project directory, create a `.env` file, adding the following lines of code to it, replacing each value with your unique mnemonic, account address, and alchemy url:

   ```
   MNEMONIC = "your mnemonic fron ganache"
   MAINNET_FROM_ADDRESS = "any account address provided in ganache"
   ALCHEMY_MAINNNET_URL = "your alchemy api url"
   ```

8. Compile the contracts:

   ```
   truffle compile
   ```

9. Migrate the contracts onto Ganache:

   ```
   truffle migrate
   ```
