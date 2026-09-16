import express from 'express';
import { listProperties, getPropertyById, createProperty, updateProperty, deleteProperty } from '../controllers/propertyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listProperties);
router.get('/list', listProperties);
router.get('/:id', getPropertyById);
router.post('/', requireAuth, createProperty);
router.post('/create', requireAuth, createProperty);
router.put('/:id', requireAuth, updateProperty);
router.post('/update', requireAuth, updateProperty);
router.delete('/:id', requireAuth, deleteProperty);
router.post('/delete', requireAuth, deleteProperty);

export default router;
