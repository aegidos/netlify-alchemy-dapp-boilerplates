const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const NEKITO_ADDRESS = '0x23abf38a6d3ad137c0b219b51243cf326ed66039';
const SUSPECT_ADDRESS = '0xecf66f586f109f91ddfd6df472298dd11ca64a76';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// Enhanced ABI with more events
const ABI = [
    'function mint(address _to, uint256 _amount, bytes32 _phaseID, uint256 _price, uint256 _maxPerTx, uint256 _maxPerUser, uint256 _maxPerPhase, bytes32 _nonce, bytes memory _signature) payable',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Mint(address indexed caller, address indexed to, uint256 amount)'
];

async function analyzeTransactions() {
    try {
        console.log('Starting transaction analysis...');
        const provider = new ethers.providers.JsonRpcProvider('https://apechain.calderachain.xyz/http', {
            chainId: 33139,
            timeout: 120000
        });

        console.log('Checking connection...');
        const network = await provider.getNetwork();
        console.log('Connected to network:', network);

        const contract = new ethers.Contract(NEKITO_ADDRESS, ABI, provider);

        // Set specific block range around known mint
        const startBlock = 6994110; // Start a few blocks before
        const endBlock = 6997751;   // End a few blocks after

        console.log(`\nAnalyzing blocks ${startBlock} to ${endBlock}`);

        // Look for any transfers to suspect address
        const transferFilter = {
            fromBlock: startBlock,
            toBlock: endBlock,
            address: NEKITO_ADDRESS,
            topics: [
                ethers.utils.id("Transfer(address,address,uint256)"),
                null, // Any from address
                ethers.utils.hexZeroPad(SUSPECT_ADDRESS, 32)
            ]
        };

        console.log('\nFetching transfer events...');
        const transfers = await provider.getLogs(transferFilter);
        console.log(`Found ${transfers.length} transfers`);

        // Process each transfer
        for (const transfer of transfers) {
            const tx = await provider.getTransaction(transfer.transactionHash);
            const receipt = await provider.getTransactionReceipt(transfer.transactionHash);
            const block = await provider.getBlock(transfer.blockNumber);

            console.log('\n=== Transfer Details ===');
            console.log('Block:', transfer.blockNumber);
            console.log('Timestamp:', new Date(block.timestamp * 1000).toISOString());
            console.log('From:', ethers.utils.hexDataSlice(transfer.topics[1], 12));
            console.log('To:', ethers.utils.hexDataSlice(transfer.topics[2], 12));
            console.log('Token ID:', parseInt(transfer.topics[3], 16));
            console.log('TX Hash:', transfer.transactionHash);
            console.log('Transaction sender:', tx.from);
            console.log('Gas used:', receipt.gasUsed.toString());
            console.log('Gas price:', ethers.utils.formatUnits(tx.gasPrice, 'gwei'), 'gwei');
            console.log('Value sent:', ethers.utils.formatEther(tx.value), 'APE');
        }

    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        process.exit(1);
    }
}

analyzeTransactions().catch(console.error);