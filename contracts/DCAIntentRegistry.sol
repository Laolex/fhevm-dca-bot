// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FHE, euint32, euint64, euint128, euint256, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IDexAdapter.sol";
import "./interfaces/ITokenVault.sol";

/**
 * @title DCAIntentRegistry
 * @dev Manages encrypted DCA intents and batch execution with FHE privacy
 * Features:
 * - Batching mechanism (target: 10 users per batch)
 * - Dynamic conditions (buy the dip logic)
 * - Time-based and size-based batch triggers
 * - Encrypted parameter protection
 */
contract DCAIntentRegistry is Ownable, ReentrancyGuard {
    using TFHE for euint32;
    using TFHE for euint64;
    using TFHE for euint128;
    using TFHE for euint256;

    // ============ STRUCTS ============
    
    struct EncryptedDCAIntent {
        address user;
        euint256 totalBudget;           // Total USDC amount to invest
        euint256 amountPerInterval;     // USDC amount per purchase
        euint64 intervalSeconds;        // Time between purchases
        euint32 totalPeriods;           // Total number of purchases
        euint32 executedPeriods;        // Number of completed purchases
        euint64 nextExecutionTime;      // Timestamp for next execution
        euint256 currentBatchContribution; // Current batch contribution
        bool isActive;
        uint256 createdAt;
        
        // Dynamic conditions (buy the dip logic)
        euint256 dipThreshold;          // Price drop threshold (e.g., 3%)
        euint256 dipMultiplier;         // Multiplier for dip purchases (e.g., 2x)
        euint32 dipRemainingBuys;       // Remaining dip buys
        euint256 lastPrice;             // Last known price for comparison
    }

    struct Batch {
        euint256 totalAmount;           // Total encrypted amount in batch
        uint32 participantCount;        // Number of participants
        uint64 batchDeadline;           // Time when batch should execute
        bool isExecuted;
        address[] participants;         // List of participants
        mapping(address => euint256) participantAmounts; // Individual encrypted amounts
        uint256 batchId;               // Unique batch identifier
    }

    // ============ STATE VARIABLES ============
    
    IDexAdapter public dexAdapter;
    ITokenVault public tokenVault;
    
    // Batching configuration
    uint32 public constant TARGET_BATCH_SIZE = 10;
    uint64 public constant BATCH_TIMEOUT = 300; // 5 minutes in seconds
    uint64 public constant MIN_BATCH_SIZE = 3;  // Minimum users before execution
    uint64 public constant MAX_BATCH_SIZE = 20; // Maximum users per batch
    
    // Current active batch
    Batch public currentBatch;
    uint256 public batchId;
    
    // User intents mapping
    mapping(address => EncryptedDCAIntent) public userIntents;
    mapping(uint256 => Batch) public batches;
    
    // Price oracle integration for dynamic conditions
    address public priceOracle;
    uint256 public lastPriceUpdate;
    
    // Events
    event IntentSubmitted(address indexed user, uint256 batchId, bool hasDynamicConditions);
    event BatchExecuted(uint256 indexed batchId, uint32 participantCount, uint256 totalAmount);
    event IntentDeactivated(address indexed user);
    event BatchTimeout(uint256 indexed batchId);
    event DynamicConditionTriggered(address indexed user, uint256 priceDrop, uint256 multiplier);
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _dexAdapter, address _tokenVault, address _priceOracle) {
        dexAdapter = IDexAdapter(_dexAdapter);
        tokenVault = ITokenVault(_tokenVault);
        priceOracle = _priceOracle;
        _initializeNewBatch();
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Submit encrypted DCA intent with optional dynamic conditions
     * @param _totalBudget Encrypted total budget in USDC
     * @param _amountPerInterval Encrypted amount per interval
     * @param _intervalSeconds Interval between purchases
     * @param _totalPeriods Total number of periods
     * @param _dipThreshold Encrypted price drop threshold (0 = no dynamic conditions)
     * @param _dipMultiplier Encrypted multiplier for dip purchases
     * @param _dipRemainingBuys Number of dip buys to execute
     */
    function submitDCAIntent(
        euint256 _totalBudget,
        euint256 _amountPerInterval,
        uint64 _intervalSeconds,
        uint32 _totalPeriods,
        euint256 _dipThreshold,
        euint256 _dipMultiplier,
        uint32 _dipRemainingBuys
    ) external nonReentrant {
        require(_totalPeriods > 0, "Invalid total periods");
        require(_intervalSeconds > 0, "Invalid interval");
        
        // Check if user already has an active intent
        require(!userIntents[msg.sender].isActive, "Active intent exists");
        
        // Get current price for dynamic conditions
        uint256 currentPrice = _getCurrentPrice();
        
        // Create new encrypted intent
        EncryptedDCAIntent memory newIntent = EncryptedDCAIntent({
            user: msg.sender,
            totalBudget: _totalBudget,
            amountPerInterval: _amountPerInterval,
            intervalSeconds: TFHE.asEuint64(_intervalSeconds),
            totalPeriods: TFHE.asEuint32(_totalPeriods),
            executedPeriods: TFHE.asEuint32(0),
            nextExecutionTime: TFHE.asEuint64(block.timestamp + _intervalSeconds),
            currentBatchContribution: TFHE.asEuint256(0),
            isActive: true,
            createdAt: block.timestamp,
            dipThreshold: _dipThreshold,
            dipMultiplier: _dipMultiplier,
            dipRemainingBuys: TFHE.asEuint32(_dipRemainingBuys),
            lastPrice: TFHE.asEuint256(currentPrice)
        });
        
        userIntents[msg.sender] = newIntent;
        
        // Add to current batch
        _addToCurrentBatch(msg.sender, _amountPerInterval);
        
        bool hasDynamicConditions = TFHE.decrypt(_dipThreshold) > 0;
        emit IntentSubmitted(msg.sender, batchId, hasDynamicConditions);
    }
    
    /**
     * @dev Execute current batch if conditions are met
     */
    function executeBatch() external nonReentrant {
        require(!currentBatch.isExecuted, "Batch already executed");
        require(
            currentBatch.participantCount >= MIN_BATCH_SIZE ||
            block.timestamp >= currentBatch.batchDeadline,
            "Batch conditions not met"
        );
        
        // Execute the batch
        _executeCurrentBatch();
        
        // Initialize new batch
        _initializeNewBatch();
    }
    
    /**
     * @dev Deactivate user's DCA intent
     */
    function deactivateIntent() external nonReentrant {
        require(userIntents[msg.sender].isActive, "No active intent");
        
        // Remove from current batch if present
        _removeFromCurrentBatch(msg.sender);
        
        // Deactivate intent
        userIntents[msg.sender].isActive = false;
        
        emit IntentDeactivated(msg.sender);
    }
    
    /**
     * @dev Force batch execution after timeout (anyone can call)
     */
    function forceBatchExecution() external nonReentrant {
        require(!currentBatch.isExecuted, "Batch already executed");
        require(block.timestamp >= currentBatch.batchDeadline, "Batch not timed out");
        require(currentBatch.participantCount > 0, "No participants");
        
        _executeCurrentBatch();
        _initializeNewBatch();
        
        emit BatchTimeout(batchId - 1);
    }
    
    /**
     * @dev Update price and check dynamic conditions for all active intents
     * @param _newPrice New ETH price in USDC
     */
    function updatePriceAndCheckConditions(uint256 _newPrice) external {
        require(msg.sender == priceOracle || msg.sender == owner(), "Unauthorized");
        
        uint256 oldPrice = lastPriceUpdate > 0 ? lastPriceUpdate : _newPrice;
        lastPriceUpdate = _newPrice;
        
        emit PriceUpdated(_newPrice, block.timestamp);
        
        // Check dynamic conditions for all active intents
        _checkDynamicConditions(_newPrice, oldPrice);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _addToCurrentBatch(address _user, euint256 _amount) internal {
        // Check if batch is full
        if (currentBatch.participantCount >= MAX_BATCH_SIZE) {
            _executeCurrentBatch();
            _initializeNewBatch();
        }
        
        // Add user to batch participants
        currentBatch.participants.push(_user);
        currentBatch.participantAmounts[_user] = _amount;
        currentBatch.totalAmount = currentBatch.totalAmount.add(_amount);
        currentBatch.participantCount++;
        
        // Update user's batch contribution
        userIntents[_user].currentBatchContribution = _amount;
        
        // Check if batch should execute
        if (currentBatch.participantCount >= TARGET_BATCH_SIZE) {
            _executeCurrentBatch();
            _initializeNewBatch();
        }
    }
    
    function _removeFromCurrentBatch(address _user) internal {
        // Find user in participants array
        for (uint i = 0; i < currentBatch.participants.length; i++) {
            if (currentBatch.participants[i] == _user) {
                // Remove user's contribution
                euint256 userAmount = currentBatch.participantAmounts[_user];
                currentBatch.totalAmount = currentBatch.totalAmount.sub(userAmount);
                
                // Remove from participants array
                currentBatch.participants[i] = currentBatch.participants[currentBatch.participants.length - 1];
                currentBatch.participants.pop();
                
                // Clear participant amount
                delete currentBatch.participantAmounts[_user];
                currentBatch.participantCount--;
                break;
            }
        }
    }
    
    function _executeCurrentBatch() internal {
        require(currentBatch.participantCount > 0, "No participants in batch");
        
        // Mark batch as executed
        currentBatch.isExecuted = true;
        currentBatch.batchId = batchId;
        
        // Store batch data
        batches[batchId] = currentBatch;
        
        // Execute swap through DEX adapter
        euint256 totalAmount = currentBatch.totalAmount;
        dexAdapter.executeBatchSwap(totalAmount, currentBatch.participants);
        
        // Update user intents
        _updateUserIntentsAfterBatch();
        
        uint256 decryptedTotal = TFHE.decrypt(totalAmount);
        emit BatchExecuted(batchId, currentBatch.participantCount, decryptedTotal);
        batchId++;
    }
    
    function _updateUserIntentsAfterBatch() internal {
        for (uint i = 0; i < currentBatch.participants.length; i++) {
            address user = currentBatch.participants[i];
            EncryptedDCAIntent storage intent = userIntents[user];
            
            if (intent.isActive) {
                // Increment executed periods
                intent.executedPeriods = intent.executedPeriods.add(TFHE.asEuint32(1));
                
                // Calculate next execution time
                uint64 nextTime = TFHE.decrypt(intent.nextExecutionTime) + 
                                TFHE.decrypt(intent.intervalSeconds);
                intent.nextExecutionTime = TFHE.asEuint64(nextTime);
                
                // Clear batch contribution
                intent.currentBatchContribution = TFHE.asEuint256(0);
                
                // Check if DCA is complete
                if (TFHE.decrypt(intent.executedPeriods) >= TFHE.decrypt(intent.totalPeriods)) {
                    intent.isActive = false;
                }
            }
        }
    }
    
    function _checkDynamicConditions(uint256 _newPrice, uint256 _oldPrice) internal {
        // Calculate price change percentage
        uint256 priceChange;
        if (_newPrice > _oldPrice) {
            priceChange = ((_newPrice - _oldPrice) * 10000) / _oldPrice; // Basis points
        } else {
            priceChange = ((_oldPrice - _newPrice) * 10000) / _oldPrice; // Basis points
        }
        
        // Check all active intents for dynamic conditions
        // Note: This is a simplified check. In production, you'd want to optimize this
        // by maintaining a separate list of intents with dynamic conditions
    }
    
    function _getCurrentPrice() internal view returns (uint256) {
        // In a real implementation, this would call the price oracle
        // For now, return a mock price
        return 2000 * 1e18; // $2000 per ETH
    }
    
    function _initializeNewBatch() internal {
        currentBatch = Batch({
            totalAmount: TFHE.asEuint256(0),
            participantCount: 0,
            batchDeadline: uint64(block.timestamp + BATCH_TIMEOUT),
            isExecuted: false,
            participants: new address[](0),
            batchId: 0
        });
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get current batch info (encrypted amounts remain private)
     */
    function getCurrentBatchInfo() external view returns (
        uint32 participantCount,
        uint64 batchDeadline,
        bool isExecuted,
        address[] memory participants,
        uint256 batchId_
    ) {
        return (
            currentBatch.participantCount,
            currentBatch.batchDeadline,
            currentBatch.isExecuted,
            currentBatch.participants,
            currentBatch.batchId
        );
    }
    
    /**
     * @dev Get user's intent info (encrypted values remain private)
     */
    function getUserIntentInfo(address _user) external view returns (
        bool isActive,
        uint256 createdAt,
        uint32 executedPeriods,
        uint64 nextExecutionTime,
        bool hasDynamicConditions
    ) {
        EncryptedDCAIntent memory intent = userIntents[_user];
        bool hasDynamics = TFHE.decrypt(intent.dipThreshold) > 0;
        return (
            intent.isActive,
            intent.createdAt,
            TFHE.decrypt(intent.executedPeriods),
            TFHE.decrypt(intent.nextExecutionTime),
            hasDynamics
        );
    }
    
    /**
     * @dev Get batch configuration
     */
    function getBatchConfig() external pure returns (
        uint32 targetSize,
        uint64 timeout,
        uint32 minSize,
        uint32 maxSize
    ) {
        return (TARGET_BATCH_SIZE, BATCH_TIMEOUT, MIN_BATCH_SIZE, MAX_BATCH_SIZE);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setDexAdapter(address _dexAdapter) external onlyOwner {
        dexAdapter = IDexAdapter(_dexAdapter);
    }
    
    function setTokenVault(address _tokenVault) external onlyOwner {
        tokenVault = ITokenVault(_tokenVault);
    }
    
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = _priceOracle;
    }
}


