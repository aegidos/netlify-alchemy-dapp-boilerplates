import { supabase } from '../../utils/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;

  try {
    const { count, error } = await supabase
      .from('scores')
      .select('*', { count: 'exact' })
      .eq('walletaddress', address);

    if (error) throw error;

    res.status(200).json({ count });
  } catch (error) {
    console.error('Error checking mint count:', error);
    res.status(500).json({ error: 'Failed to check mint count' });
  }
}