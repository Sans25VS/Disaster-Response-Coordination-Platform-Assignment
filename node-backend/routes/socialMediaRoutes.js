import express from 'express';

const router = express.Router();

// Helper to flag priority alerts
function isPriority(post) {
  const text = post.post.toLowerCase();
  return text.includes('urgent') || text.includes('sos');
}

// Mock social media endpoint with priority alert
router.get('/mock-social-media', (req, res) => {
  const posts = [
    { post: '#floodrelief Need food in NYC', user: 'citizen1' },
    { post: 'Evacuation ongoing in Houston', user: 'citizen2' },
    { post: 'Power outage in LA #earthquake', user: 'citizen3' },
    { post: 'SOS! Trapped in basement, need help', user: 'citizen4' },
    { post: 'urgent: medical supplies needed at shelter', user: 'citizen5' }
  ];
  const flagged = posts.map((p, i) => ({
    id: i + 1,
    content: p.post,
    author: p.user,
    priority: isPriority(p)
  }));
  res.json(flagged);
});

export default router; 