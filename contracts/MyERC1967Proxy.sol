// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MyERC1967Proxy is ERC1967Proxy {
    constructor(address _logic, bytes memory _data) ERC1967Proxy(_logic, _data) {
         if (_data.length > 0) {
        (bool success, ) = _logic.delegatecall(_data);
        require(success, "Initialization failed");
    }
    }

    /// @notice Fetches the implementation contract address
    function getImplementation() external view returns (address) {
        bytes32 IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
        address implementation;
        assembly {
            implementation := sload(IMPLEMENTATION_SLOT)
        }
        return implementation;
    }

    receive() external payable {}
}
