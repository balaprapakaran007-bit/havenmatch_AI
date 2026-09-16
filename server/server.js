import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToMongo, getDb } from './config/db.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import engagementRoutes from './routes/engagementRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

import fs from 'fs';
import { login, signup, forgotPassword, resetPassword, getCurrentUser, updateProfile, uploadAvatar } from './controllers/authController.js';
import { listProperties, getPropertyById, createProperty, updateProperty, deleteProperty } from './controllers/propertyController.js';
import { getBuyerRecommendations } from './controllers/matchingController.js';
import { addShortlist, removeShortlist, listShortlists, expressInterest, listInterests, scheduleVisit, listVisits } from './controllers/engagementController.js';
import { geocodeLocation, discoverLocationPlaces } from './controllers/locationController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const avatarsUploadDir = path.join(__dirname, 'uploads', 'avatars');
const propertiesUploadDir = path.join(__dirname, 'uploads', 'properties');
if (!fs.existsSync(avatarsUploadDir)) fs.mkdirSync(avatarsUploadDir, { recursive: true });
if (!fs.existsSync(propertiesUploadDir)) fs.mkdirSync(propertiesUploadDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME || 'havenmatch';

// Standard Hardened CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow during dev
    }
  },
  credentials: true
}));

// Cap body size to 50MB to support high-resolution property image uploads safely
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static asset delivery
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API rate limiting
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HavenMatch AI Modular Backend Engine',
    database: getDb() ? 'connected' : 'connecting',
    mongoDatabase: DB_NAME,
    timestamp: new Date()
  });
});

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/location', locationRoutes);

// Action Dispatcher for Webhook & Action-based clients
async function actionDispatcher(req, res, next) {
  const action = req.body?.action;
  if (!action || action === 'matching/buyer' || action === 'match') {
    return getBuyerRecommendations(req, res, next);
  }
  switch (action) {
    case 'auth/login':
      return login(req, res, next);
    case 'auth/register':
    case 'auth/signup':
      return signup(req, res, next);
    case 'auth/forgot-password':
      return forgotPassword(req, res, next);
    case 'auth/reset-password':
      return resetPassword(req, res, next);
    case 'auth/me':
      return getCurrentUser(req, res, next);
    case 'auth/update-profile':
      return updateProfile(req, res, next);
    case 'properties/create':
      return createProperty(req, res, next);
    case 'properties/update':
      return updateProperty(req, res, next);
    case 'properties/delete':
      return deleteProperty(req, res, next);
    case 'properties/list':
    case 'seller/listings':
      return listProperties(req, res, next);
    case 'properties/get':
      return getPropertyById(req, res, next);
    case 'shortlists/list':
      return listShortlists(req, res, next);
    case 'shortlists/add':
      return addShortlist(req, res, next);
    case 'shortlists/remove':
      return removeShortlist(req, res, next);
    case 'interests/list':
      return listInterests(req, res, next);
    case 'interests/express':
      return expressInterest(req, res, next);
    case 'visits/list':
      return listVisits(req, res, next);
    case 'visits/schedule':
      return scheduleVisit(req, res, next);
    case 'location/geocode':
      return geocodeLocation(req, res, next);
    case 'location/discover':
      return discoverLocationPlaces(req, res, next);
    case 'location/poi':
      return handleLocationPoi(req, res, next);
    default:
      return getBuyerRecommendations(req, res, next);
  }
}

async function handleLocationPoi(req, res, next) {
  try {
    const db = getDb();
    const propertyId = req.query?.propertyId || req.body?.propertyId;
    if (!propertyId) {
      return res.json({ success: true, propertyId: '', nearbyPlaces: [] });
    }
    const prop = await db.collection('properties').findOne({
      $or: [{ id: propertyId }, { propertyId }]
    });
    const places = (prop && Array.isArray(prop.nearbyPlaces)) ? prop.nearbyPlaces : [];
    res.json({
      success: true,
      action: 'location/poi',
      propertyId,
      nearbyPlaces: places
    });
  } catch (err) {
    next(err);
  }
}

// Backwards-Compatible Action Routing
app.post('/webhook/havenmatch/match', actionDispatcher);
app.post('/webhook-test/havenmatch/match', actionDispatcher);

// Direct API Aliases for Frontend Compatibility
app.get('/api/location/poi', handleLocationPoi);
app.post('/api/location/poi', handleLocationPoi);
app.get('/api/location/geocode', geocodeLocation);
app.post('/api/location/geocode', geocodeLocation);
app.get('/api/location/discover', discoverLocationPlaces);
app.post('/api/location/discover', discoverLocationPlaces);
app.get('/api/shortlists/list', listShortlists);
app.get('/api/shortlist/list', listShortlists);
app.get('/api/interests/list', listInterests);
app.post('/api/interests/express', expressInterest);
app.get('/api/visits/list', listVisits);
app.post('/api/visits/schedule', scheduleVisit);
app.get('/api/properties/list', listProperties);
app.post('/api/properties/create', createProperty);
app.post('/api/properties/update', updateProperty);
app.post('/api/properties/delete', deleteProperty);

app.post('/api/profile/photo', uploadAvatar);
app.post('/api/auth/profile/photo', uploadAvatar);

app.post('/api/auth/login', login);
app.post('/api/auth/register', signup);
app.post('/api/auth/signup', signup);
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);
app.get('/api/auth/me', getCurrentUser);
app.post('/api/auth/update-profile', updateProfile);

// 404 JSON Handler — Guarantee no HTML is ever returned from JSON API requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested API endpoint ${req.method} ${req.originalUrl} was not found on this server.`
    }
  });
});

// Central Error Handler
app.use(globalErrorHandler);

// Server bootstrap
let serverInstance = null;
if (process.env.NODE_ENV !== 'test') {
  connectToMongo().then(() => {
    serverInstance = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  HAVENMATCH AI — MODULAR MVC MONGODB ENGINE ONLINE`);
      console.log(`  PORT: http://localhost:${PORT}`);
      console.log(`  WEBHOOK: http://localhost:${PORT}/webhook/havenmatch/match`);
      console.log(`  DATABASE: MongoDB Atlas ("${DB_NAME}")`);
      console.log(`======================================================\n`);
    });
  });
}

export default app;
