// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract TestNFT {
    string public name = "TestNFT";
    string public symbol = "TNFT";
    uint256 public totalSupply;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;

    function mint(address to) external {
        ownerOf[totalSupply] = to;
        balanceOf[to] += 1;
        totalSupply += 1;
    }
}
