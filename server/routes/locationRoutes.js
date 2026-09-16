import express from 'express';
import { geocodeLocation, discoverLocationPlaces } from '../controllers/locationController.js';

const router = express.Router();

router.post('/geocode', geocodeLocation);
router.get('/geocode', geocodeLocation);
router.post('/discover', discoverLocationPlaces);
router.get('/discover', discoverLocationPlaces);

export default router;
