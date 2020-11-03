// eslint-disable-next-line import/no-named-as-default
import { getAddress } from "@ethersproject/address";
import prompts from "prompts";
import Web3 from "web3";
import yargs from "yargs";
import { UniswapTradingPairsGraph } from "./tradingPairsGraph";

async function main(): Promise<void> {
  const argv = yargs(process.argv.slice(2)).options({
    api_url: { type: "string", alias: "Alchemy API URL", required: true },
  }).argv;

  const web3 = new Web3(argv.api_url);

  console.log("Creating graph of trading pairs");

  const uniswapTradingPairsGraph = new UniswapTradingPairsGraph(web3);

  await uniswapTradingPairsGraph.createTradingGraph();

  console.log(
    "This script will find the cheapest path for exchanging value between two given token addresses on Uniswap.",
  );

  while (true) {
    const onCancel = () => {
      console.log("Goodbye - happy trading!");
      process.exit();
    };
    const response = await prompts(
      [
        {
          type: "text",
          name: "tokenAddress0",
          message: "Trade from asset with address:",
          validate: (address) =>
            !/^0x[a-fA-F0-9]{40}$/.test(address) ? `Invalid eth address` : true,
        },
        {
          type: "number",
          name: "tokenAmount0",
          message: "Ammount of from asset to trade:",
        },
        {
          type: "text",
          name: "tokenAddress1",
          message: "Trade to asset with address:",
          validate: (address) =>
            !/^0x[a-fA-F0-9]{40}$/.test(address) ? `Invalid eth address` : true,
        },
      ],
      { onCancel },
    );
    await uniswapTradingPairsGraph.getCheapestTradingPath(
      getAddress(response.tokenAddress0),
      response.tokenAmount0,
      getAddress(response.tokenAddress1.toLowerCase()),
    );
  }
}

main();
