// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";

interface IRewardVault {
    function depositFrom(address from, uint256 amount) external;
    function creditBatch(address[] calldata users, externalEuint64[] calldata encAmounts, bytes[] calldata proofs) external;
}

interface IRewardVaultInternalCredit {
    function creditEncrypted(address user, euint64 delta) external;
}


