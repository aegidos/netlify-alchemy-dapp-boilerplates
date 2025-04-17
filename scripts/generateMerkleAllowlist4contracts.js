const { ethers } = require('ethers');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');
const fs = require('fs');

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
];

// Additional allowed wallet addresses
const ALLOWED_WALLETS = [
  '0x53aa577071e848c2789159842051f992dC22bb51',
  '0x939AC38d9ee95e0E01B88086AAb47786F8e61f5f',
];

const abi = [
  'function totalSupply() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
];

const getHolders = async (contractConfig) => {
  try {
    console.log(`\n🔍 Checking ${contractConfig.name} at ${contractConfig.address}...`);
    const contract = new ethers.Contract(contractConfig.address, abi, provider);
    const holdersSet = new Set();

    const totalSupply = await contract.totalSupply();
    console.log(`Total Supply for ${contractConfig.name}: ${totalSupply.toString()}`);

    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        holdersSet.add(owner.toLowerCase());
      } catch (err) {
        console.warn(`Token ${tokenId} may have been burned or is invalid.`);
      }

      if ((tokenId + 1) % 10 === 0) {
        console.log(`Checked ${tokenId + 1} tokens for ${contractConfig.name}`);
      }
    }

    return Array.from(holdersSet);
  } catch (error) {
    console.error(`❌ Error processing ${contractConfig.name}:`, error.message);
    return [];
  }
};

async function generateMerkleTree(addresses) {
  // Hash addresses the same way the contract does
  const leaves = addresses.map(addr => 
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['address'], [addr])
    )
  );

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getHexRoot();

  const proofs = {};
  addresses.forEach(addr => {
    const leaf = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['address'], [addr])
    );
    proofs[addr.toLowerCase()] = tree.getHexProof(leaf);
  });

  const merkleData = {
    root,
    timestamp: new Date().toISOString(),
    addresses: addresses,
    proofs
  };

  // Save to data directory
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  fs.writeFileSync('./data/merkle-data.json', JSON.stringify(merkleData, null, 2));

  // Also save to public directory for frontend access
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
  fs.writeFileSync('./public/proofs.json', JSON.stringify({ proofs }, null, 2));

  return root;
}

(async () => {
  try {
    const allHolders = new Set();

    // Process each contract
    for (const contract of CONTRACTS) {
      const holders = await getHolders(contract);
      console.log(`✅ Found ${holders.length} holders for ${contract.name}`);
      holders.forEach(holder => allHolders.add(holder));
    }

    console.log(`\n🔍 Total unique holders found: ${allHolders.size}`);

    // Generate and save Merkle tree
    const root = await generateMerkleTree(Array.from(allHolders));
    console.log(`\n🌳 Merkle root: ${root}`);
    console.log('✨ All Merkle data saved to disk.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
