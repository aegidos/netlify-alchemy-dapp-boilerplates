require("dotenv").config();
const fs = require("fs");
const path = require("path");
const FormData = require('form-data');
const fetch = require('node-fetch');

const PINATA_API_KEY = process.env.PINATA_API_KEY?.trim();
const PINATA_API_SECRET = process.env.PINATA_API_SECRET?.trim();

if (!PINATA_API_KEY || !PINATA_API_SECRET) {
  console.error('PINATA_API_KEY or PINATA_API_SECRET not found in environment');
  process.exit(1);
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function uploadToPinata(filePath, metadata) {
  try {
    // First upload the image
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const pinataMetadata = JSON.stringify({
      name: metadata.name,
      keyvalues: {
        description: metadata.description
      }
    });
    form.append('pinataMetadata', pinataMetadata);

    const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
      body: form
    });

    if (!imageResponse.ok) {
      throw new Error(`Image upload failed: ${await imageResponse.text()}`);
    }

    const imageResult = await imageResponse.json();
    const imageUrl = `ipfs://${imageResult.IpfsHash}`;
    console.log(`Image uploaded: ${imageUrl}`);

    // Create and upload metadata JSON
    const metadataJSON = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Type",
          value: metadata.file.replace(/[_.]/g, '').toUpperCase() // Cleanup filename to just type letter
        }
      ]
    };

    const metadataForm = new FormData();
    const metadataBuffer = Buffer.from(JSON.stringify(metadataJSON, null, 2));
    metadataForm.append('file', metadataBuffer, {
      filename: `${metadata.file.replace('.png', '')}_metadata.json`,
      contentType: 'application/json',
    });

    const jsonResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
      body: metadataForm
    });

    if (!jsonResponse.ok) {
      throw new Error(`Metadata upload failed: ${await jsonResponse.text()}`);
    }

    const jsonResult = await jsonResponse.json();
    const metadataUrl = `ipfs://${jsonResult.IpfsHash}`;
    console.log(`Metadata uploaded: ${metadataUrl}`);

    return {
      name: metadata.name,
      description: metadata.description,
      imageUrl: imageUrl,
      metadataUrl: metadataUrl,
      imageIpfsHash: imageResult.IpfsHash,
      metadataIpfsHash: jsonResult.IpfsHash
    };
  } catch (error) {
    console.error(`Error in uploadToPinata:`, error);
    throw error;
  }
}

async function checkIfPinExists(name) {
  try {
    const response = await fetch(
      `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"name":{"value":"${name}","op":"eq"}}`,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Check failed: ${await response.text()}`);
    }

    const data = await response.json();
    return data.rows.length > 0 ? data.rows[0] : null;
  } catch (error) {
    console.error(`Error checking pin: ${error.message}`);
    return null;
  }
}

async function uploadNFTs() {
  const nftData = [
    { file: "_A.png", name: "Hushrooms", description: "Hushrooms Base NFT Type A" },
    { file: "_B.png", name: "Firegrassbush", description: "Firegrassbush Base NFT Type B" },
    { file: "_C.png", name: "Rangones", description: "Rangones Base NFT Type C" },
    { file: "_D.png", name: "Blueleaf", description: "Blueleaf Base NFT Type D" },
    { file: "_E.png", name: "Stinkballtrees", description: "Stinkballtrees Base NFT Type E" },
    { file: "_F.png", name: "Snakeroots", description: "Snakeroots Base NFT Type F" },
    { file: "G.png", name: "Magic Mana + Cure", description: "Evolved Elixir NFT Type G" },
    { file: "H.png", name: "Mana", description: "Evolved Elixir NFT Type H" },
    { file: "I.png", name: "Cure 25", description: "Evolved Elixir NFT Type I" },
    { file: "J.png", name: "Cure 50", description: "Evolved Elixir NFT Type J" }
  ];

  const results = [];

  for (const nft of nftData) {
    try {
      console.log(`\nProcessing ${nft.file}...`);

      const filePath = path.join(__dirname, 'nfts/images', nft.file); // Update path to use images subdirectory
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }

      const uploadResult = await uploadToPinata(filePath, {
        name: nft.name,
        description: nft.description,
        file: nft.file
      });

      // Save local copy of metadata JSON
      const metadataPath = path.join(
        __dirname, 
        'nfts/metadata', 
        `${nft.file.replace('.png', '.json')}`
      );
      
      fs.writeFileSync(
        metadataPath,
        JSON.stringify({
          name: nft.name,
          description: nft.description,
          image: uploadResult.imageUrl,
          attributes: [{
            trait_type: "Type",
            value: nft.file.replace(/[_.]/g, '').toUpperCase()
          }]
        }, null, 2)
      );

      results.push({
        file: nft.file,
        name: nft.name,
        imageUrl: uploadResult.imageUrl,
        metadataUrl: uploadResult.metadataUrl, // This is what you'll use in the contract
        imageIpfsHash: uploadResult.imageIpfsHash,
        metadataIpfsHash: uploadResult.metadataIpfsHash
      });

      await delay(1000); // Rate limiting
    } catch (error) {
      console.error(`Error processing ${nft.file}:`, error.message);
    }
  }

  const outputPath = path.join(__dirname, 'upload-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${outputPath}`);
  
  // Log the metadata URLs that should be used in the contract
  console.log('\nMetadata URLs for contract deployment:');
  console.log(results.map(r => r.metadataUrl).join('\n'));
}

uploadNFTs().catch(error => {
  console.error("Upload failed:", error);
  process.exit(1);
});
