import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const CONTRACT_ADDRESS = '0x6b70b49748abe1191107f20a8f176d50f63050c1';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const APECHAIN_RPC = 'https://apechain.calderachain.xyz/http';

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

const ABI = [
  {
    inputs: [{ internalType: "uint256[]", name: "tokenIds", type: "uint256[]" }],
    name: "burnAndMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokenIds } = req.body;
    
    if (!tokenIds || !Array.isArray(tokenIds)) {
      return res.status(400).json({ error: 'Invalid token IDs' });
    }

    console.log('Attempting to burn tokens:', tokenIds);

    if (!PRIVATE_KEY) {
      console.log('No private key found, returning for client-side burn');
      return res.status(200).json({
        contractAddress: CONTRACT_ADDRESS,
        abi: ABI,
        chain: apeChain,
        transactionParams: {
          gasLimit: 500000,
          maxFeePerGas: '50000000000',  // 50 gwei
          maxPriorityFeePerGas: '2000000000'  // 2 gwei
        }
      });
    }

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    const walletClient = createWalletClient({
      account,
      chain: apeChain,
      transport: http()
    });

    // Execute the burnAndMint transaction
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'burnAndMint',
      args: [tokenIds],
      gas: BigInt(500000),
      maxFeePerGas: BigInt(50000000000), // 50 gwei
      maxPriorityFeePerGas: BigInt(2000000000) // 2 gwei
    });

    console.log(`Burn successful! Transaction hash: ${txHash}`);
    
    return res.status(200).json({
      success: true,
      message: "NFTs burned successfully!",
      txHash: txHash
    });

  } catch (error) {
    console.error("Error in burn API:", error);
    // Return a proper error response
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
}