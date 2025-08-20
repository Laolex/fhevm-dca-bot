// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISwapRouterV3Minimal {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
}

contract MockSwapRouterV3 is ISwapRouterV3Minimal {
    uint256 public lastAmountIn;
    address public lastRecipient;

    function exactInputSingle(ExactInputSingleParams calldata params) external returns (uint256 amountOut) {
        lastAmountIn = params.amountIn;
        lastRecipient = params.recipient;
        uint256 simulated = params.amountIn / 2; // deterministic mock output
        require(simulated >= params.amountOutMinimum, "SlippageExceeded");
        return simulated;
    }
}


