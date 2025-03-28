import { supabase } from '../../utils/supabase';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const scoreData = req.body;

      // Save to Supabase
      const { data, error } = await supabase
        .from('scores')
        .insert([scoreData])
        .select();

      if (error) throw error;

      // Also save to local JSON as backup
      const scoresPath = path.join(process.cwd(), 'data', 'scores.json');
      let scores = [];
      
      if (fs.existsSync(scoresPath)) {
        const fileContent = fs.readFileSync(scoresPath, 'utf8');
        scores = JSON.parse(fileContent);
      }
      
      scores.push(scoreData);
      fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));

      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error saving score:', error);
      res.status(500).json({ error: 'Failed to save score' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}