# Uniswap Trading Scripts

A simple script to find the best trading route for two tokens on Uniswap.

### Simple setup

First, install Yarn if you don't have it:

```
npm install -g yarn
```

Then, install the dependencies of all packages:

```
yarn
```

Next, generate the contract types:

```
yarn generate-contract-types
```

Finally, run the trading script

```
yarn trade --api_url=YOUR_ALCHEMY_API_URL
```

Don't have an alchemy API key? [Signup now!](https://dashboard.alchemyapi.io/signup/)
