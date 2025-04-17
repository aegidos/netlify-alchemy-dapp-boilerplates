const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function verifyProof() {
    try {
        const proofsPath = path.join(__dirname, '../public/proofs.json');
        if (!fs.existsSync(proofsPath)) {
            console.error('Error: proofs.json not found in public directory');
            return;
        }

        const proofsRaw = fs.readFileSync(proofsPath, 'utf8');
        const proofsData = JSON.parse(proofsRaw);
        
        // Use original case for address
        const address = '0x939AC38d9ee95e0E01B88086AAb47786F8e61f5f';
        
        const proof = proofsData.proofs[address];
        
        if (!proof) {
            console.error(`No proof found for address: ${address}`);
            console.log('Available addresses:', Object.keys(proofsData.proofs));
            return;
        }

        console.log('\nCorrect proof format for explorer:');
        console.log(JSON.stringify(proof, null, 2));
        
        if (Array.isArray(proof)) {
            console.log('\nProof validation:');
            console.log('Number of proof elements:', proof.length);
            console.log('All elements are hex strings:', proof.every(p => /^0x[0-9a-f]{64}$/i.test(p)));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyProof().catch(console.error);


