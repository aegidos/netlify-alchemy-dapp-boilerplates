const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // Load deployment info
  const deploymentInfo = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'deployment-info.json'),
      'utf8'
    )
  );

  console.log('Starting contract verification...');
  console.log('Contract address:', deploymentInfo.contractAddress);
  
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: [
        deploymentInfo.baseURIs,
        deploymentInfo.evolvedURIs
      ],
    });
    
    console.log('Contract verified successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });