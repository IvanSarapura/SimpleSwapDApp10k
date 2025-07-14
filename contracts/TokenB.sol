// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenB is ERC20, Ownable {
    constructor() ERC20("TokenB", "TBCC") Ownable(msg.sender) {
        // Mint 1,000,000 tokens to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        // Mint tokens to the specified address
        _mint(to, amount);
    }
}
