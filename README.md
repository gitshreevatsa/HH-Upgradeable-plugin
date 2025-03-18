# **UUPS Upgradeable Smart Contracts on =nil;**
This repository demonstrates **UUPS proxy-based upgradeable contracts** on the **=nil; blockchain** using **Hardhat** and **niljs**.

## 📌 **Overview**
This project includes:
- **UUPS (Universal Upgradeable Proxy Standard) Proxy Pattern**
- **Upgradeable Smart Contracts with Persistent State**
- **Deployment of Proxy & Implementation Contracts**
- **Automated Upgrade Process via Hardhat Task**
- **Verification Checks to Confirm the Upgrade Worked**

---

## 📦 **Installation & Setup**
### 🔧 **Prerequisites**
Ensure you have the following installed:
- **Node.js v18+** (⚠️ **Do not use Node.js 20+ due to compatibility issues with Hardhat**)
- **Yarn or npm**
- **Hardhat**
- **=nil; blockchain RPC endpoint**

### 🛠 **Install Dependencies**
Clone the repository and install required dependencies:
```sh
git clone https://github.com/gitshreevatsa/HH-Upgradeable-plugin.git
cd HH-Upgradeable-plugin
npm install
```

### 🔑 **Set Up Environment Variables**
Create a **`.env`** file in the project root and add:
```env
NIL_RPC_ENDPOINT=<your_nil_rpc_endpoint>
NIL=0x0001111111111111111111111111111111111110
```

---

## 🏗 **Compile the Contracts**
Before running the deployment and upgrade process, **compile the contracts** using Hardhat:
```sh
npx hardhat compile
```

---

## ⚡ **Running the Deployment & Upgrade Flow**
Once the contracts are compiled, execute the **full deployment and upgrade process** with:
```sh
npx hardhat test-uups-pattern
```

### ✅ **What This Task Does**
1. **Deploys the initial implementation contract** (`UUPSUpgradeableExample.sol`)
2. **Deploys the proxy contract** (`MyERC1967Proxy.sol`)
3. **Initializes the contract with a value (`42`)**
4. **Fetches stored values using `getValue()`**
5. **Deploys the new implementation contract** (`UUPSUpgradeableExampleV2.sol`)
6. **Upgrades the proxy to point to V2**
7. **Reinitializes the contract (if required)**
8. **Verifies the upgrade by checking state persistence**
9. **Tests the new logic (`deposit()`)**

---

## 🔍 **How Do You Know the Upgrade Worked?**
After upgrading to **V2**, the contract should:
1. **Return the same stored value** when calling `getValue()`, confirming state persistence
2. **Allow interactions with the new logic**, e.g., calling `deposit()` and updating the balance
3. **Show a different implementation address** when fetching it via `getImplementation()`, verifying the upgrade

**✅ If these checks pass, the upgrade was successful!**

---

## 📂 **Project Structure**
```
/contracts
│── UUPSUpgradeableExample.sol     # V1 Implementation contract
│── UUPSUpgradeableExampleV2.sol   # V2 Implementation contract
│── MyERC1967Proxy.sol             # UUPS Proxy contract
/tasks
│── test-uups-pattern.ts           # Hardhat task to deploy & upgrade contracts
/artifacts
│── ...                            # Compiled contract ABIs & bytecode
```

### 📝 **Contract Descriptions**
- **UUPSUpgradeableExample.sol** – Initial smart contract (V1)  
- **MyERC1967Proxy.sol** – Proxy contract for upgradeability  
- **UUPSUpgradeableExampleV2.sol** – New contract (V2) with additional features  

---

## ⚡ **Example Workflow**
### ✅ **Run the Deployment & Upgrade Flow**
```sh
npx hardhat test-uups-pattern
```

