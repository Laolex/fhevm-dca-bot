// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IDCAIntentRegistry} from "./interfaces/IDCAIntentRegistry.sol";
import {ITokenVault} from "./interfaces/ITokenVault.sol";
import {IRewardVault, IRewardVaultInternalCredit} from "./interfaces/IRewardVault.sol";
import {IDexAdapter} from "./interfaces/IDexAdapter.sol";

/// @title BatchExecutor
/// @notice Aggregates encrypted DCA amounts, reveals batch totals, and triggers a single DEX swap (stub)
contract BatchExecutor is SepoliaConfig {
    IDCAIntentRegistry public immutable registry;
    address public dexAdapter;
    address public usdcVault;
    address public rewardVault; // e.g., WETH vault

    uint256 public minBatchUsers; // e.g., 10

    address public owner;

    error OnlyOwner();
    error InvalidBatch();

    event BatchPrepared(uint256 indexed batchId, uint256 userCount);
    event BatchDecryptionRequested(uint256 indexed batchId, uint256 requestId);
    event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal);

    uint256 private _nextBatchId = 1;
    struct BatchMeta {
        euint64 encryptedTotal;
        bytes32 usersHash;
        bool finalized;
        uint64 decryptedTotal;
        uint256 requestId;
    }
    mapping(uint256 => BatchMeta) private _batches;
    mapping(uint256 => uint256) private _requestIdToBatchId;

    constructor(address registry_, address dexAdapter_, uint256 minBatchUsers_) {
        owner = msg.sender;
        registry = IDCAIntentRegistry(registry_);
        dexAdapter = dexAdapter_;
        minBatchUsers = minBatchUsers_;
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

    /// @notice Finalize using oracle-decrypted aggregate stored in batch metadata
    function finalizeBatchWithOracle(
        uint256 batchId,
        address[] calldata users,
        uint256 minEthOut,
        uint24 poolFee,
        address rewardVaultAddress,
        address usdcVaultAddress,
        address dexAdapterAddress
    ) external {
        BatchMeta storage meta = _batches[batchId];
        if (meta.finalized) revert InvalidBatch();
        if (meta.usersHash != keccak256(abi.encode(users))) revert InvalidBatch();
        uint256 amountIn = uint256(meta.decryptedTotal);
        require(amountIn > 0, "no-decrypted-total");
        meta.finalized = true;
        ITokenVault(usdcVaultAddress).transferOut(dexAdapterAddress, amountIn);
        IDexAdapter dex = IDexAdapter(dexAdapterAddress);
        uint256 amountOut = dex.swapUsdcForEth(amountIn, minEthOut, rewardVaultAddress, poolFee);
        amountOut;
    }

    /// @notice Finalize a previously prepared batch by depositing purchased tokens and crediting encrypted allocations
    /// @dev Off-chain computes per-user encrypted allocations encAmounts using proportional shares; this function only records them
    function finalizeBatch(
        uint256 batchId,
        address[] calldata users,
        uint256 usdcToSwap,
        uint256 minEthOut,
        uint24 poolFee,
        address rewardVaultAddress,
        address usdcVaultAddress,
        address dexAdapterAddress
    ) external {
        BatchMeta storage meta = _batches[batchId];
        if (meta.finalized) revert InvalidBatch();
        if (meta.usersHash != keccak256(abi.encode(users))) revert InvalidBatch();
        meta.finalized = true;
        // Move USDC from vault to dex adapter, perform on-chain swap to reward vault
        ITokenVault(usdcVaultAddress).transferOut(dexAdapterAddress, usdcToSwap);
        IDexAdapter dex = IDexAdapter(dexAdapterAddress);
        uint256 amountOut = dex.swapUsdcForEth(usdcToSwap, minEthOut, rewardVaultAddress, poolFee);
        amountOut; // silence unused warning for now
    }

    function setMinBatchUsers(uint256 k) external {
        if (msg.sender != owner) revert OnlyOwner();
        minBatchUsers = k;
    }

    /// @notice Execute a batch for the given users; sums encrypted per-interval amounts and returns encrypted total
    /// @dev Off-chain automation can decrypt the encrypted total and perform the swap via a separate flow
    function executeBatch(address[] calldata users) external returns (uint256 batchId, euint64 encryptedTotal) {
        uint256 len = users.length;
        if (len < minBatchUsers) revert InvalidBatch();

        // Sum encrypted per-interval amounts
        euint64 sumEnc = FHE.asEuint64(0);
        for (uint256 i = 0; i < len; i++) {
            (, euint64 amountPerInterval, , , , bool active) = registry.getParamsFor(users[i]);
            if (!active) continue;
            sumEnc = FHE.add(sumEnc, amountPerInterval);
        }
        encryptedTotal = sumEnc;
        // Update each user's spent by one interval amount
        registry.incrementSpentForUsers(users);

        batchId = _nextBatchId++;
        _batches[batchId] = BatchMeta({
            encryptedTotal: sumEnc,
            usersHash: keccak256(abi.encode(users)),
            finalized: false,
            decryptedTotal: 0,
            requestId: 0
        });
        emit BatchPrepared(batchId, len);
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(sumEnc);
        uint256 requestId = FHE.requestDecryption(handles, this.onDecryptionFulfilled.selector);
        _batches[batchId].requestId = requestId;
        _requestIdToBatchId[requestId] = batchId;
        emit BatchDecryptionRequested(batchId, requestId);
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
    /// @dev Off-chain computes encrypted per-user deltas and passes external handles + proofs; vault converts to euint64
    function creditAllocations(
        address rewardVaultAddress,
        address[] calldata users,
        externalEuint64[] calldata encAmounts,
        bytes[] calldata proofs
    ) external {
        require(users.length == encAmounts.length && users.length == proofs.length, "len");
        IRewardVault(rewardVaultAddress).creditBatch(users, encAmounts, proofs);
    }
}


