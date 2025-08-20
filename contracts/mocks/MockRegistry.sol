// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint32, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {IDCAIntentRegistry} from "../interfaces/IDCAIntentRegistry.sol";

contract MockRegistry is IDCAIntentRegistry {
    address private _executor;

    function getParamsFor(address /*user*/)
        external
        pure
        returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalIntervals, euint64 spent, bool active)
    {
        // default zeros; active true
        active = true;
    }

    function incrementSpentForUsers(address[] calldata /*users*/) external {}

    function getAuthorizedExecutor() external view returns (address) {
        return _executor;
    }

    function setAuthorizedExecutor(address executor) external {
        _executor = executor;
    }
}


