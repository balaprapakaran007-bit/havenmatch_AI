/**
 * HavenMatch AI - Geo Utilities & Coimbatore Landmark Directory
 * Grounded in authentic GPS coordinates and Haversine distance formulas.
 */

export interface Landmark {
  id: string;
  name: string;
  shortName: string;
  category: 'COLLEGE' | 'WORKPLACE';
  locality: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

export const COIMBATORE_COLLEGES: Landmark[] = [];

export const COIMBATORE_WORKPLACES: Landmark[] = [
  {
    id: 'tidel-park',
    name: 'TIDEL Park Coimbatore',
    shortName: 'TIDEL Park',
    category: 'WORKPLACE',
    locality: 'Peelamedu / Avinashi Road',
    coordinates: { lat: 11.0285, lng: 77.0290 },
    address: 'ELCOSEZ, Civil Aerodrome Post, Avinashi Road, Coimbatore - 641014'
  },
  {
    id: 'chil-sez',
    name: 'CHIL SEZ IT Park (KGISL / Cognizant)',
    shortName: 'CHIL SEZ IT Park',
    category: 'WORKPLACE',
    locality: 'Saravanampatti / Keeranatham',
    coordinates: { lat: 11.0850, lng: 76.9980 },
    address: 'Saravanampatti, Keeranatham Road, Coimbatore - 641035'
  },
  {
    id: 'peelamedu-hub',
    name: 'Peelamedu Commercial & IT Corridor',
    shortName: 'Peelamedu Hub',
    category: 'WORKPLACE',
    locality: 'Peelamedu',
    coordinates: { lat: 11.0245, lng: 77.0050 },
    address: 'Avinashi Road, Peelamedu, Coimbatore - 641004'
  },
  {
    id: 'rs-puram',
    name: 'RS Puram Business District',
    shortName: 'RS Puram',
    category: 'WORKPLACE',
    locality: 'RS Puram',
    coordinates: { lat: 11.0110, lng: 76.9500 },
    address: 'DB Road & TV Swamy Road, RS Puram, Coimbatore - 641002'
  },
  {
    id: 'gandhipuram-central',
    name: 'Gandhipuram Central Commercial Hub',
    shortName: 'Gandhipuram',
    category: 'WORKPLACE',
    locality: 'Gandhipuram',
    coordinates: { lat: 11.0180, lng: 76.9680 },
    address: 'Cross Cut Road & 100 Feet Road, Gandhipuram, Coimbatore - 641012'
  },
  {
    id: 'race-course',
    name: 'Race Course Executive District',
    shortName: 'Race Course',
    category: 'WORKPLACE',
    locality: 'Race Course',
    coordinates: { lat: 11.0018, lng: 76.9744 },
    address: 'Race Course Road, Coimbatore - 641018'
  }
];

/**
 * Calculates genuine geographical distance in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Resolves coordinates for any landmark name (matches presets or falls back to Coimbatore central)
 */
export function resolveLandmarkCoordinates(name: string): { lat: number; lng: number } {
  if (!name) return { lat: 11.0168, lng: 76.9558 };
  const lower = name.toLowerCase();

  const all = [...COIMBATORE_COLLEGES, ...COIMBATORE_WORKPLACES];
  const found = all.find(
    (l) =>
      lower.includes(l.name.toLowerCase()) ||
      lower.includes(l.shortName.toLowerCase()) ||
      l.name.toLowerCase().includes(lower)
  );

  if (found) return found.coordinates;

  // Locality fallbacks
  if (lower.includes('saravanampatti') || lower.includes('kurumbapalayam')) {
    return { lat: 11.0850, lng: 76.9980 };
  }
  if (lower.includes('peelamedu') || lower.includes('avinashi')) {
    return { lat: 11.0250, lng: 77.0050 };
  }
  if (lower.includes('race course')) {
    return { lat: 11.0018, lng: 76.9744 };
  }
  if (lower.includes('rs puram')) {
    return { lat: 11.0110, lng: 76.9500 };
  }
  if (lower.includes('gandhipuram')) {
    return { lat: 11.0180, lng: 76.9680 };
  }
  if (lower.includes('saibaba')) {
    return { lat: 11.0289, lng: 76.9421 };
  }
  if (lower.includes('vadavalli')) {
    return { lat: 11.0216, lng: 76.9038 };
  }

  // Default Coimbatore central
  return { lat: 11.0168, lng: 76.9558 };
}

/**
 * Formats a commute estimate given distance in km
 */
export function formatCommuteEstimate(distanceKm: number): { driveTime: string; walkTime?: string } {
  if (distanceKm <= 0) return { driveTime: 'Under 5 mins drive' };
  
  const driveMinutes = Math.max(3, Math.round(distanceKm * 2.5)); // ~25 km/h urban speed
  const driveTime = `${driveMinutes} mins drive`;

  if (distanceKm <= 2.5) {
    const walkMinutes = Math.round(distanceKm * 12); // ~5 km/h walking speed
    return {
      driveTime,
      walkTime: `${walkMinutes} mins walk`
    };
  }

  return { driveTime };
}
