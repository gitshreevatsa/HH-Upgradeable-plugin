import { task } from "hardhat/config";

import {
    PublicClient,
    HttpTransport,
    SmartAccountV1,
    generateSmartAccount,
    FaucetClient,
    waitTillCompleted,
    generateRandomPrivateKey,
    LocalECDSAKeySigner,
} from "@nilfoundation/niljs";
import { ethers } from "ethers";
import { deployUUPSProxy, upgradeUUPSProxy } from "../utils/deployAndUpgrade"; // Import functions
import "dotenv/config";
import * as fs from "fs";


// Import compiled contracts (Ensure correct paths)
const UUPSExample = require("../artifacts/contracts/UUPSUpgradeableExample.sol/UUPSUpgradeableExample.json");
const UUPSV2Example = require("../artifacts/contracts/UUPSUpgradeableExampleV2.sol/UUPSUpgradeableExampleV2.json");

let smartAccount: SmartAccountV1 | null = null; // Variable to store the initialized SmartAccountV1

/**
 * ✅ Fetches or initializes a Smart Account:
 * - **Uses an existing account** if `PRIVATE_KEY` & `SMART_ACCOUNT_ADDRESS` are available.
 * - **Generates a new account** if no details are found.
 * - **Always funds the account before use.**
 */
async function getSmartAccount(): Promise<SmartAccountV1> {
    const rpcEndpoint = process.env.NIL_RPC_ENDPOINT as string;
    const client = new PublicClient({ transport: new HttpTransport({ endpoint: rpcEndpoint }) });
    const faucetClient = new FaucetClient({ transport: new HttpTransport({ endpoint: rpcEndpoint }) });

    const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
    const smartAccountAddress = process.env.SMART_ACCOUNT_ADDRESS as `0x${string}`;

    if (privateKey && smartAccountAddress) {
        console.log("🔹 Using existing Smart Account...");
        const signer = new LocalECDSAKeySigner({ privateKey });
        smartAccount = new SmartAccountV1({
            signer,
            client,
            address: smartAccountAddress,
            pubkey: signer.getPublicKey(),
        });

        console.log("🟢 Loaded Smart Account:", smartAccount.address);
    } else {
        console.log("🚀 Generating New Smart Account...");

        const privateKey = generateRandomPrivateKey();

        const signer = new LocalECDSAKeySigner({ privateKey });
        smartAccount = new SmartAccountV1({
            signer,
            client,
            address: smartAccountAddress,
            pubkey: signer.getPublicKey(),
        });

        console.log()
        console.log("🆕 New Smart Account Generated:", smartAccount.address);

        // ✅ Store details in .env
        const envFile = fs.readFileSync(".env", "utf8");
        const newEnv = envFile
            .replace(/(PRIVATE_KEY=).*/, `$1${privateKey}`)
            .replace(/(SMART_ACCOUNT_ADDRESS=).*/, `$1${smartAccount.address}`);

        fs.writeFileSync(".env", newEnv);
        console.log("✅ Smart Account details saved to `.env`");
    }

    // ✅ Fund the Smart Account
    await faucetClient.topUp({
        smartAccountAddress: smartAccount.address,
        amount: ethers.parseEther("0.01"), // Ensure enough ETH for operations
        faucetAddress: process.env.NIL as `0x${string}`,
    });

    console.log("✅ Smart Account Funded (0.01 ETH)");
    return smartAccount;
}


/**
 * Deploys a UUPS proxy along with the first implementation contract and verifies deployment.
 * @param deployer - Smart account used for deployment.
 * @param implementationContract - The compiled implementation contract (ABI + Bytecode).
 * @param initializeArgs - Arguments for the initialize function.
 * @returns Deployed proxy and implementation addresses.
 */
task("deploy-uups-proxy", "Deploys a UUPS proxy along with the first implementation contract and verifies deployment.")
.setAction(async() => {
    console.log("🚀 Deploying UUPS Proxy with Implementation...");

    const deployer = await getSmartAccount();
    const initializeArgs = [42]; // Example args for initialize()

    const { proxyAddress, implAddress } = await deployUUPSProxy(
        deployer,
        UUPSExample,
        initializeArgs
    );

    console.log("✅ Deployment Complete!");
    console.log("🟢 Proxy Address:", proxyAddress);
    console.log("🟢 Implementation Address:", implAddress);

    // Store the deployed proxy address for later upgrades
    require("fs").writeFileSync("proxyAddress.txt", proxyAddress);
});

/**
 * Upgrades the UUPS proxy to a new implementation contract.
 */

task("upgrade-uups-proxy", "Upgrades the UUPS proxy to a new implementation contract.")
    .addParam("proxy", "The address of the deployed proxy contract.")
    .setAction(async({proxy}) => {
        console.log("🚀 Upgrading Proxy to V2 Implementation...");

    // Use the same smart account instance
    const deployer = await getSmartAccount();

    const proxyAddress = proxy;
        
    if (!proxyAddress) {
        console.error("❌ Error: No deployed proxy address found. Run `deploy` first.");
        process.exit(1);
    }

    // Example reinitialization arguments
    const reinitializeArgs : any[]= []; // Modify if needed, or leave empty

    const newImplAddress = await upgradeUUPSProxy(
        deployer,
        proxyAddress as `0x${string}`,
        UUPSV2Example,
        reinitializeArgs
    );

    console.log("✅ Upgrade Complete!");
    console.log("🟢 New Implementation Address:", newImplAddress);
})

task("smart-account", "Get the smart account associated")
.setAction(async() => {
    const account = await getSmartAccount();
    console.log("🟢 Smart Account Address:", account.address);
})
