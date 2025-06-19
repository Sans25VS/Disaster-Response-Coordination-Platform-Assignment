import express from 'express';
import { extractLocationHandler, verifyImageHandler } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/extract-location', extractLocationHandler);
router.post('/verify-image', verifyImageHandler);

export default router; 