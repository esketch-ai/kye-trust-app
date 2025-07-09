
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// This line is added to fix the ts-node issue
import "ts-node/register";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    sources: "./contracts", // Use the existing contracts folder
    artifacts: "./src/artifacts", // Output artifacts to the src folder
  },
  networks: {
    hardhat: {
      chainId: 1337, // Standard for local testing
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    baobab: { // Klaytn Baobab Testnet
      url: "https://klaytn-baobab-rpc.allthatnode.com:8551", // All That Node RPC URL
      accounts: ["0x2271463ff28435be776aa43dd01afed1c97fd8f6e7cc5f4bd9632d15d829e440"], // Replace with your private key
      chainId: 1001, // Klaytn Baobab Chain ID
      gasPrice: 250000000000, // Klaytn's default gas price (250 Gwei)
    },
    // Add other networks like Sepolia, etc. here
  },
};

export default config;
