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

    /// @notice Execute batch swap for DCA bot participants
    /// @dev This function handles the batch execution of USDC to ETH swaps
    /// @param totalAmount Total USDC amount to swap (encrypted)
    /// @param participants Array of participant addresses
    function executeBatchSwap(uint256 totalAmount, address[] calldata participants) external returns (uint256 totalEthReceived) {
        require(msg.sender == owner, "Only owner can execute batch");
        require(totalAmount > 0, "Invalid amount");
        require(participants.length > 0, "No participants");

        // Calculate minimum ETH output (with 1% slippage tolerance)
        uint256 minEthOut = (totalAmount * 99) / 100; // 1% slippage tolerance
        
        // Execute the swap
        totalEthReceived = swapUsdcForEth(
            totalAmount,
            minEthOut,
            address(this), // Receive ETH to this contract first
            3000 // 0.3% fee tier
        );

        // Distribute ETH proportionally to participants
        // Note: In a real implementation, you'd use FHE to calculate proportional amounts
        uint256 ethPerParticipant = totalEthReceived / participants.length;
        
        for (uint i = 0; i < participants.length; i++) {
            if (ethPerParticipant > 0) {
                // Transfer ETH to participant
                IERC20Minimal(weth).transfer(participants[i], ethPerParticipant);
            }
        }

        emit BatchSwapExecuted(totalAmount, totalEthReceived, participants.length);
    }

    event BatchSwapExecuted(uint256 totalUsdcAmount, uint256 totalEthReceived, uint256 participantCount);
}


