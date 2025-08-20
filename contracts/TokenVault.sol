// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IDCAIntentRegistry} from "./interfaces/IDCAIntentRegistry.sol";

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/// @title TokenVault
/// @notice Custody for ERC20 with encrypted per-user accounting (prototype)
contract TokenVault is SepoliaConfig {
    IERC20 public immutable token;
    address public owner;
    address public authorizedExecutor;

    mapping(address => euint64) private _encBalances;

    error OnlyOwner();
    error OnlyExecutor();

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event ExecutorUpdated(address indexed newExecutor);

    constructor(address token_) {
        owner = msg.sender;
        token = IERC20(token_);
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

    function deposit(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount));
        euint64 prev = _encBalances[msg.sender];
        euint64 delta = FHE.asEuint64(uint64(amount));
        _encBalances[msg.sender] = FHE.add(prev, delta);
        FHE.allowThis(_encBalances[msg.sender]);
        FHE.allow(_encBalances[msg.sender], msg.sender);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        // Prototype: do not check encrypted underflow on-chain; only allow withdraw if liquid
        require(token.transfer(msg.sender, amount));
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

    /// @notice Decrease each user's encrypted balance by their amountPerInterval from the registry
    function batchDebitFromRegistry(address registry, address[] calldata users) external {
        if (msg.sender != authorizedExecutor) revert OnlyExecutor();
        IDCAIntentRegistry reg = IDCAIntentRegistry(registry);
        uint256 len = users.length;
        for (uint256 i = 0; i < len; i++) {
            address user = users[i];
            (, euint64 amountPerInterval, , , , bool active) = reg.getParamsFor(user);
            if (!active) continue;
            _encBalances[user] = FHE.sub(_encBalances[user], amountPerInterval);
            FHE.allowThis(_encBalances[user]);
            FHE.allow(_encBalances[user], user);
        }
    }

    /// @notice Transfer pooled tokens out (e.g., to DEX adapter)
    function transferOut(address to, uint256 amount) external {
        if (msg.sender != authorizedExecutor) revert OnlyExecutor();
        require(token.transfer(to, amount));
    }
}


