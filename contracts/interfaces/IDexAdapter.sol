// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDexAdapter {
    function swapUsdcForEth(uint256 amountIn, uint256 minAmountOut, address recipient, uint24 poolFee) external returns (uint256 amountOut);
}


