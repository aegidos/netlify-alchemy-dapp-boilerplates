const { StandardMerkleTree } = require('@openzeppelin/merkle-tree');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const ERC721_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'function balanceOf(address owner) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)'
];

const ALLOWED_CONTRACTS = [
    {
        address: '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90',
        name: 'APE GANG',
        rpc: 'https://apechain.calderachain.xyz/http',
        chainId: 33139,
        startBlock: 13000000  // Add startBlock based on contract deployment
    },
    {
        address: '0xfC012b768648BECf19f79E70D37B4a76a8E5bD0f',
        name: 'Apes in Space',
        rpc: 'https://curtis.rpc.caldera.xyz/http',
        chainId: 33111
    }
];

async function getHolders(contractConfig) {
    console.log(`\nQuerying ${contractConfig.name} on chain ${contractConfig.chainId}...`);
    const provider = new ethers.providers.JsonRpcProvider(contractConfig.rpc);
    
    try {
        const network = await provider.getNetwork();
        console.log(`Connected to network ${network.chainId}`);
        
        const contract = new ethers.Contract(contractConfig.address, ERC721_ABI, provider);
        const holders = new Set();

        // Try to get total supply first
        try {
            const supply = await contract.totalSupply();
            console.log(`Total supply: ${supply.toString()}`);
        } catch (e) {
            console.log('Could not get total supply:', e.message);
        }

        // Get blocks range
        const latestBlock = await provider.getBlockNumber();
        console.log(`Latest block: ${latestBlock}`);
        const fromBlock = contractConfig.startBlock || Math.max(0, latestBlock - 500000); // Look back further
        
        // Split the range into chunks to avoid RPC timeout
        const CHUNK_SIZE = 50000;
        const chunks = [];
        for (let i = fromBlock; i < latestBlock; i += CHUNK_SIZE) {
            chunks.push({
                from: i,
                to: Math.min(i + CHUNK_SIZE - 1, latestBlock)
            });
        }

        // Process chunks
        for (const chunk of chunks) {
            console.log(`\nFetching transfers from blocks ${chunk.from} to ${chunk.to}...`);
            try {
                const events = await contract.queryFilter('Transfer', chunk.from, chunk.to);
                console.log(`Found ${events.length} transfer events in this chunk`);

                for (const event of events) {
                    const holder = event.args.to;
                    try {
                        const balance = await contract.balanceOf(holder);
                        if (balance.gt(0)) {
                            holders.add(holder.toLowerCase());
                            console.log(`Current holder count: ${holders.size}`);
                        }
                    } catch (e) {
                        console.error(`Error checking balance for ${holder}:`, e.message);
                    }
                }
            } catch (e) {
                console.error(`Error processing chunk:`, e.message);
            }
        }

        const holdersList = Array.from(holders);
        console.log(`\nTotal holders found: ${holdersList.length}`);
        return holdersList;

    } catch (error) {
        console.error(`Error processing ${contractConfig.name}:`, error);
        return [];
    }
}

async function main() {
    const allHolders = new Set();

    for (const contract of ALLOWED_CONTRACTS) {
        console.log(`\nProcessing ${contract.name}...`);
        const holders = await getHolders(contract);
        console.log(`\nFound ${holders.length} holders for ${contract.name}`);
        holders.forEach(holder => allHolders.add(holder));
    }

    if (allHolders.size === 0) {
        console.error('\nError: No holders found for any contract!');
        process.exit(1);
    }

    // Create merkle tree
    console.log(`\nCreating Merkle tree with ${allHolders.size} total holders...`);
    const tree = StandardMerkleTree.of(
        Array.from(allHolders).map(addr => [addr]),
        ['address']
    );

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // Save results
    const treeData = {
        tree: tree.dump(),
        root: tree.root,
        timestamp: new Date().toISOString(),
        totalHolders: allHolders.size
    };

    fs.writeFileSync(
        path.join(dataDir, 'merkle-tree.json'),
        JSON.stringify(treeData, null, 2)
    );

    // Generate and save proofs
    const proofs = {};
    for (const [i, v] of tree.entries()) {
        proofs[v[0]] = tree.getProof(i);
    }

    fs.writeFileSync(
        path.join(dataDir, 'merkle-proofs.json'),
        JSON.stringify(proofs, null, 2)
    );

    console.log(`\nMerkle root: ${tree.root}`);
    console.log(`Total unique holders: ${allHolders.size}`);
}

main().catch(console.error);