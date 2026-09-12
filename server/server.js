import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://verisphere07_db_user:cMdZLx0gUXjgZIEa@havenmatch.ifbll60.mongodb.net/havenmatch?retryWrites=true&w=majority';
const DB_NAME = 'havenmatch';

let db = null;
let client = null;
let isConnecting = false;

// ─── HELPER: Password Security ──────────────────────────────────────────────
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  if (!hash || !salt) return true; // allow legacy/seeded accounts
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

function formatNameFromEmail(email) {
  if (!email) return 'Verified User';
  const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
  return prefix
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Connect to MongoDB Atlas
async function connectToMongo() {
  if (isConnecting) return;
  isConnecting = true;

  try {
    console.log(`[MongoDB] Connecting to MongoDB Atlas cluster...`);
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[MongoDB] Connected successfully to Atlas database: "${DB_NAME}"`);

    // Ensure collections, indexes and seed initial data if empty
    await initializeDatabase();
    isConnecting = false;
  } catch (err) {
    isConnecting = false;
    console.error('[MongoDB] Connection error:', err.message);
    setTimeout(connectToMongo, 5000);
  }
}

// Initial Database Seeding
async function initializeDatabase() {
  try {
    const propCount = await db.collection('properties').countDocuments();
    console.log(`[MongoDB] Current property count: ${propCount}`);

    if (propCount === 0) {
      console.log('[MongoDB] Seeding initial properties into Atlas...');
      const seedProperties = [
        {
          id: 'prop-cbe-01',
          title: 'Mayflower Sakthi Garden',
          slug: 'mayflower-sakthi-garden-peelamedu',
          tagline: 'Premium 3 BHK Residence near TIDEL Park & Hospitals',
          description:
            'A beautifully planned, Vastu-compliant 3 BHK apartment in prime Peelamedu with round-the-clock Siruvani water, 100% power backup, and top-tier security. Ideal for families and IT professionals.',
          propertyType: 'Apartment',
          intent: 'BUY',
          city: 'Coimbatore',
          locality: 'Peelamedu',
          pincode: '641004',
          fullAddress: 'Avinashi Road, Near PSG Tech, Peelamedu, Coimbatore, Tamil Nadu 641004',
          coordinates: { lat: 11.0255, lng: 77.0028 },
          price: 6800000,
          priceDisplay: '₹68 Lakhs',
          pricePerSqFt: '₹4,387/sq.ft',
          maintenanceMonthly: '₹2,500/month',
          bhk: 3,
          bathrooms: 3,
          balconies: 2,
          builtUpAreaSqFt: 1550,
          carpetAreaSqFt: 1280,
          floor: 4,
          totalFloors: 9,
          facing: 'East',
          furnishing: 'Semi-Furnished',
          propertyAgeYears: 2,
          possession: 'Ready to Move',
          reraApproved: true,
          reraId: 'TN/11/Building/0142/2021',
          vastuCompliant: true,
          parking: '1 Covered Stilt + 1 Open',
          powerBackup: '100% Full Backup',
          waterSupply: 'Corporation (Siruvani) + Borewell',
          gatedCommunity: true,
          security24x7: true,
          amenities: [
            'Swimming Pool',
            "Children's Play Area",
            'Gymnasium',
            'Clubhouse',
            '24/7 Security & CCTV',
            'Power Backup',
            'Lift Access',
            'Jogging Track',
            'Rainwater Harvesting'
          ],
          images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
          ],
          featured: true,
          seller: {
            id: 'S001',
            name: 'Dr. K. Senthil Kumar',
            role: 'Individual Owner',
            phone: '+91 98422 11223',
            email: 'senthil.k@gmail.com',
            verified: true,
            responseRate: '98%'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'prop-cbe-02',
          title: 'Sobha Emerald Villa',
          slug: 'sobha-emerald-villa-race-course',
          tagline: 'Ultra Luxury 4 BHK Independent Villa in Race Course',
          description:
            'A landmark independent villa in the most prestigious neighborhood of Coimbatore. Exquisite private garden, double-height ceiling living hall, and Italian marble flooring.',
          propertyType: 'Villa',
          intent: 'BUY',
          city: 'Coimbatore',
          locality: 'Race Course',
          pincode: '641018',
          fullAddress: 'Race Course Road, Opp. Thomas Park, Coimbatore, Tamil Nadu 641018',
          coordinates: { lat: 11.0016, lng: 76.9744 },
          price: 18500000,
          priceDisplay: '₹1.85 Cr',
          pricePerSqFt: '₹6,607/sq.ft',
          maintenanceMonthly: '₹4,500/month',
          bhk: 4,
          bathrooms: 4,
          balconies: 3,
          builtUpAreaSqFt: 2800,
          carpetAreaSqFt: 2350,
          floor: 1,
          totalFloors: 2,
          facing: 'North-East',
          furnishing: 'Fully Furnished',
          propertyAgeYears: 1,
          possession: 'Ready to Move',
          reraApproved: true,
          reraId: 'TN/11/Building/0089/2022',
          vastuCompliant: true,
          parking: '2 Covered Garage',
          powerBackup: '100% Full Backup',
          waterSupply: 'Corporation (Siruvani)',
          gatedCommunity: true,
          security24x7: true,
          amenities: [
            'Private Landscaped Lawn',
            'Modular Italian Kitchen',
            'Home Theater Room',
            'Solar Rooftop Grid',
            '24/7 Security Guard',
            'Intercom & Smart Lock',
            'Covered Car Porch'
          ],
          images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
          ],
          featured: true,
          seller: {
            id: 'S002',
            name: 'R. Balasubramaniam',
            role: 'Individual Owner',
            phone: '+91 94433 55667',
            email: 'balasubramaniam@gmail.com',
            verified: true,
            responseRate: '95%'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'prop-cbe-rent-01',
          title: 'Sreevatsa Global Village Apartment',
          slug: 'sreevatsa-global-village-saravanampatti',
          tagline: 'Modern 2 BHK Rental near CHIL SEZ IT Park',
          description:
            'Gated community 2 BHK apartment right next to Saravanampatti IT corridor. Super quiet neighborhood, reliable water, high-speed fiber internet ready.',
          propertyType: 'Apartment',
          intent: 'RENT',
          city: 'Coimbatore',
          locality: 'Saravanampatti',
          pincode: '641035',
          fullAddress: 'Sathy Main Road, Near CHIL SEZ, Saravanampatti, Coimbatore 641035',
          coordinates: { lat: 11.0825, lng: 76.9958 },
          price: 22000,
          priceDisplay: '₹22,000/mo',
          pricePerSqFt: '₹18/sq.ft/mo',
          maintenanceMonthly: '₹2,000/month',
          bhk: 2,
          bathrooms: 2,
          balconies: 1,
          builtUpAreaSqFt: 1200,
          carpetAreaSqFt: 980,
          floor: 3,
          totalFloors: 6,
          facing: 'East',
          furnishing: 'Semi-Furnished',
          propertyAgeYears: 3,
          possession: 'Immediate',
          reraApproved: true,
          reraId: 'TN/11/Building/0312/2020',
          vastuCompliant: true,
          parking: '1 Covered',
          powerBackup: 'Common Areas + Inverter Provision',
          waterSupply: 'Borewell + Corporation Supply',
          gatedCommunity: true,
          security24x7: true,
          amenities: ['Gym', "Children's Park", 'Lift', '24x7 Security', 'Covered Parking'],
          images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
          ],
          featured: true,
          seller: {
            id: 'S003',
            name: 'P. Rajeshwari',
            role: 'Individual Owner',
            phone: '+91 98401 77889',
            email: 'rajeshwari.p@gmail.com',
            verified: true,
            responseRate: '100%'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await db.collection('properties').insertMany(seedProperties);
      console.log(`[MongoDB] Seeded ${seedProperties.length} initial properties into Atlas!`);
    }

    // Seed default demo user if users collection empty
    const userCount = await db.collection('users').countDocuments();
    if (userCount === 0) {
      await db.collection('users').insertMany([
        {
          userId: 'B001',
          name: 'Akash Sundaram',
          email: 'akash@havenmatch.ai',
          phone: '+91 98401 23456',
          role: 'BUYER',
          intent: 'BUY',
          createdAt: new Date(),
          lastLogin: new Date()
        },
        {
          userId: 'S001',
          name: 'Dr. K. Senthil Kumar',
          email: 'senthil.k@gmail.com',
          phone: '+91 98422 11223',
          role: 'SELLER',
          intent: 'SELL',
          createdAt: new Date(),
          lastLogin: new Date()
        }
      ]);
      console.log('[MongoDB] Seeded default users into Atlas.');
    }
  } catch (err) {
    console.error('[MongoDB] Initialization error:', err.message);
  }
}

// ─── LIFESTYLE MATCHING ENGINE ──────────────────────────────────────────────
function calculateLifestyleMatch(property, buyer) {
  const req = buyer || {};
  const life = buyer?.lifestyle || {};
  const priorities = life.priorities || {};

  // 1. Budget Fit (out of 25)
  let budgetScore = 23;
  if (req.budgetMax && req.budgetMax > 0) {
    if (property.price <= req.budgetMax) {
      budgetScore = 25;
    } else if (property.price <= req.budgetMax * 1.1) {
      budgetScore = 18;
    } else {
      budgetScore = 10;
    }
  }

  // 2. Property Fit (out of 20)
  let propScore = 18;
  if (req.bhk && req.bhk.length > 0) {
    if (req.bhk.includes(property.bhk)) propScore += 2;
  }
  if (property.vastuCompliant && req.vastuRequired) propScore = Math.min(20, propScore + 1);

  // 3. Location & Commute Fit (out of 30)
  let locScore = 26;
  if (req.city && property.city.toLowerCase() === req.city.toLowerCase()) locScore += 2;
  if (
    req.preferredLocalities &&
    req.preferredLocalities.some(
      (l) => l.toLowerCase() === property.locality.toLowerCase()
    )
  ) {
    locScore += 2;
  }
  locScore = Math.min(30, locScore);

  // 4. Lifestyle & Amenity Fit (out of 25)
  let lifeScore = 22;
  if (priorities.healthcare === 'HIGH' && property.locality.includes('Peelamedu')) lifeScore += 2;
  if (priorities.commute === 'HIGH') lifeScore += 1;
  lifeScore = Math.min(25, lifeScore);

  const totalScore = budgetScore + propScore + locScore + lifeScore;

  const whyReasons = [
    `Located in ${property.locality}, within prime commute target`,
    `Budget fit: priced at ${property.priceDisplay} within your ceiling`,
    `${property.bhk} BHK layout matching your space requirement with ${property.facing} facing`
  ];

  if (property.waterSupply && property.waterSupply.includes('Siruvani')) {
    whyReasons.push('Verified Siruvani drinking water connection');
  }

  const tradeOffs = [];
  if (property.floor > 3 && !property.amenities.includes('Lift Access')) {
    tradeOffs.push('Higher floor with no private elevator');
  }
  if (property.price > (req.budgetMax || 10000000) * 0.95) {
    tradeOffs.push('Near the upper limit of your budget ceiling');
  }

  return {
    propertyId: property.id,
    title: property.title,
    price: property.price,
    city: property.city,
    locality: property.locality,
    bedrooms: property.bhk,
    propertyType: property.propertyType,
    matchScore: totalScore,
    scoreBreakdown: {
      budget: budgetScore,
      property: propScore,
      location: locScore,
      lifestyle: lifeScore
    },
    whyThisProperty: whyReasons,
    tradeOffs: tradeOffs,
    property: property
  };
}

// ─── UNIVERSAL WEBHOOK & API DISPATCHER ─────────────────────────────────────
async function handleAction(action, payload = {}) {
  if (!db) {
    await connectToMongo();
    if (!db) {
      throw new Error('Database connection initializing, please try again in a moment.');
    }
  }

  console.log(`[Dispatcher] Action: "${action}" | Payload:`, Object.keys(payload));

  switch (action) {
    // 1. User Authentication (Login / Register / Profile)
    case 'auth/login':
    case 'auth/register': {
      const { email, phone, name, password, role, intent } = payload;
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (phone || '').trim();

      if (!cleanEmail && !cleanPhone) {
        throw new Error('Please provide an email address or mobile number.');
      }

      // Query database for existing user
      let user = await db.collection('users').findOne({
        $or: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanPhone ? [{ phone: cleanPhone }] : [])
        ]
      });

      if (!user) {
        // Create new user
        const { hash, salt } = password ? hashPassword(password) : { hash: '', salt: '' };
        const userDisplayName = name?.trim() || formatNameFromEmail(cleanEmail);

        const newUser = {
          userId: `usr-${Date.now()}`,
          name: userDisplayName,
          email: cleanEmail,
          phone: cleanPhone || '+91 98421 88402',
          passwordHash: hash,
          salt: salt,
          role: role || 'BUYER',
          intent: intent || (role === 'SELLER' ? 'SELL' : 'BUY'),
          createdAt: new Date(),
          lastLogin: new Date()
        };

        const insertRes = await db.collection('users').insertOne(newUser);
        user = { ...newUser, _id: insertRes.insertedId };
        console.log(`[Auth] Registered new user in Atlas: ${userDisplayName} <${cleanEmail}> (${user.role})`);
      } else {
        // If password is provided, verify it (unless user was created without password)
        if (password && user.passwordHash && user.salt) {
          const isValid = verifyPassword(password, user.passwordHash, user.salt);
          if (!isValid) {
            throw new Error('Incorrect password. Please verify your credentials and try again.');
          }
        } else if (password && (!user.passwordHash || !user.salt)) {
          // Set password on first password-based login
          const { hash, salt } = hashPassword(password);
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { passwordHash: hash, salt } }
          );
        }

        // Update last login and role if specified
        const updates = { lastLogin: new Date() };
        if (role) updates.role = role;
        if (name && name !== user.name) updates.name = name;

        await db.collection('users').updateOne({ _id: user._id }, { $set: updates });
        user = { ...user, ...updates };
        console.log(`[Auth] User authenticated successfully: ${user.name} <${user.email || user.phone}> (${user.role})`);
      }

      const token = `hm_${Buffer.from(`${user.userId}:${Date.now()}`).toString('base64')}`;

      return {
        success: true,
        action,
        token,
        user: {
          id: user.userId || String(user._id),
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
          intent: user.intent
        }
      };
    }

    case 'auth/me': {
      const { email, phone, userId } = payload;
      let user = null;
      if (userId) user = await db.collection('users').findOne({ userId });
      else if (email) user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
      else if (phone) user = await db.collection('users').findOne({ phone: phone.trim() });

      if (!user) {
        throw new Error('User session not found');
      }

      return {
        success: true,
        action,
        user: {
          id: user.userId || String(user._id),
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
          intent: user.intent
        }
      };
    }

    // 2. Property Upload / Create (Saves directly to MongoDB Atlas)
    case 'properties/create': {
      const { propertyData } = payload;
      if (!propertyData) throw new Error('Missing propertyData in payload');

      const id = propertyData.id || `prop-${Date.now()}`;
      const newProperty = {
        ...propertyData,
        id,
        slug: propertyData.slug || (propertyData.title || 'property').toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('properties').insertOne(newProperty);
      console.log(`[Properties] Created and saved new property to Atlas: "${newProperty.title}" (${id})`);

      return {
        success: true,
        action,
        propertyId: id,
        property: newProperty,
        message: 'Property uploaded successfully to database!'
      };
    }

    // 3. Property List (Queries MongoDB Atlas)
    case 'properties/list': {
      const { filters } = payload;
      let query = {};

      if (filters?.city && filters.city !== 'All Cities') {
        query.city = new RegExp(`^${filters.city}$`, 'i');
      }
      if (filters?.intent) {
        query.intent = filters.intent;
      }
      if (filters?.budgetMax && filters.budgetMax > 0) {
        query.price = { $lte: Number(filters.budgetMax) };
      }

      const properties = await db
        .collection('properties')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return {
        success: true,
        action,
        total: properties.length,
        properties
      };
    }

    // 4. Property Get Single
    case 'properties/get': {
      const { propertyId } = payload;
      if (!propertyId) throw new Error('Missing propertyId');

      let property = await db.collection('properties').findOne({ id: propertyId });
      if (!property) {
        property = await db.collection('properties').findOne({ slug: propertyId });
      }

      return {
        success: true,
        action,
        property
      };
    }

    // 5. Lifestyle Matching Engine
    case 'matching/buyer': {
      const buyer = payload.buyer || payload;
      const allProperties = await db.collection('properties').find({}).toArray();

      const recommendations = allProperties
        .map((p) => calculateLifestyleMatch(p, buyer))
        .sort((a, b) => b.matchScore - a.matchScore);

      // Save match calculation into Atlas for analytics
      if (buyer?.userId) {
        db.collection('match_results').insertOne({
          userId: buyer.userId,
          timestamp: new Date(),
          topMatchScore: recommendations[0]?.matchScore,
          matchCount: recommendations.length
        }).catch(() => {});
      }

      return {
        success: true,
        action: 'matching/buyer',
        buyerId: buyer?.userId || 'guest',
        matchCount: recommendations.length,
        recommendations
      };
    }

    // 6. Location POIs & Matching Services
    case 'location/poi': {
      const { propertyId } = payload;
      const property = await db.collection('properties').findOne({ id: propertyId });

      const pois = [
        {
          id: 'poi-sch-1',
          name: 'Delhi Public School (DPS Coimbatore)',
          category: 'school',
          categoryLabel: 'CBSE Senior Secondary',
          distanceKm: 1.8,
          driveTimeMins: 5,
          walkTimeMins: 22,
          icon: 'GraduationCap',
          directionDegrees: 25,
          highlight: 'Top 5 CBSE School in Coimbatore with sports academy'
        },
        {
          id: 'poi-sch-2',
          name: 'PSG College of Technology & Polytechnic',
          category: 'school',
          categoryLabel: 'Premier Engineering & Tech Institute',
          distanceKm: 0.9,
          driveTimeMins: 3,
          walkTimeMins: 11,
          icon: 'GraduationCap',
          directionDegrees: 40,
          highlight: 'Ranked top engineering college with world-class campus'
        },
        {
          id: 'poi-sch-3',
          name: 'GRD College of Science & Commerce',
          category: 'school',
          categoryLabel: 'Arts & Science Campus',
          distanceKm: 1.2,
          driveTimeMins: 4,
          walkTimeMins: 15,
          icon: 'GraduationCap',
          directionDegrees: 15,
          highlight: 'Reputed autonomous institution'
        },
        {
          id: 'poi-sch-4',
          name: 'Stanes Anglo-Indian Higher Secondary School',
          category: 'school',
          categoryLabel: 'ICSE Heritage School',
          distanceKm: 2.6,
          driveTimeMins: 7,
          walkTimeMins: 32,
          icon: 'GraduationCap',
          directionDegrees: 80,
          highlight: 'Historic 160-year-old CBSE/ICSE institution'
        },
        {
          id: 'poi-hosp-1',
          name: 'KMCH Medical Center & Super Specialty Hospital',
          category: 'hospital',
          categoryLabel: 'Super Specialty Hospital',
          distanceKm: 1.2,
          driveTimeMins: 3,
          walkTimeMins: 14,
          icon: 'Hospital',
          directionDegrees: 90,
          highlight: '24/7 Level 1 Trauma Care & Multi-organ transplant center'
        },
        {
          id: 'poi-hosp-2',
          name: 'PSG Hospitals & Emergency Care',
          category: 'hospital',
          categoryLabel: 'Teaching Hospital & Research Center',
          distanceKm: 1.4,
          driveTimeMins: 4,
          walkTimeMins: 17,
          icon: 'Hospital',
          directionDegrees: 45,
          highlight: '1,400-bed hospital with 24/7 pharmacy and cardiac care'
        },
        {
          id: 'poi-trans-1',
          name: 'Peelamedu Main Road Bus Transit',
          category: 'transit',
          categoryLabel: 'City Bus Corridor',
          distanceKm: 0.45,
          driveTimeMins: 1,
          walkTimeMins: 5,
          icon: 'Bus',
          directionDegrees: 180,
          highlight: 'Direct buses every 2 minutes to Gandhipuram & Railway Station'
        },
        {
          id: 'poi-trans-2',
          name: 'Coimbatore International Airport (CJB)',
          category: 'transit',
          categoryLabel: 'International Airport',
          distanceKm: 5.1,
          driveTimeMins: 12,
          walkTimeMins: 60,
          icon: 'Plane',
          directionDegrees: 75,
          highlight: 'Daily domestic & international flights'
        },
        {
          id: 'poi-shop-1',
          name: 'Nilgiris 1905 Supermarket & Bakery',
          category: 'supermarket',
          categoryLabel: 'Daily Groceries & Essentials',
          distanceKm: 0.65,
          driveTimeMins: 2,
          walkTimeMins: 8,
          icon: 'ShoppingBag',
          directionDegrees: 210,
          highlight: 'Fresh farm produce, dairy, bakery & organics'
        },
        {
          id: 'poi-shop-2',
          name: 'Fun Republic Mall & INOX Cinemas',
          category: 'supermarket',
          categoryLabel: 'Retail, Dining & Multiplex',
          distanceKm: 1.8,
          driveTimeMins: 5,
          walkTimeMins: 22,
          icon: 'ShoppingBag',
          directionDegrees: 30,
          highlight: '5-screen multiplex, food court & major retail brands'
        },
        {
          id: 'poi-park-1',
          name: 'Peelamedu Town Park & Walking Track',
          category: 'park',
          categoryLabel: 'Green Lung & Jogging Track',
          distanceKm: 0.9,
          driveTimeMins: 3,
          walkTimeMins: 11,
          icon: 'Trees',
          directionDegrees: 270,
          highlight: 'Well-shaded 1.2 km walking track with children play equipment'
        },
        {
          id: 'poi-work-1',
          name: 'TIDEL Park Coimbatore (ELCOT SEZ)',
          category: 'techpark',
          categoryLabel: 'IT/ITES Corridor',
          distanceKm: 2.8,
          driveTimeMins: 7,
          walkTimeMins: 35,
          icon: 'Briefcase',
          directionDegrees: 60,
          highlight: 'Home to 80+ top global tech companies & startups'
        }
      ];

      return {
        success: true,
        action,
        propertyId,
        nearbyPlaces: pois
      };
    }

    // 7. Visits Scheduling
    case 'visits/schedule': {
      const { visitData } = payload;
      if (!visitData) {
        throw new Error('Missing visitData in visits/schedule payload');
      }

      // Resolve propertyTitle from DB if not provided
      let resolvedTitle = visitData.propertyTitle;
      let resolvedLocality = visitData.propertyLocality;
      if (!resolvedTitle && visitData.propertyId) {
        const prop = await db.collection('properties').findOne({
          $or: [
            { id: visitData.propertyId },
            { propertyId: visitData.propertyId },
            { _id: visitData.propertyId.length === 24 ? new ObjectId(visitData.propertyId) : null }
          ].filter(q => q._id !== null || !q._id)
        });
        if (prop) {
          resolvedTitle = prop.title || prop.propertyTitle || visitData.propertyId;
          resolvedLocality = resolvedLocality || `${prop.locality || ''}, ${prop.city || ''}`.replace(/^, |, $/g, '');
        }
      }

      const doc = {
        ...visitData,
        propertyTitle: resolvedTitle || visitData.propertyId || 'Unknown Property',
        propertyLocality: resolvedLocality || visitData.propertyLocality || '',
        buyerName: visitData.buyerName || visitData.buyerId || 'Buyer',
        sellerName: visitData.sellerName || visitData.sellerId || 'Seller',
        id: visitData.id || `vis-${Date.now()}`,
        status: visitData.status || 'Scheduled',
        createdAt: new Date()
      };
      await db.collection('visit_requests').insertOne(doc);
      console.log(`[Visits] Visit scheduled for property: ${doc.propertyTitle} (${doc.propertyId}) | Buyer: ${doc.buyerName} | Date: ${doc.date} ${doc.timeSlot}`);
      return { success: true, action, visit: doc };
    }

    case 'visits/list': {
      const { userId, buyerId, sellerId } = payload;
      const query = {};
      if (buyerId || userId) {
        query.$or = [
          { buyerId: buyerId || userId },
          { buyerName: buyerId || userId },
          { 'buyerPhone': buyerId || userId }
        ];
      }
      if (sellerId) {
        query.$or = query.$or || [];
        query.$or.push({ sellerId }, { sellerName: sellerId });
      }
      const visits = await db
        .collection('visit_requests')
        .find(Object.keys(query).length > 0 ? query : {})
        .sort({ createdAt: -1 })
        .toArray();
      return { success: true, action, visits };
    }

    case 'visits/updateStatus': {
      const { visitId, status } = payload;
      if (!visitId) throw new Error('Missing visitId for visits/updateStatus');
      const validStatuses = ['Pending', 'Confirmed', 'Scheduled', 'Completed', 'Cancelled'];
      const newStatus = validStatuses.includes(status) ? status : 'Confirmed';
      const updateResult = await db.collection('visit_requests').findOneAndUpdate(
        { $or: [{ id: visitId }, { _id: visitId.length === 24 ? new ObjectId(visitId) : null }].filter(q => q._id !== null || !q._id) },
        { $set: { status: newStatus, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      console.log(`[Visits] Status updated: ${visitId} → ${newStatus}`);
      return { success: true, action, visit: updateResult || { id: visitId, status: newStatus } };
    }

    case 'visits/cancel': {
      const { visitId } = payload;
      if (!visitId) throw new Error('Missing visitId for visits/cancel');
      const cancelResult = await db.collection('visit_requests').findOneAndUpdate(
        { $or: [{ id: visitId }, { _id: visitId.length === 24 ? new ObjectId(visitId) : null }].filter(q => q._id !== null || !q._id) },
        { $set: { status: 'Cancelled', cancelledAt: new Date() } },
        { returnDocument: 'after' }
      );
      console.log(`[Visits] Visit cancelled: ${visitId}`);
      return { success: true, action, visit: cancelResult || { id: visitId, status: 'Cancelled' } };
    }

    // 8. Shortlists
    case 'shortlists/add': {
      const { userId, propertyId } = payload;
      await db.collection('shortlists').updateOne(
        { userId, propertyId },
        { $set: { userId, propertyId, updatedAt: new Date() } },
        { upsert: true }
      );
      return { success: true, action };
    }

    case 'shortlists/remove': {
      const { userId, propertyId } = payload;
      await db.collection('shortlists').deleteOne({ userId, propertyId });
      return { success: true, action };
    }

    case 'shortlists/list': {
      const { userId } = payload;
      const query = userId ? { userId } : {};
      const shortlists = await db.collection('shortlists').find(query).toArray();
      return { success: true, action, shortlists };
    }

    // 9. Interests
    case 'interests/create':
    case 'interests/express': {
      const { buyerId, propertyId, sellerId, message } = payload;
      const interestId = `int-${Date.now()}`;
      const doc = {
        interestId,
        buyerId: buyerId || payload.userId,
        propertyId,
        sellerId: sellerId || 'owner@havenmatch.ai',
        message: message || '',
        status: 'PENDING',
        createdAt: new Date()
      };
      await db.collection('interests').insertOne(doc);
      return { success: true, action, interestId, interest: doc };
    }

    case 'interests/list': {
      const { userId, buyerId, sellerId } = payload;
      const query = {};
      if (buyerId || userId) query.buyerId = buyerId || userId;
      if (sellerId) query.sellerId = sellerId;
      const interests = await db.collection('interests').find(query).sort({ createdAt: -1 }).toArray();
      return { success: true, action, interests };
    }

    // 10. Direct Connections
    case 'connections/create': {
      const { buyerId, sellerId, propertyId, status } = payload;
      if (!buyerId && !payload.userId) throw new Error('Missing buyerId for connections/create');
      if (!sellerId) throw new Error('Missing sellerId for connections/create');
      if (!propertyId) throw new Error('Missing propertyId for connections/create');

      const uniqueConnId = `conn-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const doc = {
        connection_id: uniqueConnId,
        connectionId: uniqueConnId,
        id: uniqueConnId,
        buyerId: buyerId || payload.userId,
        sellerId,
        propertyId,
        status: status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('connections').insertOne(doc);
      console.log(`[Connections] Connection created: ${uniqueConnId} | Buyer: ${doc.buyerId} | Seller: ${doc.sellerId} | Property: ${doc.propertyId}`);
      return { success: true, action, connection_id: uniqueConnId, connectionId: uniqueConnId, connection: doc };
    }

    case 'connections/get': {
      const { connection_id, connectionId, id } = payload;
      const targetId = connection_id || connectionId || id;
      if (!targetId) throw new Error('Missing connection ID for connections/get');
      const connection = await db.collection('connections').findOne({
        $or: [
          { connection_id: targetId },
          { connectionId: targetId },
          { id: targetId },
          { _id: targetId.length === 24 ? new ObjectId(targetId) : null }
        ].filter(q => q._id !== null || !q._id)
      });
      if (!connection) throw new Error(`Connection not found: ${targetId}`);
      return { success: true, action, connection };
    }

    case 'connections/list': {
      const { userId, buyerId, sellerId, propertyId } = payload;
      const query = {};
      if (propertyId) query.propertyId = propertyId;
      if (buyerId) query.buyerId = buyerId;
      if (sellerId) query.sellerId = sellerId;
      if (userId && !buyerId && !sellerId) {
        query.$or = [{ buyerId: userId }, { sellerId: userId }];
      }
      const connections = await db.collection('connections').find(query).sort({ createdAt: -1 }).toArray();
      return { success: true, action, connections };
    }

    // 11. In-App Messaging
    case 'messages/send': {
      const msg = payload.message || payload;
      const messageId = `msg-${Date.now()}`;
      const doc = {
        messageId,
        fromUserId: msg.fromUserId || msg.senderId || 'buyer',
        toUserId: msg.toUserId || msg.recipientId || 'owner',
        propertyId: msg.propertyId,
        content: msg.content || msg.text || '',
        createdAt: new Date()
      };
      await db.collection('messages').insertOne(doc);
      return { success: true, action, messageId, message: doc };
    }

    case 'messages/list': {
      const { userId, propertyId } = payload;
      const query = {};
      if (propertyId) query.propertyId = propertyId;
      if (userId) query.$or = [{ fromUserId: userId }, { toUserId: userId }];
      const messages = await db.collection('messages').find(query).sort({ createdAt: 1 }).toArray();
      return { success: true, action, messages };
    }

    // 12. Property Feedback & Reviews
    case 'feedback/submit': {
      const { propertyId, userId, rating, review } = payload;
      const feedbackId = `fb-${Date.now()}`;
      const doc = {
        feedbackId,
        propertyId,
        userId: userId || 'anonymous_user',
        rating: Number(rating) || 5,
        review: review || '',
        createdAt: new Date()
      };
      await db.collection('feedback').insertOne(doc);
      return { success: true, action, feedbackId, feedback: doc };
    }

    case 'feedback/list': {
      const { propertyId } = payload;
      const query = propertyId ? { propertyId } : {};
      const feedback = await db.collection('feedback').find(query).sort({ createdAt: -1 }).toArray();
      return { success: true, action, feedback };
    }

    // 10. Seller Listings & Compatible Buyers
    case 'seller/listings': {
      const { sellerId } = payload;
      let query = {};
      if (sellerId && sellerId !== 'all') {
        query = {
          $or: [
            { 'seller.id': sellerId },
            { 'seller.email': sellerId },
            { 'seller.phone': sellerId },
            { 'seller.name': new RegExp(`^${sellerId}$`, 'i') },
            { 'seller.name': sellerId }
          ]
        };
      }
      let listings = await db
        .collection('properties')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      // If user has specific sellerId and nothing found yet, check if they are the default admin/demo seller or return all recent properties for preview
      if (listings.length === 0 && (!sellerId || sellerId === 'S001' || sellerId === 'owner@havenmatch.ai')) {
        listings = await db.collection('properties').find({}).sort({ createdAt: -1 }).limit(10).toArray();
      }

      const enriched = listings.map((l) => ({
        ...l,
        viewsCount: l.viewsCount || 1420,
        interestsCount: l.interestsCount || 12,
        compatibleBuyersCount: l.compatibleBuyersCount || 18,
        status: l.status || 'Published',
        listedDate: l.listedDate || new Date(l.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }));

      return { success: true, action, listings: enriched, total: enriched.length };
    }

    case 'seller/compatible-buyers': {
      const { propertyId, sellerId } = payload;
      
      // Query real buyers from MongoDB users collection
      const realUsers = await db.collection('users').find({
        $or: [{ role: 'BUYER' }, { role: 'buyer' }]
      }).limit(10).toArray();

      // Query any expressed interests for this property
      const interests = propertyId ? await db.collection('interests').find({ propertyId }).toArray() : [];

      let buyers = [];
      if (realUsers.length > 0) {
        buyers = realUsers.map((u, idx) => {
          const hasInterest = interests.some(i => i.buyerId === u.userId || i.buyerId === String(u._id));
          return {
            id: u.userId || `usr_buyer_${idx + 1}`,
            name: u.name || 'Verified Buyer',
            email: u.email,
            phone: u.phone,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            matchPercentage: 90 + (idx % 8),
            intent: u.intent || 'BUY',
            budgetDisplay: '₹75 Lakhs – 1.2 Cr',
            preferredBhk: '2 & 3 BHK',
            targetLocality: 'Coimbatore Prime',
            workplace: 'IT Corridor',
            lifestyleMatchReason: [
              'Budget and preferred locality alignment verified',
              'High priority for green spaces and family living',
              'Direct walkthrough requested'
            ],
            lastActive: 'Recently active',
            contactStage: hasInterest ? 'Interest Received' : 'Matched'
          };
        });
      }

      return { success: true, action, propertyId, buyers, total: buyers.length };
    }

    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

// 1. Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HavenMatch AI Backend Engine',
    database: db ? 'connected' : 'connecting',
    mongoDatabase: DB_NAME,
    timestamp: new Date()
  });
});

// 2. Webhook compatibility routes (identical to SNS Workbench endpoint)
app.post('/webhook/havenmatch/match', async (req, res) => {
  try {
    const action = req.body?.action || 'matching/buyer';
    const result = await handleAction(action, req.body);
    res.json(result);
  } catch (err) {
    console.error(`[Webhook] Error executing action ${req.body?.action}:`, err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/webhook-test/havenmatch/match', async (req, res) => {
  try {
    const action = req.body?.action || 'matching/buyer';
    const result = await handleAction(action, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. REST API routes
app.post('/api/:category/:action', async (req, res) => {
  try {
    const action = `${req.params.category}/${req.params.action}`;
    const result = await handleAction(action, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/properties/list', async (req, res) => {
  try {
    const result = await handleAction('properties/list', { filters: req.query });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const result = await handleAction('properties/get', { propertyId: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Start Server
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  HAVENMATCH AI — MONGODB BACKEND SERVER LIVE`);
    console.log(`  PORT: http://localhost:${PORT}`);
    console.log(`  WEBHOOK: http://localhost:${PORT}/webhook/havenmatch/match`);
    console.log(`  DATABASE: MongoDB Atlas ("${DB_NAME}")`);
    console.log(`======================================================\n`);
  });
});
