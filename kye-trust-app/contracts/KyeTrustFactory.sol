
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./KyeTrust.sol";

contract KyeTrustFactory {
    address[] public deployedKyes;

    event KyeCreated(
        address indexed kyeAddress,
        string name,
        uint256 goalAmount,
        address indexed owner
    );

    function createKye(
        string memory _name,
        uint256 _goalAmount,
        uint256 _contributionAmount,
        uint256 _duration,
        address[] memory _members,
        bool _multiSigEnabled,
        uint256 _requiredConfirmations
    ) public returns (address) {
        KyeTrust newKye = new KyeTrust(
            _name,
            _goalAmount,
            _contributionAmount,
            _duration,
            _members,
            _multiSigEnabled,
            _requiredConfirmations
        );
        deployedKyes.push(address(newKye));
        emit KyeCreated(address(newKye), _name, _goalAmount, msg.sender);
        return address(newKye);
    }

    function getDeployedKyes() public view returns (address[] memory) {
        return deployedKyes;
    }
}
