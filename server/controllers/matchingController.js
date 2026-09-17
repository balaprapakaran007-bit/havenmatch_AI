import { getDb } from '../config/db.js';
import { getAuthenticatedUser } from '../middleware/authMiddleware.js';
import { normalizeProperty } from './propertyController.js';
import { getPropertyPrice, isPropertyWithinBudget } from '../utils/budgetUtils.js';
import { generateAgent1LifestyleNarrative, generateAgent2LocalityAdvisory, enrichRecommendationsWithAgents } from '../utils/agentUtils.js';
export { generateAgent1LifestyleNarrative, generateAgent2LocalityAdvisory, enrichRecommendationsWithAgents };

const LANDMARK_COORDINATES = {
  'tidel park': { lat: 11.0285, lng: 77.0290 },
  'tidel park coimbatore': { lat: 11.0285, lng: 77.0290 },
  'chil sez it park': { lat: 11.0850, lng: 76.9980 },
  'chil sez': { lat: 11.0850, lng: 76.9980 },
  'peelamedu': { lat: 11.0245, lng: 77.0050 },
  'rs puram': { lat: 11.0110, lng: 76.9500 },
  'gandhipuram': { lat: 11.0180, lng: 76.9680 },
  'race course': { lat: 11.0018, lng: 76.9744 },
  'saibaba colony': { lat: 11.0289, lng: 76.9421 },
  'vadavalli': { lat: 11.0216, lng: 76.9038 },
  'saravanampatti': { lat: 11.0850, lng: 76.9980 }
};

export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function resolveLandmarkCoordinates(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const [key, coords] of Object.entries(LANDMARK_COORDINATES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return coords;
    }
  }
  return null;
}

