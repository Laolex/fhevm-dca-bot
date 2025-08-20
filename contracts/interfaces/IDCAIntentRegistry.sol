// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint32, euint64} from "@fhevm/solidity/lib/FHE.sol";

interface IDCAIntentRegistry {
    function getParamsFor(address user)
        external
        view
        returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalIntervals, euint64 spent, bool active);

    function incrementSpentForUsers(address[] calldata users) external;

    function getAuthorizedExecutor() external view returns (address);

    function setAuthorizedExecutor(address executor) external;
}


