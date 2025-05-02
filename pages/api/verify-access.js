import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }

          // Suckerz + Freshest KIX + Ashita no Kaze
  try {
        // Define contract addresses
        const contractAddresses = [
          '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90', // APE GANG @BasedApeGang
          '0xee0c1016fe325fa755be196cc3fc4d6661e84b11', // ETHEREA @nftetherea
          '0x23abf38a6d3ad137c0b219b51243cf326ed66039', // Nekito @NekitoNFT
          '0xb3443b6bd585ba4118cae2bedb61c7ec4a8281df', // Gs on ape @GeezOnApe 
          '0xfa1c20e0d4277b1e0b289dffadb5bd92fb8486aa', // NPC @notapunkscult
          '0x91417bd88af5071ccea8d3bf3af410660e356b06',  // zards @ZardsNFT 
          '0xb1cd9a49d51b753b25878c150a920a9294f45022',  // ASHITA NO KAZE @w_tmr_
          '0xdd2da83d07603897b2eb80dc1f7a0b567ad1c2c6',  // Pixl Pals @PixlPalsNFT
          '0xe277a7643562775c4f4257e23b068ba8f45608b4', // Primal Cult @PrimalOnApe
          '0xcf2e5437b2944def3fc72b0a7488e87467c7d76c', // Froglings @froglings
          '0x7166dde47b3a6c75eec75c5367ff1f629b1a4603', // Driftlands @0xX1A 
          '0x1B094A5B06ce05FE443E7cF0B5fDcD6673eb735D', // Trenchers on Ape @TrenchersOnApe
        ];

    for (const contractAddress of contractAddresses) {
      const response = await axios.get(
        `https://apechain-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contractAddress}`
      );
      //if (response.data.totalCount > 0) {
      if (true) {
        return res.status(200).json({ hasAccess: true });
      }
    }

    return res.status(403).json({ hasAccess: false });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}