import {
  CometaService,
  FaucetClient,
  HttpTransport,
  PublicClient,
  convertEthToWei,
  generateSmartAccount,
  getContract,
  waitTillCompleted,
} from "@nilfoundation/niljs";

const fs = require("fs");
import * as path from "path";

export async function registerCometa(
  implAddress: `0x${string}`,
  proxyAddress: `0x${string}`,
) {
  const UUPSExamplePath = path.resolve(
    __dirname,
    "../contracts/UUPSUpgradeableExample.sol",
  );
  const MyERC1967ProxyExamplePath = path.resolve(
    __dirname,
    "../contracts/MyERC1967Proxy.sol",
  );

  const UUPSUpgradePath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol",
  );
  const InitializeablePath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol",
  );
  const OwnableUpgradeAblePath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol",
  );
  const IERC1822Path = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/interfaces/draft-IERC1822.sol",
  );
  const IBeaconPath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/proxy/beacon/IBeacon.sol",
  );
  const IERC1967Path = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/interfaces/IERC1967.sol",
  );
  const ErrorsPath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/utils/Errors.sol",
  );
  const AddressPath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/utils/Address.sol",
  );
  const StorageSlotPath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/utils/StorageSlot.sol",
  );
  const ERC1967Utils = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol",
  );
  const ContextUpgradeablePath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol",
  );

  const ERC1967Path = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol",
  );
  const ProxyPath = path.resolve(
    __dirname,
    "../node_modules/@openzeppelin/contracts/proxy/Proxy.sol",
  );

  const UUPSExampleContract = fs.readFileSync(UUPSExamplePath, "utf8");
  const MyERC1967ProxyExampleContract = fs.readFileSync(
    MyERC1967ProxyExamplePath,
    "utf8",
  );
  const UUPSUpgradeContract = fs.readFileSync(UUPSUpgradePath, "utf8");
  const InitializeableContract = fs.readFileSync(InitializeablePath, "utf8");
  const OwnableUpgradeAbleContract = fs.readFileSync(
    OwnableUpgradeAblePath,
    "utf8",
  );
  const IERC1822Contract = fs.readFileSync(IERC1822Path, "utf8");
  const IBeaconContract = fs.readFileSync(IBeaconPath, "utf8");
  const IERC1967Contract = fs.readFileSync(IERC1967Path, "utf8");
  const ErrorsContract = fs.readFileSync(ErrorsPath, "utf8");
  const AddressContract = fs.readFileSync(AddressPath, "utf8");
  const StorageSlotContract = fs.readFileSync(StorageSlotPath, "utf8");
  const ERC1967UtilsContract = fs.readFileSync(ERC1967Utils, "utf8");
  const ContextUpgradeableContract = fs.readFileSync(
    ContextUpgradeablePath,
    "utf8",
  );

  const ERC1967Contract = fs.readFileSync(ERC1967Path, "utf8");
  const ProxyContract = fs.readFileSync(ProxyPath, "utf8");

  const compileInputForUUPSExample = {
    language: "Solidity",
    contractName: "UUPSUpgradeableExample.sol:UUPSUpgradeableExample",
    compilerVersion: "0.8.28",
    sources: {
      "UUPSUpgradeableExample.sol": {
        content: UUPSExampleContract,
      },
      "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol": {
        content: UUPSUpgradeContract,
      },
      "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol": {
        content: InitializeableContract,
      },
      "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol": {
        content: OwnableUpgradeAbleContract,
      },
      "@openzeppelin/contracts/interfaces/draft-IERC1822.sol": {
        content: IERC1822Contract,
      },
      "@openzeppelin/contracts/proxy/beacon/IBeacon.sol": {
        content: IBeaconContract,
      },
      "@openzeppelin/contracts/interfaces/IERC1967.sol": {
        content: IERC1967Contract,
      },
      "@openzeppelin/contracts/utils/Errors.sol": {
        content: ErrorsContract,
      },
      "@openzeppelin/contracts/utils/Address.sol": {
        content: AddressContract,
      },
      "@openzeppelin/contracts/utils/StorageSlot.sol": {
        content: StorageSlotContract,
      },
      "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol": {
        content: ERC1967UtilsContract,
      },
      "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol": {
        content: ContextUpgradeableContract,
      },
    },
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
  };

  // const compileInputForMyERC1967ProxyExample = {
  //     language: 'Solidity',
  //     contractName: 'MyERC1967Proxy.sol:MyERC1967Proxy',
  //     compilerVersion: "0.8.28",
  //     sources: {
  //         'MyERC1967Proxy.sol': {
  //             content: MyERC1967ProxyExampleContract
  //         },
  //         '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol': {
  //             content: ERC1967Contract
  //         },

  //         '@openzeppelin/contracts/proxy/Proxy.sol': {
  //             content: ProxyContract
  //         },
  //         '@openzeppelin/contracts/interfaces/draft-IERC1822.sol': {
  //             content: IERC1822Contract
  //         },
  //         '@openzeppelin/contracts/proxy/beacon/IBeacon.sol': {
  //             content: IBeaconContract
  //         },
  //         '@openzeppelin/contracts/interfaces/IERC1967.sol': {
  //             content: IERC1967Contract
  //         },
  //         '@openzeppelin/contracts/utils/Errors.sol': {
  //             content: ErrorsContract
  //         },
  //         '@openzeppelin/contracts/utils/Address.sol': {
  //             content: AddressContract
  //         },
  //         '@openzeppelin/contracts/utils/StorageSlot.sol': {
  //             content: StorageSlotContract
  //         },
  //         '@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol': {
  //             content: ERC1967UtilsContract
  //         },
  //     },
  //     settings: {
  //         metadata: {
  //             appendCBOR: false,
  //             bytecodeHash: "none",
  //         },
  //         debug: {
  //             debugInfo: ["location"],
  //         },
  //         outputSelection: {
  //             "*": {
  //                 "*": ["*"],
  //             },
  //         },
  //         evmVersion: "cancun",
  //         optimizer: {
  //             enabled: false,
  //             runs: 200,
  //         },
  //     },
  // };

  const service = new CometaService({
    transport: new HttpTransport({
      endpoint: process.env.NIL_RPC_ENDPOINT as string,
    }),
  });

  try {
    console.log("Compilation started");
    const compileOutputForUUPS = await service.compileContract(
      JSON.stringify(compileInputForUUPSExample),
    );
    // const compileOutputForProxy = await service.compileContract(JSON.stringify(compileInputForMyERC1967ProxyExample));
    // console.log("Compilation complete", compileOutputForUUPS, compileOutputForProxy);

    console.log("Registering UUPS contract...");
    await service.registerContractData(compileOutputForUUPS, implAddress);

    console.log("Registering Proxy contract...");
    // await service.registerContractData(compileOutputForProxy, proxyAddress);

    console.log("Registration complete!");
  } catch (error) {
    console.log("Error occured at:", error);
  }
}
