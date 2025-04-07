const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // Load deployment info
    const deploymentInfo = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'deployment-info.json'),
        'utf8'
      )
    );

    // Create ABI fragment for constructor
    const constructorFragment = {
      inputs: [
        {
          internalType: "string[6]",
          name: "_baseNftURIs",
          type: "string[6]"
        },
        {
          internalType: "string[4]",
          name: "_evolvedNftURIs",
          type: "string[4]"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    };

    // Create AbiCoder instance
    const abiCoder = ethers.utils.defaultAbiCoder;

    // Encode constructor parameters
    const encodedParams = abiCoder.encode(
      ["string[6]", "string[4]"],
      [deploymentInfo.baseURIs, deploymentInfo.evolvedURIs]
    );

    console.log("\nConstructor Arguments (ABI-encoded):");
    console.log(encodedParams);

    console.log("\nArguments for manual verification:");
    console.log("baseURIs:", JSON.stringify(deploymentInfo.baseURIs, null, 2));
    console.log("evolvedURIs:", JSON.stringify(deploymentInfo.evolvedURIs, null, 2));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error encoding constructor arguments:", error);
    process.exit(1);
  });
