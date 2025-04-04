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

  // Extract and validate base URIs (A-F)
  const baseURIs = uploadResults
    .slice(0, 6)
    .map(result => result.metadataUrl);

  // Verify all base URIs exist
  if (baseURIs.length !== 6 || baseURIs.some(uri => !uri)) {
    throw new Error('Missing or invalid base URIs. Need exactly 6 base URIs (A-F).');
  }
  
  // Extract evolved URIs (G-J)
  const evolvedURIs = uploadResults
    .slice(6, 10)
    .map(result => result.metadataUrl);

  if (evolvedURIs.length !== 4 || evolvedURIs.some(uri => !uri)) {
    throw new Error('Missing or invalid evolved URIs. Need exactly 4 evolved URIs (G-J).');
  }

  // Log all URIs for verification
  console.log("\nBase NFT URIs (A-F):");
  baseURIs.forEach((uri, i) => console.log(`Type ${String.fromCharCode(65 + i)}: ${uri}`));
  
  console.log("\nEvolved NFT URIs (G-J):");
  evolvedURIs.forEach((uri, i) => console.log(`Type ${String.fromCharCode(71 + i)}: ${uri}`));

  // Get deployer account
  const [deployer] = await hre.viem.getWalletClients();
  console.log("\nDeploying contracts with account:", deployer.account.address);

  // Get network info
  const publicClient = await hre.viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  console.log("Network ChainId:", chainId);

  // Deploy contract
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
