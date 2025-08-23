// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IDCAIntentRegistry} from "./interfaces/IDCAIntentRegistry.sol";
import {ITokenVault} from "./interfaces/ITokenVault.sol";
import {IRewardVault, IRewardVaultInternalCredit} from "./interfaces/IRewardVault.sol";
import {IDexAdapter} from "./interfaces/IDexAdapter.sol";

/// @title BatchExecutor
/// @notice Aggregates encrypted DCA amounts, reveals batch totals, and triggers single DEX swaps
/// Features:
/// - Collects encrypted DCA intents from multiple users (target: 10 users per batch)
/// - Aggregates encrypted amounts using FHE operations
/// - Executes single decrypted swap on DEX (USDC → ETH)
/// - Distributes purchased tokens proportionally using encrypted calculations
contract BatchExecutor is SepoliaConfig {
    IDCAIntentRegistry public immutable registry;
    address public dexAdapter;
    address public usdcVault;
    address public rewardVault; // e.g., WETH vault

    uint256 public minBatchUsers; // e.g., 10
    uint256 public maxBatchUsers; // e.g., 20
    uint256 public batchTimeout; // e.g., 300 seconds (5 minutes)

    address public owner;

    error OnlyOwner();
    error InvalidBatch();
    error BatchNotReady();
    error InsufficientParticipants();

    event BatchPrepared(uint256 indexed batchId, uint256 userCount, uint256 totalAmount);
    event BatchDecryptionRequested(uint256 indexed batchId, uint256 requestId);
    event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal);
    event BatchExecuted(uint256 indexed batchId, uint256 ethReceived, uint256 userCount);
    event BatchTimeout(uint256 indexed batchId);

    uint256 private _nextBatchId = 1;
    
    struct BatchMeta {
        euint64 encryptedTotal;
        bytes32 usersHash;
        bool finalized;
        uint64 decryptedTotal;
        uint256 requestId;
        uint256 createdAt;
        uint256 deadline;
        address[] participants;
        mapping(address => euint64) participantAmounts;
        mapping(address => euint64) proportionalShares; // Encrypted proportional shares
    }
    
    mapping(uint256 => BatchMeta) private _batches;
    mapping(uint256 => uint256) private _requestIdToBatchId;

    constructor(
        address registry_, 
        address dexAdapter_, 
        uint256 minBatchUsers_,
        uint256 maxBatchUsers_,
        uint256 batchTimeout_
    ) {
        owner = msg.sender;
        registry = IDCAIntentRegistry(registry_);
        dexAdapter = dexAdapter_;
        minBatchUsers = minBatchUsers_;
        maxBatchUsers = maxBatchUsers_;
        batchTimeout = batchTimeout_;
    }

    function setOwner(address newOwner) external {
        if (msg.sender != owner) revert OnlyOwner();
        owner = newOwner;
    }

    function setDexAdapter(address newDex) external {
        if (msg.sender != owner) revert OnlyOwner();
        dexAdapter = newDex;
    }

    function setUsdcVault(address newVault) external {
        if (msg.sender != owner) revert OnlyOwner();
        usdcVault = newVault;
    }

    function setRewardVault(address newVault) external {
        if (msg.sender != owner) revert OnlyOwner();
        rewardVault = newVault;
    }

    function setBatchConfig(uint256 minUsers, uint256 maxUsers, uint256 timeout) external {
        if (msg.sender != owner) revert OnlyOwner();
        minBatchUsers = minUsers;
        maxBatchUsers = maxUsers;
        batchTimeout = timeout;
    }

    /// @notice Execute a batch for the given users; sums encrypted per-interval amounts
    /// @dev Aggregates encrypted amounts using FHE operations without revealing individual contributions
    function executeBatch(address[] calldata users) external returns (uint256 batchId, euint64 encryptedTotal) {
        uint256 len = users.length;
        if (len < minBatchUsers) revert InsufficientParticipants();
        if (len > maxBatchUsers) revert InvalidBatch();

        // Sum encrypted per-interval amounts
        euint64 sumEnc = FHE.asEuint64(0);
        BatchMeta storage batch = _batches[_nextBatchId];
        
        // Initialize batch metadata
        batch.participants = new address[](len);
        batch.createdAt = block.timestamp;
        batch.deadline = block.timestamp + batchTimeout;
        
        for (uint256 i = 0; i < len; i++) {
            address user = users[i];
            batch.participants[i] = user;
            
            // Get user's encrypted amount per interval
            (, euint64 amountPerInterval, , , , bool active) = registry.getParamsFor(user);
            if (!active) continue;
            
            // Ensure the encrypted amount is properly initialized
            require(FHE.isInitialized(amountPerInterval), "Uninitialized amount");
            
            // Store individual amounts for proportional distribution
            batch.participantAmounts[user] = amountPerInterval;
            
            // Aggregate total
            sumEnc = FHE.add(sumEnc, amountPerInterval);
        }
        
        encryptedTotal = sumEnc;
        batch.encryptedTotal = sumEnc;
        batch.usersHash = keccak256(abi.encode(users));
        
        // Calculate proportional shares for each participant
        _calculateProportionalShares(_nextBatchId, sumEnc);

        batchId = _nextBatchId++;
        
        emit BatchPrepared(batchId, len, 0); // Total amount will be revealed after decryption
        
        // Request decryption of the total amount
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(sumEnc);
        uint256 requestId = FHE.requestDecryption(handles, this.onDecryptionFulfilled.selector);
        batch.requestId = requestId;
        _requestIdToBatchId[requestId] = batchId;
        
        emit BatchDecryptionRequested(batchId, requestId);
    }

    /// @notice Finalize batch execution after decryption is complete
    /// @dev Executes single decrypted swap on DEX and distributes tokens proportionally
    function finalizeBatchExecution(
        uint256 batchId,
        uint256 minEthOut,
        uint24 poolFee
    ) external {
        BatchMeta storage batch = _batches[batchId];
        if (batch.finalized) revert InvalidBatch();
        if (batch.decryptedTotal == 0) revert BatchNotReady();
        
        batch.finalized = true;
        
        // Execute single swap on DEX
        ITokenVault(usdcVault).transferOut(dexAdapter, batch.decryptedTotal);
        IDexAdapter dex = IDexAdapter(dexAdapter);
        uint256 ethReceived = dex.swapUsdcForEth(
            batch.decryptedTotal, 
            minEthOut, 
            rewardVault, 
            poolFee
        );
        
        // Credit proportional shares to reward vault
        _creditProportionalShares(batchId, ethReceived);
        
        emit BatchExecuted(batchId, ethReceived, batch.participants.length);
    }

    /// @notice Force batch execution after timeout
    function forceBatchExecution(uint256 batchId) external {
        BatchMeta storage batch = _batches[batchId];
        if (batch.finalized) revert InvalidBatch();
        if (block.timestamp < batch.deadline) revert BatchNotReady();
        
        // If decryption hasn't completed, use a fallback mechanism
        if (batch.decryptedTotal == 0) {
            // In a real implementation, you might have a fallback oracle or manual intervention
            revert("Decryption not complete");
        }
        
        batch.finalized = true;
        emit BatchTimeout(batchId);
    }

    function onDecryptionFulfilled(uint256 requestId, bytes[] calldata signatures, uint64[] calldata plaintexts) external {
        FHE.checkSignatures(requestId, signatures);
        uint256 batchId = _requestIdToBatchId[requestId];
        if (batchId == 0) revert InvalidBatch();
        
        uint64 total = plaintexts[0];
        _batches[batchId].decryptedTotal = total;
        
        emit BatchDecryptionFulfilled(batchId, total);
    }

    /// @notice Credit encrypted allocations in the reward vault
    /// @dev Distributes purchased tokens back to users proportionally using encrypted calculations
    function creditAllocations(
        address rewardVaultAddress,
        address[] calldata users,
        externalEuint64[] calldata encAmounts,
        bytes[] calldata proofs
    ) external {
        require(users.length == encAmounts.length && users.length == proofs.length, "Length mismatch");
        IRewardVault(rewardVaultAddress).creditBatch(users, encAmounts, proofs);
    }

    // ============ INTERNAL FUNCTIONS ============

    /// @notice Calculate proportional shares for each participant
    /// @dev Uses FHE operations to maintain privacy of individual amounts
    function _calculateProportionalShares(uint256 batchId, euint64 totalAmount) internal {
        BatchMeta storage batch = _batches[batchId];
        
        for (uint256 i = 0; i < batch.participants.length; i++) {
            address user = batch.participants[i];
            euint64 userAmount = batch.participantAmounts[user];
            
            if (FHE.isInitialized(userAmount)) {
                // Calculate proportional share: (userAmount * 1e18) / totalAmount
                // This gives us the share in basis points (1e18 = 100%)
                euint64 share = FHE.div(FHE.mul(userAmount, FHE.asEuint64(1e18)), totalAmount);
                batch.proportionalShares[user] = share;
            }
        }
    }

    /// @notice Credit proportional shares to the reward vault
    /// @dev Converts encrypted proportional shares to external format for vault
    function _creditProportionalShares(uint256 batchId, uint256 totalEthReceived) internal {
        BatchMeta storage batch = _batches[batchId];
        externalEuint64[] memory externalShares = new externalEuint64[](batch.participants.length);
        
        for (uint256 i = 0; i < batch.participants.length; i++) {
            address user = batch.participants[i];
            euint64 share = batch.proportionalShares[user];
            
            if (FHE.isInitialized(share)) {
                // Convert to external format for the reward vault
                externalShares[i] = FHE.toExternal(share);
            }
        }
        
        // Credit the shares to the reward vault
        IRewardVault(rewardVault).creditBatch(batch.participants, externalShares, new bytes[](batch.participants.length));
    }

    // ============ VIEW FUNCTIONS ============

    /// @notice Get batch information
    function getBatchInfo(uint256 batchId) external view returns (
        bool finalized,
        uint64 decryptedTotal,
        uint256 createdAt,
        uint256 deadline,
        uint256 participantCount
    ) {
        BatchMeta storage batch = _batches[batchId];
        return (
            batch.finalized,
            batch.decryptedTotal,
            batch.createdAt,
            batch.deadline,
            batch.participants.length
        );
    }

    /// @notice Get batch configuration
    function getBatchConfig() external view returns (
        uint256 minUsers,
        uint256 maxUsers,
        uint256 timeout
    ) {
        return (minBatchUsers, maxBatchUsers, batchTimeout);
    }
}


