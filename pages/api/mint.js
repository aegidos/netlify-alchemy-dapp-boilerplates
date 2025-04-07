import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x223a0d58e50bb9c03261fc34dd271a9eaf1ffb6d';
const APECHAIN_RPC = 'https://apechain.calderachain.xyz/http';
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Add this to .env

// Define proper ApeChain configuration
const apeChain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [APECHAIN_RPC],
    },
    public: {
      http: [APECHAIN_RPC],
    },
  },
  blockExplorers: {
    default: { name: 'ApeChain Explorer', url: 'https://apechain.calderaexplorer.xyz/' },
  },
  testnet: false
};

const publicClient = createPublicClient({
  transport: http(APECHAIN_RPC),
  chain: apeChain
});

export default async function handler(req, res) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
    
    console.log(`Minting NFT to address: ${walletAddress}`);

    // If we have a private key, perform server-side minting
    if (PRIVATE_KEY) {
      try {
        // Create account from private key
        const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
        
        // Create wallet client
        const walletClient = createWalletClient({
          account,
          chain: apeChain,
          transport: http(APECHAIN_RPC)
        });

        // Execute the mint transaction
        const txHash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'mint',
          args: [walletAddress],
          gas: BigInt(1500000),  // Keep this high gas limit
          maxFeePerGas: BigInt(50000000000), // 50 gwei (much higher than the 25.4 gwei base fee)
          maxPriorityFeePerGas: BigInt(2000000000) // 2 gwei
        });

        console.log(`NFT minted successfully! Transaction hash: ${txHash}`);
        
        // Return success response
        return res.status(200).json({
          success: true,
          message: "NFT minted successfully!",
          txHash: txHash
        });
      } catch (error) {
        console.error("Error during server-side minting:", error);
        // Continue to return contract details for client-side minting as fallback
      }
    }

    // Return contract details for client-side minting with consistent gas params
    console.log("Returning contract details for client-side minting");
    return res.status(200).json({
      contractAddress: CONTRACT_ADDRESS,
      abi: ABI,
      chain: apeChain,
      transactionParams: {
        gasLimit: 1500000, // Keep high gas limit
        maxFeePerGas: '50000000000',  // 50 gwei (same as server-side)
        maxPriorityFeePerGas: '2000000000'  // 2 gwei (same as server-side)
      }
    });
  } catch (error) {
    console.error("Error in mint API:", error);
    return res.status(500).json({ error: error.message });
  }
}

