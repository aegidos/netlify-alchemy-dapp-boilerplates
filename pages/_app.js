import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { 
  configureChains, 
  createClient,
  WagmiConfig,
  useAccount, 
  useDisconnect,
  useNetwork,
  usePublicClient,
  useWalletClient
} from "wagmi";
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
const curtisNetwork = {
  id: 33111,
  name: 'Curtis',
  network: 'curtis',
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ['https://curtis.rpc.caldera.xyz/http'],
    },
    default: {
      http: ['https://curtis.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    default: { name: 'Curtis Explorer', url: 'https://curtis.explorer.caldera.xyz/' },
  },
  testnet: true,
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
  provider
});

export { WagmiConfig, RainbowKitProvider };

export const WalletContext = createContext();

const queryClient = new QueryClient();

// Create a new component to handle wallet logic
function WalletWrapper({ children }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedNFT, setHasCheckedNFT] = useState(false);

  // Make wallet address available globally
  useEffect(() => {
    window.walletContext = {
      address: address || 'unknown',
      isConnected
    };
  }, [address, isConnected]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (!isClient || !isConnected || !address || hasCheckedNFT) return;

      console.log('Starting NFT check:', {
        pathname: router.pathname,
        isConnected,
        address
      });

      try {
        setIsLoading(true);
        setHasCheckedNFT(true);

        // Define contract addresses
        const contractAddresses = [
          '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90', // APE GANG
          '0x60e4d786628fea6478f785a6d7e704777c86a7c6', // MAYC
          '0xb3443b6bd585ba4118cae2bedb61c7ec4a8281df', // Gs on ape
          '0xfa1c20e0d4277b1e0b289dffadb5bd92fb8486aa', // NPC
          '0x91417bd88af5071ccea8d3bf3af410660e356b06',  // zards
          '0xcf2e5437b2944def3fc72b0a7488e87467c7d76c',  // Froglings
          '0xa096af26affe37cc2a56ecf381b754a20b6ddf20',  // OVISAURS
          '0x35b70c728ce7bc2e2593100673a0ccd9ef4e1c7b',  // spunkys
          '0xdd2da83d07603897b2eb80dc1f7a0b567ad1c2c6',  // Pixl Pals
          '0x0178a9d0b0cba1b2ede3afdb6dd021db24ff4240',  // Forever Undead
          '0x3F398d9DBa769c8Bd4A3298aBb68E376100e213C' //Curtis Test NFT
        ];

        for (const contractAddress of contractAddresses) {
          const response = await axios.get(
            `https://apechain-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contractAddress}`
          );

          if (response.data.totalCount > 0) {
            console.log(`Found NFT in contract: ${contractAddress}`);
            sessionStorage.setItem('hasValidNFT', 'true');
            
            if (router.pathname !== '/members-only') {
              console.log('NFT found, pushing to members-only');
              await router.push('/members-only');
              console.log('Router push completed');
            }
            return;
          }
        }

        // No NFTs found
        sessionStorage.removeItem('hasValidNFT');
        if (router.pathname !== '/') {
          router.push('/');
        }

      } catch (error) {
        console.error("Error checking NFT ownership:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkNFTOwnership();
  }, [isClient, isConnected, address, router.pathname, hasCheckedNFT]);

  // Reset check when disconnecting
  useEffect(() => {
    if (!isConnected) {
      setHasCheckedNFT(false);
      sessionStorage.removeItem('hasValidNFT');
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && window.ethereum) {
      // Cleanup old listeners
      window.ethereum.removeAllListeners();
      
      // Add single disconnect handler
      window.ethereum.on('disconnect', () => {
        console.log('Wallet disconnected');
        router.replace('/');
      });
    }

    return () => {
      if (window.ethereum?.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [isConnected]);

  if (!isClient) return null;

  return (
    <WalletContext.Provider value={{ address: address || '', isConnected }}>
      {children}
    </WalletContext.Provider>
  );
}

// Simplify MyApp component
function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={apeChain}
          chains={chains}
        >
          <WalletWrapper>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </WalletWrapper>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default MyApp;