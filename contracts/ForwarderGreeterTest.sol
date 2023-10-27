//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.21;

import "./ERC2771Context.sol";

import "hardhat/console.sol";

contract ForwarderGreeterTest is ERC2771Context {

    event Greetings(address indexed who, string what);
    event GreetingChanged(address indexed who, string oldGreeting, string newGreeting);

    // Note: We normally use the storage slot namespace pattern you can see throughout the
    // code base. Because this is a test contract we can get a way with just using a 
    // variable here. Please do not replicate this pattern to upgradeable contracts as it
    // won't work.
    string private greeting;

    // Note: Most of our contracts are designed to be upgradeable. This means the
    // storage slots for the implementation contract aren't used and all storage
    // is kept on the proxy, so we normally use initialise() functions. This is a
    // test contract which is not upgradeable or behind a proxy, so we use the
    // constructor for convenience. Do not replicate this pattern to upgradeable
    // contracts as it won't work.
    constructor(string memory _greeting, address trustedForwarder)
        ERC2771Context(trustedForwarder)
	{
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    function greet() external {
	    emit Greetings(_msgSender(), greeting);
    }

    function setGreeting(string memory newGreeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, newGreeting);
        string memory oldGreeting = greeting;
        greeting = newGreeting;

        emit GreetingChanged(_msgSender(), oldGreeting, newGreeting);
    }
}