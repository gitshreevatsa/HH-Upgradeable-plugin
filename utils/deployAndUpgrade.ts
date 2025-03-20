import {
  type SmartAccountV1,
  waitTillCompleted,
} from "@nilfoundation/niljs";
import { ethers } from "ethers";
import { decodeFunctionResult, encodeFunctionData } from "viem";

/**
 * Deploys a UUPS proxy along with the first implementation contract and verifies deployment.
 * @param deployer - Smart account used for deployment.
 * @param implementationContract - The compiled implementation contract (ABI + Bytecode).
 * @param initializeArgs - Arguments for the initialize function.
 * @returns Deployed proxy and implementation addresses.
 */
export async function deployUUPSProxy(
  deployer: SmartAccountV1,
  implementationContract: { abi: any; bytecode: `0x${string}` },
  initializeArgs: any[],
) {
  // Load Proxy Contract ABI + Bytecode (Assumed Unchanged)
  const ProxyContract = require("../artifacts/contracts/MyERC1967Proxy.sol/MyERC1967Proxy.json");

  const client = deployer.client;

  console.log("🔹 Deploying UUPS Proxy...");
  console.log("🟢 Deployer Address:", deployer.address);

  // Step 1️⃣: Deploy Implementation Contract (V1)
  const { address: implAddress, hash: implTxHash } =
    await deployer.deployContract({
      shardId: 1,
      bytecode: implementationContract.bytecode,
      abi: implementationContract.abi,
      salt: BigInt(Math.floor(Math.random() * 10000)),
      args: [],
      feeCredit: ethers.parseEther("0.001"),
    });
  await waitTillCompleted(client, implTxHash);
  console.log("✅ Implementation deployed at:", implAddress);

  // Step 2️⃣: Encode Initialization Call
  const initializeData = encodeFunctionData({
    abi: implementationContract.abi,
    functionName: "initialize",
    args: initializeArgs,
  });

  // Step 3️⃣: Deploy Proxy Contract
  const { address: proxyAddress, hash: proxyTxHash } =
    await deployer.deployContract({
      shardId: 1,
      bytecode: ProxyContract.bytecode,
      abi: ProxyContract.abi,
      salt: BigInt(Math.floor(Math.random() * 10000)),
      args: [implAddress, initializeData],
    });
  await waitTillCompleted(client, proxyTxHash);
  console.log("✅ Proxy deployed at:", proxyAddress);

  // Step 4️⃣: Verify Proxy is Connected to Implementation
  console.log("🔎 Verifying Deployment...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Check Implementation Address
  const implementationAddress = await client.call(
    {
      to: proxyAddress,
      abi: ProxyContract.abi,
      functionName: "getImplementation",
    },
    "latest",
  );

  const implAddrDecoded = await decodeFunctionResult({
    abi: ProxyContract.abi,
    functionName: "getImplementation",
    data: implementationAddress.data,
  });

  console.log("✅ Proxy is pointing to Implementation:", implAddrDecoded);

  // Check getValue()
  const getValue = await client.call(
    {
      to: proxyAddress,
      abi: implementationContract.abi,
      functionName: "getValue",
    },
    "latest",
  );

  const value = await decodeFunctionResult({
    abi: implementationContract.abi,
    functionName: "getValue",
    data: getValue.data,
  });

  console.log("✅ getValue() returned:", value);

  return { proxyAddress, implAddress };
}

/**
 * Deploys a new implementation contract and upgrades the proxy, verifying the upgrade.
 * @param deployer - Smart account used for deployment.
 * @param proxyAddress - Address of the already deployed proxy.
 * @param newImplementationContract - The compiled new implementation contract (ABI + Bytecode).
 * @param reinitializeArgs - Optional arguments for the reinitialize function.
 */
export async function upgradeUUPSProxy(
  deployer: SmartAccountV1,
  proxyAddress: `0x${string}`,
  newImplementationContract: { abi: any; bytecode: `0x${string}` },
  reinitializeArgs?: any[], // Now Optional
) {
  // Load Proxy Contract ABI + Bytecode (Assumed Unchanged)
  const ProxyContract = require("../artifacts/contracts/MyERC1967Proxy.sol/MyERC1967Proxy.json");

  const client = deployer.client;

  console.log("🔹 Upgrading UUPS Proxy...");
  console.log("🟢 Deployer Address:", deployer.address);
  console.log("🔵 Proxy Address:", proxyAddress);

  // Step 1️⃣: Deploy New Implementation Contract (V2)
  const { address: newImplAddress, hash: newImplTxHash } =
    await deployer.deployContract({
      shardId: 1,
      bytecode: newImplementationContract.bytecode,
      abi: newImplementationContract.abi,
      salt: BigInt(Math.floor(Math.random() * 10000)),
      args: [],
      feeCredit: ethers.parseEther("0.001"),
    });
  await waitTillCompleted(client, newImplTxHash);
  console.log("✅ New Implementation deployed at:", newImplAddress);

  // Step 2️⃣: Upgrade Proxy to New Implementation
  const upgradeTxHash = await deployer.sendTransaction({
    to: proxyAddress,
    data: encodeFunctionData({
      abi: newImplementationContract.abi,
      functionName: "upgradeToAndCall",
      args: [newImplAddress, "0x"],
    }),
  });
  await waitTillCompleted(client, upgradeTxHash);
  console.log("✅ Proxy upgraded to new implementation at:", newImplAddress);

  // Step 3️⃣: Conditionally Call reinitializeV2()
  if (reinitializeArgs && reinitializeArgs.length > 0) {
    console.log("🔄 Calling reinitializeV2() with:", reinitializeArgs);
    const reinitTxHash = await deployer.sendTransaction({
      to: proxyAddress,
      data: encodeFunctionData({
        abi: newImplementationContract.abi,
        functionName: "reinitializeV2",
        args: reinitializeArgs,
      }),
    });
    await waitTillCompleted(client, reinitTxHash);
    console.log("✅ Reinitialize completed!");
  } else {
    console.log("⚠️ Skipping reinitialize step as no arguments were provided.");
  }

  // Step 4️⃣: Verify Upgrade Worked
  console.log("🔎 Verifying Upgrade...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    // Check Implementation Address
    const updatedImplementation = await client.call(
      {
        to: proxyAddress,
        abi: ProxyContract.abi,
        functionName: "getImplementation",
      },
      "latest",
    );

    const updatedImplAddrDecoded : string = decodeFunctionResult({
      abi: ProxyContract.abi,
      functionName: "getImplementation",
      data: updatedImplementation.data,
    }) as string;

    console.log("✅ Updated Implementation Address:", updatedImplAddrDecoded);

       // Check if the implementation address matches the newly deployed one
       if (updatedImplAddrDecoded.toLowerCase() !== newImplAddress.toLowerCase()) {
        console.error(
          "❌ Upgrade failed! Proxy did not update to the new implementation."
        );
        return;
      }

    // Check getValue()
    const getValue = await client.call(
      {
        to: proxyAddress,
        abi: newImplementationContract.abi,
        functionName: "getValue",
      },
      "latest",
    );

    const value = decodeFunctionResult({
      abi: newImplementationContract.abi,
      functionName: "getValue",
      data: getValue.data,
    });

    console.log("✅ getValue() after upgrade:", value);
  } catch (error) {
    console.error("❌ Error verifying upgrade:", error);
  }

  return newImplAddress;
}
