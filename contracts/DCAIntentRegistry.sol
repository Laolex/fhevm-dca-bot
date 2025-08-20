// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title DCAIntentRegistry
/// @notice Stores users' DCA strategy parameters as encrypted values on-chain
/// @dev Parameters remain encrypted; only aggregate usage should be revealed by other contracts
contract DCAIntentRegistry is SepoliaConfig {
    struct EncryptedDCAParams {
        // Total budget to invest (e.g., total USDC)
        euint64 budget;
        // Amount to purchase per interval (USDC amount)
        euint64 amountPerInterval;
        // Frequency in seconds between purchases
        euint32 intervalSeconds;
        // Total number of intervals (or 0 for open-ended until budget consumed)
        euint32 totalIntervals;
        // How much of the budget has been consumed so far
        euint64 spent;
        // Plain flag for lifecycle control
        bool active;
    }

    mapping(address => EncryptedDCAParams) private _paramsByUser;
    mapping(address => bool) private _hasParams;

    address private _owner;
    address private _authorizedExecutor;

    event IntentSubmitted(address indexed user);
    event IntentUpdated(address indexed user);
    event IntentDeactivated(address indexed user);

    error NoIntent();
    error OnlyOwner();
    error OnlyExecutor();

    constructor() {
        _owner = msg.sender;
    }

    /// @notice Submit a new encrypted DCA intent
    function submitIntent(
        externalEuint64 budgetExt,
        bytes calldata budgetProof,
        externalEuint64 amountPerIntervalExt,
        bytes calldata amountPerIntervalProof,
        externalEuint32 intervalSecondsExt,
        bytes calldata intervalSecondsProof,
        externalEuint32 totalIntervalsExt,
        bytes calldata totalIntervalsProof
    ) external {
        euint64 budget = FHE.fromExternal(budgetExt, budgetProof);
        euint64 amountPerInterval = FHE.fromExternal(amountPerIntervalExt, amountPerIntervalProof);
        euint32 intervalSeconds = FHE.fromExternal(intervalSecondsExt, intervalSecondsProof);
        euint32 totalIntervals = FHE.fromExternal(totalIntervalsExt, totalIntervalsProof);

        // Initialize spent to 0
        euint64 spent = FHE.asEuint64(0);

        // Allow contract and user to decrypt their own values where appropriate
        FHE.allowThis(budget);
        FHE.allowThis(amountPerInterval);
        FHE.allowThis(intervalSeconds);
        FHE.allowThis(totalIntervals);
        FHE.allowThis(spent);

        FHE.allow(budget, msg.sender);
        FHE.allow(amountPerInterval, msg.sender);
        FHE.allow(intervalSeconds, msg.sender);
        FHE.allow(totalIntervals, msg.sender);
        FHE.allow(spent, msg.sender);
        // Also allow current authorized executor if set
        if (_authorizedExecutor != address(0)) {
            FHE.allow(budget, _authorizedExecutor);
            FHE.allow(amountPerInterval, _authorizedExecutor);
            FHE.allow(intervalSeconds, _authorizedExecutor);
            FHE.allow(totalIntervals, _authorizedExecutor);
            FHE.allow(spent, _authorizedExecutor);
        }

        _paramsByUser[msg.sender] = EncryptedDCAParams({
            budget: budget,
            amountPerInterval: amountPerInterval,
            intervalSeconds: intervalSeconds,
            totalIntervals: totalIntervals,
            spent: spent,
            active: true
        });
        _hasParams[msg.sender] = true;

        emit IntentSubmitted(msg.sender);
    }

    /// @notice Update an existing intent's encrypted parameters (partial updates allowed via optional flags)
    function updateIntent(
        bool updateBudget,
        externalEuint64 budgetExt,
        bytes calldata budgetProof,
        bool updateAmountPerInterval,
        externalEuint64 amountPerIntervalExt,
        bytes calldata amountPerIntervalProof,
        bool updateIntervalSeconds,
        externalEuint32 intervalSecondsExt,
        bytes calldata intervalSecondsProof,
        bool updateTotalIntervals,
        externalEuint32 totalIntervalsExt,
        bytes calldata totalIntervalsProof
    ) external {
        if (!_hasParams[msg.sender]) revert NoIntent();
        EncryptedDCAParams storage p = _paramsByUser[msg.sender];

        if (updateBudget) {
            euint64 v = FHE.fromExternal(budgetExt, budgetProof);
            FHE.allowThis(v);
            FHE.allow(v, msg.sender);
            p.budget = v;
        }
        if (updateAmountPerInterval) {
            euint64 v = FHE.fromExternal(amountPerIntervalExt, amountPerIntervalProof);
            FHE.allowThis(v);
            FHE.allow(v, msg.sender);
            p.amountPerInterval = v;
        }
        if (updateIntervalSeconds) {
            euint32 v = FHE.fromExternal(intervalSecondsExt, intervalSecondsProof);
            FHE.allowThis(v);
            FHE.allow(v, msg.sender);
            p.intervalSeconds = v;
        }
        if (updateTotalIntervals) {
            euint32 v = FHE.fromExternal(totalIntervalsExt, totalIntervalsProof);
            FHE.allowThis(v);
            FHE.allow(v, msg.sender);
            p.totalIntervals = v;
        }

        emit IntentUpdated(msg.sender);
    }

    /// @notice Deactivate an existing intent (plain boolean)
    function deactivateIntent() external {
        if (!_hasParams[msg.sender]) revert NoIntent();
        _paramsByUser[msg.sender].active = false;
        emit IntentDeactivated(msg.sender);
    }

    /// @notice Return caller's encrypted DCA parameters
    function getMyParams()
        external
        view
        returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalIntervals, euint64 spent, bool active)
    {
        if (!_hasParams[msg.sender]) revert NoIntent();
        EncryptedDCAParams storage p = _paramsByUser[msg.sender];
        return (p.budget, p.amountPerInterval, p.intervalSeconds, p.totalIntervals, p.spent, p.active);
    }

    /// @notice Return target user's encrypted DCA parameters (for other contracts)
    function getParamsFor(address user)
        external
        view
        returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalIntervals, euint64 spent, bool active)
    {
        if (!_hasParams[user]) revert NoIntent();
        EncryptedDCAParams storage p = _paramsByUser[user];
        return (p.budget, p.amountPerInterval, p.intervalSeconds, p.totalIntervals, p.spent, p.active);
    }

    /// @notice Set the authorized batch executor contract
    function setAuthorizedExecutor(address executor) external {
        if (msg.sender != _owner) revert OnlyOwner();
        _authorizedExecutor = executor;
    }

    function getAuthorizedExecutor() external view returns (address) {
        return _authorizedExecutor;
    }

    function getOwner() external view returns (address) {
        return _owner;
    }

    /// @notice Internal helper for batch executors to account for spent budget
    /// @dev The amount parameter is expected to be an encrypted delta to add to `spent`.
    function _incrementSpent(address user, euint64 amountDeltaEncrypted) internal {
        EncryptedDCAParams storage p = _paramsByUser[user];
        p.spent = FHE.add(p.spent, amountDeltaEncrypted);
        // Keep decryption allowances up to date
        FHE.allowThis(p.spent);
        FHE.allow(p.spent, user);
    }

    /// @notice Increase spent by one interval amount for each user (authorized executor only)
    function incrementSpentForUsers(address[] calldata users) external {
        if (msg.sender != _authorizedExecutor) revert OnlyExecutor();
        uint256 len = users.length;
        for (uint256 i = 0; i < len; i++) {
            address user = users[i];
            if (!_hasParams[user]) continue;
            EncryptedDCAParams storage p = _paramsByUser[user];
            _incrementSpent(user, p.amountPerInterval);
        }
    }

    /// @notice Grant the authorized executor FHE access on the specified users' encrypted params
    function grantExecutorOnUsers(address[] calldata users) external {
        if (msg.sender != _owner && msg.sender != _authorizedExecutor) revert OnlyOwner();
        if (_authorizedExecutor == address(0)) revert OnlyExecutor();
        uint256 len = users.length;
        for (uint256 i = 0; i < len; i++) {
            address user = users[i];
            if (!_hasParams[user]) continue;
            EncryptedDCAParams storage p = _paramsByUser[user];
            FHE.allow(p.budget, _authorizedExecutor);
            FHE.allow(p.amountPerInterval, _authorizedExecutor);
            FHE.allow(p.intervalSeconds, _authorizedExecutor);
            FHE.allow(p.totalIntervals, _authorizedExecutor);
            FHE.allow(p.spent, _authorizedExecutor);
        }
    }
}


