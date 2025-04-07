import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { createPublicClient, http } from 'viem';
import styles from '../styles/BurnNFTs.module.css';

// Contract configuration
const CONTRACT_ADDRESS = '0x223a0d58e50bb9c03261fc34dd271a9eaf1ffb6d';
const APECHAIN_RPC = 'https://apechain.calderachain.xyz/http';

const publicClient = createPublicClient({
  transport: http(APECHAIN_RPC),
  chain: {
    id: 33139,
    name: 'ApeChain'
  }
});

const ABI = [
  // NFT contract ABI
  {
    inputs: [{ internalType: "uint256[]", name: "tokenIds", type: "uint256[]" }],
    name: "burnAndMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "tokensOfOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  }
];

const RECIPES = {
  'Cure 50 (J)': { ingredients: [0, 3, 5], result: 9 } // A + D + F = J
};

const BurnNFTs = () => {
  const { address, isConnected } = useAccount();
  const [selectedNFTs, setSelectedNFTs] = useState([null, null, null]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [recipe, setRecipe] = useState(null);

  // Get user's NFTs
  const { data: nfts } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'tokensOfOwner',
    args: [address],
    enabled: Boolean(address),
    watch: true,
  });

  // Prepare burn transaction
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'burnAndMint',
    args: [selectedNFTs.filter(Boolean)],
    enabled: Boolean(recipe && selectedNFTs.some(Boolean)),
  });

  const { write: burnNFTs, isLoading, isSuccess } = useContractWrite(config);

  // Update user NFTs when data changes
  useEffect(() => {
    if (nfts) {
      setUserNFTs(nfts);
    }
  }, [nfts]);

  // Check for valid recipe
  useEffect(() => {
    const selectedTypes = selectedNFTs
      .filter(Boolean)
      .map(nft => Number(nft))
      .sort((a, b) => a - b);

    const recipeMatch = Object.entries(RECIPES).find(([_, r]) => 
      JSON.stringify(selectedTypes) === JSON.stringify(r.ingredients.sort((a, b) => a - b))
    );

    setRecipe(recipeMatch ? { name: recipeMatch[0], ...recipeMatch[1] } : null);
  }, [selectedNFTs]);

  const handleNFTSelect = (index, value) => {
    const newSelection = [...selectedNFTs];
    newSelection[index] = value ? Number(value) : null;
    setSelectedNFTs(newSelection);
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <h1>🧪 Brew Your Elixir</h1>
        <p>Please connect your wallet to brew elixirs</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>🧪 Brew Your Elixir</h1>
      
      <div className={styles.dropdowns}>
        {[0, 1, 2].map((index) => (
          <select
            key={index}
            value={selectedNFTs[index] || ''}
            onChange={(e) => handleNFTSelect(index, e.target.value)}
            className={styles.dropdown}
          >
            <option value="">Select NFT {index + 1}</option>
            {userNFTs?.map((tokenId, i) => (
              <option key={i} value={tokenId.toString()}>
                NFT #{tokenId.toString()}
              </option>
            ))}
          </select>
        ))}
      </div>

      {recipe && (
        <div className={styles.recipe}>
          <h3>Recipe Found: {recipe.name}</h3>
          <button
            onClick={() => burnNFTs?.()}
            disabled={isLoading || !burnNFTs}
            className={styles.burnButton}
          >
            {isLoading ? 'Brewing...' : 'Brew Elixir'}
          </button>
        </div>
      )}

      {isSuccess && (
        <div className={styles.success}>
          Successfully brewed your elixir! 🎉
        </div>
      )}
    </div>
  );
};

export default BurnNFTs;