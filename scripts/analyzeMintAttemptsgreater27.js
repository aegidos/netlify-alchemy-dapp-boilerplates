const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const NEKITO_ADDRESS = '0x23abf38a6d3ad137c0b219b51243cf326ed66039';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const HIGH_VALUE_THRESHOLD = 27; // APE threshold

async function analyzeTransactions() {
    try {
        console.log('Starting high-value mint analysis...');
        const provider = new ethers.providers.JsonRpcProvider('https://apechain.calderachain.xyz/http', {
            chainId: 33139,
            timeout: 120000
        });

        const startBlock = 6994110;
        const endBlock = 6997751;

        // Modified filter to only look at transfers from NULL address (mints)
        const mintFilter = {
            fromBlock: startBlock,
            toBlock: endBlock,
            address: NEKITO_ADDRESS,
            topics: [
                ethers.utils.id("Transfer(address,address,uint256)"),
                ethers.utils.hexZeroPad(NULL_ADDRESS, 32) // From NULL address = mint
            ]
        };

        console.log('\nFetching mint events...');
        const mints = await provider.getLogs(mintFilter);
        
        const highValueMints = [];
        let totalHighValueMints = 0;

        for (const mint of mints) {
            const tx = await provider.getTransaction(mint.transactionHash);
            const value = parseFloat(ethers.utils.formatEther(tx.value));
            
            if (value > HIGH_VALUE_THRESHOLD) {
                totalHighValueMints++;
                const receipt = await provider.getTransactionReceipt(mint.transactionHash);
                const block = await provider.getBlock(mint.blockNumber);

                highValueMints.push({
                    blockNumber: mint.blockNumber,
                    timestamp: new Date(block.timestamp * 1000).toISOString(),
                    to: ethers.utils.hexDataSlice(mint.topics[2], 12),
                    tokenId: parseInt(mint.topics[3], 16),
                    transactionHash: mint.transactionHash,
                    minter: tx.from,
                    gasUsed: receipt.gasUsed.toString(),
                    gasPrice: ethers.utils.formatUnits(tx.gasPrice, 'gwei'),
                    mintCost: value.toString()
                });

                console.log(`Found high-value mint: ${value} APE by ${tx.from}`);
            }
        }

        const analysis = {
            contractAddress: NEKITO_ADDRESS,
            analysisPeriod: {
                startBlock,
                endBlock
            },
            summary: {
                totalMints: mints.length,
                highValueMints: totalHighValueMints,
                threshold: HIGH_VALUE_THRESHOLD
            },
            mints: highValueMints
        };

        fs.writeFileSync(
            path.join(__dirname, 'mint-analysis.json'),
            JSON.stringify(analysis, null, 2)
        );

        console.log('\n=== Analysis Summary ===');
        console.log(`Total mints analyzed: ${mints.length}`);
        console.log(`High-value mints (>${HIGH_VALUE_THRESHOLD} APE): ${totalHighValueMints}`);
        console.log('Full analysis written to mint-analysis.json');

    } catch (error) {
        console.error('Analysis error:', error);
        process.exit(1);
    }
}

analyzeTransactions().catch(console.error);