// SPDX-License-Identifier: MIT
// Originally sourced from OpenZeppelin Contracts (last updated v4.9.3) (metatx/ERC2771Context.sol)

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @dev Context variant with ERC2771 support.
 */
abstract contract ERC2771Context is Context {
    address public trustedForwarder;

    constructor ( address  initialTrustedForwarder) {
        trustedForwarder = initialTrustedForwarder;
    }

    function isTrustedForwarder(address forwarder) public view virtual returns (bool) {
        return trustedForwarder == forwarder;
    }

    function _msgSender() internal view virtual override returns (address sender) {
        if (isTrustedForwarder(msg.sender) && msg.data.length >= 20) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view virtual override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender) && msg.data.length >= 20) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
