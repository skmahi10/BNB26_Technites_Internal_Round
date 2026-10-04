// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ModelTrust {
    struct Model {
        string modelId;
        address owner;
        bytes32 modelHash;
        string version;
        uint256 timestamp;
        bool active;
    }

    mapping(string => Model) private models;

    event ModelRegistered(
        string indexed modelId,
        address indexed owner,
        bytes32 modelHash,
        string version,
        uint256 timestamp
    );

    function registerModel(
        string calldata modelId,
        bytes32 modelHash,
        string calldata version
    ) external {
        require(bytes(modelId).length > 0, "Model ID required");
        require(models[modelId].timestamp == 0, "Model already exists");

        models[modelId] = Model({
            modelId: modelId,
            owner: msg.sender,
            modelHash: modelHash,
            version: version,
            timestamp: block.timestamp,
            active: true
        });

        emit ModelRegistered(
            modelId,
            msg.sender,
            modelHash,
            version,
            block.timestamp
        );
    }

    function getModel(
        string calldata modelId
    )
        external
        view
        returns (
            string memory,
            address,
            bytes32,
            string memory,
            uint256,
            bool
        )
    {
        require(models[modelId].timestamp != 0, "Model not found");

        Model memory model = models[modelId];

        return (
            model.modelId,
            model.owner,
            model.modelHash,
            model.version,
            model.timestamp,
            model.active
        );
    }

    function verifyModelHash(
        string calldata modelId,
        bytes32 suppliedHash
    ) external view returns (bool) {
        require(models[modelId].timestamp != 0, "Model not found");

        return models[modelId].modelHash == suppliedHash;
    }
}