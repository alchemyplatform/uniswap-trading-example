import { getAddress } from "@ethersproject/address";
import {
  ChainId,
  Token,
  Fetcher,
  Route,
  Pair,
  Trade,
  TokenAmount,
  TradeType,
} from "@uniswap/sdk";
import UniswapV2Erc20Contract from "@uniswap/v2-core/build/UniswapV2ERC20.json";
import UniswapV2FactoryContract from "@uniswap/v2-core/build/UniswapV2Factory.json";
import UniswapV2PairContract from "@uniswap/v2-core/build/UniswapV2Pair.json";
import { Graph } from "graphlib";
import { range } from "transducist";
import Web3 from "web3";
import { runConcurrently } from "./async";
import { UniswapV2Erc20 } from "./declarations/generated/typechain/UniswapV2ERC20";
import { UniswapV2Factory } from "./declarations/generated/typechain/UniswapV2Factory";
import { UniswapV2Pair } from "./declarations/generated/typechain/UniswapV2Pair";
import { zipAdjacent } from "./zip";

export const UNISWAP_FACTORY_ADDRESS =
  "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export interface TokenPair {
  token0: string;
  token1: string;
  tokenPairAddress: string;
}

export class UniswapTradingPairsGraph {
  private readonly uniswapFactory: UniswapV2Factory;
  private readonly uniswapTradingGraph: Graph;
  private tradingPaths: string[][] = [];

  constructor(private readonly web3: Web3) {
    this.uniswapFactory = new this.web3.eth.Contract(
      UniswapV2FactoryContract.abi as any,
      UNISWAP_FACTORY_ADDRESS,
    ) as any;
    this.uniswapTradingGraph = new Graph({ directed: false, multigraph: true });
  }

  public async createTradingGraph(): Promise<void> {
    const allPairsLength = +(await this.uniswapFactory.methods
      .allPairsLength()
      .call());
    console.log(
      `There are ${allPairsLength} tradable pairs, but we will only get the first 1000 for the sake of time. Can you cache the results to speed things up next time?`,
    );
    const allPairs = await runConcurrently(
      [...range(0, 1000)],
      this.fetchTokenPairNoThrow.bind(this),
      { maxConcurrency: 16 },
    );
    allPairs.forEach((pair) => {
      if (pair) {
        this.uniswapTradingGraph.setEdge(
          getAddress(pair.token0),
          getAddress(pair.token1),
          getAddress(pair.tokenPairAddress),
        );
      }
    });
    console.log("You can choose from the following assets:");
    console.log(this.uniswapTradingGraph.nodes());
  }

