import express from 'express';
import { searchTweetsHandler } from '../controllers/twitterController.js';

const router = express.Router();
router.get('/twitter/search', searchTweetsHandler);
export default router; 