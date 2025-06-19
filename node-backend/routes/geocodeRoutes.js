import express from 'express';
import { geocodeHandler } from '../controllers/geocodeController.js';

const router = express.Router();

router.post('/', geocodeHandler);

export default router; 