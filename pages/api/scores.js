import { supabase } from '../../utils/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Add debug logging
      console.log('Fetched scores from Supabase:', data);
      
      res.status(200).json(data || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({ error: 'Failed to fetch scores' });
    }
  } else if (req.method === 'POST') {
    try {
      const scoreData = req.body
      const { data, error } = await supabase
        .from('scores')
        .insert([scoreData])
        .select()

      if (error) throw error
      res.status(200).json(data[0])
    } catch (error) {
      console.error('Error saving score:', error)
      res.status(500).json({ error: 'Failed to save score' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

// SQL schema for the scores table
const scoresTableSchema = `
create table scores (
  id uuid default uuid_generate_v4() primary key,
  score integer not null,
  species text not null,
  timestamp timestamptz not null default now(),
  walletAddress text not null,
  turn integer not null
);

-- Add indexes for better query performance
create index scores_score_idx on scores (score desc);
create index scores_timestamp_idx on scores (timestamp desc);

-- Insert sample data
INSERT INTO scores (score, timestamp, walletAddress, species, turn)
VALUES (
  290,
  '2025-03-27T20:42:46.984Z',
  '0x939AC38d9ee95e0E01B88086AAb47786F8e61f5f',
  'Ape Gang',
  10
);
`;