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
      '0x91417bd88af5071ccea8d3bf3af410660e356b06',  // zards
      '0xcf2e5437b2944def3fc72b0a7488e87467c7d76c',  // Froglings
      '0xa096af26affe37cc2a56ecf381b754a20b6ddf20',  // OVISAURS
      '0x35b70c728ce7bc2e2593100673a0ccd9ef4e1c7b',  // spunkys
      '0xdd2da83d07603897b2eb80dc1f7a0b567ad1c2c6',  // Pixl Pals
      '0x0178a9d0b0cba1b2ede3afdb6dd021db24ff4240'  // Forever Undead
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