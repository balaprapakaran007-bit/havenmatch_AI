/**
 * HAVENMATCH AI — LOCATION INTELLIGENCE UTILITIES
 * Real Geocoding (Nominatim), Real Nearby Places (OpenStreetMap),
 * Real Haversine Distance, and Real Route Travel Times (OSRM).
 * 
 * STRICT RULES:
 * - NO fake / mock / demo fallback places
 * - NO hardcoded coordinates
 * - NO invented travel times (only real OSRM or straight-line distance)
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OSRM_BASE = 'https://router.project-osrm.org';
const USER_AGENT = 'HavenMatchAI/1.0 (contact@havenmatch.ai)';

/**
 * Calculates authentic spherical Haversine distance between two coordinates in km.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Fetches genuine driving route distance and duration using OSRM.
 * Returns null if unreachable or fails (strictly never invents fake travel time).
 */
export async function fetchRouteDetails(lat1, lon1, lat2, lon2) {
  try {
    const url = `${OSRM_BASE}/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(2500)
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === 'Ok' && Array.isArray(data.routes) && data.routes[0]) {
      const route = data.routes[0];
      return {
        routeDistanceKm: Number((route.distance / 1000).toFixed(1)),
        driveTimeMins: Math.max(1, Math.round(route.duration / 60))
      };
    }
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Geocodes an address to verified latitude & longitude using OpenStreetMap Nominatim.
 * Falls back progressively to broader location queries if ultra-specific address is unindexed.
 */
export async function geocodeAddress(details = {}) {
  const { address, locality, city, pincode, landmark } = details;

  // Candidate queries in descending order of specificity
  const candidateQueries = [
    [address, landmark, locality, city, pincode, 'India'].filter(Boolean).join(', '),
    [landmark, locality, city, pincode, 'India'].filter(Boolean).join(', '),
    [locality, city, pincode, 'India'].filter(Boolean).join(', '),
    [locality, city, 'India'].filter(Boolean).join(', '),
    [city, pincode, 'India'].filter(Boolean).join(', '),
    [city, 'India'].filter(Boolean).join(', ')
  ].filter(q => q.trim().length > 0);

  // De-duplicate candidate queries
  const uniqueQueries = [...new Set(candidateQueries)];

  for (const query of uniqueQueries) {
    try {
      const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) continue;
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return {
            latitude: lat,
            longitude: lng,
            displayName: item.display_name,
            matchedQuery: query,
            placeId: item.place_id ? String(item.place_id) : `osm-${lat.toFixed(4)}-${lng.toFixed(4)}`
          };
        }
      }
    } catch (_) {
      // Continue to next broader query candidate
    }
  }

  return null;
}

/**
 * 12 Standard Location Intelligence Categories
 */
export const LOCATION_CATEGORIES = [
  { key: 'hospital', label: 'Hospital', query: 'hospital', icon: '🏥' },
  { key: 'school', label: 'School', query: 'school', icon: '🏫' },
  { key: 'college', label: 'College', query: 'college', icon: '🎓' },
  { key: 'transit', label: 'Public Transport', query: 'bus stop', icon: '🚌' },
  { key: 'supermarket', label: 'Supermarket', query: 'supermarket', icon: '🛒' },
  { key: 'grocery', label: 'Grocery Store', query: 'grocery', icon: '🍏' },
  { key: 'pharmacy', label: 'Pharmacy', query: 'pharmacy', icon: '💊' },
  { key: 'bank', label: 'Bank / ATM', query: 'bank', icon: '🏦' },
  { key: 'restaurant', label: 'Restaurant', query: 'restaurant', icon: '🍽️' },
  { key: 'shopping', label: 'Shopping', query: 'shopping mall', icon: '🛍️' },
  { key: 'park', label: 'Park', query: 'park', icon: '🌳' },
  { key: 'worship', label: 'Place of Worship', query: 'temple', icon: '🛕' }
];

/**
 * Automatically discovers genuine nearby facilities around coordinates within radiusKm.
 * Computes exact distances and queries driving times when route service is reachable.
 */
export async function discoverNearbyPlaces({ latitude, longitude, radiusKm = 5 }) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const radius = parseFloat(radiusKm) || 5;

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return {
      success: false,
      error: 'Invalid coordinates provided for location intelligence discovery.',
      nearbyPlaces: []
    };
  }

  // Calculate bounding box (viewbox) for radiusKm
  // 1 deg latitude ≈ 111 km
  const deltaLat = radius / 110.574;
  const deltaLng = radius / (111.320 * Math.cos(lat * (Math.PI / 180)));
  const minLng = (lng - deltaLng).toFixed(5);
  const maxLng = (lng + deltaLng).toFixed(5);
  const minLat = (lat - deltaLat).toFixed(5);
  const maxLat = (lat + deltaLat).toFixed(5);
  const viewbox = `${minLng},${maxLat},${maxLng},${minLat}`;

  const allDiscovered = [];
  const seenPlaceKeys = new Set();

  // Search each category across the bounding box
  for (const cat of LOCATION_CATEGORIES) {
    try {
      const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(cat.query)}&viewbox=${viewbox}&bounded=1&limit=3`;
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(3500)
      });
      if (!res.ok) continue;
      const items = await res.json();
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        if (isNaN(itemLat) || isNaN(itemLng)) continue;

        const distanceKm = calculateHaversineDistance(lat, lng, itemLat, itemLng);
        // Exclude results outside configured radius
        if (distanceKm > radius) continue;

        // Clean name (take first segment before commas)
        const rawName = (item.display_name || '').split(',')[0].trim();
        if (!rawName || rawName.length < 2) continue;

        // Deduplication key: normalized name + rough coordinate grid (0.005 deg ≈ 500m)
        const dedupKey = `${rawName.toLowerCase()}_${itemLat.toFixed(2)}_${itemLng.toFixed(2)}`;
        if (seenPlaceKeys.has(dedupKey)) continue;
        seenPlaceKeys.add(dedupKey);

        const placeId = item.place_id ? String(item.place_id) : `osm-${itemLat.toFixed(4)}-${itemLng.toFixed(4)}`;

        allDiscovered.push({
          id: `poi-${placeId}`,
          name: rawName,
          category: cat.key,
          categoryLabel: cat.label,
          icon: cat.icon,
          distanceKm,
          driveTimeMins: undefined, // Will be enriched via OSRM if route available
          latitude: itemLat,
          longitude: itemLng,
          placeId,
          source: 'OpenStreetMap',
          highlight: `${cat.label} within ${distanceKm} km`
        });
      }
    } catch (_) {
      // Continue next category gracefully
    }
  }

  // Sort overall by real distance ascending
  allDiscovered.sort((a, b) => a.distanceKm - b.distanceKm);

  // Attempt authentic route drive time lookup for top closest facilities (up to 4)
  const topToRoute = allDiscovered.slice(0, 4);
  await Promise.all(topToRoute.map(async (poi) => {
    const route = await fetchRouteDetails(lat, lng, poi.latitude, poi.longitude);
    if (route) {
      poi.driveTimeMins = route.driveTimeMins;
      // If road route distance is longer than straight line, update to road distance
      if (route.routeDistanceKm > poi.distanceKm) {
        poi.distanceKm = route.routeDistanceKm;
      }
    }
  }));

  return {
    success: true,
    coordinates: { lat, lng },
    count: allDiscovered.length,
    nearbyPlaces: allDiscovered
  };
}
