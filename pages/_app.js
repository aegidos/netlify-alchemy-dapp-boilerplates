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
    default: 'https://apechain.calderachain.xyz/http',
  },
  blockExplorers: {
    default: { name: 'ApeChain Explorer', url: 'https://apechain.calderaexplorer.xyz/' },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [
    mainnet,
   
  ],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}), publicProvider()]
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

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (isConnected && address) {
        try {
          //APE GANG
          const contractAddress = '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90';
          //MAYC
          //const contractAddress = "0x60e4d786628fea6478f785a6d7e704777c86a7c6";
          const response = await axios.get(
            `https://apechain-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contractAddress}`
          );

          if (response.data.totalCount > 0) {
            router.push('/members-only');
          } else if (!router.pathname.includes('/members-only')) {
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
        initialChain={mainnet}
        chains={chains}
      >
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;