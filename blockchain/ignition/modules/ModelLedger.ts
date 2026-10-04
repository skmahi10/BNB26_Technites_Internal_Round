import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ModelLedgerModule = buildModule("ModelLedgerModule", (m) => {
  const modelTrust = m.contract("ModelTrust");
  const modelTesting = m.contract("ModelTesting");

  return {
    modelTrust,
    modelTesting,
  };
});

export default ModelLedgerModule;