export function calculateLifestyleMatch(rawProp, buyer) {
  const property = normalizeProperty(rawProp);
  const req = buyer || {};
  const life = buyer?.lifestyle || {};
  const priorities = life.priorities || {};

  const userType = req.buyerType || req.userType || life.buyerType || life.userType || 'IT Employee / Working Professional';
  const isStudent = userType === 'Student';
  const isBachelor = userType === 'Bachelor';
  const isFamily = userType === 'Family';
  const isITProfessional = userType === 'IT Employee / Working Professional' || userType === 'IT Employee';

  const propCity = (property.city || '').toLowerCase();
  const propLocality = (property.locality || '').toLowerCase();
  const reqCity = (req.city && req.city !== 'All Cities') ? req.city.toLowerCase() : '';

  const targetName = req.targetLocationName || life.targetLocationName || (
    isITProfessional ? life.workplaceLocation || 'TIDEL Park' :
    null
  );
  let targetCoords = req.targetCoordinates || life.targetCoordinates || (targetName ? resolveLandmarkCoordinates(targetName) : null);

  const maxDistanceKm = req.maxDistanceKm || life.maxDistanceKm || (
    isITProfessional ? 5 :
    undefined
  );

  const whyReasons = [];
  const tradeOffs = [];

  // Calculate Distance if coordinates available
  let computedDistanceKm = null;
  let distanceFromTarget = null;
  if (property.coordinates?.lat && property.coordinates?.lng && targetCoords?.lat && targetCoords?.lng) {
    computedDistanceKm = calculateHaversineKm(
      property.coordinates.lat,
      property.coordinates.lng,
      targetCoords.lat,
      targetCoords.lng
    );
    if (computedDistanceKm !== null && targetName) {
      distanceFromTarget = `${computedDistanceKm} km from ${targetName}`;
    }
  }

  // 1. Intent check (out of 20)
  let intentScore = 15;
  if (req.intent) {
    if (property.intent === req.intent || property.listingType === req.intent) {
      intentScore = 20;
      whyReasons.push(`Matches your intention to ${req.intent}`);
    } else {
      intentScore = 5;
      tradeOffs.push(`Property is listed for ${property.intent}, while you selected ${req.intent}`);
    }
  }

  // HARD MAXIMUM BUDGET CHECK: If user budget is specified, property price/rent MUST NOT exceed user budget
  const userBudget = Number(req.budgetMax || req.budget?.max || req.budget || life.budgetMax || 0);
  if (userBudget > 0 && !isPropertyWithinBudget(property, userBudget)) {
    return null; // DISQUALIFIED: Property exceeds user's hard maximum budget
  }

  // 2. Budget Fit (out of 25) — Guaranteed within budget
  let budgetScore = 25;
  if (userBudget > 0) {
    whyReasons.push(
      isStudent ? `Affordable student rent at ${property.priceDisplay}` :
      isBachelor ? `Budget-friendly bachelor rent at ${property.priceDisplay}` :
      `Within budget target at ${property.priceDisplay}`
    );
  }

  // 3. Location & Proximity Fit (out of 30)
  let locScore = 18;
  if (computedDistanceKm !== null && maxDistanceKm) {
    if (computedDistanceKm <= maxDistanceKm) {
      locScore = 30;
      whyReasons.unshift(
        isStudent ? `Only ${computedDistanceKm} km from ${targetName} (Within preferred ${maxDistanceKm} km)` :
        isITProfessional ? `Just ${computedDistanceKm} km from ${targetName} (Within your ${maxDistanceKm} km limit)` :
        `Within ${maxDistanceKm} km of ${targetName} (${computedDistanceKm} km)`
      );
    } else if (computedDistanceKm <= maxDistanceKm * 1.5) {
      locScore = 22;
      whyReasons.push(`${computedDistanceKm} km from ${targetName}`);
      tradeOffs.push(`Slightly beyond preferred ${maxDistanceKm} km target (${computedDistanceKm} km)`);
    } else {
      locScore = 12;
      tradeOffs.push(`${computedDistanceKm} km from ${targetName} (exceeds ${maxDistanceKm} km preference)`);
    }
  } else {
    if (reqCity && propCity === reqCity) {
      locScore = 22;
      whyReasons.push(`Located in ${property.city}`);
    }
    if (req.preferredLocalities && Array.isArray(req.preferredLocalities) && req.preferredLocalities.length > 0) {
      const locMatch = req.preferredLocalities.some(l => l && (propLocality.includes(l.toLowerCase()) || l.toLowerCase().includes(propLocality)));
      if (locMatch) {
        locScore = Math.min(30, locScore + 5);
        whyReasons.push(`Located in preferred area: ${property.locality}`);
      }
    }
  }

  // 4. Property Layout / BHK / Room Type (out of 15)
  let specScore = 12;
  if (req.bhk && Array.isArray(req.bhk) && req.bhk.length > 0) {
    if (req.bhk.some(b => b === property.bhk || (b >= 5 && property.bhk >= 5))) {
      specScore = 15;
      whyReasons.push(
        isStudent ? `Ideal ${property.bhk} BHK student-friendly layout` :
        isBachelor ? `Ideal ${property.bhk} BHK bachelor layout` :
        isFamily ? `Spacious ${property.bhk} BHK family home` :
        `Ideal ${property.bhk} BHK layout`
      );
    } else {
      specScore = 8;
      tradeOffs.push(`${property.bhk} BHK differs from preferred bedrooms`);
    }
  }

  // 5. Lifestyle, Persona Suitability & Amenities (out of 15)
  let lifeScore = 10;
  const suitableFor = property.suitableFor || [];

  if (isStudent) {
    // Student: quiet study, wifi, student/bachelor friendly, food mess
    if (suitableFor.includes('Students') || suitableFor.includes('Bachelors')) {
      lifeScore += 2;
      whyReasons.push('Verified suitable for student accommodation');
    }
    if (property.noiseLevel === 'LOW') {
      lifeScore += 2;
      whyReasons.push('Peaceful and quiet environment for studying');
    }
    if (property.amenities && property.amenities.some(a => /wifi|internet|study/i.test(a))) {
      lifeScore += 1;
      whyReasons.push('High-speed Wi-Fi and study-ready');
    }
  } else if (isBachelor) {
    // Bachelor: bachelor suitability, wifi, transit, gym/dining
    if (suitableFor.includes('Bachelors') || suitableFor.includes('Young Professionals')) {
      lifeScore += 3;
      whyReasons.push('Bachelor-friendly rental with zero hassle');
    }
    if (property.amenities && property.amenities.some(a => /wifi|internet|gym|parking/i.test(a))) {
      lifeScore += 2;
      whyReasons.push('Modern amenities and broadband connectivity');
    }
  } else if (isFamily) {
    // Family: family suitability, 2+ BHK, gated, schools, hospitals, quietness, siruvani water
    if (suitableFor.includes('Families') || suitableFor.includes('Small Families') || property.bhk >= 2) {
      lifeScore += 2;
      whyReasons.push('Family-friendly community');
    }
    if (property.gatedCommunity || property.security24x7) {
      lifeScore += 2;
      whyReasons.push('Gated society with 24x7 security');
    }
    if (property.waterSupply && String(property.waterSupply).toLowerCase().includes('siruvani')) {
      lifeScore += 1;
      whyReasons.push('Siruvani drinking water supply');
    }
    const places = Array.isArray(property.nearbyPlaces) ? property.nearbyPlaces : [];
    const nearestSchool = places.find(p => p.category === 'school');
    const nearestHospital = places.find(p => p.category === 'hospital');
    const nearestTransit = places.find(p => p.category === 'transit');

    if (nearestSchool) {
      lifeScore += 1;
      whyReasons.push(`${nearestSchool.name} within ${nearestSchool.distanceKm} km`);
    } else if (priorities.schools === 'HIGH') {
      lifeScore += 1;
      whyReasons.push('Reputed schools in vicinity');
    }

    if (nearestHospital) {
      lifeScore += 1;
      whyReasons.push(`${nearestHospital.name} within ${nearestHospital.distanceKm} km`);
    } else if (priorities.healthcare === 'HIGH') {
      lifeScore += 1;
      whyReasons.push('Hospitals and healthcare nearby');
    }

    if (nearestTransit) {
      whyReasons.push(`${nearestTransit.name} within ${nearestTransit.distanceKm} km`);
    }
  } else if (isITProfessional) {
    // IT Professional: commute, gated, power backup, wifi, quietness, transit
    const places = Array.isArray(property.nearbyPlaces) ? property.nearbyPlaces : [];
    const nearestTransit = places.find(p => p.category === 'transit');
    const nearestHospital = places.find(p => p.category === 'hospital');

    if (property.powerBackup) {
      lifeScore += 2;
      whyReasons.push('Reliable power backup for remote work');
    }
    if (property.gatedCommunity || property.security24x7) {
      lifeScore += 1;
      whyReasons.push('Secure gated community');
    }
    if (property.noiseLevel === 'LOW') {
      lifeScore += 1;
      whyReasons.push('Quiet residential surroundings');
    }
    if (nearestTransit) {
      whyReasons.push(`${nearestTransit.name} within ${nearestTransit.distanceKm} km`);
    }
    if (nearestHospital) {
      whyReasons.push(`${nearestHospital.name} within ${nearestHospital.distanceKm} km`);
    }
  }
  lifeScore = Math.min(15, lifeScore);

  const rawScore = intentScore + budgetScore + locScore + specScore + lifeScore;
  const totalScore = Math.min(99, Math.max(45, Math.round(rawScore)));

  // Drive/walk commute calculation
  let commuteEstimate = undefined;
  if (computedDistanceKm !== null) {
    const driveMinutes = Math.max(3, Math.round(computedDistanceKm * 2.5));
    commuteEstimate = {
      driveTime: `${driveMinutes} mins drive`
    };
    if (computedDistanceKm <= 2.5) {
      commuteEstimate.walkTime = `${Math.round(computedDistanceKm * 12)} mins walk`;
    }
  }

  const enhancedProp = {
    ...property,
    computedDistanceKm: computedDistanceKm !== null ? computedDistanceKm : undefined,
    distanceFromTarget: distanceFromTarget || undefined
  };

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
      property: specScore + intentScore,
      location: locScore,
      lifestyle: lifeScore
    },
    whyThisProperty: whyReasons,
    tradeOffs,
    explanation: computedDistanceKm !== null && targetName
      ? `${totalScore}% match — ${computedDistanceKm} km from ${targetName}.`
      : `${totalScore}% match for your ${userType} preferences.`,
    property: enhancedProp,
    computedDistanceKm: computedDistanceKm !== null ? computedDistanceKm : undefined,
    distanceFromTarget: distanceFromTarget || undefined,
    commuteEstimate
  };
}

