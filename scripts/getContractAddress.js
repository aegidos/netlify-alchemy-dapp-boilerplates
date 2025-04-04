const hre = require("hardhat");
const { createPublicClient, http, getContractAddress } = require('viem');

async function predictContractAddress() {
  // Create a public client
  const publicClient = createPublicClient({
    chain: hre.network.config,
    transport: http(hre.network.config.url)
  });

  // Get the wallet accounts
  const [deployer] = await hre.viem.getWalletClients();
  
  // Get the nonce
  const nonce = await publicClient.getTransactionCount({
    address: deployer.account.address
  });

  // Generate the future contract address using viem's function directly
  const futureAddress = getContractAddress({
    from: deployer.account.address,
    nonce: BigInt(nonce)
  });

  console.log("Future contract address:", futureAddress);
  return futureAddress;
}

module.exports = { predictContractAddress };

if (require.main === module) {
  predictContractAddress()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}