  public async getCheapestTradingPath(
    tokenAddress0: string,
    tokenAmount0: number,
    tokenAddress1: string,
  ): Promise<void> {
    const path: string[] = [tokenAddress0];
    const visited: Set<string> = new Set();
    const maxLength = 3;

    this.tradingPaths = [];

    this.allPaths(tokenAddress0, tokenAddress1, visited, path, maxLength);
    const tokenAmount1ToPath: Record<number, string[]> = {};

    const tokenAddrToToken: Record<string, Token> = {};
    const tokenPairsInfo: Record<string, Pair> = {};

    for (const path of this.tradingPaths) {
      // Ignore cycles
      if (path.length === new Set(path).size && path.length > 1) {
        const tokens = [];
        for (const tokenAddr of path) {
          if (tokenAddrToToken[tokenAddr]) {
            tokens.push(tokenAddrToToken[tokenAddr]);
          } else {
            const erc20Token: UniswapV2Erc20 = new this.web3.eth.Contract(
              UniswapV2Erc20Contract.abi as any,
              tokenAddr,
            ) as any;
            const tokenObj = new Token(
              ChainId.MAINNET,
              tokenAddr,
              Number(await erc20Token.methods.decimals().call()),
            );
            tokenAddrToToken[tokenAddr] = tokenObj;
            tokens.push(tokenObj);
          }
        }
        const tokenPairs: Pair[] = [];
        for (const [tokenFrom, tokenTo] of zipAdjacent(tokens)) {
          if (tokenFrom && tokenTo) {
            const tokenPairString = tokenFrom.address + "," + tokenTo.address;
            if (tokenPairsInfo[tokenPairString]) {
              tokenPairs.push(tokenPairsInfo[tokenPairString]);
            } else {
              const tokenPair = await Fetcher.fetchPairData(tokenFrom, tokenTo);
              tokenPairsInfo[tokenPairString] = tokenPair;
              tokenPairs.push(tokenPair);
            }
          }
        }
        try {
          const route = new Route(
            tokenPairs,
            tokens[0],
            tokens[tokens.length - 1],
          );
          const trade = new Trade(
            route,
            new TokenAmount(tokens[0], BigInt(tokenAmount0)),
            TradeType.EXACT_INPUT,
          );
          // TODO: Simple version doesn't take into account price impact - how would you add it?
          // TODO: It also doesn't take into account gas costs - once you go live with BetterUniswap can you use estimateGas? https://web3js.readthedocs.io/en/v1.2.9/web3-eth-contract.html#methods-mymethod-estimategas
          tokenAmount1ToPath[
            Number(trade.executionPrice.toSignificant(10)) * tokenAmount0
          ] = path;
        } catch (err) {
          if (err.name == "InsufficientInputAmountError") {
            console.log(
              `Insufficient input amount to take path: ${path.join(" -> ")}`,
            );
          } else {
            console.log(err);
          }
        }
      }
    }
    if (Object.entries(tokenAmount1ToPath).length != 0) {
      let maxValue = 0;
      for (const [value, path] of Object.entries(tokenAmount1ToPath)) {
        const valueNumber = Number(value);
        console.log("The following path produced the following value:");
        console.log(`${path.join(" -> ")} : ${value}`);
        console.log("Using the following uniswap pools:");
        const tokenPairAddresses = [];
        for (const [tokenFrom, tokenTo] of zipAdjacent(path)) {
          if (tokenFrom && tokenTo) {
            tokenPairAddresses.push(
              this.uniswapTradingGraph.edge(tokenFrom, tokenTo),
            );
          }
        }
        console.log(`${tokenPairAddresses.join(" -> ")}`);
        if (valueNumber > maxValue) maxValue = valueNumber;
      }
      console.log(
        `Optimal trading path: ${tokenAmount1ToPath[maxValue].join(
          " -> ",
        )} : ${maxValue}`,
      );
      // TODO: Submit transaction on ganache
    } else {
      console.log(`No such route found`);
    }
  }

  private allPaths(
    tokenAddress0: string,
    tokenAddress1: string,
    visited: Set<string>,
    path: string[],
    length: number,
  ): void {
    // Full path found
    if (tokenAddress0 === tokenAddress1) {
      this.tradingPaths.push([...path]);
      return;
    }

    // To prevent recursion from going too deep
    if (path.length === length) {
      return;
    }
    visited.add(tokenAddress0);

    const neighborsResponse = this.uniswapTradingGraph.neighbors(tokenAddress0);
    const neighbors = neighborsResponse == undefined ? [] : neighborsResponse;
    for (const neighbor of neighbors) {
      // Ignores cycles
      if (!visited.has(neighbor) && !path.includes(neighbor)) {
        path.push(neighbor);
        this.allPaths(neighbor, tokenAddress1, visited, path, length);
        path.pop();
      }
    }
    visited.delete(tokenAddress0);
  }

  private async fetchTokenPairNoThrow(
    pairIndex: number,
  ): Promise<TokenPair | undefined> {
    try {
      return await this.fetchTokenPair(pairIndex);
    } catch (error) {
      console.error(`Failed to fetch token pair at index ${pairIndex}`, error);
      return undefined;
    }
  }

  private async fetchTokenPair(pairIndex: number): Promise<TokenPair> {
    const tokenPairAddress = await this.uniswapFactory.methods
      .allPairs(pairIndex)
      .call();
    const uniswapPair: UniswapV2Pair = new this.web3.eth.Contract(
      UniswapV2PairContract.abi as any,
      tokenPairAddress,
    ) as any;
    const token0 = await uniswapPair.methods.token0().call();
    const token1 = await uniswapPair.methods.token1().call();
    return { tokenPairAddress, token0, token1 };
  }
}
