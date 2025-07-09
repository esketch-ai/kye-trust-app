import { ethers } from 'ethers';
import contractAddress from '../contracts/contract-address.json';
import kyeTrustFactoryAbi from '../contracts/KyeTrustFactory.json';
import kyeTrustAbi from '../contracts/KyeTrust.json';
import { functions } from '../firebase'; // Assuming you have firebase functions initialized
import { httpsCallable } from 'firebase/functions';

// Define the callable Firebase Function for recording transactions
const recordKyeDepositTransaction = httpsCallable(functions, 'recordKyeDepositTransaction');

// Hardhat local node URL (for development)
const HARDHAT_NODE_URL = "http://127.0.0.1:8545";

let provider: ethers.JsonRpcProvider | null = null;
let factoryContract: ethers.Contract | null = null;
const listenedKyes: Set<string> = new Set(); // To keep track of Kyes we are already listening to

export const setupBlockchainEventListeners = async () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(HARDHAT_NODE_URL);
  }

  if (!factoryContract) {
    factoryContract = new ethers.Contract(
      contractAddress.KyeTrustFactory,
      kyeTrustFactoryAbi.abi,
      provider
    );

    // Listen for KyeCreated events from the factory
    factoryContract.on("KyeCreated", (kyeAddress, name, goalAmount, owner) => {
      console.log("KyeCreated Event Detected:", {
        kyeAddress,
        name,
        goalAmount: ethers.formatEther(goalAmount),
        owner,
      });
      // Once a Kye is created, set up a listener for its contributions
      listenForKyeContributions(kyeAddress);
    });
    console.log("Listening for KyeCreated events...");
  }

  // Also, listen for events from already deployed Kyes (if any)
  try {
    const deployedKyeAddresses: string[] = await factoryContract.getDeployedKyes();
    for (const kyeAddress of deployedKyeAddresses) {
      listenForKyeContributions(kyeAddress);
    }
  } catch (error: any) {
    console.warn("Could not fetch deployed Kyes initially (likely none yet):", error.message);
  }
};

const listenForKyeContributions = (kyeAddress: string) => {
  if (listenedKyes.has(kyeAddress)) {
    return; // Already listening
  }

  const kyeContract = new ethers.Contract(kyeAddress, kyeTrustAbi.abi, provider);

  kyeContract.on("ContributionReceived", async (member, turn, amount) => {
    console.log("ContributionReceived Event Detected:", {
      kyeAddress,
      member,
      turn,
      amount: ethers.formatEther(amount),
    });

    // --- Placeholder for calling Firebase Function ---
    // In a real scenario, you would call the Firebase Function here
    // to record this transaction in Firestore.
    try {
      // Example call (uncomment and ensure Firebase Functions are deployed)
      // const result = await recordKyeDepositTransaction({
      //   kyeId: kyeAddress,
      //   transactionHash: "", // You'd get this from the actual transaction receipt
      //   amount: parseFloat(ethers.formatEther(amount)),
      //   fromAddress: member,
      //   toAddress: kyeAddress, // Or the contract owner/treasurer
      // });
      // console.log("Firebase Function call result:", result);
    } catch (error) {
      console.error("Error calling Firebase Function:", error);
    }
    // --------------------------------------------------
  });
  listenedKyes.add(kyeAddress);
  console.log(`Listening for ContributionReceived events on Kye: ${kyeAddress}`);
};
