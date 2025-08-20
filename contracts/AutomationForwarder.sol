// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BatchExecutor} from "./BatchExecutor.sol";

interface IAutomationCompatible {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

/// @title AutomationForwarder
/// @notice Minimal keeper-compatible forwarder: off-chain sets performData, keeper triggers performUpkeep
contract AutomationForwarder is IAutomationCompatible {
    address public owner;
    BatchExecutor public executor;

    bytes private _pendingPerformData;
    bool private _hasPending;

    event Proposed(bytes performData);
    event Consumed(bytes performData);

    error OnlyOwner();

    constructor(address executor_) {
        owner = msg.sender;
        executor = BatchExecutor(executor_);
    }

    function setOwner(address newOwner) external {
        if (msg.sender != owner) revert OnlyOwner();
        owner = newOwner;
    }

    function setExecutor(address newExec) external {
        if (msg.sender != owner) revert OnlyOwner();
        executor = BatchExecutor(newExec);
    }

    /// @notice Propose a performData payload (ABI enc: address[] users)
    function propose(bytes calldata performData) external {
        _pendingPerformData = performData;
        _hasPending = true;
        emit Proposed(performData);
    }

    function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData) {
        if (_hasPending) {
            return (true, _pendingPerformData);
        }
        return (false, bytes(""));
    }

    function performUpkeep(bytes calldata performData) external {
        if (!_hasPending) return;
        // Consume
        _hasPending = false;
        bytes memory pd = _pendingPerformData;
        _pendingPerformData = bytes("");
        emit Consumed(pd);

        // Decode and call executor
        (address[] memory users) = abi.decode(performData, (address[]));
        executor.executeBatch(users);
    }
}


