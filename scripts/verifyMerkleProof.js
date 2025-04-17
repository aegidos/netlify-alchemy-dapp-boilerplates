const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const path = require('path');

async function verifyMerkleProof() {
    // Read merkle data
    const merkleData = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '../data/merkle-data.json'),
            'utf8'
        )
    );

    // Read proofs
    const proofsData = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, '../public/proofs.json'),
            'utf8'
        )
    );

    const address = '0x939AC38d9ee95e0E01B88086AAb47786F8e61f5f';
    const proof = proofsData.proofs[address];

    // Recreate leaf node
    const leaf = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(['address'], [address])
    );

    // Verify proof
    const tree = new MerkleTree(
        merkleData.addresses.map(addr => 
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(['address'], [addr])
            )
        ),
        keccak256,
        { sortPairs: true }
    );

    const isValid = tree.verify(proof, leaf, merkleData.root);
    console.log('Verification result:', isValid);
    console.log('Expected root:', merkleData.root);
    console.log('Calculated root:', tree.getHexRoot());
}

verifyMerkleProof().catch(console.error);