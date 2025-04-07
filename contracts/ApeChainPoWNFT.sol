// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ApeChainPoWNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public tokenCounter;
    uint256 public constant MAX_MINTS_PER_WALLET = 12;

    uint256[6] public NFT_LIMITS = [150, 600, 800, 1000, 1000, 1300];
    uint256[6] public NFT_MINTED;

    mapping(uint256 => uint8) public tokenTypes;
    mapping(address => uint256) public numMinted;

    string[6] public baseNftURIs;
    string[4] public evolvedNftURIs;

    struct Recipe {
        uint8[] ingredients;
        uint8 result;
        string resultURI;
    }

    Recipe[] public recipes;

    event NFTMinted(address indexed miner, uint256 tokenId, uint8 nftType);
    event NFTBurned(uint256[] burnedTokens, uint256 newTokenId, uint8 newType);

    constructor(string[6] memory _baseNftURIs, string[4] memory _evolvedNftURIs)
        ERC721("ApeChain PoW NFT", "APOW")
        Ownable(msg.sender)
    {
        baseNftURIs = _baseNftURIs;
        evolvedNftURIs = _evolvedNftURIs;

        // Set up burn recipes
        recipes.push(Recipe(new uint8[](2), 6, _evolvedNftURIs[0])); // E + F = G
        recipes[0].ingredients[0] = 4;
        recipes[0].ingredients[1] = 5;

        recipes.push(Recipe(new uint8[](2), 7, _evolvedNftURIs[1])); // C + D = H
        recipes[1].ingredients[0] = 2;
        recipes[1].ingredients[1] = 3;

        recipes.push(Recipe(new uint8[](2), 8, _evolvedNftURIs[2])); // B + F = I
        recipes[2].ingredients[0] = 1;
        recipes[2].ingredients[1] = 5;

        recipes.push(Recipe(new uint8[](3), 9, _evolvedNftURIs[3])); // A + D + F = J
        recipes[3].ingredients[0] = 0;
        recipes[3].ingredients[1] = 3;
        recipes[3].ingredients[2] = 5;

        _setDefaultRoyalty(msg.sender, 500);
    }

    function mint(address to) public {
        require(numMinted[msg.sender] < MAX_MINTS_PER_WALLET, "Max mints per wallet reached");

        uint256 randomType = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenCounter))) % 6;
        require(NFT_MINTED[randomType] < NFT_LIMITS[randomType], "NFT type limit reached");

        uint256 newTokenId = tokenCounter++;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, baseNftURIs[randomType]);

        tokenTypes[newTokenId] = uint8(randomType);
        NFT_MINTED[randomType]++;
        numMinted[msg.sender]++;

        emit NFTMinted(msg.sender, newTokenId, uint8(randomType));
    }

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
        _setTokenURI(newTokenId, resultURI);
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
}
