// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ModelTesting} from "./ModelTesting.sol";

contract ModelTestingTest is Test {
    ModelTesting modelTesting;

    address tester = address(0x5678);

    function setUp() public {
        modelTesting = new ModelTesting();
    }

    function test_RecordTest() public {
        vm.prank(tester);

        uint256 testId = modelTesting.recordTest(
            "model_demo_v1",
            "ROBUSTNESS",
            92,
            15,
            ModelTesting.Status.APPROVED,
            "result_hash_123"
        );

        assertEq(testId, 1);

        (
            uint256 returnedId,
            string memory modelId,
            string memory testType,
            uint256 score,
            uint256 riskScore,
            ModelTesting.Status status,
            string memory resultHash,
            uint256 timestamp,
            address returnedTester
        ) = modelTesting.getTest(testId);

        assertEq(returnedId, 1);
        assertEq(modelId, "model_demo_v1");
        assertEq(testType, "ROBUSTNESS");
        assertEq(score, 92);
        assertEq(riskScore, 15);
        assertEq(
            uint256(status),
            uint256(ModelTesting.Status.APPROVED)
        );
        assertEq(resultHash, "result_hash_123");
        assertGt(timestamp, 0);
        assertEq(returnedTester, tester);
    }

    function test_ModelTestHistory() public {
        modelTesting.recordTest(
            "model_demo_v1",
            "ACCURACY",
            95,
            10,
            ModelTesting.Status.APPROVED,
            "hash_1"
        );

        modelTesting.recordTest(
            "model_demo_v1",
            "SECURITY",
            88,
            20,
            ModelTesting.Status.PENDING,
            "hash_2"
        );

        uint256[] memory ids =
            modelTesting.getModelTestIds("model_demo_v1");

        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_InvalidScoreRejected() public {
        vm.expectRevert("Invalid score");

        modelTesting.recordTest(
            "model_demo_v1",
            "ACCURACY",
            101,
            20,
            ModelTesting.Status.PENDING,
            "hash"
        );
    }

    function test_InvalidRiskRejected() public {
        vm.expectRevert("Invalid risk score");

        modelTesting.recordTest(
            "model_demo_v1",
            "SECURITY",
            90,
            101,
            ModelTesting.Status.PENDING,
            "hash"
        );
    }
}