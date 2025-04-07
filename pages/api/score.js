import { supabase } from '../../utils/supabase';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const scoreData = req.body;
      
      // Validate required data
      if (!scoreData || !scoreData.address || !scoreData.score) {
        return res.status(400).json({
          success: false,
          error: 'Missing required score data'
        });
      }

      console.log('Processing score data:', scoreData);

      // Save to Supabase
      const { data, error } = await supabase
        .from('scores')
        .insert([scoreData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Create data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
      }

      // Save to local JSON
      const scoresPath = path.join(dataDir, 'scores.json');
      let scores = [];
      
      try {
        if (fs.existsSync(scoresPath)) {
          scores = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
        }
      } catch (fsError) {
        console.warn('Error reading scores file:', fsError);
      }
      
      scores.push(scoreData);
      fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));

      console.log('Score saved successfully:', data[0]);
      
      res.status(200).json({
        success: true,
        data: data[0],
        message: 'Score saved successfully'
      });

    } catch (error) {
      console.error('Error saving score:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to save score',
        details: error.toString()
      });
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
}