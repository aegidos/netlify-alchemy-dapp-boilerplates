import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import styles from '../styles/BurnNFTs.module.css';
import axios from 'axios';
import { createPublicClient, createWalletClient, http, custom } from 'viem';

const APECHAIN_RPC = 'https://apechain.calderachain.xyz/http';
const CONTRACT_ADDRESS = '0x223a0d58e50bb9c03261fc34dd271a9eaf1ffb6d';
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const ALCHEMY_API_URL = `https://apechain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTsForOwner`;

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
    default: {
      http: [APECHAIN_RPC],
    },
    public: {
      http: [APECHAIN_RPC],
    },
  },
  blockExplorers: {
    default: { name: 'ApeChain Explorer', url: 'https://apechain.calderaexplorer.xyz/' },
  },
  testnet: false
};

const NFT_TYPES = {
  0: "HUSHROOMS",
  1: "FIREGRASSBUSH", 
  2: "RANGONES",
  3: "BLUELEAF",
  4: "STINKBALLTREES",
  5: "SNAKEROOTS",
  6: "MAGIC MANA & CURE",
  7: "MANA",
  8: "Cure 25",
  9: "Cure 50"
};

const ABI = [
  {
    inputs: [{ internalType: "address", name: "to", type: "address" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
  
];
const ABI2 = [
{
  inputs: [{ internalType: "uint256[]", name: "tokenIds", type: "uint256[]" }],
  name: "burnAndMint",
  outputs: [],
  stateMutability: "nonpayable",
  type: "function"
}
];

export default function MembersOnly() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState([null, null, null]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isClient, router]);

  const fetchNFTs = async () => {
    if (!address) return;

    try {
      const response = await axios.get(ALCHEMY_API_URL, {
        params: {
          owner: address,
          contractAddresses: [CONTRACT_ADDRESS],
          withMetadata: true,
          pageSize: 100,
        },
        headers: {
          accept: 'application/json',
        },
      });

      console.log('Raw NFT data:', response.data.ownedNfts[0]); // Log for debugging

      const nfts = response.data.ownedNfts.map((nft) => {
        // Get the metadata or default to empty object
        const metadata = nft.metadata || {};
        let nftType = 'Unknown';
        let displayName = `NFT #${parseInt(nft.id.tokenId, 16)}`;
        
        // Check if metadata has what we need
        if (metadata) {
          // Get the display name from metadata if available
          if (metadata.name) {
            displayName = metadata.name;
          }
          
          // Try to get type from attributes array
          if (metadata.attributes && Array.isArray(metadata.attributes)) {
            const typeAttribute = metadata.attributes.find(
              attr => attr.trait_type === "Type"
            );
            
            if (typeAttribute && typeAttribute.value) {
              // Map from attribute value to friendly name
              const typeCode = typeAttribute.value;
              if (typeCode === "APNG") nftType = "HUSHROOMS";
              else if (typeCode === "BPNG") nftType = "FIREGRASSBUSH";
              else if (typeCode === "CPNG") nftType = "RANGONES";
              else if (typeCode === "DPNG") nftType = "BLUELEAF";
              else if (typeCode === "EPNG") nftType = "STINKBALLTREES";
              else if (typeCode === "FPNG") nftType = "SNAKEROOTS";
              else if (typeCode === "GPNG") nftType = "MAGIC MANA & CURE";
              else if (typeCode === "HPNG") nftType = "MANA";
              else if (typeCode === "IPNG") nftType = "Cure 25";
              else if (typeCode === "JPNG") nftType = "Cure 50";
              else nftType = typeCode; // Use the attribute value directly if no mapping
            }
          }
        }
        
        // If we couldn't get the type from attributes, fall back to the previous method
        if (nftType === 'Unknown') {
          nftType = NFT_TYPES[parseInt(nft.id.tokenId, 16) % 6] || 'Unknown';
        }

        return {
          tokenId: nft.id.tokenId,
          type: nftType,
          title: displayName,
          image: metadata.image || null,
          rawMetadata: metadata // Include full metadata for debugging
        };
      });

      console.log('Processed NFTs:', nfts);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs from Alchemy:', error);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [address]);

  const handleNFTSelect = (index, value) => {
    const newSelection = [...selectedNFTs];
    // Find the actual NFT object instead of just storing the ID
    newSelection[index] = value ? userNFTs.find(nft => nft.tokenId === value) : null;
    setSelectedNFTs(newSelection);
  };

  const handleBrewClick = async () => {
    if (!selectedNFTs.filter(Boolean).length) return;

    try {
      const tokenIds = selectedNFTs
        .filter(Boolean)
        .map(nft => nft.tokenId);

      console.log('Sending token IDs to burn:', tokenIds);

      const response = await fetch('/api/burnNFT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('Error:', data.error);
        setStatusMessage(`Error: ${data.error}`);
        return;
      }

      if (data.success) {
        console.log('Burn successful:', data.txHash);
        setStatusMessage('NFTs burned successfully! 🎉');
        // Refresh NFTs after successful burn
        setTimeout(fetchNFTs, 2000);
      } else if (data.contractAddress) {
        setStatusMessage('Please confirm transaction in your wallet...');
        
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Create wallet client with account
          const walletClient = createWalletClient({
            account: address,
            chain: apeChain,
            transport: custom(window.ethereum)
          });

          // Execute burnAndMint using viem
          const txHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: ABI2,
            functionName: 'burnAndMint',
            args: [tokenIds],
            gas: BigInt(1500000),
            maxFeePerGas: BigInt(50000000000),
            maxPriorityFeePerGas: BigInt(2000000000)
          });
          
          setStatusMessage(`Transaction sent! Hash: ${txHash}`);
          setTimeout(() => {
            fetchNFTs();
          }, 2000);
        } catch (clientError) {
          setStatusMessage(`Error: ${clientError.message}`);
          console.error("Client-side burning error:", clientError);
        }
      }
    } catch (error) {
      console.error('Error burning NFTs:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const mintNFT = async () => {
    if (!address) return;
    
    setIsMinting(true);
    setMintStatus('Initiating minting process...');
    
    try {
      // Request account access first
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create wallet client with account
      const walletClient = createWalletClient({
        account: address,  // Add the account
        chain: apeChain,
        transport: custom(window.ethereum)
      });

      const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'mint',
        args: [address],
        gas: BigInt(3000000),
        maxFeePerGas: BigInt(100000000000),
        maxPriorityFeePerGas: BigInt(4000000000)
      });

      setMintStatus(`Transaction sent! Hash: ${txHash}`);
      setTimeout(() => {
        fetchNFTs();
      }, 2000);
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintStatus(`Error: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className={styles.container}>
      <div className={styles.brewSection}>
        <h2>🧪 Brew Your Elixir</h2>
        <div className={styles.dropdowns}>
          {[0, 1, 2].map((index) => (
            <select
              key={index}
              value={selectedNFTs[index]?.tokenId || ''}
              onChange={(e) => handleNFTSelect(index, e.target.value)}
              className={styles.dropdown}
            >
              <option value="">Select NFT {index + 1}</option>
              {userNFTs.map((nft) => (
                <option key={nft.tokenId} value={nft.tokenId}>
                  {nft.type} #{nft.tokenId}
                </option>
              ))}
            </select>
          ))}
        </div>
        <button 
          onClick={handleBrewClick}
          className={styles.burnButton}
          disabled={!selectedNFTs.filter(Boolean).length}
        >
          🧪 BREW ELIXIR
        </button>
        {statusMessage && (
          <div style={{
            marginTop: '1rem',
            padding: '10px',
            backgroundColor: statusMessage.includes('Error') ? '#ff000022' : '#00ff0022',
            borderRadius: '4px',
            color: '#f8f8f8'
          }}>
            {statusMessage}
          </div>
        )}
      </div>

      <div style={{
        margin: '2rem 0',
        padding: '2rem',
        backgroundColor: '#222',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#f8f8f8', marginBottom: '1.5rem' }}>🔮 Get Free ApeChain NFT</h2>
        <button 
          onClick={mintNFT}
          disabled={isMinting}
          style={{
            backgroundColor: '#ffd700',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '6px',
            cursor: isMinting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {isMinting ? '⏳ MINTING...' : '⚡ MINT NOW'}
        </button>
        
        {mintStatus && (
          <div style={{
            marginTop: '1rem',
            padding: '10px',
            backgroundColor: mintStatus.includes('Error') ? '#ff000022' : '#00ff0022',
            borderRadius: '4px',
            color: '#f8f8f8'
          }}>
            {mintStatus}
          </div>
        )}
        
        <p style={{ marginTop: '1rem', fontSize: '14px', color: '#aaa' }}>
          Mint a unique ApeChain NFT directly to your wallet.
        </p>
      </div>

      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#a0a0a0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <h1>Members Only Content</h1>
        <p>Current Wallet: {address || 'Not connected'}</p>
        <div style={{
          width: '900px',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <iframe
            key={address}
            src={`/games/ape-game/index.html?wallet=${address || ''}`}
            style={{
              width: '100%',
              height: '1800px',
              border: 'none',
              marginTop: '2rem',
              backgroundColor: '#000'
            }}
            onLoad={() => console.log('iframe loaded with address:', address)}
          />
        </div>
      </div>
    </div>
  );
}