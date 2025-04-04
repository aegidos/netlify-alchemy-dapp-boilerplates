require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.NFT_STORAGE_KEY?.trim();
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

async function createCollection() {
  // Log the request details for debugging
  console.log('Sending request with:');
  console.log('- Contract Address:', CONTRACT_ADDRESS);
  console.log('- API Key length:', API_KEY?.length || 0);

  const response = await fetch('https://preserve.nft.storage/api/v1/collection/create_collection', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contractAddress: CONTRACT_ADDRESS,
      collectionName: "ApeChain PoW NFTs",
      chainID: "33111",
      network: "curtis"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Response status:', response.status);
    console.error('Response headers:', response.headers);
    throw new Error(`Failed to create collection: ${errorText}`);
  }

  const collection = await response.json();
  
  // Save collection info to a file for future reference
  const collectionInfo = {
    ...collection,
    contractAddress: CONTRACT_ADDRESS,
    timestamp: new Date().toISOString()
  };
  
  const outputPath = path.join(__dirname, 'collection-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(collectionInfo, null, 2));
  
  console.log('Collection created successfully!');
  console.log('Collection info saved to:', outputPath);
  return collection;
}

async function main() {
  try {
    console.log('Creating collection on NFT.storage...');
    const collection = await createCollection();
    console.log('\nNext steps:');
    console.log('1. Check collection-info.json for collection details');
    console.log('2. Run: node upload.js');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}