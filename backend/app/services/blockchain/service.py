import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from web3 import Web3
from web3.contract import Contract

load_dotenv()


BASE_DIR = Path(__file__).resolve().parents[3]
ABI_DIR = BASE_DIR / "app" / "blockchain" / "abis"


class BlockchainService:
    def __init__(self):
        self.rpc_url = os.getenv("BLOCKCHAIN_RPC_URL")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
        self.model_trust_address = os.getenv("MODEL_TRUST_ADDRESS")
        self.model_testing_address = os.getenv("MODEL_TESTING_ADDRESS")

        if not self.rpc_url:
            raise RuntimeError("BLOCKCHAIN_RPC_URL is not configured")

        if not self.model_trust_address:
            raise RuntimeError("MODEL_TRUST_ADDRESS is not configured")

        if not self.model_testing_address:
            raise RuntimeError("MODEL_TESTING_ADDRESS is not configured")

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

        if not self.w3.is_connected():
            raise RuntimeError("Could not connect to blockchain RPC")

        self.model_trust = self._load_contract(
            "ModelTrust.json",
            self.model_trust_address,
        )

        self.model_testing = self._load_contract(
            "ModelTesting.json",
            self.model_testing_address,
        )

        self.account = None

        if self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)

    def _load_contract(
        self,
        filename: str,
        address: str,
    ) -> Contract:
        abi_path = ABI_DIR / filename

        with open(abi_path, "r", encoding="utf-8") as file:
            artifact = json.load(file)

        return self.w3.eth.contract(
            address=Web3.to_checksum_address(address),
            abi=artifact["abi"],
        )

    def _require_account(self):
        if not self.account:
            raise RuntimeError(
                "BLOCKCHAIN_PRIVATE_KEY is required for write operations"
            )

        return self.account

    @staticmethod
    def _hash_to_bytes32(hash_value: str) -> bytes:
        clean_hash = hash_value.removeprefix("0x")

        if len(clean_hash) != 64:
            raise ValueError("Hash must be a 64-character SHA-256 hex string")

        try:
            value = bytes.fromhex(clean_hash)
        except ValueError as exc:
            raise ValueError("Invalid hexadecimal hash") from exc

        if len(value) != 32:
            raise ValueError("Hash must be exactly 32 bytes")

        return value

    def _send_transaction(self, function):
        account = self._require_account()

        nonce = self.w3.eth.get_transaction_count(
            account.address,
            "pending",
        )

        transaction = function.build_transaction(
            {
                "from": account.address,
                "nonce": nonce,
                "chainId": self.w3.eth.chain_id,
                "gas": 500000,
                "maxFeePerGas": self.w3.to_wei(30, "gwei"),
                "maxPriorityFeePerGas": self.w3.to_wei(2, "gwei"),
            }
        )

        signed = self.w3.eth.account.sign_transaction(
            transaction,
            private_key=self.private_key,
        )

        tx_hash = self.w3.eth.send_raw_transaction(
            signed.raw_transaction
        )

        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "transactionHash": tx_hash.hex(),
            "blockNumber": receipt["blockNumber"],
            "status": receipt["status"],
        }

    def register_model(
        self,
        model_id: str,
        model_hash: str,
        version: str,
    ) -> dict[str, Any]:
        hash_bytes = self._hash_to_bytes32(model_hash)

        function = self.model_trust.functions.registerModel(
            model_id,
            hash_bytes,
            version,
        )

        return self._send_transaction(function)

    def verify_model_hash(
        self,
        model_id: str,
        supplied_hash: str,
    ) -> bool:
        hash_bytes = self._hash_to_bytes32(supplied_hash)

        return self.model_trust.functions.verifyModelHash(
            model_id,
            hash_bytes,
        ).call()

    def get_model(
        self,
        model_id: str,
    ) -> dict[str, Any]:
        result = self.model_trust.functions.getModel(
            model_id
        ).call()

        return {
            "modelId": result[0],
            "owner": result[1],
            "modelHash": "0x" + result[2].hex(),
            "version": result[3],
            "timestamp": result[4],
            "active": result[5],
        }

    def record_test(
        self,
        model_id: str,
        test_type: str,
        score: int,
        risk_score: int,
        status: int,
        result_hash: str,
    ) -> dict[str, Any]:
        function = self.model_testing.functions.recordTest(
            model_id,
            test_type,
            score,
            risk_score,
            status,
            result_hash,
        )

        return self._send_transaction(function)

    def get_test(
        self,
        test_id: int,
    ) -> dict[str, Any]:
        result = self.model_testing.functions.getTest(
            test_id
        ).call()

        return {
            "testId": result[0],
            "modelId": result[1],
            "testType": result[2],
            "score": result[3],
            "riskScore": result[4],
            "status": result[5],
            "resultHash": result[6],
            "timestamp": result[7],
            "tester": result[8],
        }

    def get_model_test_ids(
        self,
        model_id: str,
    ) -> list[int]:
        return list(
            self.model_testing.functions.getModelTestIds(
                model_id
            ).call()
        )

    def get_network_info(self) -> dict[str, Any]:
        return {
            "connected": self.w3.is_connected(),
            "chainId": self.w3.eth.chain_id,
            "latestBlock": self.w3.eth.block_number,
        }
