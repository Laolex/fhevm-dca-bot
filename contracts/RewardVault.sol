// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IERC20Like {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @title RewardVault
/// @notice Holds purchased tokens (e.g., WETH) and credits encrypted balances to users
contract RewardVault is SepoliaConfig {
    IERC20Like public immutable token;
    address public owner;
    address public authorizedExecutor;

    mapping(address => euint64) private _encBalances;

    error OnlyOwner();
    error OnlyExecutor();

    event Credited(address indexed user);
    event Withdrawn(address indexed user, uint256 amount);
    event ExecutorUpdated(address indexed newExecutor);

    constructor(address token_) {
        owner = msg.sender;
        token = IERC20Like(token_);
    }

    function setOwner(address newOwner) external {
        if (msg.sender != owner) revert OnlyOwner();
        owner = newOwner;
    }

    function setAuthorizedExecutor(address exec) external {
        if (msg.sender != owner) revert OnlyOwner();
        authorizedExecutor = exec;
        emit ExecutorUpdated(exec);
    }

    /// @notice Executor credits per-user amounts as encrypted values, after a batch swap completes
    function creditBatch(
        address[] calldata users,
        externalEuint64[] calldata encAmounts,
        bytes[] calldata proofs
    ) external {
        if (msg.sender != authorizedExecutor) revert OnlyExecutor();
        uint256 len = users.length;
        require(encAmounts.length == len && proofs.length == len, "len");
        for (uint256 i = 0; i < len; i++) {
            euint64 delta = FHE.fromExternal(encAmounts[i], proofs[i]);
            
            // Ensure the delta is properly initialized
            require(FHE.isInitialized(delta), "Uninitialized delta");
            
            _encBalances[users[i]] = FHE.add(_encBalances[users[i]], delta);
            FHE.allowThis(_encBalances[users[i]]);
            FHE.allow(_encBalances[users[i]], users[i]);
            emit Credited(users[i]);
        }
    }

    /// @notice Executor moves purchased tokens into this vault
    function depositFrom(address from, uint256 amount) external {
        if (msg.sender != authorizedExecutor) revert OnlyExecutor();
        require(token.transferFrom(from, address(this), amount));
    }

    function withdraw(uint256 amount) external {
        require(token.transfer(msg.sender, amount));
        // Update encrypted balance
        euint64 prev = _encBalances[msg.sender];
        euint64 delta = FHE.asEuint64(uint64(amount));
        _encBalances[msg.sender] = FHE.sub(prev, delta);
        FHE.allowThis(_encBalances[msg.sender]);
        FHE.allow(_encBalances[msg.sender], msg.sender);
        emit Withdrawn(msg.sender, amount);
    }

    function getMyEncryptedBalance() external view returns (euint64) {
        return _encBalances[msg.sender];
    }

    /// @notice Executor credits a single user's encrypted balance directly
    function creditEncrypted(address user, euint64 delta) external {
        if (msg.sender != authorizedExecutor) revert OnlyExecutor();
        
        // Ensure the delta is properly initialized
        require(FHE.isInitialized(delta), "Uninitialized delta");
        
        _encBalances[user] = FHE.add(_encBalances[user], delta);
        FHE.allowThis(_encBalances[user]);
        FHE.allow(_encBalances[user], user);
        emit Credited(user);
    }
}


