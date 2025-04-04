// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApeChainPoWNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public difficulty = 2**160;
    uint256 public tokenCounter;

    // NFT Type Limits
    uint256[6] public NFT_LIMITS = [150, 600, 800, 1000, 1000, 1300];
    uint256[6] public NFT_MINTED;

    struct Recipe {
        uint8[] ingredients;
        uint8 result;
        string resultURI;
    }

    Recipe[] public recipes;
    mapping(address => uint256) public numMinted;
    uint256 public constant MAX_MINTS_PER_WALLET = 12;
    mapping(address => uint256) public minedBlock;
    mapping(uint256 => uint8) public tokenTypes;
    string[6] public baseNftURIs;

    event NFTBurned(uint256[] burnedTokens, uint256 newTokenId, uint8 newType);
    event NFTMinted(address miner, uint256 tokenId, uint8 nftType);

    constructor(string[6] memory _baseURIs, string[4] memory _evolvedURIs) 
        ERC721("ApeChain PoW NFT", "APOW") 
        Ownable(msg.sender) 
    {
        baseNftURIs = _baseURIs;

        // Set up burn recipes correctly
        recipes.push(Recipe(new uint8[](2), 6, _evolvedURIs[0])); // E + F = G
        recipes[0].ingredients[0] = 4;
        recipes[0].ingredients[1] = 5;

        recipes.push(Recipe(new uint8[](2), 7, _evolvedURIs[1])); // C + D = H
        recipes[1].ingredients[0] = 2;
        recipes[1].ingredients[1] = 3;

        recipes.push(Recipe(new uint8[](2), 8, _evolvedURIs[2])); // B + F = I
        recipes[2].ingredients[0] = 1;
        recipes[2].ingredients[1] = 5;

        recipes.push(Recipe(new uint8[](3), 9, _evolvedURIs[3])); // A + D + F = J
        recipes[3].ingredients[0] = 0;
        recipes[3].ingredients[1] = 3;
        recipes[3].ingredients[2] = 5;

        _setDefaultRoyalty(msg.sender, 500);
    }

    // Improved random NFT type generation
    function getRandomNFTType(address sender, uint256 blockNumber) internal pure returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(sender, blockNumber)));
        // Ensure we only get numbers 0-5 for base NFTs (A-F)
        return randomNumber % 6;
    }

    function mint(address to) public {
        require(numMinted[msg.sender] < MAX_MINTS_PER_WALLET, "Max mints per wallet reached");
        
        // Generate random type (0-5 only)
        uint256 randomType = getRandomNFTType(msg.sender, block.number);
        require(randomType < 6, "Invalid NFT type generated");
        require(NFT_MINTED[randomType] < NFT_LIMITS[randomType], "NFT type limit reached");

        uint256 newTokenId = tokenCounter;
        tokenCounter++;

        _safeMint(to, newTokenId);
        
        // Add error checking for URI
        require(bytes(baseNftURIs[randomType]).length > 0, "Invalid URI for NFT type");
        _setTokenURI(newTokenId, baseNftURIs[randomType]);
        
        tokenTypes[newTokenId] = uint8(randomType);
        NFT_MINTED[randomType]++;
        numMinted[msg.sender]++;
        minedBlock[msg.sender] = block.number;

        emit NFTMinted(msg.sender, newTokenId, uint8(randomType));
    }

    function remainingMints(address wallet) public view returns (uint256) {
        return MAX_MINTS_PER_WALLET - numMinted[wallet];
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override(ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721URIStorage, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
