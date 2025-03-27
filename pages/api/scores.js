import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Read the scores file
    const scoresPath = path.join(process.cwd(), 'data', 'scores.json');
    const scoresData = fs.readFileSync(scoresPath, 'utf8');
    const scores = JSON.parse(scoresData);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return the scores
    res.status(200).json(scores);
  } catch (error) {
    console.error('Error reading scores:', error);
    res.status(500).json({ error: 'Failed to load highscores' });
  }
}