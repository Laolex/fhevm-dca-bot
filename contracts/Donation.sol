// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract Donation is SepoliaConfig {
    euint32 private _totalDonations;
    mapping(address => euint32) private _donations;
    address private _owner;

    event DonationMade(address indexed donor);
    error ContractPaused();
    error OnlyOwner();
    error InvalidEncryptedAmount();

    bool private _paused;

    constructor() {
        _owner = msg.sender;
    }

    modifier whenNotPaused() {
        if (_paused) revert ContractPaused();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != _owner) revert OnlyOwner();
        _;
    }

    function donate(externalEuint32 inputEuint32, bytes calldata inputProof) external whenNotPaused {
        euint32 amount = FHE.fromExternal(inputEuint32, inputProof);
        _donations[msg.sender] = FHE.add(_donations[msg.sender], amount);
        _totalDonations = FHE.add(_totalDonations, amount);
        // Allow contract to authorize decryption for these values
        FHE.allowThis(_donations[msg.sender]);
        FHE.allowThis(_totalDonations);
        FHE.allow(_donations[msg.sender], msg.sender);
        // Maintain owner decryption permission on the updated total
        FHE.allow(_totalDonations, _owner);
        emit DonationMade(msg.sender);
    }

    function getTotalDonations() external view returns (euint32) {
        return _totalDonations;
    }

    function getMyDonation() external view returns (euint32) {
        return _donations[msg.sender];
    }

    function getOwner() external view returns (address) {
        return _owner;
    }

    function pause() external onlyOwner {
        _paused = true;
    }

    function unpause() external onlyOwner {
        _paused = false;
    }
    function isPaused() external view returns (bool) {
        return _paused;
    }
    function getDonations(address donor) external view returns (euint32) {
        return _donations[donor];
    }
}