### ✅ **Expected Console Output**
```sh
Deployer Address: 0x0001fbf1f94e635f9993b74d77ed4c5de8b3b954
Tx Hash for deployment of UUPS Example Implementation contract: 0x000126c5398c3ff3ad419efd23f21866226a41ee49d81233477b54fb886f5dba
Deployed Implementation Address: 0x0001d14a99bc5e907930f943cff3098898a97cc1
Registration complete!
Encoded initialize function call: 0xfe4b84df000000000000000000000000000000000000000000000000000000000000002a
Tx Hash for deployment of UUPS Proxy contract: 0x000139e403e11c4a699b8bddd8b776bbe091755e1d30eb534ed36ad2948dbb84
Deployed Proxy Address: 0x00019a4a3ad41b1cd41b8692280ec8794f73d1ba
Checking if getImplementation exists in ABI...
Fetching the implementation address from proxy...
Implementation Address from Proxy: 0x0001d14a99Bc5e907930F943CfF3098898A97CC1
Making a call to get the value after initialization...
Call made for getting Value via getValue function
Value after initialization: 42n
Topping Up before upgrade...
Topped up 0.01 ETH
Deploying New Implementation Contract...
Tx Hash for deployment of UUPS Example V2 Implementation contract: 0x00018a1fbb85932bf09b77206b960d7242fc1ab476dd3599e846a6856dcbec9a
Deployed Implementation Address: 0x0001a90bd7629c886ad95d50d4bd4894ddb775b4
Upgrade transaction completed: 0x0001b4ac828fab5ae40a8451134523483ffa95d43dae910f25ec51b22806f00b
Proxy upgraded to V2: 0x0001a90bd7629c886ad95d50d4bd4894ddb775b4
New version reinitialized!
Updated Implementation Address: 0x0001A90BD7629c886ad95D50D4bd4894DDB775b4
Making a call to get the value after reinitialization...
Call made for getting Value via getValue function
Value after reinitialization: 42n
Deposit transaction completed: 0x00011475b4daa4b91243e346c5945116b2e92c839772072ecd13b4204eb8d01c
Deposited 0.0001 ETH
User Balance after deposit: 100000000000000n
```
The above values are experimental, so contract addresses and receipts **will differ** for each user

✔ **This confirms the upgrade worked while preserving state.** 🎉

---

## 🚀 **How to Use This Repository**
### ✅ **1. Modify or Implement Your Own UUPS Contracts**
- Navigate to `/contracts` and update the implementation contract (`UUPSUpgradeableExample.sol`) **or** create your own UUPS-compatible smart contract
- Ensure your contract:
  - **Inherits `UUPSUpgradeable.sol`** from OpenZeppelin
  - **Overrides `_authorizeUpgrade()`** for upgrade permission
  - **Includes an `initialize()` function** for proper setup

Examples for custom **UUPS implementation contracts** can be found in the `./contracts` directory

### ✅ **2. Update the Hardhat Task File**
Modify **`test-uups-pattern.ts`** inside `/tasks`:
- Change file paths for your **V1 and V2 implementation contracts**
- Do **not** modify the proxy contract import

Example:
```typescript
const UUPSExample = require("../artifacts/contracts/MyUpgradeableContract.sol/MyUpgradeableContract.json");
const UUPSV2Example = require("../artifacts/contracts/MyUpgradeableContractV2.sol/MyUpgradeableContractV2.json");
```


### ✅ **3. Update the Funtion Calls and initialisation variables**
Modify **`test-uups-pattern.ts`** inside `/tasks`:
- Change the function calls inside `encodeFuntionData` and `decodeFuntionResult` functions
- Modify the initialisation parameters based on your requirement


---

## 🛠 **Troubleshooting**
### ❌ **"Out of Gas" Error**
- Increase `feeCredit` in the script
- Verify **gas settings** in Hardhat

### ❌ **"Node.js version not supported"**
Use **Node.js v18**:
```sh
nvm install 18
nvm use 18
```

### ❌ **Upgrade Fails**
- Check `_authorizeUpgrade()` is **properly implemented**
- Ensure **V1 and V2 have consistent storage layouts**

---

## 🔗 **Resources**
- 📖 [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)  
- 📖 [OpenZeppelin UUPS Proxies](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)  
- 📖 [Upgradeable Smart Contracts Guide](https://docs.openzeppelin.com/upgrades-plugins/1.x/)  

Here's the updated **Maintenance** section with the note that the project is under maintenance and more updates will be rolled out:

---

## 🔧 **Maintenance Status**
🚧 **This project is currently under maintenance.** 🚧  
There will be more upgrades with respect to flow, documentation, and additional features for a smoother experience.  

Stay tuned for updates! 🚀  

For any issues or suggestions, feel free to **open an issue** or contribute.