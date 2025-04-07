require("@nomicfoundation/hardhat-toolbox-viem");  // Changed back to viem version
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (!PRIVATE_KEY) {
  console.error('Please set your PRIVATE_KEY in a .env file');
  process.exit(1);
}

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    apechain: {
      url: "https://apechain.calderachain.xyz/http",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 33139
    },
    curtis: {
      url: "https://curtis.rpc.caldera.xyz/http",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 33111
    }
  },
  etherscan: {
    apiKey: {
      curtis: ETHERSCAN_API_KEY,
      apechain: 'NO_API_KEY_NEEDED'  // Changed from 'apechain'
    },
    customChains: [
      {
        network: "apechain",
        chainId: 33139,
        urls: {
          apiURL: "https://apechain.calderaexplorer.xyz/api",  // Updated explorer API URL
          browserURL: "https://apechain.calderaexplorer.xyz"    // Updated explorer URL
        }
      },
      {
        network: "curtis",
        chainId: 33111,
        urls: {
          apiURL: "https://curtis.explorer.caldera.xyz/api",
          browserURL: "https://curtis.explorer.caldera.xyz/"
        }
      }
    ]
  }
};

module.exports = config;
