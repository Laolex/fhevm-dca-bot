// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BatchExecutor} from "./BatchExecutor.sol";
import {IDCAIntentRegistry} from "./interfaces/IDCAIntentRegistry.sol";

/// @title TimeBasedBatchTrigger
/// @notice Chainlink Automation-compatible contract for time-based batch execution
/// @dev Triggers batches based on time intervals, regardless of user count
contract TimeBasedBatchTrigger {
    BatchExecutor public immutable batchExecutor;
    IDCAIntentRegistry public immutable registry;
    
    uint256 public lastExecutionTime;
    uint256 public executionInterval; // in seconds
    uint256 public minBatchUsers;
    
    address public owner;
    
    event BatchTriggered(uint256 timestamp, uint256 userCount);
    event ExecutionIntervalUpdated(uint256 newInterval);
    
    error OnlyOwner();
    error TooSoon();
    error NoActiveUsers();
    
    constructor(
        address _batchExecutor,
        address _registry,
        uint256 _executionInterval,
        uint256 _minBatchUsers
    ) {
        batchExecutor = BatchExecutor(_batchExecutor);
        registry = IDCAIntentRegistry(_registry);
        executionInterval = _executionInterval;
        minBatchUsers = _minBatchUsers;
        owner = msg.sender;
        lastExecutionTime = block.timestamp;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    /// @notice Check if upkeep is needed (Chainlink Automation interface)
    function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData) {
        // Check if enough time has passed
        if (block.timestamp < lastExecutionTime + executionInterval) {
            return (false, bytes(""));
        }
        
        // Get all users with active intents
        address[] memory activeUsers = getActiveUsers();
        
        if (activeUsers.length < minBatchUsers) {
            return (false, bytes(""));
        }
        
        // Encode the user list for performUpkeep
        performData = abi.encode(activeUsers);
        return (true, performData);
    }
    
    /// @notice Execute the batch (Chainlink Automation interface)
    function performUpkeep(bytes calldata performData) external {
        if (block.timestamp < lastExecutionTime + executionInterval) revert TooSoon();
        
        address[] memory users = abi.decode(performData, (address[]));
        
        if (users.length < minBatchUsers) revert NoActiveUsers();
        
        // Update last execution time
        lastExecutionTime = block.timestamp;
        
        // Execute the batch
        batchExecutor.executeBatch(users);
        
        emit BatchTriggered(block.timestamp, users.length);
    }
    
    /// @notice Get all users with active DCA intents
    function getActiveUsers() public view returns (address[] memory) {
        // This is a simplified implementation
        // In a real scenario, you'd need to maintain a list of active users
        // or query events to find users with active intents
        
        // For now, return an empty array - this would need to be implemented
        // based on how you want to track active users
        return new address[](0);
    }
    
    /// @notice Set execution interval
    function setExecutionInterval(uint256 _interval) external onlyOwner {
        executionInterval = _interval;
        emit ExecutionIntervalUpdated(_interval);
    }
    
    /// @notice Set minimum batch users
    function setMinBatchUsers(uint256 _minUsers) external onlyOwner {
        minBatchUsers = _minUsers;
    }
    
    /// @notice Set owner
    function setOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }
    
    /// @notice Manual trigger for testing
    function manualTrigger(address[] calldata users) external onlyOwner {
        if (users.length < minBatchUsers) revert NoActiveUsers();
        
        batchExecutor.executeBatch(users);
        emit BatchTriggered(block.timestamp, users.length);
    }
}
