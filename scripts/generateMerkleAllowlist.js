const { ethers } = require('ethers');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');
const fs = require('fs');
const path = require('path');

// ApeChain RPC
const provider = new ethers.providers.JsonRpcProvider('https://apechain.calderachain.xyz/http');

// Contract configurations
const CONTRACTS = [
    {
        address: '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90',
        name: 'APE GANG',
    },
    {
        address: '0xb3443b6bd585ba4118cae2bedb61c7ec4a8281df',
        name: 'Gs on ape',
    },
    {
        address: '0xfa1c20e0d4277b1e0b289dffadb5bd92fb8486aa',
        name: 'NPC',
    },
    {
        address: '0x91417bd88af5071ccea8d3bf3af410660e356b06',
        name: 'zards',
    },
    {
        address: '0xee0c1016fe325fa755be196cc3fc4d6661e84b11',
        name: 'ETHEREA',
    },
    {
        address: '0x23abf38a6d3ad137c0b219b51243cf326ed66039',
        name: 'Nekito',
    },
    {
        address: '0xdd2da83d07603897b2eb80dc1f7a0b567ad1c2c6',
        name: 'Pixl Pals',
    },
    {
        address: '0xb1cd9a49d51b753b25878c150a920a9294f45022',
        name: 'ASHITA NO KAZE',
    },
    {
        address: '0xe277a7643562775c4f4257e23b068ba8f45608b4',
        name: 'Primal Cult',
    },
    {
        address: '0xcf2e5437b2944def3fc72b0a7488e87467c7d76c',
        name: 'Froglings',
    },
    {
        address: '0x7166dde47b3a6c75eec75c5367ff1f629b1a4603',
        name: 'Driftlands',
    },
    {
        address: '0x1B094A5B06ce05FE443E7cF0B5fDcD6673eb735D', 
        name: 'Trenchers on Ape',
    },
];

// Additional allowed wallet addresses
const ALLOWED_WALLETS = [
    '0x53aa577071e848c2789159842051f992dC22bb51',
    '0x939AC38d9ee95e0E01B88086AAb47786F8e61f5f',
];

async function main() {
    try {
        console.log('Starting to fetch NFT holders...');
        
        // Get all holders from each contract
        const holdersArrays = await Promise.all(CONTRACTS.map(getHolders));
        
        // Combine all holders and allowed wallets, remove duplicates
        const allAddresses = new Set([
            ...ALLOWED_WALLETS,
            ...holdersArrays.flat()
        ]);

        console.log(`\nTotal unique addresses: ${allAddresses.size}`);
        
        // Convert to array and maintain original case
        const addresses = Array.from(allAddresses);

        // Create leaves using abi.encode for consistency with the contract
        const leaves = addresses.map(addr => 
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(['address'], [addr])
            )
        );

        // Create Merkle Tree
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();

        // Generate proofs for each address
        const proofs = {};
        addresses.forEach(addr => {
            const leaf = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(['address'], [addr])
            );
            proofs[addr] = tree.getHexProof(leaf);
        });

        // Save merkle data
        const merkleData = {
            root,
            timestamp: new Date().toISOString(),
            addresses
        };

        // Ensure directories exist
        if (!fs.existsSync(path.join(__dirname, '../data'))) {
            fs.mkdirSync(path.join(__dirname, '../data'));
        }
        if (!fs.existsSync(path.join(__dirname, '../public'))) {
            fs.mkdirSync(path.join(__dirname, '../public'));
        }

        // Write files
        fs.writeFileSync(
            path.join(__dirname, '../data/merkle-data.json'),
            JSON.stringify(merkleData, null, 2)
        );
        fs.writeFileSync(
            path.join(__dirname, '../public/proofs.json'),
            JSON.stringify({ proofs }, null, 2)
        );

        console.log('\nMerkle tree generated successfully!');
        console.log('Root:', root);
        console.log('\nFiles generated:');
        console.log('- data/merkle-data.json');
        console.log('- public/proofs.json');

    } catch (error) {
        console.error('Error generating merkle tree:', error);
        process.exit(1);
    }
}

const getHolders = async (contractConfig) => {
    try {
        console.log(`\n🔍 Checking ${contractConfig.name} at ${contractConfig.address}...`);
        
        const abi = [
            'function totalSupply() view returns (uint256)',
            'function ownerOf(uint256 tokenId) view returns (address)'
        ];
        
        const contract = new ethers.Contract(contractConfig.address, abi, provider);
        const holdersSet = new Set();

        const totalSupply = await contract.totalSupply();
        console.log(`Total Supply for ${contractConfig.name}: ${totalSupply.toString()}`);

        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            try {
                const owner = await contract.ownerOf(tokenId);
                holdersSet.add(owner); // Keep original case
            } catch (err) {
                console.warn(`Token ${tokenId} may have been burned or is invalid.`);
            }

            if ((tokenId + 1) % 10 === 0) {
                console.log(`Checked ${tokenId + 1} tokens for ${contractConfig.name}`);
            }
        }

        const holders = Array.from(holdersSet);
        console.log(`Found ${holders.length} holders for ${contractConfig.name}`);
        return holders;

    } catch (error) {
        console.error(`❌ Error processing ${contractConfig.name}:`, error.message);
        return [];
    }
};

// Run the script
main().catch(console.error);
