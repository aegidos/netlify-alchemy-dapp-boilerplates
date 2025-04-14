// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ApeChainPoWNFT is ERC721URIStorage, ERC2981, Ownable, Pausable {
    uint256 public tokenCounter;
    uint256 public constant MAX_MINTS_PER_WALLET = 12;

    uint256[7] public NFT_LIMITS = [350, 100, 275, 500, 135, 310, 885];
    uint256[7] public NFT_MINTED;

    mapping(uint256 => uint8) public tokenTypes;
    mapping(address => uint256) public numMinted;

    string[7] public baseNftURIs;
    string[5] public evolvedNftURIs;

    struct Recipe {
        uint8[] ingredients;
        uint8 result;
        string resultURI;
    }

    Recipe[] public recipes;

    address[] public allowedContracts = [
        0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90, // APE GANG

        0x224fc0b2Af8f4530eEE986a2fA3F6c6dfe3EC4d9  // Apes in Space Curtis Test NFT
    ];

    event NFTMinted(address indexed miner, uint256 tokenId, uint8 nftType);
    event NFTBurned(uint256[] burnedTokens, uint256 newTokenId, uint8 newType);
    event MintingPaused(address indexed pauser);
    event MintingUnpaused(address indexed unpauser);

    constructor(string[7] memory _baseNftURIs, string[5] memory _evolvedNftURIs)
        ERC721("Apes in Space on Ape (Weapons)", "AISAW")
        Ownable(msg.sender)
    {
        baseNftURIs = _baseNftURIs;
        evolvedNftURIs = _evolvedNftURIs;

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

    function isHolder(address _wallet) public view returns (bool) {
        for (uint i = 0; i < allowedContracts.length; i++) {
            if (IERC721(allowedContracts[i]).balanceOf(_wallet) > 0) {
                return true;
            }
        }
        return false;
    }

    function mint(address to) public whenNotPaused {
        // require(isHolder(msg.sender), "Must hold one of the allowed NFTs to mint");
        // require(numMinted[msg.sender] < MAX_MINTS_PER_WALLET, "Max mints per wallet reached");

        uint256 randomType = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenCounter))) % 7;
        require(NFT_MINTED[randomType] < NFT_LIMITS[randomType], "NFT type limit reached");

        uint256 newTokenId = tokenCounter++;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, baseNftURIs[randomType]);

        tokenTypes[newTokenId] = uint8(randomType);
        NFT_MINTED[randomType]++;
        numMinted[msg.sender]++;

        emit NFTMinted(msg.sender, newTokenId, uint8(randomType));
    }

    // Keep burnAndMint available even when minting is paused
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

    // Check if minting is currently paused
    function isMintingPaused() public view returns (bool) {
        return paused();
    }

    function updateAllowedContracts(address[] calldata _contracts) external onlyOwner {
        allowedContracts = _contracts;
    }

    function getAllowedContracts() external view returns (address[] memory) {
        return allowedContracts;
    }
}
