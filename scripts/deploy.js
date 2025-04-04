const { ethers } = require("hardhat");

async function main() {
  // Get the base URIs from your uploaded NFTs (json file)
  const uploadResults = require('../upload-nft/upload-results.json');
  
  // Separate base and evolved URIs
  const baseURIs = uploadResults.slice(0, 6).map(nft => nft.url);
  const evolvedURIs = uploadResults.slice(6, 10).map(nft => nft.url);

  // Deploy the contract
  const ApeChainPoWNFT = await ethers.getContractFactory("ApeChainPoWNFT");
  const nft = await ApeChainPoWNFT.deploy(baseURIs, evolvedURIs);

  await nft.waitForDeployment();
  console.log("ApeChainPoWNFT deployed to:", await nft.getAddress());
}

module.exports = { main };

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
