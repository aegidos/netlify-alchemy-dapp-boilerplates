const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');

async function verifyMerkleRoot() {
    const address = '0x939ac38d9ee95e0e01b88086aab47786f8e61f5f';
    const leaf = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [address]));
    
    // Your merkle root from the contract
    const expectedRoot = '0x03384e646958e6a30f5d9bdb9a1d8a8da4f42df14dec55bc879d2702aaf37224';
    
    console.log('Leaf:', leaf);
    console.log('Expected root:', expectedRoot);
}

verifyMerkleRoot();