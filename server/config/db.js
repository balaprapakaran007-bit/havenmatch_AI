import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://verisphere07_db_user:cMdZLx0gUXjgZIEa@havenmatch.ifbll60.mongodb.net/havenmatch?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'havenmatch';

let db = null;
let client = null;
let isConnecting = false;

export function safeObjectId(idStr) {
  if (!idStr) return null;
  const str = String(idStr).trim();
  if (/^[0-9a-fA-F]{24}$/.test(str)) {
    try {
      return new ObjectId(str);
    } catch (_) {
      return null;
    }
  }
  return null;
}

export async function connectToMongo() {
  if (db) return db;
  if (isConnecting) return null;
  isConnecting = true;

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Connected successfully to Atlas database: "${DB_NAME}"`);

    await initializeDatabase();
    isConnecting = false;
    return db;
  } catch (err) {
    isConnecting = false;
    console.error('[MongoDB] Connection error:', err.message);
    setTimeout(connectToMongo, 5000);
    return null;
  }
}

export function getDb() {
  return db;
}

export async function initializeDatabase() {
  try {
    if (!db) return;
    // Compound and unique indexes for sub-millisecond lookups (NO DUMMY DATA)
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ userId: 1 }, { unique: true, sparse: true });
    await db.collection('properties').createIndex({ propertyId: 1 }, { unique: true, sparse: true });
    await db.collection('properties').createIndex({ ownerId: 1 });
    await db.collection('properties').createIndex({ sellerId: 1 });
    await db.collection('properties').createIndex({ listingType: 1 });
    await db.collection('properties').createIndex({ city: 1 });
    await db.collection('properties').createIndex({ locality: 1 });
    await db.collection('properties').createIndex({ status: 1 });
    await db.collection('properties').createIndex({ status: 1, listingType: 1, city: 1 });
    await db.collection('properties').createIndex({ price: 1 });
    await db.collection('properties').createIndex({ createdAt: -1 });
    await db.collection('shortlists').createIndex({ userId: 1, propertyId: 1 }, { unique: true });
    await db.collection('interests').createIndex({ userId: 1, propertyId: 1 }, { unique: true });
    await db.collection('visit_requests').createIndex({ userId: 1, propertyId: 1 });
    await db.collection('visits').createIndex({ userId: 1, propertyId: 1 });
    await db.collection('buyer_profiles').createIndex({ userId: 1 }, { unique: true, sparse: true });
    await db.collection('seller_profiles').createIndex({ userId: 1 }, { unique: true, sparse: true });
    await db.collection('match_results').createIndex({ buyerId: 1, propertyId: 1 });
    await db.collection('connections').createIndex({ connectionId: 1 }, { unique: true, sparse: true });
    await db.collection('messages').createIndex({ fromUserId: 1, toUserId: 1 });
    await db.collection('messages').createIndex({ conversationId: 1, timestamp: 1 });
    await db.collection('feedback').createIndex({ propertyId: 1 });

    const userCount = await db.collection('users').countDocuments();
    const propCount = await db.collection('properties').countDocuments();
    console.log(`[MongoDB] Initialized database indexes cleanly. Total Users: ${userCount}, Total Properties: ${propCount}`);
  } catch (err) {
    console.warn('[MongoDB] Index setup note:', err.message);
  }
}
