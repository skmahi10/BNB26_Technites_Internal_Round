// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ModelTesting {
    enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }

    struct TestRecord {
        uint256 testId;
        string modelId;
        string testType;
        uint256 score;
        uint256 riskScore;
        Status status;
        string resultHash;
        uint256 timestamp;
        address tester;
    }

    uint256 private nextTestId = 1;

    mapping(uint256 => TestRecord) private tests;
    mapping(string => uint256[]) private modelTests;

    event ModelTestRecorded(
        uint256 indexed testId,
        string indexed modelId,
        string testType,
        uint256 score,
        uint256 riskScore,
        Status status,
        address indexed tester,
        uint256 timestamp
    );

    function recordTest(
        string calldata modelId,
        string calldata testType,
        uint256 score,
        uint256 riskScore,
        Status status,
        string calldata resultHash
    ) external returns (uint256) {
        require(bytes(modelId).length > 0, "Model ID required");
        require(score <= 100, "Invalid score");
        require(riskScore <= 100, "Invalid risk score");

        uint256 testId = nextTestId++;

        tests[testId] = TestRecord({
            testId: testId,
            modelId: modelId,
            testType: testType,
            score: score,
            riskScore: riskScore,
            status: status,
            resultHash: resultHash,
            timestamp: block.timestamp,
            tester: msg.sender
        });

        modelTests[modelId].push(testId);

        emit ModelTestRecorded(
            testId,
            modelId,
            testType,
            score,
            riskScore,
            status,
            msg.sender,
            block.timestamp
        );

        return testId;
    }

    function getTest(
        uint256 testId
    ) external view returns (
        uint256,
        string memory,
        string memory,
        uint256,
        uint256,
        Status,
        string memory,
        uint256,
        address
    ) {
        require(tests[testId].timestamp != 0, "Test not found");

        TestRecord memory test = tests[testId];

        return (
            test.testId,
            test.modelId,
            test.testType,
            test.score,
            test.riskScore,
            test.status,
            test.resultHash,
            test.timestamp,
            test.tester
        );
    }

    function getModelTestIds(
        string calldata modelId
    ) external view returns (uint256[] memory) {
        return modelTests[modelId];
    }
}