export async function getBuyerRecommendations(req, res, next) {
  try {
    const db = getDb();
    const authUser = await getAuthenticatedUser(req, req.body);
    const buyerId = authUser?.userId || req.body?.userId || req.body?.buyerId || req.query?.buyerId;

    let buyerProfile = null;
    if (buyerId) {
      buyerProfile = await db.collection('buyer_profiles').findOne({ userId: buyerId });
    }

    const incoming = req.body?.buyer || req.body || {};
    const buyerCriteria = {
      ...(buyerProfile || {}),
      ...incoming,
      lifestyle: {
        ...(buyerProfile?.lifestyle || {}),
        ...(incoming?.lifestyle || {})
      }
    };

    const userType = buyerCriteria.buyerType || buyerCriteria.userType || buyerCriteria.lifestyle?.userType || 'IT Employee / Working Professional';
    const isStudent = userType === 'Student';
    const isBachelor = userType === 'Bachelor';

    // Persist current persona to user profile in MongoDB if authenticated
    if (buyerId && incoming && (incoming.buyerType || incoming.userType)) {
      db.collection('buyer_profiles').updateOne(
        { userId: buyerId },
        { 
          $set: { 
            ...incoming, 
            buyerType: userType,
            userType: userType,
            userId: buyerId,
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      ).catch(() => {});
    }

    // Students and Bachelors default to RENT unless BUY explicitly requested
    let intent = (buyerCriteria.intent || ((isStudent || isBachelor) ? 'RENT' : 'BUY')).toUpperCase();
    const listingType = (intent === 'RENT' || intent === 'RENT_OUT') ? 'RENT' : 'BUY';

    const rawActiveProps = await db.collection('properties').find({ status: 'ACTIVE', listingType }).toArray();

    // Deduplication by propertyId / id
    const uniquePropsMap = new Map();
    for (const p of rawActiveProps) {
      const norm = normalizeProperty(p);
      if (norm && norm.id && !uniquePropsMap.has(norm.id)) {
        uniquePropsMap.set(norm.id, norm);
      }
    }
    const activeProps = Array.from(uniquePropsMap.values());

    const userBudget = Number(buyerCriteria.budgetMax || buyerCriteria.budget?.max || buyerCriteria.budget || req.body?.budgetMax || 0);

    // CRITICAL HARD MAXIMUM BUDGET FILTER: Applied BEFORE sorting, ranking, or AI matching
    const eligibleProps = userBudget > 0
      ? activeProps.filter((p) => isPropertyWithinBudget(p, userBudget))
      : activeProps;

    if (eligibleProps.length === 0) {
      return res.json({
        success: true,
        buyerId: buyerId || 'guest',
        userType,
        buyerType: userType,
        userBudget,
        targetLocationName: buyerCriteria.targetLocationName || (isITProfessional ? 'TIDEL Park' : null),
        matchCount: 0,
        recommendations: [],
        matches: [],
        message: 'No properties found within your budget.'
      });
    }

    const recommendations = eligibleProps
      .map((p) => calculateLifestyleMatch(p, buyerCriteria))
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Enrich with ⭐ AGENT 1 (Lifestyle Matchmaker) and ⭐ AGENT 2 (Locality & Value Advisor)
    const enrichedRecommendations = await enrichRecommendationsWithAgents(recommendations, buyerCriteria);

    if (buyerId) {
      db.collection('match_results').insertOne({
        buyerId,
        userId: buyerId,
        userType,
        evaluatedAt: new Date(),
        matchCount: enrichedRecommendations.length,
        topMatchScore: enrichedRecommendations[0]?.matchScore || 0
      }).catch(() => {});
    }

    res.json({
      success: true,
      buyerId: buyerId || 'guest',
      userType,
      buyerType: userType,
      targetLocationName: buyerCriteria.targetLocationName || (isITProfessional ? 'TIDEL Park' : null),
      matchCount: enrichedRecommendations.length,
      recommendations: enrichedRecommendations,
      matches: enrichedRecommendations
    });
  } catch (err) {
    next(err);
  }
}
