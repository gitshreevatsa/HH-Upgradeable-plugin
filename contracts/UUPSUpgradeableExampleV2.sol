// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UUPSUpgradeableExample.sol"; // Import V1 contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UUPSUpgradeableExampleV2 is UUPSUpgradeableExample {
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    // Reinitializer for V2
    function reinitializeV2() public reinitializer(2) {
        totalDeposits = 0; // Initialize new storage
    }

    // Deposit ETH and update user balance
    function deposit() external payable {
        require(msg.value > 0, "No ether sent");
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Withdraw ETH from balance
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override virtual onlyOwner {}
}
