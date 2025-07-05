// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract lottery {
    address payable admin;
    address payable[] public participants;
    uint public poolsize;
    uint public entryFee;
    uint public currentPoolSize = 0;
    address payable public lucky;

    constructor(uint _poolsize, uint _entryFee) {
        admin = payable(msg.sender);
        poolsize = _poolsize;
        entryFee = _entryFee;
    }

    receive() external payable {
        require(msg.value >= entryFee, '"minimum fee" + entryFee');
        participants.push(payable(msg.sender));
        currentPoolSize += 1;
    }

    function poolAmount() external view returns (uint) {
        return address(this).balance;
    }

    function winner() external {
        require(
            participants.length >= poolsize,
            "Pool does not have enough participants"
        );

        uint randomIndex = uint(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    participants.length
                )
            )
        ) % participants.length;

        lucky = participants[randomIndex];

        // Send the full balance to the winner
        (bool sent, ) = lucky.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

        delete participants;
        currentPoolSize = 0;
    }
}
