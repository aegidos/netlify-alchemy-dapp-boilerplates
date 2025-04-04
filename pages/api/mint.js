import { createPublicClient, http, createWalletClient } from 'viem';
import { curtis } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Update ABI to match new mint function signature
const ABI = [{
  "inputs": [
    {"internalType": "address", "name": "to", "type": "address"}
  ],
  "name": "mint",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}];

// Update this with your new deployed contract address
const CONTRACT_ADDRESS = "0xfc012b768648becf19f79e70d37b4a76a8e5bd0f";
const RPC_URL = "https://curtis.rpc.caldera.xyz/http";

// Format and validate private key
const privateKey = process.env.PRIVATE_KEY?.startsWith('0x') 
  ? process.env.PRIVATE_KEY 
  : `0x${process.env.PRIVATE_KEY}`;

if (!privateKey) {
  throw new Error('PRIVATE_KEY environment variable is required');
}

// Create account once
const account = privateKeyToAccount(privateKey);

// Create clients outside request handler
const publicClient = createPublicClient({
  chain: curtis,
  transport: http(RPC_URL)
});

const walletClient = createWalletClient({
  account,
  chain: curtis,
  transport: http(RPC_URL)
});

export default async function handler(req, res) {
  try {
    const { walletAddress } = req.body;
    console.log('Starting mint process with:', { walletAddress });
    
    // Prepare transaction with single argument
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'mint',
      args: [walletAddress], // Only pass the wallet address now
      account: account.address
    });

    console.log('Transaction simulation successful');

    // Sign and send transaction
    const hash = await walletClient.writeContract({
      ...request,
      account
    });

    return res.status(200).json({ 
      success: true,
      hash,
      message: 'Random NFT minting initiated',
      details: {
        walletAddress,
        transactionHash: hash
      }
    });

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      cause: error.cause?.message,
      data: error.data
    });

    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.cause?.message
    });
  }
}