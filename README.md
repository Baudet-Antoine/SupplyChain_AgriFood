##  🔧 Setting up Local Development

### Step1.
## Installation and Setup

* **VSCODE** : VSCode can be downloaded from https://code.visualstudio.com/
* **Node.js** : Download the latest version of Node.js from https://nodejs.org/ and after installation check     Version using terimal: node -v .

* **Ganache** : Download the latest version of Ganache from the official website at https://www.trufflesuite.com/ganache.
* **MetaMask** : can be installed as a browser extension from the Chrome Web Store at https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?pli=1
* **Pinata**: Create an account from https://www.pinata.cloud/ , then create a new API key from your account and save the data of that key.

### Step 2.
## Connect Meta Musk with Ganache. 

1. Start Ganache: Start the Ganache application and make note of the RPC server URL and port number.

2. Connect MetaMask: Open MetaMask in your browser and click on the network dropdown in the top-left corner.

Select "Add network" at the bottom of the dropdown menu, then select "Add a network manually" at the bottom of the page and enter the following data:

* For "Network Name" enter "Ganache Local"
* For "New RPC URL" enter your Ganache RPC Server URL (for istance HTTP://127.0.0.1:7545)
* For "Chain ID" enter 1337
* For "Currency symbol" enter "ETH"

Click "Save".

3. Import an account: In Ganache, click on the "Accounts" tab and select the first account listed, click on the icon of a key, and copy the "Private Key" field.
 
4. In MetaMask, click on the central dropdown menu, click on "Add account or hardware wallet", select "Import Account", and paste the private key into the private key field. Click "Import".

5. Add All participate(Raw Material,Supplier,Manufacture,Retail). by following above Step

### Step 3
## Modify the .env file in the client folder

* From Ganache copy the address of the first account listed for the variable REACT_APP_OWNER_ADDRESS.
* From your Pinata account copy the API key and the private key for variables REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY.
  
### Step 4.
## Create,Compile & Deploy Smart Contract. 

* Download and open the SupplyChain_agriFood project with VScode and open VScode Terminal then + and select Command Prompt.
* **Install truffle** : Type the following command and press Enter: `npm install -g truffle`
* **File structure for  DApp** : 
  
    **contracts**: This folder contains the Solidity smart contracts for the DApp. The Migrations.sol contract is automatically created by Truffle and is used for managing migrations.

    **migrations**: This folder contains the JavaScript migration files used to deploy the smart contracts to the blockchain network.

    **test**: This folder contains the JavaScript test files used to test the smart contracts.

    **truffle-config.js**: This file contains the configuration for the Truffle project, including the blockchain network to be used and any necessary settings.

    **package.json**: This file contains information about the dependencies and scripts used in the project.

    **package-lock.json**: This file is generated automatically and contains the exact version of each dependency used in the project.

    **Client**s: This Folder contains the client-side code, typically HTML, CSS, and JavaScript, can be organized into a client folder.
* **Compile the smart contract** :  In the terminal, use the following command to compile the smart contract: `truffle compile` 
* **Deploy the smart contract** :
   
    * After Compile We Need To Deploy Your Smart Contract on Blockchain. In Our Case We are Using Ganache Which is personal blockchain for Ethereum development, used to test and develop Smart Contracts.

    * Open Ganache and create new WorkSpace. Copy RPC SERVER Address (should be HTTP://127.0.0.1:7545).

    * The RPC server is used to allow applications to communicate with the Ethereum blockchain and execute smart contract transactions, query the state of the blockchain, and interact with the Ethereum network.

    * Now we need to add Rcp address in our truffle-config.js, uncomment from line 46 to 50, and the replace host address and port address with Our Ganache Rcp.
  
    * After Changing RCP address.Open terminal and run this cmd : `truffle migrate`.
    * This Command Will deploye Smart Contract to Blockchain.

### Step 5.
## Run DAPP. 
* Open a second terminal (again Command Prompt) and enter the client folder
  * `cd client`
 
* Install all packages in the package.json file
  * `npm i`
  
* Install the following packages in the package.json file
  * `npm install -save web3`
  * `npm install -save react-select`
  * `npm install -save react-router-dom`
  * `npm install -save react-i18next`
  * `npm install -save country-flag-icons`
  * `npm install -save react-overlays`
  * `npm install -save react-bootstrap`

* Run this Command :
  * `npm`
 
* Run the app 
  * `npm start`

* The app gets hosted by default at port 3000.


