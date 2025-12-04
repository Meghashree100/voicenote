import express from 'express';
import { parseVoiceInput } from '../utils/voiceParser.js';

const router = express.Router();

// POST /api/parse - Parse voice input to extract task details
router.post('/', (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    
    const parsed = parseVoiceInput(transcript);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse voice input', message: error.message });
  }
});

export default router;


