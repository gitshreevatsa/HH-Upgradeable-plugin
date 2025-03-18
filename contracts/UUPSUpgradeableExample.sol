// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UUPSUpgradeableExample is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 private value;

    /// @notice Initializer function (replaces constructor for upgradeable contracts)
    function initialize(uint256 _value) public initializer {
        __Ownable_init(msg.sender); // Initialize Ownable (sets deployer as owner)
        __UUPSUpgradeable_init(); // Initialize UUPS Upgradeability
        value = _value;
    }

    /// @notice Function to update the stored value
    function setValue(uint256 _value) external onlyOwner {
        value = _value;
    }

    /// @notice Function to get the stored value
    function getValue() external view returns (uint256) {
        return value;
    }

    /// @notice Required function to allow upgrades (restricted to owner)
    function _authorizeUpgrade(address newImplementation) internal override virtual onlyOwner {}

}
