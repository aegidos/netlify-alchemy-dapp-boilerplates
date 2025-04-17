// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract ApeChainPoWNFT is ERC721URIStorage, ERC2981, Ownable, Pausable {
    uint256 public tokenCounter;
    uint256 public constant MAX_MINTS_PER_WALLET = 12;
    uint256 public constant MAX_MINTS_PHASE2 = 24;

    // Phase tracking
    bool public plantsPhaseComplete;

    // Separate mappings for PLANTS and WEAPONS
    mapping(uint256 => uint256) public NFT_LIMITS_PLANTS;
    mapping(uint256 => uint256) public NFT_MINTED_PLANTS;
    mapping(uint256 => string) public baseNftURIsPLANTS;
    mapping(uint256 => string) public evolvedNftURIsELIXIRS;

    // Original weapons mappings
    mapping(uint256 => uint256) public NFT_LIMITS;
    mapping(uint256 => uint256) public NFT_MINTED;
    mapping(uint256 => string) public baseNftURIs;
    mapping(uint256 => string) public evolvedNftURIs;

    mapping(address => bool) public allowedContracts;

    mapping(uint256 => uint8) public tokenTypes;
    mapping(address => uint256) public numMinted;

    struct Recipe {
        uint8[] ingredients;
        uint8 result;
        string resultURI;
    }

    Recipe[] public recipes;

    bytes32 public merkleRoot;
    bool public mintingComplete;

    event NFTMinted(address indexed miner, uint256 tokenId, uint8 nftType);
    event NFTBurned(uint256[] burnedTokens, uint256 newTokenId, uint8 newType);
    event MintingPaused(address indexed pauser);
    event MintingUnpaused(address indexed unpauser);

    constructor(
        string[6] memory _baseNftURIsPLANTS,
        string[4] memory _evolvedNftURIsELIXIRS,
        string[7] memory _baseNftURIs, 
        string[5] memory _evolvedNftURIs,
        bytes32 _merkleRoot
    )
        ERC721("Apes in Space on Ape (Weapons)", "AISAW")
        Ownable(msg.sender)
    {
        // Initialize PLANTS limits
        NFT_LIMITS_PLANTS[0] = 150;
        NFT_LIMITS_PLANTS[1] = 600;
        NFT_LIMITS_PLANTS[2] = 800;
        NFT_LIMITS_PLANTS[3] = 1000;
        NFT_LIMITS_PLANTS[4] = 1000;
        NFT_LIMITS_PLANTS[5] = 1300;

        // Initialize PLANTS URIs
        for(uint i = 0; i < 6; i++) {
            baseNftURIsPLANTS[i] = _baseNftURIsPLANTS[i];
        }
        for(uint i = 0; i < 4; i++) {
            evolvedNftURIsELIXIRS[i] = _evolvedNftURIsELIXIRS[i];
        }

        // Initialize original WEAPONS limits and URIs
        NFT_LIMITS[0] = 350; // blue sea shell QmYD518XPN92dWfPzFPkCdT2fVJoxJx94KbXuV4ZjUKkBK
        NFT_LIMITS[1] = 100; //aquamarin crystals QmNTp2296uzNZC8xafnFFGFFXD21TRpPAfiQscAFcWBbAt
        NFT_LIMITS[2] = 275; //dark red crystals QmfDgCg2ez8s8BCvN1G6F3XJVoPWftnzd6r4tVx9j6t1r5
        NFT_LIMITS[3] = 500; //purple crystals: QmcfUtpV2vCZp8Jg5k6FZf3QKcBDqjn1iyG21ZJPZoF2e2
        NFT_LIMITS[4] = 135; //yellow crystals QmeQ7G11hsk9VVQqbGy8pvM2DcSW1BtzWSKwF2fgQ369ea
        NFT_LIMITS[5] = 310; // hot Lava QmY8fWBjApQqNNCzRwgVdjQ119HvhgefwDELxFdaFHzgkT
        NFT_LIMITS[6] = 885; //magic wood QmSLhvs1gg6PaCtwAjgdh2hF7g1wX1JapG1fV1PAeE8fhj

        for(uint i = 0; i < 7; i++) {
            baseNftURIs[i] = _baseNftURIs[i];
        }
        for(uint i = 0; i < 5; i++) {
            evolvedNftURIs[i] = _evolvedNftURIs[i];
        }

        // Initialize allowed contracts
        allowedContracts[0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90] = true; // APE GANG
        allowedContracts[0x224fc0b2Af8f4530eEE986a2fA3F6c6dfe3EC4d9] = true; // Test NFT

        plantsPhaseComplete = false;
        merkleRoot = _merkleRoot;
        mintingComplete = false;

        // Recipe H (index 7): ingredients 1 & 4 = H
        recipes.push(Recipe(new uint8[](2), 7, _evolvedNftURIs[0]));
        recipes[0].ingredients[0] = 1;
        recipes[0].ingredients[1] = 4;

        // Recipe I (index 8): ingredients 0 & 6 = I
        recipes.push(Recipe(new uint8[](2), 8, _evolvedNftURIs[1]));
        recipes[1].ingredients[0] = 0;
        recipes[1].ingredients[1] = 6;

        // Recipe J (index 9): ingredients 3 & 6 = J
        recipes.push(Recipe(new uint8[](2), 9, _evolvedNftURIs[2]));
        recipes[2].ingredients[0] = 3;
        recipes[2].ingredients[1] = 6;

        // Recipe K (index 10): ingredients 2 & 5 = K
        recipes.push(Recipe(new uint8[](2), 10, _evolvedNftURIs[3]));
        recipes[3].ingredients[0] = 2;
        recipes[3].ingredients[1] = 5;

        // Recipe L (index 11): ingredients 4 & 6 & 5 = L
        recipes.push(Recipe(new uint8[](3), 11, _evolvedNftURIs[4]));
        recipes[4].ingredients[0] = 4;
        recipes[4].ingredients[1] = 6;
        recipes[4].ingredients[2] = 5;

        _setDefaultRoyalty(msg.sender, 500);
    }

    // Pause minting - only owner can call
    function pauseMinting() public onlyOwner {
        _pause();
        emit MintingPaused(msg.sender);
    }

    // Unpause minting - only owner can call
    function unpauseMinting() public onlyOwner {
        _unpause();
        emit MintingUnpaused(msg.sender);
    }

    function mint(bytes32[] calldata merkleProof) public whenNotPaused {
        require(!mintingComplete, "Minting is complete");
        
        address sender = msg.sender;
        
        bytes32 leaf = keccak256(abi.encode(sender)); 
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Not on allowlist");

        uint256 seed = uint256(keccak256(
            abi.encode(
                block.timestamp,
                block.prevrandao,
                sender,
                tokenCounter,
                block.number
            )
        ));
        
        if (!plantsPhaseComplete) {
            // PLANTS Phase - Check original limit
            require(numMinted[sender] < MAX_MINTS_PER_WALLET, "Max mints per wallet reached for plants phase");
            
            uint256 randomType = uint256(seed) % 6;
            require(NFT_MINTED_PLANTS[randomType] < NFT_LIMITS_PLANTS[randomType], "Plant type limit reached");

            uint256 newTokenId = tokenCounter++;
            _safeMint(sender, newTokenId);
            
            tokenTypes[newTokenId] = uint8(randomType);
            NFT_MINTED_PLANTS[randomType]++;
            numMinted[sender]++;
            
            _setTokenURI(newTokenId, baseNftURIsPLANTS[randomType]);

            // Check if all plants are minted
            bool allPlantsMinted = true;
            for (uint256 i = 0; i < 6; i++) {
                if (NFT_MINTED_PLANTS[i] < NFT_LIMITS_PLANTS[i]) {
                    allPlantsMinted = false;
                    break;
                }
            }
            
            if (allPlantsMinted) {
                plantsPhaseComplete = true;
                _pause(); // Pause for phase transition
            }

            emit NFTMinted(sender, newTokenId, uint8(randomType));
        } else {
            // WEAPONS Phase - Check increased limit
            require(numMinted[sender] < MAX_MINTS_PHASE2, "Max mints per wallet reached for weapons phase");
            
            uint256 randomType = uint256(seed) % 7;
            require(NFT_MINTED[randomType] < NFT_LIMITS[randomType], "Weapon type limit reached");

            uint256 newTokenId = tokenCounter++;
            _safeMint(sender, newTokenId);
            
            tokenTypes[newTokenId] = uint8(randomType);
            NFT_MINTED[randomType]++;
            numMinted[sender]++;
            
            _setTokenURI(newTokenId, baseNftURIs[randomType]);

            emit NFTMinted(sender, newTokenId, uint8(randomType));
        }
    }

    // Add function to check remaining PLANTS
    function getRemainingPlants() public view returns (uint256[6] memory) {
        uint256[6] memory remaining;
        for (uint256 i = 0; i < 6; i++) {
            remaining[i] = NFT_LIMITS_PLANTS[i] - NFT_MINTED_PLANTS[i];
        }
        return remaining;
    }

    // Add this function to test distribution (remove in production)
    function testRandomDistribution(uint256 iterations) public view returns (uint256[7] memory) {
        uint256[7] memory distribution;
        address sender = msg.sender;
        uint256 counter = tokenCounter;
        
        for(uint256 i = 0; i < iterations; i++) {
            uint256 seed = uint256(keccak256(
                abi.encode(
                    block.timestamp,
                    block.prevrandao,
                    sender,
                    counter + i,
                    block.number
                )
            ));
            uint256 randomType = seed % 7;
            distribution[randomType]++;
        }
        
        return distribution;
    }

    // Function to update the Merkle root (onlyOwner)
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    // Add this function to help debug merkle proof issues
    function verifyProof(bytes32[] calldata merkleProof, address account) public view returns (bool) {
        // Match the local encoding method
        bytes32 leaf = keccak256(abi.encode(account));  // Changed from abi.encodePacked to abi.encode
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }

    // Add this function right after verifyProof
    function getLeafHash(address account) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    // Modify burnAndMint to handle both PLANTS/ELIXIRS and WEAPONS
    function burnAndMint(uint256[] calldata tokenIds) public {
        require(tokenIds.length > 0, "Must burn at least one token");

        uint8[] memory types = new uint8[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ownerOf(tokenIds[i]) == msg.sender, "Not owner of token");
            types[i] = tokenTypes[tokenIds[i]];
            _burn(tokenIds[i]);
        }

        (bool recipeFound, uint8 resultType, string memory resultURI) = findRecipe(types);
        require(recipeFound, "No valid recipe found");

        uint256 newTokenId = tokenCounter++;
        _safeMint(msg.sender, newTokenId);
        
        // Use appropriate URI based on phase
        if (!plantsPhaseComplete) {
            _setTokenURI(newTokenId, evolvedNftURIsELIXIRS[resultType - 6]); // Adjust index
        } else {
            _setTokenURI(newTokenId, evolvedNftURIs[resultType - 7]); // Adjust index
        }
        
        tokenTypes[newTokenId] = resultType;
        emit NFTBurned(tokenIds, newTokenId, resultType);
    }

    function findRecipe(uint8[] memory types)
        internal
        view
        returns (
            bool,
            uint8,
            string memory
        )
    {
        for (uint256 i = 0; i < recipes.length; i++) {
            if (types.length == recipes[i].ingredients.length) {
                bool matches = true;
                for (uint256 j = 0; j < types.length; j++) {
                    if (types[j] != recipes[i].ingredients[j]) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    return (true, recipes[i].result, recipes[i].resultURI);
                }
            }
        }
        return (false, 0, "");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Check if minting is currently paused
    function isMintingPaused() public view returns (bool) {
        return paused();
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        require(!mintingComplete, "Minting is complete");
        merkleRoot = _merkleRoot;
    }

    function completeMinting() external onlyOwner {
        mintingComplete = true;
    }

    function approve(address to, uint256 tokenId) public override(ERC721, IERC721) {
        require(!mintingComplete, "Approvals locked until minting complete");
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override(ERC721, IERC721) {
        require(!mintingComplete, "Approvals locked until minting complete");
        super.setApprovalForAll(operator, approved);
    }
}
