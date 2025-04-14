const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // Read upload results
  const uploadResults = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'upload-results.json'),
      'utf8'
    )
  );

  console.log("Reading metadata URLs from upload results...");

  // Extract and validate base URIs (A-G)
  const baseURIs = uploadResults
    .slice(0, 7)
    .map(result => result.metadataUrl);

  // Verify all base URIs exist
  if (baseURIs.length !== 7 || baseURIs.some(uri => !uri)) {
    throw new Error('Missing or invalid base URIs. Need exactly 7 base URIs (A-G).');
  }
  
  // Extract evolved URIs (H-L)
  const evolvedURIs = uploadResults
    .slice(7, 12)
    .map(result => result.metadataUrl);

  if (evolvedURIs.length !== 5 || evolvedURIs.some(uri => !uri)) {
    throw new Error('Missing or invalid evolved URIs. Need exactly 5 evolved URIs (H-L).');
  }

  // Log all URIs for verification
  console.log("\nBase NFT URIs (A-G):");
  baseURIs.forEach((uri, i) => console.log(`Type ${String.fromCharCode(65 + i)}: ${uri}`));
  
  console.log("\nEvolved NFT URIs (H-L):");
  evolvedURIs.forEach((uri, i) => console.log(`Type ${String.fromCharCode(72 + i)}: ${uri}`));

  // Get deployer account
  const [deployer] = await hre.viem.getWalletClients();
  console.log("\nDeploying contracts with account:", deployer.account.address);

  // Get network info
  const publicClient = await hre.viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  console.log("Network ChainId:", chainId);

  // Deploy contract - Update this section
  const ApeChainPoWNFT = await hre.viem.deployContract("ApeChainPoWNFT", [
    baseURIs,
    evolvedURIs
  ]);

  console.log("\nApeChainPoWNFT deployed to:", ApeChainPoWNFT.address);
  
  // Save deployment info
  const deployInfo = {
    contractAddress: ApeChainPoWNFT.address,
    chainId,
    deployer: deployer.account.address,
    timestamp: new Date().toISOString(),
    baseURIs,
    evolvedURIs
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
      constructorArguments: [baseURIs, evolvedURIs],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
