import express from 'express';

const router = express.Router();

// Mock social media endpoint
router.get('/mock-social-media', (req, res) => {
  res.json([
    { post: '#floodrelief Need food in NYC', user: 'citizen1' },
    { post: 'Evacuation ongoing in Houston', user: 'citizen2' },
    { post: 'Power outage in LA #earthquake', user: 'citizen3' }
  ]);
});

export default router; 