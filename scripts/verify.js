const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function verifyContract() {
    const deploymentInfo = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'deployment-info.json'), 'utf8')
    );

    // Read and clean up the constructor arguments
    const constructorArgs = fs.readFileSync(
        path.join(__dirname, 'constructorarugments.txt'), 
        'utf8'
    )
    .trim()
    .split('\n')[0]
    .replace(/^0x/, ''); // Remove '0x' prefix if present

    // Read the flattened source code and clean up license identifiers
    let sourceCode = fs.readFileSync(
        path.join(__dirname, '../contracts/ApeChainPoWNFTFlat_new.sol'), 
        'utf8'
    );

    const verificationBody = {
        apikey: '8AIZVW9PAGT3UY6FCGRZFDJ51SZGDIG13X',
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: deploymentInfo.contractAddress,
        sourceCode: sourceCode,
        codeformat: 'solidity-single-file',
        contractname: 'ApeChainPoWNFT',
        compilerversion: 'v0.8.24+commit.e11b9ed9',
        optimizationUsed: 1,
        runs: 200,
        evmversion: 'paris',
        licenseType: 3,
        constructorArguements: constructorArgs
    };

    try {
        const response = await axios.post('https://api.apescan.io/api', verificationBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Verification Response:', response.data);
        
        if (response.data.status === '1') {
            console.log('Verification submitted successfully!');
            console.log('GUID:', response.data.result);
            
            setTimeout(async () => {
                await checkVerificationStatus(response.data.result);
            }, 30000);
        } else {
            console.error('Verification submission failed:', response.data.result);
        }
    } catch (error) {
        console.error('Error during verification:', error.message);
    }
}

async function checkVerificationStatus(guid) {
    try {
        const response = await axios.get('https://api.apescan.io/api', {
            params: {
                apikey: '8AIZVW9PAGT3UY6FCGRZFDJ51SZGDIG13X',
                module: 'contract',
                action: 'checkverifystatus',
                guid: guid
            }
        });

        console.log('Verification Status:', response.data);
    } catch (error) {
        console.error('Error checking verification status:', error.message);
    }
}

verifyContract().catch(console.error);