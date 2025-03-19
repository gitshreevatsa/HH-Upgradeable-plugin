import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

import "./task/test-uups-pattern";
import "./task/test-modular";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
  },
  defaultNetwork: "nil",
  networks: {
    nil: {
      url: process.env.NIL_RPC_ENDPOINT,
    },
  },
};

export default config;
