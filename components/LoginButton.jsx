import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function LoginButton() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const checkNFTOwnership = async () => {
    if (isConnected && address) {
      try {
        const contractAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
        const response = await axios.get(
          `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contractAddress}`
        );

        if (response.data.totalCount > 0) {
          router.push('/members-only');
        } else {
          alert('You do not own any NFTs from this collection');
        }
      } catch (error) {
        console.error("Error checking NFT ownership:", error);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <ConnectButton />
      {isConnected && (
        <button
          onClick={checkNFTOwnership}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check NFT Access
        </button>
      )}
    </div>
  );
}