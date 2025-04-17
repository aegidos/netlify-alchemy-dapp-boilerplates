const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function main() {
  // Read upload results for PLANTS and ELIXIRS
  const uploadResultsPLANTS = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'upload-resultsPLANTS.json'),
      'utf8'
    )
  );

  // Read upload results for WEAPONS
  const uploadResults = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'upload-results.json'),
      'utf8'
    )
  );

  console.log("Reading metadata URLs from upload results...");

  // Extract PLANTS URIs (6 types)
  const baseNftURIsPLANTS = uploadResultsPLANTS
    .slice(0, 6)
    .map(result => result.metadataUrl);

  if (baseNftURIsPLANTS.length !== 6 || baseNftURIsPLANTS.some(uri => !uri)) {
    throw new Error('Missing or invalid PLANTS URIs. Need exactly 6 URIs.');
  }

  // Extract ELIXIR URIs (4 types)
  const evolvedNftURIsELIXIRS = uploadResultsPLANTS
    .slice(6, 10)
    .map(result => result.metadataUrl);

  if (evolvedNftURIsELIXIRS.length !== 4 || evolvedNftURIsELIXIRS.some(uri => !uri)) {
    throw new Error('Missing or invalid ELIXIR URIs. Need exactly 4 URIs.');
  }

  // Extract WEAPONS base URIs (A-G)
  const baseNftURIs = uploadResults
    .slice(0, 7)
    .map(result => result.metadataUrl);

  if (baseNftURIs.length !== 7 || baseNftURIs.some(uri => !uri)) {
    throw new Error('Missing or invalid base URIs. Need exactly 7 base URIs (A-G).');
  }

  // Extract WEAPONS evolved URIs (H-L)
  const evolvedNftURIs = uploadResults
    .slice(7, 12)
    .map(result => result.metadataUrl);

  if (evolvedNftURIs.length !== 5 || evolvedNftURIs.some(uri => !uri)) {
    throw new Error('Missing or invalid evolved URIs. Need exactly 5 evolved URIs (H-L).');
  }

  // Log all URIs for verification
  console.log("\nPLANTS Base URIs (0-5):");
  baseNftURIsPLANTS.forEach((uri, i) => console.log(`Plant Type ${i}: ${uri}`));

  console.log("\nELIXIR URIs (0-3):");
  evolvedNftURIsELIXIRS.forEach((uri, i) => console.log(`Elixir Type ${i}: ${uri}`));

  console.log("\nWEAPONS Base URIs (A-G):");
  baseNftURIs.forEach((uri, i) => console.log(`Type ${String.fromCharCode(65 + i)}: ${uri}`));

  console.log("\nWEAPONS Evolved URIs (H-L):");
  evolvedNftURIs.forEach((uri, i) => console.log(`Type ${String.fromCharCode(72 + i)}: ${uri}`));

  // Read Merkle root from merkle-data.json
  const merkleData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../data/merkle-data.json'),
      'utf8'
    )
  );

  console.log("\nMerkle Root:", merkleData.root);

  // Get deployer account
  const [deployer] = await hre.viem.getWalletClients();
  console.log("\nDeploying contracts with account:", deployer.account.address);

  // Get network info
  const publicClient = await hre.viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  console.log("Network ChainId:", chainId);

  // Deploy contract with all URIs
  const ApeChainPoWNFT = await hre.viem.deployContract("ApeChainPoWNFT", [
    baseNftURIsPLANTS,
    evolvedNftURIsELIXIRS,
    baseNftURIs,
    evolvedNftURIs,
    merkleData.root
  ]);

  console.log("\nApeChainPoWNFT deployed to:", ApeChainPoWNFT.address);

  // Verify Merkle root after deployment
  const contractRoot = await ApeChainPoWNFT.read.merkleRoot();
  console.log("\nVerifying Merkle root:");
  console.log("Expected root:", merkleData.root);
  console.log("Contract root:", contractRoot);

  if (contractRoot !== merkleData.root) {
    console.error("❌ WARNING: Merkle root mismatch!");
  } else {
    console.log("✅ Merkle root verified successfully!");
  }

  // Test proof verification with properly formatted proof array
  const testAddress = '0x939AC38d9ee95e0E01B88086AAb47786F8e61f5f';
  const proofs = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../public/proofs.json'),
    'utf8'
  ));
  const proof = proofs.proofs[testAddress];

  // Convert single proof to array if needed
  const proofArray = Array.isArray(proof) ? proof : [proof];
  
  console.log("\nTesting proof verification for:", testAddress);
  console.log("Proof Array:", JSON.stringify(proofArray, null, 2));
  
  // Pass the proof array as the first argument
  const isValid = await ApeChainPoWNFT.read.verifyProof([proofArray, testAddress]);
  console.log("Verification result:", isValid);

  // Test proof verification with debug info
  // Calculate leaf locally
  const localLeaf = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['address'], [testAddress])
  );
  
  // Get leaf from contract
  const contractLeaf = await ApeChainPoWNFT.read.getLeafHash([testAddress]);
  
  console.log("\nLeaf hash comparison:");
  console.log("Local leaf  :", localLeaf);
  console.log("Contract leaf:", contractLeaf);
  
  // Log all verification parameters
  console.log("\nVerification parameters:");
  console.log("Address:", testAddress);
  console.log("Merkle Root:", merkleData.root);
  console.log("Proof:", JSON.stringify(proofArray, null, 2));

  // Save deployment info
  const deployInfo = {
    contractAddress: ApeChainPoWNFT.address,
    chainId,
    deployer: deployer.account.address,
    timestamp: new Date().toISOString(),
    baseNftURIsPLANTS,
    evolvedNftURIsELIXIRS,
    baseNftURIs,
    evolvedNftURIs,
    merkleRoot: merkleData.root
  };

  fs.writeFileSync(
    path.join(__dirname, 'deployment-info.json'),
    JSON.stringify(deployInfo, null, 2)
  );

  // Verify on explorer if on Curtis
  if (chainId === 33139 || chainId === 33111) {
    console.log("\nWaiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: ApeChainPoWNFT.address,
      constructorArguments: [
        baseNftURIsPLANTS,
        evolvedNftURIsELIXIRS,
        baseNftURIs,
        evolvedNftURIs,
        merkleData.root
      ],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
