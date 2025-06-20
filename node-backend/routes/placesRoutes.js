import express from 'express';
import { getNearbyHospitalsHandler } from '../controllers/placesController.js';
 
const router = express.Router();
router.get('/resources/hospitals', getNearbyHospitalsHandler);
export default router; 