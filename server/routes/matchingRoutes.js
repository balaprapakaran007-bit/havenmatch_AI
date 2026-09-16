import express from 'express';
import { getBuyerRecommendations } from '../controllers/matchingController.js';

const router = express.Router();

router.post('/buyer', getBuyerRecommendations);
router.get('/buyer', getBuyerRecommendations);
router.post('/buyer-recommendations', getBuyerRecommendations);
router.get('/buyer-recommendations', getBuyerRecommendations);

export default router;
