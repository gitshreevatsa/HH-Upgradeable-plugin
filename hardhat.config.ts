import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

import "./task/test-uups-pattern";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      metadata: {
          appendCBOR: false,
          bytecodeHash: "none",
      },
      debug: {
          debugInfo: ["location"],
      },
      outputSelection: {
          "*": {
              "*": ["*"],
          },
      },
      evmVersion: "cancun",
      optimizer: {
          enabled: false,
          runs: 200,
      },
  },
  },
  networks: {
    nil: {
      url: process.env.NIL_RPC_ENDPOINT,
    },
  },
};

export default config;
