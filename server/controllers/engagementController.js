import { getDb } from '../config/db.js';
import { getAuthenticatedUser } from '../middleware/authMiddleware.js';
import { normalizeProperty } from './propertyController.js';

export async function addShortlist(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) return res.status(401).json({ success: false, error: '401 Unauthenticated: Log in required to save properties.' });

    const userId = authUser.userId;
    const propertyId = req.body.propertyId || req.body.id;
    if (!propertyId) return res.status(400).json({ success: false, error: 'propertyId is required' });

    await db.collection('shortlists').updateOne(
      { userId, propertyId },
      { $set: { userId, propertyId, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Property saved to shortlist.' });
  } catch (err) {
    next(err);
  }
}

export async function removeShortlist(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) return res.status(401).json({ success: false, error: '401 Unauthenticated' });

    const userId = authUser.userId;
    const propertyId = req.body.propertyId || req.body.id || req.params.id;
    if (!propertyId) return res.status(400).json({ success: false, error: 'propertyId is required' });

    await db.collection('shortlists').deleteOne({ userId, propertyId });
    res.json({ success: true, message: 'Property removed from shortlist.' });
  } catch (err) {
    next(err);
  }
}

export async function listShortlists(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.query);
    const userId = authUser?.userId || req.query.userId;
    if (!userId) return res.json({ success: true, properties: [], total: 0 });

    const items = await db.collection('shortlists').find({ userId }).toArray();
    const propIds = items.map(i => i.propertyId);

    if (propIds.length === 0) return res.json({ success: true, properties: [], total: 0 });

    const rawProps = await db.collection('properties').find({
      $or: [{ id: { $in: propIds } }, { propertyId: { $in: propIds } }]
    }).toArray();

    const properties = rawProps.map(normalizeProperty);
    res.json({ success: true, properties, total: properties.length });
  } catch (err) {
    next(err);
  }
}

export async function expressInterest(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) return res.status(401).json({ success: false, error: '401 Unauthenticated: Log in to express interest.' });

    const userId = authUser.userId;
    const { propertyId, message } = req.body;
    if (!propertyId) return res.status(400).json({ success: false, error: 'propertyId is required' });

    const doc = {
      userId,
      buyerId: userId,
      propertyId,
      interestStatus: 'EXPRESSED',
      message: message || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('interests').updateOne(
      { userId, propertyId },
      { $set: doc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    res.json({ success: true, interest: doc, message: 'Interest registered.' });
  } catch (err) {
    next(err);
  }
}

export async function listInterests(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.query);
    const userId = authUser?.userId || req.query.userId;
    if (!userId) return res.json({ success: true, interests: [], total: 0 });

    const interests = await db.collection('interests').find({
      $or: [{ userId }, { buyerId: userId }]
    }).sort({ createdAt: -1 }).toArray();

    res.json({ success: true, interests, total: interests.length });
  } catch (err) {
    next(err);
  }
}

export async function scheduleVisit(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) return res.status(401).json({ success: false, error: '401 Unauthenticated: Log in to schedule visit.' });

    const userId = authUser.userId;
    const { propertyId, date, timeSlot } = req.body;
    if (!propertyId) return res.status(400).json({ success: false, error: 'propertyId is required' });

    const doc = {
      userId,
      buyerId: userId,
      propertyId,
      visitDate: date || req.body.visitDate || '',
      visitTime: timeSlot || req.body.visitTime || '',
      visitStatus: 'REQUESTED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('visit_requests').insertOne(doc);
    res.json({ success: true, visit: doc, message: 'Visit scheduled successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function listVisits(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.query);
    const userId = authUser?.userId || req.query.userId;
    if (!userId) return res.json({ success: true, visits: [], total: 0 });

    const visits = await db.collection('visit_requests').find({
      $or: [{ userId }, { buyerId: userId }]
    }).sort({ createdAt: -1 }).toArray();

    res.json({ success: true, visits, total: visits.length });
  } catch (err) {
    next(err);
  }
}
