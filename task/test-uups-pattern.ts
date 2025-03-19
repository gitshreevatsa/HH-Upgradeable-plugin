import {
  CometaService,
  FaucetClient,
  HttpTransport,
  PublicClient,
  SmartAccountInterface,
  SmartAccountV1,
  generateSmartAccount,
  getContract,
  waitTillCompleted,
} from "@nilfoundation/niljs";
import { ethers } from "ethers";
import { task } from "hardhat/config";
import { decodeFunctionResult, encodeFunctionData } from "viem";

task("test-uups-pattern", "Test the UUPS pattern deployment").setAction(
  async (taskArgs, hre) => {
    const UUPSExample = require("../artifacts/contracts/UUPSUpgradeableExample.sol/UUPSUpgradeableExample.json");
    const ERC1967Proxy = require("../artifacts/contracts/MyERC1967Proxy.sol/MyERC1967Proxy.json");
    const UUPSV2Example = require("../artifacts/contracts/UUPSUpgradeableExampleV2.sol/UUPSUpgradeableExampleV2.json");

    console.log("RPC_ENDPOINT:", process.env.NIL_RPC_ENDPOINT);

    const client: PublicClient = new PublicClient({
      transport: new HttpTransport({
        endpoint: process.env.NIL_RPC_ENDPOINT as string,
      }),
    });

    console.log("Client Initialized");

    const faucetClient: FaucetClient = new FaucetClient({
      transport: new HttpTransport({
        endpoint: process.env.NIL_RPC_ENDPOINT as string,
      }),
    });

    console.log("Faucet Client Initialized", faucetClient);

    const deployer = await generateSmartAccount({
      rpcEndpoint: process.env.NIL_RPC_ENDPOINT as string,
      faucetEndpoint: process.env.NIL_RPC_ENDPOINT as string,
      shardId: 1,
    });

    console.log("Deployer Address:", deployer.address);

    // Deploy Implementation Contract
    const { address: deployUUPSExampleImpl, hash: deployUUPSExampleImplHash } =
      await deployer.deployContract({
        shardId: 1,
        bytecode: UUPSExample.bytecode,
        abi: UUPSExample.abi,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        args: [],
        feeCredit: ethers.parseEther("0.001"),
      });
    await waitTillCompleted(client, deployUUPSExampleImplHash);
    console.log(
      "Tx Hash for deployment of UUPS Example Implementation contract:",
      deployUUPSExampleImplHash,
    );
    console.log("Deployed Implementation Address:", deployUUPSExampleImpl);

    // Encode initialize function call
    const initializeData = encodeFunctionData({
      abi: UUPSExample.abi,
      functionName: "initialize",
      args: [42],
    }); // Example value

    console.log("Encoded initialize function call:", initializeData);

    // Deploy Proxy Contract with initialization call
    const { address: deployProxy, hash: deployProxyHash } =
      await deployer.deployContract({
        shardId: 1,
        bytecode: ERC1967Proxy.bytecode,
        abi: ERC1967Proxy.abi,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        args: [deployUUPSExampleImpl, initializeData], // Pass encoded function call
      });

    await waitTillCompleted(client, deployProxyHash);
    console.log(
      "Tx Hash for deployment of UUPS Proxy contract:",
      deployProxyHash,
    );
    console.log("Deployed Proxy Address:", deployProxy);

    console.log("Checking if getImplementation exists in ABI...");
    const hasGetImplementation = ERC1967Proxy.abi.some(
      (entry: any) => entry.name === "getImplementation",
    );

    if (!hasGetImplementation) {
      console.error("Error: ABI does not contain getImplementation function.");
      process.exit(1);
    }

    console.log("Fetching the implementation address from proxy...");

    try {
      const implementationAddress = await client.call(
        {
          to: deployProxy,
          abi: ERC1967Proxy.abi, // Ensure this is the correct ABI
          functionName: "getImplementation",
        },
        "latest",
      );

      const implAddress = decodeFunctionResult({
        abi: ERC1967Proxy.abi,
        functionName: "getImplementation",
        data: implementationAddress.data,
      });

      console.log("Implementation Address from Proxy:", implAddress);
    } catch (error) {
      console.error("Error calling getImplementation:", error);
    }

    console.log("Making a call to get the value after initialization...");
    const getValue = await client.call(
      {
        to: deployProxy,
        abi: UUPSExample.abi,
        functionName: "getValue",
      },
      "latest",
    );

    console.log("Call made for getting Value via getValue function");

    const value = decodeFunctionResult({
      abi: UUPSExample.abi,
      functionName: "getValue",
      data: getValue.data,
    });

    console.log("Value after initialization:", value as unknown as number);

    console.log("Topping Up before upgrade...");

    const topUp = await faucetClient.topUp({
      smartAccountAddress: deployer.address,
      amount: ethers.parseEther("0.01"),
      faucetAddress: process.env.NIL as `0x${string}`,
    });

    await waitTillCompleted(client, topUp);
    console.log("Topped up 0.01 ETH");
    console.log("Deploying New Implementation Contract...");

    const { address: newUUPSExampleImpl, hash: newUUPSExampleImplHash } =
      await deployer.deployContract({
        shardId: 1,
        bytecode: UUPSV2Example.bytecode,
        abi: UUPSV2Example.abi,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        args: [],
        feeCredit: ethers.parseEther("0.001"),
      });

    await waitTillCompleted(client, newUUPSExampleImplHash);
    console.log(
      "Tx Hash for deployment of UUPS Example V2 Implementation contract:",
      newUUPSExampleImplHash,
    );
    console.log("Deployed Implementation Address:", newUUPSExampleImpl);

    const upgradeTxHash = await deployer.sendTransaction({
      to: deployProxy,
      data: encodeFunctionData({
        abi: UUPSExample.abi, // Use V1 ABI
        functionName: "upgradeToAndCall",
        args: [newUUPSExampleImpl, "0x"],
      }),
    });
    await waitTillCompleted(client, upgradeTxHash);
    console.log("Upgrade transaction completed:", upgradeTxHash);
    console.log("Proxy upgraded to V2:", newUUPSExampleImpl);

    const reinitTxHash = await deployer.sendTransaction({
      to: deployProxy,
      data: encodeFunctionData({
        abi: UUPSV2Example.abi, // Use new ABI for reinitialize
        functionName: "reinitializeV2",
        args: [],
      }),
    });
    await waitTillCompleted(client, reinitTxHash);
    console.log("New version reinitialized!");

    const updatedImplementation = await client.call(
      {
        to: deployProxy,
        abi: ERC1967Proxy.abi,
        functionName: "getImplementation",
      },
      "latest",
    );

    const updatedImplAddress = decodeFunctionResult({
      abi: ERC1967Proxy.abi,
      functionName: "getImplementation",
      data: updatedImplementation.data,
    });

    console.log("Updated Implementation Address:", updatedImplAddress);

    console.log("Making a call to get the value after reinitialization...");
    const getValueAfterUpgrade = await client.call(
      {
        to: deployProxy,
        abi: UUPSV2Example.abi,
        functionName: "getValue",
      },
      "latest",
    );

    console.log("Call made for getting Value via getValue function");

    const valueAfterUpgrade = decodeFunctionResult({
      abi: UUPSV2Example.abi,
      functionName: "getValue",
      data: getValueAfterUpgrade.data,
    });

    console.log(
      "Value after reinitialization:",
      valueAfterUpgrade as unknown as number,
    );

    const depositTxHash = await deployer.sendTransaction({
      to: deployProxy,
      value: ethers.parseEther("0.0001"), // Sending 1 ETH
      data: encodeFunctionData({
        abi: UUPSV2Example.abi,
        functionName: "deposit",
        args: [],
      }),
    });
    await waitTillCompleted(client, depositTxHash);
    console.log("Deposit transaction completed:", depositTxHash);
    console.log("Deposited 0.0001 ETH");

    const userBalance = await client.call(
      {
        to: deployProxy,
        abi: UUPSV2Example.abi,
        functionName: "balances",
        args: [deployer.address],
      },
      "latest",
    );

    const userBalanceDecoded = decodeFunctionResult({
      abi: UUPSV2Example.abi,
      functionName: "balances",
      data: userBalance.data,
    });

    console.log(
      "User Balance after deposit:",
      userBalanceDecoded as unknown as number,
    );
  },
);
