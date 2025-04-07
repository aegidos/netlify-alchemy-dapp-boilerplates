import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import styles from '../styles/BurnNFTs.module.css';
import axios from 'axios';

const CONTRACT_ADDRESS = '0x223a0d58e50bb9c03261fc34dd271a9eaf1ffb6d';
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const ALCHEMY_API_URL = `https://apechain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTsForOwner`;

const NFT_TYPES = {
  0: "PURPLUS",
  1: "KIWIOPTERYX", 
  2: "PESCIODYPHUS",
  3: "Ape Gang",
  4: "AMORPH",
  5: "CHUCKBERRY"
};

export default function MembersOnly() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState([null, null, null]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');

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

      const nfts = response.data.ownedNfts.map((nft) => ({
        tokenId: nft.id.tokenId,
        type: NFT_TYPES[parseInt(nft.id.tokenId, 16) % 6] || 'Unknown',
        title: `NFT #${parseInt(nft.id.tokenId, 16)}`,
      }));

      console.log('NFTs fetched from Alchemy:', nfts);
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
    newSelection[index] = value ? value : null;
    setSelectedNFTs(newSelection);
  };

  const mintNFT = async () => {
    if (!address) return;
    
    setIsMinting(true);
    setMintStatus('Initiating minting process...');
    
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          walletAddress: address,
          score: Math.floor(Math.random() * 1000)
        })
      });
      
      const data = await response.json();
      
      if (data.success || data.txHash) {
        setMintStatus(`Minting successful! Transaction: ${data.txHash}`);
        setTimeout(() => {
          fetchNFTs();
        }, 2000);
      } else if (data.contractAddress) {
        setMintStatus('Please confirm transaction in your wallet');
        
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Get current gas price from the network
          const baseFeeHex = await window.ethereum.request({ 
            method: 'eth_getBlockByNumber', 
            params: ['latest', false] 
          }).then(block => block.baseFeePerGas);
          
          // Convert hex to BigInt and add buffer (multiply by 2)
          const baseFee = BigInt(baseFeeHex);
          const maxFeePerGas = (baseFee * BigInt(2)).toString(16);
          console.log(`Current baseFee: ${baseFee}, using maxFeePerGas: 0x${maxFeePerGas}`);
          
          // Use parameters that match what works in the explorer
          const transactionParameters = {
            to: data.contractAddress,
            from: address,
            data: `0x40c10f19000000000000000000000000${address.substring(2).toLowerCase()}`,
            gas: '0x493e0', // Hex for 300,000 gas
            // Dynamically set maxFeePerGas to 2x the current base fee
            maxFeePerGas: `0x${maxFeePerGas}`,
            // Set tip
            maxPriorityFeePerGas: '0x77359400' // 2 gwei in hex
          };
          
          // Add logging to see what we're sending
          console.log("Sending transaction with params:", transactionParameters);
          
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
          });
          
          setMintStatus(`Transaction sent! Hash: ${txHash}`);
          setTimeout(() => {
            fetchNFTs();
          }, 2000);
        } catch (clientError) {
          setMintStatus(`Error: ${clientError.message}`);
          console.error("Client-side minting error:", clientError);
        }
      } else {
        setMintStatus(`Error: ${data.error || 'Unknown error'}`);
      }
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
                  #{nft.tokenId} - {nft.type}
                </option>
              ))}
            </select>
          ))}
        </div>
        <button 
          onClick={() => router.push('/burnNFTs')}
          className={styles.burnButton}
          disabled={!selectedNFTs.filter(Boolean).length}
        >
          🧪 BREW ELIXIR
        </button>
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