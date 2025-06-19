import express from 'express';
import { officialUpdatesHandler } from '../controllers/browseController.js';

const router = express.Router();
router.get('/official-updates', officialUpdatesHandler);
export default router; 