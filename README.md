# **UUPS Upgradeable Contracts with Hardhat and nil.js** 🚀  

## **📌 Overview**  
This repository demonstrates **how to work with UUPS (Universal Upgradeable Proxy Standard) upgradeable contracts using Hardhat**.  

It includes:  
- **Deploying & Upgrading UUPS Proxies**
- **Working with Upgradeable Smart Contracts**
- **Two different approaches:**  
  1️⃣ **Single-task deployment & upgrade**  
  2️⃣ **Separate deployment & upgrade tasks**  

---

## **📦 Installation & Setup**  

### **🔧 Prerequisites**  
Ensure you have the following installed:  
- **Node.js v18+** (⚠️ **Avoid Node.js 20+ due to Hardhat compatibility issues**).  
- **Yarn or npm**  
- **Hardhat**  
- **=nil; blockchain RPC endpoint**  

### **🛠 Install Dependencies**  
Clone the repository and install the required dependencies:  
```sh
git clone https://github.com/gitshreevatsa/HH-Upgradeable-plugin.git
cd HH-upgradeable-plugin
npm install
```

### **🔑 Set Up Environment Variables**  
Create a **`.env`** file in the project root and add the following:  
```env
NIL_RPC_ENDPOINT=<your_nil_rpc_endpoint>
NIL=<faucet_address>
```

#### **📌 For Upgrading the Contracts (Using Separate Tasks)**
If you want to upgrade contracts using the **2-task function process**, store your **private key & smart account address** in `.env` along with the above variables:  
```env
PRIVATE_KEY=<your_wallet_private_key>
SMART_ACCOUNT_ADDRESS=<your_smart_account_address>
```
This allows the system to **use the same smart account for both deploying & upgrading**.

---

## **🛠 Actions Performed in This Repository**  

### **1️⃣ Deploy Proxy & Implementation (V1)**
✔ Deploys the **initial implementation contract**.  
✔ Deploys a **proxy contract** pointing to the implementation.  
✔ Initializes the contract (e.g., storing a number).  

✅ **Verification**  
- **Fetch the proxy's implementation address** using `getImplementation()`.  
- **Check the stored value** using `getValue()`.  

---

### **2️⃣ Upgrade Proxy to New Implementation (V2)**
✔ Deploys a **new implementation contract (V2)**.  
✔ Upgrades the proxy to **use V2 instead of V1**.  
✔ Optionally calls `reinitializeV2()` if required.  

✅ **Verification**  
- **Ensure the proxy now points to the new implementation** using `getImplementation()`.  
- **Check if `getValue()` still returns the correct value (state persistence)**.  
- **Test new functions in V2** (e.g., `deposit()`).  

---

## **📂 Repository Structure**  
```
/contracts
│── UUPSUpgradeableExample.sol     # V1 Implementation contract  
│── UUPSUpgradeableExampleV2.sol   # V2 Implementation contract  
│── MyERC1967Proxy.sol             # UUPS Proxy contract  
/tasks
│── test-uups-pattern.ts           # Deploy & upgrade in one task  
│── test-modular.ts                # Separate deploy & upgrade tasks  
/utils
│── deployAndUpgrade.ts            # Functions to handle proxy deployment and upgrade logic  
```

---

## **⚡ Running Deployment & Upgrade Commands**  

### **🔹 Deploying & Upgrading in One Task**  
This method **deploys & upgrades in a single Hardhat task**.  
```sh
npx hardhat test-uups-pattern
```
✅ **Best for:** Quick testing of upgradeability.  

---

### **🔹 Deploy Proxy & Implementation (Separate Tasks)**  
This method **splits deployment & upgrading into two tasks**.  

#### **Step 1️⃣: Deploy Proxy & Implementation**  
```sh
npx hardhat deploy-uups-proxy
```
✔ Deploys **implementation & proxy**.  
✔ Stores the **proxy address** in `proxyAddress.txt`.  

#### **Step 2️⃣: Upgrade to New Implementation**  
```sh
npx hardhat upgrade-uups-proxy --proxy <PROXY_ADDRESS>
```
✔ Deploys **new implementation contract**.  
✔ Upgrades the **proxy to use the new implementation**.  

#### **Check Smart Account**  
To verify the **smart account used**, run:  
```sh
npx hardhat smart-account
```

---

## **🛠 Customizing This Repository for Your Contracts**  

### **1️⃣ Replace the Implementation Contracts**
By default, this repository includes example contracts:  
- `UUPSUpgradeableExample.sol` (V1)  
- `UUPSUpgradeableExampleV2.sol` (V2)  

If you are working on your own upgradeable contract, **replace these files with your own implementation**.  
👉 Make sure your contracts **inherit** from `UUPSUpgradeable.sol`.  

### **2️⃣ Update Imports in Task Files**
Modify **`tasks/test-uups-pattern.ts`** or **`tasks/test-modular.ts`** to import your custom contracts instead of the default ones:
```typescript
const UUPSExample = require("../artifacts/contracts/UUPSUpgradeableExample.sol/UUPSUpgradeableExample.json");
const UUPSV2Example = require("../artifacts/contracts/UUPSUpgradeableExampleV2.sol/UUPSUpgradeableExampleV2.json");
```

### **3️⃣ Set Initialization & Reinitialization Variables**
Your contract may require different parameters during **initialization or reinitialization**.  
👉 Update the initialization variables inside the deployment script:  
```typescript
const initializeArgs = ["myCustomParam1", 1234]; // Update with your contract's parameters
```
👉 Update the reinitialization arguments inside the upgrade script:  
```typescript
const reinitializeArgs = ["updatedParam", 5678]; // Modify as per your new implementation
```
If your V2 implementation **does not require reinitialization**, leave this as an empty array:  
```typescript
const reinitializeArgs = [];
```

### **4️⃣ Run the Hardhat Tasks**
Once the changes are made, follow the same **deployment & upgrade steps** outlined above.

---

## **🔎 How Do You Know the Upgrade Worked?**  
After upgrading to **V2**, check:  
1️⃣ **State Persistence** – `getValue()` should return the **same stored value** as V1.  
2️⃣ **New Logic** – You should be able to call new functions (e.g., `deposit()`).  
3️⃣ **Implementation Address Change** – `getImplementation()` should show a **new address**.  

✅ If all checks pass, **the upgrade was successful!** 🎉  

---

## **🛠 Troubleshooting**  

### **⚠️ "Out of Gas" Errors?**  
Try **increasing `feeCredit`** inside `deployAndUpgrade.ts`.  

### **⚠️ Node.js Version Issues?**  
If you see `"Node.js version not supported"`, downgrade to **Node.js v18**:  
```sh
nvm install 18
nvm use 18
```
---

## **📚 Resources**  
- 📖 [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)  
- 📖 [OpenZeppelin UUPS Proxies](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)  
- 📖 [Upgradeable Smart Contracts Guide](https://docs.openzeppelin.com/upgrades-plugins/1.x/)  

## 🔧 **Maintenance Status**
🚧 **This project is currently under maintenance.** 🚧  
There will be more upgrades with respect to flow, documentation, and additional features for a smoother experience.  

Stay tuned for updates! 🚀  

For any issues or suggestions, feel free to **open an issue** or contribute.