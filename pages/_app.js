import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, useAccount, WagmiConfig } from "wagmi";
import {
  mainnet,
 
} from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import MainLayout from "../layout/mainLayout";
import { useRouter } from "next/router";
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { createContext, useContext } from 'react';

// ApeChain Configuration
const apeChain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
    default: {
      http: ['https://apechain.calderachain.xyz/http'],
    },
  },
  blockExplorers: {
    default: { name: 'ApeChain Explorer', url: 'https://apechain.calderaexplorer.xyz/' },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [apeChain],
  [
    alchemyProvider({ 
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    }), 
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My Alchemy DApp",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { WagmiConfig, RainbowKitProvider };

export const WalletContext = createContext();

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);

  // Make wallet address available globally
  useEffect(() => {
    window.walletContext = {
      address: address || 'unknown',
      isConnected
    };
  }, [address, isConnected]);

  const walletState = {
    address: address || '',
    isConnected
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (isConnected && address) {
        try {
          // Define all contract addresses
          const contractAddresses = [
            '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90', // APE GANG
            '0x60e4d786628fea6478f785a6d7e704777c86a7c6', // MAYC
            '0xb3443b6bd585ba4118cae2bedb61c7ec4a8281df', // Gs on ape
            '0xfa1c20e0d4277b1e0b289dffadb5bd92fb8486aa', // NPC
            '0x91417bd88af5071ccea8d3bf3af410660e356b06',  // zards
            '0xcf2e5437b2944def3fc72b0a7488e87467c7d76c',  // Froglings
            '0xa096af26affe37cc2a56ecf381b754a20b6ddf20',  // OVISAURS
            '0x35b70c728ce7bc2e2593100673a0ccd9ef4e1c7b',  // spunkys
            '0xdd2da83d07603897b2eb80dc1f7a0b567ad1c2c6'  // Pixl Pals
          ];

          // Check each contract
          for (const contractAddress of contractAddresses) {
            const response = await axios.get(
              `https://apechain-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contractAddress}`
            );

            if (response.data.totalCount > 0) {
              console.log(`Found NFT in contract: ${contractAddress}`);
              router.push('/members-only');
              console.log('Wallet address in members-only:', address);
              console.log('walletState in members-only:', walletState);
              return; // Exit after first match
            }
          }

          // If we get here, no NFTs were found in any contract
          if (!router.pathname.includes('/members-only')) {
            router.push('/');
          }

        } catch (error) {
          console.error("Error checking NFT ownership:", error);
        }
      }
    };

    if (isClient) {
      checkNFTOwnership();
    }
  }, [address, isConnected, router.pathname, isClient]);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        modalSize="compact"
        initialChain={apeChain}
        chains={chains}
      >
        <WalletContext.Provider value={walletState}>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </WalletContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;