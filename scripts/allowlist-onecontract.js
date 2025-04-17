const { ethers } = require('ethers');
const keccak256 = require('keccak256');
const { MerkleTree } = require('merkletreejs');
const fs = require('fs');

// ApeChain RPC
const provider = new ethers.providers.JsonRpcProvider('https://apechain.calderachain.xyz/http');

// Your contract address and ABI
const contractAddress = '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90';
const abi = [
  'function tokenCounter() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
];

const getHolders = async () => {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const holdersSet = new Set();

  const totalMinted = await contract.tokenCounter();
  console.log(`Token Counter: ${totalMinted.toString()}`);

  for (let tokenId = 0; tokenId < totalMinted; tokenId++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      holdersSet.add(owner.toLowerCase());
    } catch (err) {
      console.warn(`Token ${tokenId} may have been burned or is invalid.`);
    }

    if ((tokenId + 1) % 10 === 0) {
      console.log(`Checked ${tokenId + 1} tokens`);
    }
  }

  const holders = Array.from(holdersSet);
  console.log(`✅ Found ${holders.length} unique holders`);
  return holders;
};

const generateMerkleTree = (addresses) => {
  const leaves = addresses.map(addr => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const root = tree.getHexRoot();
  console.log(`🔗 Merkle Root: ${root}`);

  fs.writeFileSync('./allowlist.json', JSON.stringify(addresses, null, 2));
  fs.writeFileSync('./merkleRoot.txt', root);
  fs.writeFileSync(
    './proofs.json',
    JSON.stringify(
      Object.fromEntries(
        addresses.map(addr => [addr, tree.getHexProof(keccak256(addr))])
      ),
      null,
      2
    )
  );

  return root;
};

(async () => {
  try {
    const holders = await getHolders();
    generateMerkleTree(holders);
    console.log('✨ All Merkle data saved to disk.');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
