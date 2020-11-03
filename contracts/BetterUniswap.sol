// SPDX-License-Identifier: MIT
pragma solidity >=0.6.6 <0.7.0;

import "@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2ERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract BetterUniswap {
    address public uniswap_factory;

    constructor(
        address uniswap_factory_
    ) public {
        uniswap_factory = uniswap_factory_;
    }

    function uniswapOptimalTrade(address wallet_addr, address[] memory trading_route)
        public
        payable
    {
        // Take percentage fee
        // Execute trade
    }
}
