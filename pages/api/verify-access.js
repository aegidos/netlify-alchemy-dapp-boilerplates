import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }

  try {
    const contractAddresses = [
      '0xF36f4faDEF899E839461EccB8D0Ce3d49Cff5A90', // APE GANG
      '0x60e4d786628fea6478f785a6d7e704777c86a7c6', // MAYC
      '0xb3443b6bd585ba4118cae2bedb61c7ec4a8281df', // Gs on ape
      '0xfa1c20e0d4277b1e0b289dffadb5bd92fb8486aa', // NPC
      '0x91417bd88af5071ccea8d3bf3af410660e356b06'  // zards
    ];

    for (const contractAddress of contractAddresses) {
      const response = await axios.get(
        `https://apechain-mainnet.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contractAddress}`
      );

      if (response.data.totalCount > 0) {
        return res.status(200).json({ hasAccess: true });
      }
    }

    return res.status(403).json({ hasAccess: false });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}