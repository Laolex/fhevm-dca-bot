// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function approve(address spender, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface ISwapRouterV3 {
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

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

/// @title DexAdapter
/// @notice Minimal Uniswap V3 swapper to convert USDC -> WETH on a given router
contract DexAdapter {
    address public immutable usdc;
    address public immutable weth;
    ISwapRouterV3 public immutable router;

    address public owner;

    error OnlyOwner();

    event Swapped(address indexed recipient, uint256 amountIn, uint256 amountOut);

    constructor(address usdc_, address weth_, address router_) {
        owner = msg.sender;
        usdc = usdc_;
        weth = weth_;
        router = ISwapRouterV3(router_);
    }

    function setOwner(address newOwner) external {
        if (msg.sender != owner) revert OnlyOwner();
        owner = newOwner;
    }

    /// @notice Swap USDC already held by this contract for WETH and send to recipient
    /// @dev Assumes USDC has been transferred to this adapter and approved here
    function swapUsdcForEth(uint256 amountIn, uint256 minAmountOut, address recipient, uint24 poolFee) external returns (uint256 amountOut) {
        // Approve router to spend USDC held here
        IERC20Minimal(usdc).approve(address(router), amountIn);
        amountOut = router.exactInputSingle(
            ISwapRouterV3.ExactInputSingleParams({
                tokenIn: usdc,
                tokenOut: weth,
                fee: poolFee,
                recipient: recipient,
                deadline: block.timestamp + 300,
                amountIn: amountIn,
                amountOutMinimum: minAmountOut,
                sqrtPriceLimitX96: 0
            })
        );
        emit Swapped(recipient, amountIn, amountOut);
    }
}


