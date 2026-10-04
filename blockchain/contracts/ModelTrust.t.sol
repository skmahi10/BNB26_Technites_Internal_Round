// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ModelTrust} from "./ModelTrust.sol";

contract ModelTrustTest is Test {
    ModelTrust modelTrust;

    address owner = address(0x1234);

    string modelId = "model_demo_v1";
    bytes32 modelHash = keccak256("demo-model");
    string version = "1.0.0";

    function setUp() public {
        modelTrust = new ModelTrust();

        vm.prank(owner);

        modelTrust.registerModel(
            modelId,
            modelHash,
            version
        );
    }

    function test_ModelRegistration() public {
        (
            string memory returnedId,
            address returnedOwner,
            bytes32 returnedHash,
            string memory returnedVersion,
            uint256 timestamp,
            bool active
        ) = modelTrust.getModel(modelId);

        assertEq(returnedId, modelId);
        assertEq(returnedOwner, owner);
        assertEq(returnedHash, modelHash);
        assertEq(returnedVersion, version);
        assertGt(timestamp, 0);
        assertTrue(active);
    }

    function test_ModelHashVerification() public {
        bool valid = modelTrust.verifyModelHash(
            modelId,
            modelHash
        );

        assertTrue(valid);
    }

    function test_WrongHashFails() public {
        bytes32 wrongHash = keccak256("tampered-model");

        bool valid = modelTrust.verifyModelHash(
            modelId,
            wrongHash
        );

        assertFalse(valid);
    }

    function test_DuplicateModelRejected() public {
        vm.prank(owner);

        vm.expectRevert("Model already exists");

        modelTrust.registerModel(
            modelId,
            modelHash,
            version
        );
    }
}