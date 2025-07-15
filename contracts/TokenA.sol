// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenA Contract
 * @author Ivan Sarapura
 * @notice This contract is a ERC20 token that can be minted by the owner
 * @dev Mintable token with owner controls for testing purposes
 */
contract TokenA is ERC20, Ownable {
    /**
     * @notice Constructor that initializes TokenA with initial supply
     * @dev Mints 1,000,000 tokens to deployer and sets deployer as owner
     */
    constructor() ERC20("TokenA", "TACC") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @notice Mint tokens to a specified address
     * @dev Only the owner can mint tokens
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
