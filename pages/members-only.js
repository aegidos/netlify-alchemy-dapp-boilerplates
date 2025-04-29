import { useState, useEffect } from 'react';
import { useAccount, useNetwork, useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';
import styles from '../styles/BurnNFTs.module.css';
import axios from 'axios';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { ethers } from 'ethers';

const CURTIS_RPC = 'https://curtis.rpc.caldera.xyz/http';
const APECHAIN_RPC = 'https://apechain.calderachain.xyz/http';
const CONTRACT_ADDRESS = '0x6b70b49748abe1191107f20a8f176d50f63050c1';//productive contract
//const CONTRACT_ADDRESS = '0xac1bedce1cd0b98a89a6cf81c6c7cb7e4cff69ac';//Test Curtis contract
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
    inputs: [
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" }
    ],
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

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '2rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  th: {
    padding: '1rem',
    backgroundColor: '#2a2a2a',
    color: '#f0f0f0',
    textAlign: 'center',
    borderBottom: '2px solid #333'
  },
  td: {
    padding: '1rem',
    textAlign: 'center',
    borderBottom: '1px solid #333',
    color: '#f0f0f0'
  },
  img: {
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    border: '2px solid #444'
  }
};

export default function MembersOnly() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  
  const [isClient, setIsClient] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState([null, null, null]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [highscores, setHighscores] = useState([]);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [proofs, setProofs] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const response = await fetch('/proofs.json');
        const data = await response.json();
        setProofs(data);
      } catch (error) {
        console.error('Error loading proofs:', error);
      }
    };
    fetchProofs();
  }, []);

  useEffect(() => {
    if (!isConnected || !address) return;

    const setupWallet = async () => {
      try {
        if (window.ethereum?.removeAllListeners) {
          window.ethereum.removeAllListeners();
        }

        const accounts = await window.ethereum?.request({
          method: 'eth_accounts'
        });

        if (accounts?.length) {
          setIsWalletReady(true);
        }
      } catch (error) {
        console.error('Wallet setup error:', error);
      }
    };

    setupWallet();
  }, [isConnected, address]);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!isClient || !isConnected || !address) return;

      try {
        const lastWalletAddress = sessionStorage.getItem('lastWalletAddress');
        
        if (lastWalletAddress === address) {
          setHasAccess(true);
          setIsVerifying(false);
          return;
        }

        const response = await fetch('/api/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        });

        const data = await response.json();
        
        if (data.hasAccess) {
          setHasAccess(true);
          sessionStorage.setItem('lastWalletAddress', address);
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.error('Access verification failed:', error);
        router.replace('/');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [isClient, isConnected, address]);

  const mintNFT = async () => {
    if (!address || !proofs) return;

    try {
        const proof = proofs.proofs[address];
        
        console.log('Address:', address);
        console.log('Available addresses:', Object.keys(proofs.proofs));
        console.log('Proof found:', proof);

        if (!proof) {
            throw new Error('Address not in allowlist');
        }

        setIsMinting(true);
        setMintStatus('Initiating minting process...');

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const walletClient = createWalletClient({
            account: address,
            chain: apeChain,
            transport: custom(window.ethereum)
        });

        const txHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'mint',
            args: [proof],
            gas: BigInt(3000000)
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

  useEffect(() => {
    const handleMintRequest = async (event) => {
        console.log('Mint requested from game:', event.detail);
        await mintNFT();
    };

    window.addEventListener('requestMint', handleMintRequest);
    return () => window.removeEventListener('requestMint', handleMintRequest);
  }, [address, proofs]);

  useEffect(() => {
    console.log('Members page mounted');
    
    const handleRouteChange = (url) => {
      console.log('Route changing to:', url);
    };

    const handleRouteComplete = (url) => {
      console.log('Route change completed:', url);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, []);

  const checkWalletConnection = async () => {
    if (!isConnected || !address) {
      router.replace('/');
      return;
    }

    try {
      if (window.ethereum?.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }

      const accounts = await window.ethereum?.request({
        method: 'eth_accounts'
      });

      if (accounts?.length) {
        setIsWalletReady(true);
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      router.replace('/');
    }
  };

  useEffect(() => {
    const disconnectHandler = () => {
      console.log('Wallet disconnected');
      router.replace('/');
    };

    if (window.ethereum) {
      window.ethereum.on('disconnect', disconnectHandler);
      window.ethereum.on('accountsChanged', checkWalletConnection);
      window.ethereum.on('chainChanged', checkWalletConnection);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('disconnect', disconnectHandler);
        window.ethereum.removeListener('accountsChanged', checkWalletConnection);
        window.ethereum.removeListener('chainChanged', checkWalletConnection);
      }
    };
  }, [address, isConnected]);

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

      console.log('Raw NFT data:', response.data.ownedNfts[0]);

      const nfts = response.data.ownedNfts.map((nft) => {
        const metadata = nft.metadata || {};
        let nftType = 'Unknown';
        let displayName = `NFT #${parseInt(nft.id.tokenId, 16)}`;
        
        if (metadata) {
          if (metadata.name) {
            displayName = metadata.name;
          }
          
          if (metadata.attributes && Array.isArray(metadata.attributes)) {
            const typeAttribute = metadata.attributes.find(
              attr => attr.trait_type === "Type"
            );
            
            if (typeAttribute && typeAttribute.value) {
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
              else nftType = typeCode;
            }
          }
        }
        
        if (nftType === 'Unknown') {
          nftType = NFT_TYPES[parseInt(nft.id.tokenId, 16) % 6] || 'Unknown';
        }

        return {
          tokenId: nft.id.tokenId,
          type: nftType,
          title: displayName,
          image: metadata.image || null,
          rawMetadata: metadata
        };
      });

      console.log('Processed NFTs:', nfts);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error fetching NFTs from Alchemy:', error);
    }
  };
  const fetchNFTsCURT = async () => {
    if (!address) return;

    try {
        const provider = createPublicClient({
            chain: apeChain,
            transport: http(CURTIS_RPC)
        });

        // Create contract instance
        const nftContract = {
            address: CONTRACT_ADDRESS,
            abi: [
                "function balanceOf(address owner) view returns (uint256)",
                "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                "function tokenURI(uint256 tokenId) view returns (string)",
                "function tokenTypes(uint256) view returns (uint8)"
            ]
        };

        // Get balance
        const balance = await provider.readContract({
            ...nftContract,
            functionName: 'balanceOf',
            args: [address]
        });

        const nfts = [];
        
        // Fetch each token
        for (let i = 0; i < Number(balance); i++) {
            try {
                // Get token ID
                const tokenId = await provider.readContract({
                    ...nftContract,
                    functionName: 'tokenOfOwnerByIndex',
                    args: [address, i]
                });

                // Get token type
                const typeNum = await provider.readContract({
                    ...nftContract,
                    functionName: 'tokenTypes',
                    args: [tokenId]
                });

                const nftType = NFT_TYPES[Number(typeNum)] || 'Unknown';

                nfts.push({
                    tokenId: tokenId.toString(),
                    type: nftType,
                    title: `NFT #${tokenId}`,
                });
            } catch (err) {
                console.error(`Error fetching token ${i}:`, err);
            }
        }

        console.log('Fetched NFTs:', nfts);
        setUserNFTs(nfts);

    } catch (error) {
        console.error('Error fetching NFTs:', error);
    }
};
  useEffect(() => {
    fetchNFTs();
  }, [address]);

  const fetchHighscores = async () => {
    try {
      const response = await fetch('/api/scores');
      if (!response.ok) {
        throw new Error('Failed to fetch highscores');
      }
      const scores = await response.json();
      setHighscores(scores);
    } catch (error) {
      console.error('Error fetching highscores:', error);
    }
  };

  useEffect(() => {
    fetchHighscores();
    const interval = setInterval(fetchHighscores, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNFTSelect = (index, value) => {
    const newSelection = [...selectedNFTs];
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
        setTimeout(fetchNFTs, 2000);
      } else if (data.contractAddress) {
        setStatusMessage('Please confirm transaction in your wallet...');
        
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const walletClient = createWalletClient({
            account: address,
            chain: apeChain,
            transport: custom(window.ethereum)
          });

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

  if (!isClient || isVerifying || !isWalletReady) return null;
  if (!hasAccess) return null;

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

  <button 
  onClick={mintNFT}
  disabled={isMinting}
  data-mint-button="true"
  className={styles.mintButton} // Add a CSS class for styling
  style={{
    padding: '12px 24px',
    backgroundColor: '#4a524a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: isMinting ? 'not-allowed' : 'pointer',
    opacity: 0,  // Changed from 1 to 0
    transition: 'all 0.2s ease',
    visibility: 'hidden',  // Added this line
    position: 'absolute', // Added this line
    pointerEvents: 'none' // Added this line to prevent any mouse interaction
  }}
>
  {isMinting ? 'Minting...' : 'Mint NFT'}
</button>
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#f0f0f0', marginBottom: '1rem' }}>Maximum Mints Reached</h3>
            <p style={{ color: '#a0a0a0', marginBottom: '1.5rem' }}>
              You have reached the maximum number of mints (12). 
              Try brewing elixirs from your existing botanicals!
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                background: 'none',
                border: '1px solid #a0a0a0',
                color: '#a0a0a0',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#a0a0a0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <h2 style={{ color: '#f0f0f0', marginBottom: '2rem' }}>🧪 Elixir Recipes</h2>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={tableStyles.th}>Elixir Name</th>
              <th style={tableStyles.th}>Result</th>
              <th style={tableStyles.th}>Ingredient 1</th>
              <th style={tableStyles.th}>Ingredient 2</th>
              <th style={tableStyles.th}>Ingredient 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tableStyles.td}>Magic Mana & Cure</td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmcfNkNoamAeFqWhkhbSYsYNaRGt7qUNgiuWfN644NEcY7`} 
                  alt="Magic Mana & Cure"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmSG6xPaEpBvFAeGUizVpu1q3CmFEa3aFLbZXWLC3g4zLN`} 
                  alt="Ingredient 1"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmUaa5YB7aQ7Hmj8cdVQjtknNUpY4CHVbCoghMofMTDNcf`} 
                  alt="Ingredient 2"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>-</td>
            </tr>
            <tr>
              <td style={tableStyles.td}>Mana</td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmYbL9PWdHBuQicsJck93sLFbVicL5exvEPEC6vRFzLsDx`} 
                  alt="Mana"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmfVtANDxR6gdXxhNycjdm75UTKtzsX2ckMuhzLodfz1nv`} 
                  alt="Ingredient 1"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmNtKGGGTvKjw4zbKKUFgoPLcVSPAfNSfy5HCYn5uQyCa8`} 
                  alt="Ingredient 2"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>-</td>
            </tr>
            <tr>
              <td style={tableStyles.td}>Cure 25</td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmWUKkQ53ndEBsULZTQkkMKTuMnNCSnvVFk57hP79rfAWC`} 
                  alt="Cure 25"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/Qmb5k8VwMTkNBCpd4Nng99euurm8TV3Qq2U9X8K7WG7rbW`} 
                  alt="Ingredient 1"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmUaa5YB7aQ7Hmj8cdVQjtknNUpY4CHVbCoghMofMTDNcf`} 
                  alt="Ingredient 2"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>-</td>
            </tr>
            <tr>
              <td style={tableStyles.td}>Cure 50</td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmXZR6F73rWZNXEWnNQLYy8aCsyULoHFnwvbGs89Ni454t`} 
                  alt="Cure 50"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmbULkPpdqvVYowpHrQ2Mk6unCgdygLJ13Wx9aqZhwDwWo`} 
                  alt="Ingredient 1"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmNtKGGGTvKjw4zbKKUFgoPLcVSPAfNSfy5HCYn5uQyCa8`} 
                  alt="Ingredient 2"
                  style={tableStyles.img}
                />
              </td>
              <td style={tableStyles.td}>
                <img 
                  src={`https://ipfs.io/ipfs/QmUaa5YB7aQ7Hmj8cdVQjtknNUpY4CHVbCoghMofMTDNcf`} 
                  alt="Ingredient 3"
                  style={tableStyles.img}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{
          width: '100%',
          maxWidth: '100%',
          margin: '2rem auto'
        }}>
          <iframe
            key={address}
            src={`/games/ape-game/index.html?wallet=${address || ''}`}
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              backgroundColor: '#000'
            }}
            onLoad={() => {
              console.log('iframe loaded with address:', address);
              setIframeLoaded(true);
            }}
          />
        </div>
        <div style={{ padding: '2rem 0' }}>
          <h2 style={{ color: '#f0f0f0', marginBottom: '2rem' }}>🏆 Top 50 Highscores</h2>
          <div style={{ 
            maxWidth: '900px', 
            margin: '0 auto',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              color: '#a0a0a0'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #404040' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Wallet</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Species</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Turn</th>
                </tr>
              </thead>
              <tbody>
                {highscores.length > 0 ? (
                  highscores.map((score, index) => {
                    const shortWallet = score.walletaddress ? 
                      `${score.walletaddress.slice(0, 6)}...${score.walletaddress.slice(-4)}` : 
                      'unknown';

                    return (
                      <tr 
                        key={index}
                        style={{ 
                          borderBottom: '1px solid #303030',
                          backgroundColor: score.walletaddress === address ? '#2a2a2a' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '12px' }}>{index + 1}</td>
                        <td style={{ padding: '12px' }}>{shortWallet}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{score.score || 0}</td>
                        <td style={{ padding: '12px' }}>{score.species || 'Unknown'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{score.turn || '?'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '12px', textAlign: 'center' }}>
                      No scores yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        // Add after the first table in members-only.js
<h2 style={{ color: '#f0f0f0', marginBottom: '2rem', marginTop: '4rem' }}>⚔️ Weapon Recipes</h2>
<table style={tableStyles.table}>
  <thead>
    <tr>
      <th style={tableStyles.th}>Weapon Name</th>
      <th style={tableStyles.th}>Result</th>
      <th style={tableStyles.th}>Ingredient 1</th>
      <th style={tableStyles.th}>Ingredient 2</th>
      <th style={tableStyles.th}>Ingredient 3</th>
    </tr>
  </thead>
  <tbody>
    {/* H = 1 & 4 (Aquamarin & Yellow) */}
    <tr>
      <td style={tableStyles.td}>Green Axe</td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmawdD4AbpWe7EibxgeAMPNrFDT6G48UYksUStAR7HszM5" 
          alt="Green Axe"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmVCuwBDpyfXG71CXctrdAyXZPKbEeUShiPpqkeGyRJuKt" 
          alt="Aquamarin Crystals"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmUi1U6ahXXS2FGbXuDMb8BqsHqP1yckLALcQaJkeHABvx" 
          alt="Yellow Crystals"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>-</td>
    </tr>
    {/* I = 0 & 6 (Blue Sea Shell & Magic Wood) */}
    <tr>
      <td style={tableStyles.td}>Curved Hard Flail</td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmUySUoPXyuiVHEcBg6KHR1imyzmr9ixWzqdC9TMMAZMiU" 
          alt="Curved Hard Flail"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmRzwyfwdhpgPHKXgKBDqXS7KvPzez26aiPNeckicYQj7N" 
          alt="Blue Sea Shell"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmZAFL8GHM6o4dAMXe7ifq44vcYQya2UiV7zQrvLtSggE7" 
          alt="Magic Wood"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>-</td>
    </tr>
    {/* J = 3 & 6 (Purple Crystal & Magic Wood) */}
    <tr>
      <td style={tableStyles.td}>Sword of the Stones</td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmRfC7Lnm5PJfP7rLRRQFfyFykCYnjqM84L2YkmXsmxk8P" 
          alt="Sword of the Stones"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmYPr4Wy5EXwkKsNzfv9X8YLT7puRx3zQi8iSHB3JuUqc4" 
          alt="Purple Crystals"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmZAFL8GHM6o4dAMXe7ifq44vcYQya2UiV7zQrvLtSggE7" 
          alt="Magic Wood"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>-</td>
    </tr>
    {/* K = 2 & 5 (Dark Red & Hot Lava) */}
    <tr>
      <td style={tableStyles.td}>Lava Sword</td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmXqjxRzc8WgWDPnosW4iBoWicfBq7ecZ3jvYkvgohqx4n" 
          alt="Lava Sword"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmaxgEiMofXFqiW6hDip6MJGnFEpiSNo44fMdfV8S6PWZj" 
          alt="Dark Red Crystals"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmbmjxWDsScgmxcEsYSCKfZge6qLW9odM6koZy6zEg7Dj4" 
          alt="Hot Lava"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>-</td>
    </tr>
    {/* L = 4 & 6 & 5 (Yellow Crystal & Magic Wood & Hot Lava) */}
    <tr>
      <td style={tableStyles.td}>Necromancer's Staff</td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmS34ZbeYTKzx4GptJprz5CMDUTd6hSvyEaboYeGCVcDqk" 
          alt="Necromancer's Staff"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmUi1U6ahXXS2FGbXuDMb8BqsHqP1yckLALcQaJkeHABvx" 
          alt="Yellow Crystals"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmZAFL8GHM6o4dAMXe7ifq44vcYQya2UiV7zQrvLtSggE7" 
          alt="Magic Wood"
          style={tableStyles.img}
        />
      </td>
      <td style={tableStyles.td}>
        <img 
          src="https://chocolate-familiar-wasp-992.mypinata.cloud/ipfs/QmbmjxWDsScgmxcEsYSCKfZge6qLW9odM6koZy6zEg7Dj4" 
          alt="Hot Lava"
          style={tableStyles.img}
        />
      </td>
    </tr>
  </tbody>
</table>
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          padding: '2rem 0',
          width: '100%',
          borderTop: '1px solid #333',
          marginTop: '2rem'
        }}>
          <a href="https://opensea.io/collection/apes-in-space-on-ape-weapons-1" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/opensea.svg" alt="OpenSea" width="40" height="40" />
          </a>
          <a href="https://magiceden.io/collections/apechain/0x6b70b49748abe1191107f20a8f176d50f63050c1" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ 
               opacity: 0.7, 
               transition: 'opacity 0.2s',
               textDecoration: 'none',
               color: '#a0a0a0',
               fontSize: '24px',
               fontFamily: 'monospace',
               fontWeight: 'bold',
               display: 'flex',
               alignItems: 'center',
               height: '40px'
             }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            M∑
          </a>
          <a href="https://x.com/aegidos" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/x-logo.svg" alt="X (Twitter)" width="40" height="40" />
          </a>
          <a href="https://www.threads.net/andischmid1210" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/threads.svg" alt="Threads" width="40" height="40" />
          </a>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  
  if (!req.headers.referer?.includes(process.env.NEXT_PUBLIC_APP_URL)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}