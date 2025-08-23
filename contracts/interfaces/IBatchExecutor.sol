// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint64} from "@fhevm/solidity/lib/FHE.sol";

interface IBatchExecutor {
    function executeBatch(address[] calldata users) external returns (uint256 batchId, euint64 encryptedTotal);
    
    function finalizeBatchExecution(
        uint256 batchId,
        uint256 minEthOut,
        uint24 poolFee
    ) external;
    
    function forceBatchExecution(uint256 batchId) external;
    
    function getBatchInfo(uint256 batchId) external view returns (
        bool finalized,
        uint64 decryptedTotal,
        uint256 createdAt,
        uint256 deadline,
        uint256 participantCount
    );
    
    function getBatchConfig() external view returns (
        uint256 minUsers,
        uint256 maxUsers,
        uint256 timeout
    );
}
