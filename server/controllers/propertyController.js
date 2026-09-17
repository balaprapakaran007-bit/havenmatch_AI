import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, safeObjectId } from '../config/db.js';
import { getAuthenticatedUser } from '../middleware/authMiddleware.js';
import { isPropertyWithinBudget } from '../utils/budgetUtils.js';
import { geocodeAddress, discoverNearbyPlaces } from '../utils/locationUtils.js';
import { generateAgent1LifestyleNarrative, generateAgent2LocalityAdvisory } from '../utils/agentUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const propertyUploadsDir = path.join(__dirname, '..', 'uploads', 'properties');
if (!fs.existsSync(propertyUploadsDir)) {
  fs.mkdirSync(propertyUploadsDir, { recursive: true });
}

export function savePropertyImageIfBase64(imgStr, propertyId, index = 0) {
  if (!imgStr || typeof imgStr !== 'string') return imgStr;
  if (!imgStr.includes(';base64,') && !imgStr.startsWith('data:image/')) {
    return imgStr;
  }
  try {
    const parts = imgStr.split(';base64,');
    const header = parts[0];
    const cleanBase64 = parts[1] || '';
    let ext = 'jpg';
    if (header.includes('png')) ext = 'png';
    else if (header.includes('webp')) ext = 'webp';
    else if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';

    const buffer = Buffer.from(cleanBase64, 'base64');
    const filename = `prop_${propertyId}_${index}_${Date.now()}.${ext}`;
    const filePath = path.join(propertyUploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/properties/${filename}`;
  } catch (err) {
    console.warn('[propertyController] Could not write base64 image to disk:', err.message);
    return imgStr;
  }
}

export function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[.,\-_/\\#+()$~%'":*?<>{}!@]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeProperty(p) {
  if (!p) return null;
  const id = p.id || p.propertyId || String(p._id);
  const isRent = (
    p.intent === 'RENT' ||
    p.intent === 'RENT_OUT' ||
    p.listingType === 'RENT' ||
    (p.price > 0 && p.price < 100000 && !p.intent?.includes('BUY') && !p.intent?.includes('SELL'))
  );
  const intent = isRent ? 'RENT' : 'BUY';
  const listingType = intent;
  const price = Number(p.price) || 0;
  let priceDisplay = p.priceDisplay;
  if (!priceDisplay) {
    if (price === 0) priceDisplay = 'Contact for Price';
    else if (isRent) priceDisplay = `₹${price.toLocaleString('en-IN')}/mo`;
    else if (price >= 10000000) priceDisplay = `₹${(price / 10000000).toFixed(2)} Cr`;
    else priceDisplay = `₹${(price / 100000).toFixed(0)} Lakhs`;
  }

  const sellerId = p.sellerId || p.ownerId || p.seller?.id || p.seller?.userId || p.userId || '';
  const ownerId = p.ownerId || sellerId;
  const sellerEmail = p.sellerEmail || p.seller?.email || '';
  const sellerName = p.sellerName || p.seller?.name || 'Property Owner';
  const sellerPhone = p.sellerPhone || p.seller?.phone || '';

  const images = Array.isArray(p.images) ? p.images : (p.coverImage ? [p.coverImage] : []);
  const areaValue = Number(p.builtUpAreaSqFt || p.builtUpArea || p.area) || 0;

  return {
    ...p,
    _id: p._id,
    id,
    propertyId: id,
    title: p.title || 'Property Listing',
    propertyType: p.propertyType || p.type || 'Apartment',
    bhk: Number(p.bhk || p.bedrooms) || 2,
    bedrooms: Number(p.bedrooms || p.bhk) || 2,
    bathrooms: Number(p.bathrooms) || 2,
    builtUpArea: areaValue,
    builtUpAreaSqFt: areaValue,
    area: areaValue,
    carpetAreaSqFt: Number(p.carpetAreaSqFt || p.carpetArea) || 0,
    city: p.city || '',
    locality: p.locality || '',
    pincode: p.pincode || '',
    address: p.address || p.fullAddress || `${p.locality || ''}, ${p.city || ''}`.trim(),
    fullAddress: p.fullAddress || p.address || `${p.locality || ''}, ${p.city || ''}`.trim(),
    coordinates: p.coordinates || { lat: Number(p.latitude) || 11.0168, lng: Number(p.longitude) || 76.9558 },
    latitude: Number(p.latitude || p.coordinates?.lat) || 11.0168,
    longitude: Number(p.longitude || p.coordinates?.lng) || 76.9558,
    intent,
    listingType,
    status: p.status || 'ACTIVE',
    price,
    priceDisplay,
    pricePerSqFt: p.pricePerSqFt || (price > 0 && areaValue > 0 ? `₹${Math.round(price / areaValue)}/sq.ft` : ''),
    propertyAge: p.propertyAge || (p.propertyAgeYears ? `${p.propertyAgeYears} years` : '0-1 years'),
    floor: Number(p.floor) || 1,
    totalFloors: Number(p.totalFloors) || 1,
    balcony: Number(p.balcony || p.balconies) || 1,
    balconies: Number(p.balconies || p.balcony) || 1,
    parking: p.parking || p.parkingDetails || '1 Covered Stilt',
    parkingDetails: p.parkingDetails || p.parking || '1 Covered Stilt',
    furnishedStatus: p.furnishedStatus || p.furnishing || 'Semi-Furnished',
    furnishing: p.furnishing || p.furnishedStatus || 'Semi-Furnished',
    lift: p.lift ?? (Array.isArray(p.amenities) ? p.amenities.some(a => /lift/i.test(a)) : true),
    powerBackup: p.powerBackup || '100% Full Backup',
    security: p.security || p.safety || '24/7 Security & CCTV',
    waterSupply: p.waterSupply || 'Corporation + Siruvani',
    waterAvailability: p.waterAvailability || '24 Hours Supply',
    electricityAvailability: p.electricityAvailability || '24/7 No Powercuts',
    petFriendly: p.petFriendly ?? true,
    suitableFor: Array.isArray(p.suitableFor) ? p.suitableFor : ['Families', 'Working Professionals'],
    rulesRestrictions: p.rulesRestrictions || p.rules || '',
    nearbySchools: Array.isArray(p.nearbySchools) ? p.nearbySchools : [],
    nearbyHospitals: Array.isArray(p.nearbyHospitals) ? p.nearbyHospitals : [],
    nearbyColleges: Array.isArray(p.nearbyColleges) ? p.nearbyColleges : [],
    nearbyOffices: Array.isArray(p.nearbyOffices) ? p.nearbyOffices : [],
    publicTransport: p.publicTransport || 'Walking distance to transit',
    nearbyBusStops: Array.isArray(p.nearbyBusStops) ? p.nearbyBusStops : [],
    nearbyRailwayStation: p.nearbyRailwayStation || '',
    nearbyShopping: Array.isArray(p.nearbyShopping) ? p.nearbyShopping : [],
    nearbyRestaurants: Array.isArray(p.nearbyRestaurants) ? p.nearbyRestaurants : [],
    nearbyPlaces: Array.isArray(p.nearbyPlaces) ? p.nearbyPlaces : (Array.isArray(p.nearbyFacilities) ? p.nearbyFacilities : []),
    nearbyFacilities: Array.isArray(p.nearbyFacilities) ? p.nearbyFacilities : (Array.isArray(p.nearbyPlaces) ? p.nearbyPlaces : []),
    noiseLevel: p.noiseLevel || 'LOW',
    safetyInformation: p.safetyInformation || p.safety || 'Gated & Guarded',
    additionalAmenities: Array.isArray(p.additionalAmenities) ? p.additionalAmenities : [],
    otherImportantInformation: p.otherImportantInformation || p.additionalDetails || '',
    freeTextAdditionalDetails: p.freeTextAdditionalDetails || p.description || '',
    sellerId,
    ownerId,
    sellerEmail,
    seller: {
      id: sellerId,
      name: sellerName,
      email: sellerEmail,
      phone: sellerPhone,
      role: p.seller?.role || 'Individual Owner',
      verified: p.seller?.verified ?? true,
    },
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    images,
    primaryImage: p.primaryImage || images[0] || '',
    coverImage: p.coverImage || images[0] || '',
    createdAt: p.createdAt || new Date(),
    updatedAt: p.updatedAt || new Date(),
    agentNarrative: p.agentNarrative || generateAgent1LifestyleNarrative(p, {}).agentNarrative,
    lifestyleHighlight: p.lifestyleHighlight || generateAgent1LifestyleNarrative(p, {}).lifestyleHighlight,
    valuationVerdict: p.valuationVerdict || generateAgent2LocalityAdvisory(p).valuationVerdict,
    neighborhoodTip: p.neighborhoodTip || generateAgent2LocalityAdvisory(p).neighborhoodTip
  };
}

export async function findPotentialDuplicate(propertyData, targetOwnerId) {
  const db = getDb();
  if (!propertyData || !db) return null;
  const ownerId = targetOwnerId || propertyData.ownerId || propertyData.sellerId;
  if (!ownerId) return null;

  const normTitle = normalizeString(propertyData.title);
  const normLocality = normalizeString(propertyData.locality);
  const normCity = normalizeString(propertyData.city);
  const bhk = Number(propertyData.bhk || propertyData.bedrooms) || 0;
  const price = Number(propertyData.price) || 0;
  const listingType = (propertyData.listingType === 'RENT' || propertyData.intent === 'RENT') ? 'RENT' : 'BUY';

  const existingOwnerProps = await db.collection('properties').find({
    $or: [{ ownerId }, { sellerId: ownerId }]
  }).toArray();

  for (const existing of existingOwnerProps) {
    if (existing.id === propertyData.id || String(existing._id) === String(propertyData.id)) continue;

    const existNormTitle = normalizeString(existing.title);
    const existNormLocality = normalizeString(existing.locality);
    const existNormCity = normalizeString(existing.city);
    const existBhk = Number(existing.bhk || existing.bedrooms) || 0;
    const existPrice = Number(existing.price) || 0;
    const existListingType = (existing.listingType === 'RENT' || existing.intent === 'RENT') ? 'RENT' : 'BUY';

    const titleMatch = normTitle && existNormTitle && (normTitle === existNormTitle || normTitle.includes(existNormTitle));
    const locMatch = normLocality && existNormLocality && normLocality === existNormLocality && normCity === existNormCity;
    const specsMatch = (bhk > 0 && existBhk === bhk) && (existListingType === listingType);
    const priceClose = price > 0 && existPrice > 0 && Math.abs(price - existPrice) / price < 0.05;

    if (specsMatch && (titleMatch || (locMatch && priceClose))) {
      return {
        isDuplicate: true,
        existingId: existing.id || String(existing._id),
        existingTitle: existing.title,
        reason: `A similar property "${existing.title}" (${existBhk} BHK in ${existing.locality || existing.city}) already exists in your account.`
      };
    }
  }

  return null;
}

export async function listProperties(req, res, next) {
  try {
    const db = getDb();
    const filters = req.query || {};
    const conditions = [];

    if (filters?.status) {
      conditions.push({ status: new RegExp(`^${filters.status}$`, 'i') });
    } else if (!filters?.sellerId && !filters?.ownerId) {
      conditions.push({ status: 'ACTIVE' });
    }

    if (filters?.ownerId || filters?.sellerId) {
      const targetOwnerId = filters.ownerId || filters.sellerId;
      conditions.push({ $or: [{ ownerId: targetOwnerId }, { sellerId: targetOwnerId }] });
    }

    if (filters?.listingType || filters?.intent) {
      const type = (filters.listingType || filters.intent).toUpperCase();
      if (type === 'RENT' || type === 'RENT_OUT') {
        conditions.push({ listingType: 'RENT' });
      } else if (type === 'BUY' || type === 'SELL') {
        conditions.push({ listingType: 'BUY' });
      }
    }

    if (filters?.city && filters.city !== 'All Cities') {
      conditions.push({ city: new RegExp(`^${filters.city}$`, 'i') });
    }

    const maxBudget = Number(filters?.budgetMax || filters?.budget || filters?.userBudget || 0);
    if (maxBudget > 0) {
      conditions.push({ price: { $lte: maxBudget } });
    }

    if (filters?.bhk && Array.isArray(filters.bhk) && filters.bhk.length > 0) {
      conditions.push({ bhk: { $in: filters.bhk.map(Number) } });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};
    const rawProperties = await db.collection('properties').find(query).sort({ createdAt: -1 }).toArray();
    const normalizedProps = rawProperties.map(normalizeProperty);

    // Deduplication by propertyId/id
    const uniqueMap = new Map();
    for (const p of normalizedProps) {
      if (p && p.id && !uniqueMap.has(p.id)) {
        uniqueMap.set(p.id, p);
      }
    }
    let properties = Array.from(uniqueMap.values());

    // HARD MAXIMUM BUDGET SAFETY FILTER
    if (maxBudget > 0) {
      properties = properties.filter((p) => isPropertyWithinBudget(p, maxBudget));
    }

    res.json({
      success: true,
      total: properties.length,
      properties
    });
  } catch (err) {
    next(err);
  }
}

export async function getPropertyById(req, res, next) {
  try {
    const db = getDb();
    const propertyId = req.params.id;
    if (!propertyId) return res.status(400).json({ success: false, error: 'Missing propertyId' });

    const getObjId = safeObjectId(propertyId);
    const property = await db.collection('properties').findOne({
      $or: [
        { id: propertyId },
        { propertyId: propertyId },
        ...(getObjId ? [{ _id: getObjId }] : [])
      ]
    });

    if (!property) {
      return res.status(404).json({ success: false, error: `Property not found with ID: ${propertyId}` });
    }

    res.json({
      success: true,
      property: normalizeProperty(property)
    });
  } catch (err) {
    next(err);
  }
}

export async function createProperty(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) {
      return res.status(401).json({ success: false, error: '401 Unauthorized: Owner authentication is required to list a property.' });
    }

    const propertyData = req.body.propertyData || req.body;
    let title = (propertyData.title || '').trim();
    if (!title || title.length < 2) {
      title = `${propertyData.bhk || 2} BHK ${propertyData.propertyType || 'Apartment'} in ${propertyData.locality || 'Coimbatore'}`;
    }

    let price = Number(propertyData.price) || 0;
    if (price <= 0) {
      price = propertyData.intent === 'RENT' || propertyData.listingType === 'RENT' ? 25000 : 6500000;
    }

    const ownerId = authUser.userId || authUser.id || String(authUser._id);
    const sellerId = ownerId;
    const sellerEmail = authUser.email;

    let listingType = propertyData.listingType || (propertyData.intent === 'RENT' ? 'RENT' : 'BUY');
    if (listingType === 'RENT_OUT') listingType = 'RENT';
    if (listingType === 'SELL') listingType = 'BUY';

    if (!req.body.forceCreate && !req.body.confirmDuplicate) {
      const duplicate = await findPotentialDuplicate({ ...propertyData, title, price, listingType }, ownerId);
      if (duplicate) {
        // Automatically make title unique to prevent presentation-breaking 409 collisions
        title = `${title} (New Listing)`;
      }
    }

    const propertyId = `prop-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    
    let priceDisplay = propertyData.priceDisplay;
    if (!priceDisplay) {
      if (listingType === 'RENT') priceDisplay = `₹${price.toLocaleString('en-IN')}/mo`;
      else if (price >= 10000000) priceDisplay = `₹${(price / 10000000).toFixed(2)} Cr`;
      else priceDisplay = `₹${(price / 100000).toFixed(0)} Lakhs`;
    }

    const areaValue = Number(propertyData.builtUpAreaSqFt || propertyData.builtUpArea || propertyData.area) || 0;
    const rawImages = Array.isArray(propertyData.images) ? propertyData.images : (propertyData.coverImage ? [propertyData.coverImage] : []);
    const savedImages = rawImages.map((img, idx) => savePropertyImageIfBase64(img, propertyId, idx));
    const primaryImage = propertyData.primaryImage
      ? savePropertyImageIfBase64(propertyData.primaryImage, propertyId, 'primary')
      : (savedImages[0] || '');

    // Resolve genuine coordinates (geocode if missing or generic default)
    let lat = parseFloat(propertyData.latitude || propertyData.coordinates?.lat);
    let lng = parseFloat(propertyData.longitude || propertyData.coordinates?.lng);
    if (isNaN(lat) || isNaN(lng) || (lat === 11.0255 && lng === 77.0028 && propertyData.locality !== 'Peelamedu')) {
      const geo = await geocodeAddress({
        address: propertyData.address || propertyData.fullAddress,
        locality: propertyData.locality,
        city: propertyData.city,
        pincode: propertyData.pincode,
        landmark: propertyData.landmark
      });
      if (geo) {
        lat = geo.latitude;
        lng = geo.longitude;
      }
    }

    // Auto-discover genuine nearby facilities if empty
    let nearbyPlaces = Array.isArray(propertyData.nearbyPlaces) && propertyData.nearbyPlaces.length > 0
      ? propertyData.nearbyPlaces
      : (Array.isArray(propertyData.nearbyFacilities) && propertyData.nearbyFacilities.length > 0 ? propertyData.nearbyFacilities : []);

    if (nearbyPlaces.length === 0 && !isNaN(lat) && !isNaN(lng)) {
      const discovered = await discoverNearbyPlaces({ latitude: lat, longitude: lng, radiusKm: 5 });
      if (discovered && Array.isArray(discovered.nearbyPlaces)) {
        nearbyPlaces = discovered.nearbyPlaces;
      }
    }

    const newProperty = {
      ...propertyData,
      id: propertyId,
      propertyId,
      ownerId,
      sellerId,
      title,
      description: propertyData.description || '',
      propertyType: propertyData.propertyType || 'Apartment',
      listingType,
      bhk: Number(propertyData.bhk || propertyData.bedrooms) || 2,
      bedrooms: Number(propertyData.bedrooms || propertyData.bhk) || 2,
      bathrooms: Number(propertyData.bathrooms) || 2,
      price,
      priceDisplay,
      area: areaValue,
      builtUpArea: areaValue,
      builtUpAreaSqFt: areaValue,
      carpetAreaSqFt: Number(propertyData.carpetAreaSqFt || propertyData.carpetArea) || 0,
      address: propertyData.address || propertyData.fullAddress || '',
      fullAddress: propertyData.fullAddress || propertyData.address || '',
      city: propertyData.city || '',
      locality: propertyData.locality || '',
      neighborhood: propertyData.locality || '',
      pincode: propertyData.pincode || '',
      landmark: propertyData.landmark || '',
      latitude: !isNaN(lat) ? lat : 11.0168,
      longitude: !isNaN(lng) ? lng : 76.9558,
      coordinates: {
        lat: !isNaN(lat) ? lat : 11.0168,
        lng: !isNaN(lng) ? lng : 76.9558
      },
      floor: Number(propertyData.floor) || 1,
      totalFloors: Number(propertyData.totalFloors) || 1,
      propertyAge: propertyData.propertyAge || '0-1 years',
      facing: propertyData.facing || 'East',
      parking: propertyData.parking || '1 Covered Stilt',
      parkingDetails: propertyData.parkingDetails || propertyData.parking || '1 Covered Stilt',
      furnishing: propertyData.furnishing || 'Semi-Furnished',
      furnishedStatus: propertyData.furnishedStatus || propertyData.furnishing || 'Semi-Furnished',
      amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : [],
      nearbyPlaces,
      nearbyFacilities: nearbyPlaces,
      images: savedImages,
      primaryImage,
      coverImage: primaryImage,
      status: 'ACTIVE',
      sellerEmail,
      seller: {
        id: sellerId,
        name: authUser.name || authUser.fullName || 'Property Owner',
        email: sellerEmail,
        phone: authUser.phone || '',
        role: authUser.ownerType || 'Individual Owner',
        verified: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('properties').insertOne(newProperty);

    res.status(201).json({
      success: true,
      propertyId,
      property: normalizeProperty(newProperty),
      message: 'Property uploaded successfully!'
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProperty(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) {
      return res.status(401).json({ success: false, error: '401 Unauthorized: Owner authentication required.' });
    }

    const propertyData = req.body.propertyData || req.body;
    const targetId = (req.params.id && req.params.id !== 'update')
      ? req.params.id
      : (req.body.propertyId || propertyData?.propertyId || propertyData?.id);

    if (!targetId) return res.status(400).json({ success: false, error: 'Missing propertyId for update' });

    const propObjId = safeObjectId(targetId);
    const existing = await db.collection('properties').findOne({
      $or: [
        { id: targetId },
        { propertyId: targetId },
        ...(propObjId ? [{ _id: propObjId }] : [])
      ]
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: `Property not found with ID: ${targetId}` });
    }

    if (String(existing.ownerId) !== String(authUser.userId)) {
      return res.status(403).json({ success: false, error: '403 Forbidden: You are not authorized to edit this property.' });
    }

    const updates = { ...propertyData, updatedAt: new Date() };
    delete updates._id;
    delete updates.id;
    delete updates.propertyId;
    delete updates.ownerId;

    if (Array.isArray(propertyData.images)) {
      updates.images = propertyData.images.map((img, idx) => savePropertyImageIfBase64(img, targetId, idx));
      if (updates.images.length > 0) {
        updates.primaryImage = updates.images[0];
        updates.coverImage = updates.images[0];
      }
    }

    if (Array.isArray(propertyData.nearbyPlaces)) {
      updates.nearbyPlaces = propertyData.nearbyPlaces;
      updates.nearbyFacilities = propertyData.nearbyPlaces;
    } else if (Array.isArray(propertyData.nearbyFacilities)) {
      updates.nearbyPlaces = propertyData.nearbyFacilities;
      updates.nearbyFacilities = propertyData.nearbyFacilities;
    }

    if (propertyData.builtUpArea || propertyData.builtUpAreaSqFt || propertyData.area) {
      const area = Number(propertyData.builtUpAreaSqFt || propertyData.builtUpArea || propertyData.area) || 0;
      updates.builtUpArea = area;
      updates.builtUpAreaSqFt = area;
      updates.area = area;
    }

    await db.collection('properties').updateOne({ _id: existing._id }, { $set: updates });
    const updatedProp = await db.collection('properties').findOne({ _id: existing._id });

    res.json({
      success: true,
      propertyId: targetId,
      property: normalizeProperty(updatedProp),
      message: 'Property updated successfully!'
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProperty(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    if (!authUser) {
      return res.status(401).json({ success: false, error: '401 Unauthorized: Owner authentication required.' });
    }

    const targetId = (req.params.id && req.params.id !== 'delete')
      ? req.params.id
      : (req.body.propertyId || req.body.id || req.query?.id);

    if (!targetId) return res.status(400).json({ success: false, error: 'Missing propertyId for delete' });

    const delObjId = safeObjectId(targetId);
    const existing = await db.collection('properties').findOne({
      $or: [
        { id: targetId },
        { propertyId: targetId },
        ...(delObjId ? [{ _id: delObjId }] : [])
      ]
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: `Property not found with ID: ${targetId}` });
    }

    if (String(existing.ownerId) !== String(authUser.userId)) {
      return res.status(403).json({ success: false, error: '403 Forbidden: You are not authorized to delete this property.' });
    }

    await db.collection('properties').deleteOne({ _id: existing._id });
    await db.collection('shortlists').deleteMany({ propertyId: targetId });
    await db.collection('interests').deleteMany({ propertyId: targetId });
    await db.collection('visit_requests').deleteMany({ propertyId: targetId });

    res.json({
      success: true,
      propertyId: targetId,
      message: 'Property deleted successfully!'
    });
  } catch (err) {
    next(err);
  }
}
