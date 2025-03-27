import fs from 'fs';
import path from 'path';

const scoresFile = path.join(process.cwd(), 'data', 'scores.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Initialize scores file if it doesn't exist
if (!fs.existsSync(scoresFile)) {
  fs.writeFileSync(scoresFile, JSON.stringify([]));
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Debug incoming data
      console.log('Received request body:', req.body);

      // Read existing scores
      const scores = JSON.parse(fs.readFileSync(scoresFile, 'utf8'));
      
      // Create new score object with all fields
      const newScore = {
        score: parseInt(req.body.score) || 0,
        timestamp: req.body.timestamp || new Date().toISOString(),
        walletAddress: req.body.walletAddress || 'unknown',
        species: req.body.species || 'unknown'
      };

      // Debug new score object
      console.log('New score object:', newScore);

      // Add to scores array
      scores.push(newScore);

      // Save with pretty formatting (null, 2 for readability)
      fs.writeFileSync(scoresFile, JSON.stringify(scores, null, 2));

      // Verify saved data
      const savedScores = JSON.parse(fs.readFileSync(scoresFile, 'utf8'));
      console.log('Saved scores:', savedScores);

      res.status(200).json({ 
        message: 'Score saved successfully', 
        score: newScore,
        totalScores: scores.length,
        allScores: scores 
      });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ 
        message: 'Error saving score',
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}