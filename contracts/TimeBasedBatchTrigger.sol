// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IDCAIntentRegistry.sol";
import "./interfaces/IBatchExecutor.sol";

/**
 * @title TimeBasedBatchTrigger
 * @dev Handles time-based batch execution as fallback mechanism
 * Features:
 * - Triggers batch execution after specific time intervals
 * - Fallback mechanism when user count thresholds aren't met
 * - Configurable time intervals (1 block, 5 seconds, etc.)
 * - Integration with Chainlink Automation for decentralization
 */
contract TimeBasedBatchTrigger is Ownable, ReentrancyGuard {
    
    IDCAIntentRegistry public immutable registry;
    IBatchExecutor public immutable batchExecutor;
    
    // Time-based configuration
    uint256 public batchInterval; // Time between batch executions (e.g., 300 seconds = 5 minutes)
    uint256 public lastBatchTime;
    uint256 public minBatchSize; // Minimum users required for time-based execution
    
    // Automation configuration
    address public automationOperator;
    bool public automationEnabled;
    
    // Events
    event BatchIntervalUpdated(uint256 newInterval);
    event TimeBasedBatchTriggered(uint256 timestamp, uint256 participantCount);
    event AutomationOperatorUpdated(address newOperator);
    event AutomationToggled(bool enabled);
    
    // Errors
    error InsufficientParticipants();
    error BatchNotReady();
    error Unauthorized();
    error InvalidInterval();
    
    constructor(
        address _registry,
        address _batchExecutor,
        uint256 _batchInterval,
        uint256 _minBatchSize
    ) {
        registry = IDCAIntentRegistry(_registry);
        batchExecutor = IBatchExecutor(_batchExecutor);
        batchInterval = _batchInterval;
        minBatchSize = _minBatchSize;
        lastBatchTime = block.timestamp;
        automationEnabled = true;
    }
    
    /**
     * @dev Check if batch should be executed based on time
     * @return shouldExecute Whether batch should be executed
     * @return timeSinceLastBatch Time elapsed since last batch
     */
    function shouldExecuteBatch() external view returns (bool shouldExecute, uint256 timeSinceLastBatch) {
        timeSinceLastBatch = block.timestamp - lastBatchTime;
        shouldExecute = timeSinceLastBatch >= batchInterval;
        
        if (shouldExecute) {
            // Check if there are enough participants
            (uint32 participantCount, , , , ) = registry.getCurrentBatchInfo();
            shouldExecute = participantCount >= minBatchSize;
        }
    }
    
    /**
     * @dev Execute batch based on time trigger
     * Can be called by automation service or manually
     */
    function executeTimeBasedBatch() external nonReentrant {
        // Check if enough time has passed
        require(block.timestamp - lastBatchTime >= batchInterval, "Batch interval not met");
        
        // Get current batch info
        (uint32 participantCount, , , address[] memory participants, ) = registry.getCurrentBatchInfo();
        
        // Check minimum participants
        if (participantCount < minBatchSize) {
            revert InsufficientParticipants();
        }
        
        // Execute the batch
        _executeBatch(participants);
        
        // Update last batch time
        lastBatchTime = block.timestamp;
        
        emit TimeBasedBatchTriggered(block.timestamp, participantCount);
    }
    
    /**
     * @dev Force batch execution (emergency function)
     * Only callable by owner or automation operator
     */
    function forceBatchExecution() external {
        if (msg.sender != owner() && msg.sender != automationOperator) {
            revert Unauthorized();
        }
        
        (uint32 participantCount, , , address[] memory participants, ) = registry.getCurrentBatchInfo();
        
        if (participantCount == 0) {
            revert InsufficientParticipants();
        }
        
        _executeBatch(participants);
        lastBatchTime = block.timestamp;
        
        emit TimeBasedBatchTriggered(block.timestamp, participantCount);
    }
    
    /**
     * @dev Execute batch through the registry
     */
    function _executeBatch(address[] memory participants) internal {
        // Call the registry's executeBatch function
        registry.executeBatch();
    }
    
    /**
     * @dev Get batch execution status
     */
    function getBatchStatus() external view returns (
        uint256 timeSinceLastBatch,
        uint256 timeUntilNextBatch,
        bool canExecute,
        uint32 currentParticipants
    ) {
        timeSinceLastBatch = block.timestamp - lastBatchTime;
        timeUntilNextBatch = timeSinceLastBatch >= batchInterval ? 0 : batchInterval - timeSinceLastBatch;
        
        (uint32 participantCount, , , , ) = registry.getCurrentBatchInfo();
        currentParticipants = participantCount;
        
        canExecute = timeSinceLastBatch >= batchInterval && participantCount >= minBatchSize;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update batch interval
     */
    function setBatchInterval(uint256 _newInterval) external onlyOwner {
        if (_newInterval == 0) revert InvalidInterval();
        batchInterval = _newInterval;
        emit BatchIntervalUpdated(_newInterval);
    }
    
    /**
     * @dev Update minimum batch size
     */
    function setMinBatchSize(uint256 _newMinSize) external onlyOwner {
        minBatchSize = _newMinSize;
    }
    
    /**
     * @dev Set automation operator (e.g., Chainlink Automation)
     */
    function setAutomationOperator(address _newOperator) external onlyOwner {
        automationOperator = _newOperator;
        emit AutomationOperatorUpdated(_newOperator);
    }
    
    /**
     * @dev Toggle automation on/off
     */
    function toggleAutomation() external onlyOwner {
        automationEnabled = !automationEnabled;
        emit AutomationToggled(automationEnabled);
    }
    
    /**
     * @dev Emergency function to update last batch time
     */
    function updateLastBatchTime(uint256 _newTime) external onlyOwner {
        lastBatchTime = _newTime;
    }
    
    // ============ AUTOMATION FUNCTIONS ============
    
    /**
     * @dev Function for Chainlink Automation to call
     * Checks if batch should be executed and executes if conditions are met
     */
    function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData) {
        if (!automationEnabled) {
            return (false, "");
        }
        
        (bool shouldExecute, ) = this.shouldExecuteBatch();
        upkeepNeeded = shouldExecute;
        performData = "";
    }
    
    /**
     * @dev Function for Chainlink Automation to execute
     */
    function performUpkeep(bytes calldata) external {
        if (msg.sender != automationOperator) {
            revert Unauthorized();
        }
        
        this.executeTimeBasedBatch();
    }
}
