import express from 'express';
import { addShortlist, removeShortlist, listShortlists, expressInterest, listInterests, scheduleVisit, listVisits } from '../controllers/engagementController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/shortlists/add', requireAuth, addShortlist);
router.post('/shortlists/remove', requireAuth, removeShortlist);
router.get('/shortlists/list', listShortlists);
router.get('/shortlist/list', listShortlists);

router.post('/interests/express', requireAuth, expressInterest);
router.get('/interests/list', listInterests);

router.post('/visits/schedule', requireAuth, scheduleVisit);
router.get('/visits/list', listVisits);

export default router;
