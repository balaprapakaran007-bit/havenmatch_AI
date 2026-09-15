export type UserRole = 'BUYER' | 'SELLER' | 'OWNER';

export type BuyerIntent = 'BUY' | 'RENT';
export type SellerIntent = 'SELL' | 'RENT_OUT';

export type BackgroundTheme = 'sunset' | 'midnight' | 'aurora' | 'emerald';

export interface ThemeConfig {
  id: BackgroundTheme;
  name: string;
  badge: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  previewGradient: string;
}

export type PropertyType = 
  | 'Apartment'
  | 'Independent House'
  | 'Villa'
  | 'Builder Floor'
  | 'Studio Apartment'
  | 'Plot / Land';

export type FacingDirection = 'North' | 'East' | 'North-East' | 'South' | 'West' | 'South-East';

export type FurnishingStatus = 'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type PossessionStatus = 'Ready to Move' | 'Under Construction' | 'Immediate';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_IMPORTANT';

export type LifestyleCategory = 
  | 'commute'
  | 'healthcare'
  | 'schools'
  | 'transit'
  | 'supermarkets'
  | 'parks'
  | 'quietness'
  | 'dining'
  | 'fitness'
  | 'petFriendly'
  | 'safety';

export interface Property {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  propertyType: PropertyType;
  intent: 'BUY' | 'RENT';
  city: string;
  locality: string;
  pincode: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  price: number; // In INR e.g. 6800000 or 25000 (rent)
  priceDisplay: string; // e.g. "₹68 Lakhs" or "₹25,000/mo"
  pricePerSqFt?: string;
  securityDeposit?: string;
  maintenanceMonthly: string;
  bhk: number;
  bathrooms: number;
  balconies: number;
  builtUpAreaSqFt: number;
  carpetAreaSqFt: number;
  floor: number;
  totalFloors: number;
  facing: FacingDirection;
  furnishing: FurnishingStatus;
  propertyAgeYears: number;
  possession: PossessionStatus;
  reraApproved: boolean;
  reraId: string;
  vastuCompliant: boolean;
  parking: string;
  powerBackup: string;
  waterSupply: string;
  gatedCommunity: boolean;
  security24x7: boolean;
  noiseLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  safety?: string;
  waterAvailability?: string;
  electricityAvailability?: string;
  petFriendly?: boolean;
  suitableFor?: string[];
  rules?: string;
  additionalDetails?: string;
  nearbyPlaces?: NearbyPlace[];
  amenities: string[];
  images: string[];
  featured?: boolean;
  status?: 'ACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | string;
  ownerId?: string;
  sellerId?: string;
  listingType?: 'BUY' | 'RENT';
  primaryImage?: string;
  coverImage?: string;
  seller: {
    id: string;
    name: string;
    role: 'Individual Owner' | 'Direct Builder' | 'Verified Host' | 'Agent' | string;
    phone: string;
    email?: string;
    verified: boolean;
    responseRate: string;
    avatarUrl?: string;
    location?: string;
    bio?: string;
    ownerType?: 'OWNER' | 'AGENT';
  };
}

export interface BuyerRequirements {
  intent: BuyerIntent;
  city: string;
  preferredLocalities: string[];
  budgetMin: number; // In INR
  budgetMax: number; // In INR
  bhk: number[];
  propertyTypes: PropertyType[];
  possession: PossessionStatus[];
  furnishing?: FurnishingStatus[];
  vastuRequired?: boolean;
  parkingRequired?: boolean;
}

export interface LifestyleProfile {
  priorities: Record<LifestyleCategory, PriorityLevel>;
  workplaceLocation: string;
  maxCommuteMins: number;
  hasElderlyFamily: boolean;
  hasSchoolGoingKids: boolean;
  hasPets: boolean;
  atmospherePreference: 'Peaceful & Quiet' | 'Balanced Urban' | 'Vibrant & Connected';
}

export interface DimensionScore {
  score: number; // 0 to 100
  label: 'Excellent' | 'Good' | 'Moderate' | 'Fair';
  detail: string;
}

export interface MatchBreakdown {
  budgetFit: DimensionScore;
  commuteFit: DimensionScore;
  healthcareFit: DimensionScore;
  transitFit: DimensionScore;
  schoolsFit: DimensionScore;
  neighborhoodFit: DimensionScore;
  amenitiesFit: DimensionScore;
}

export interface MatchResult {
  propertyId: string;
  overallScore: number; // 0 to 100
  tag: 'Top Lifestyle Fit' | 'Best Value Match' | 'Commute Champion' | 'Balanced Match' | 'Recommended';
  breakdown: MatchBreakdown;
  whyItMatches: string[];
  tradeOffs: string[];
  lifestyleSummary: string;
}

export type CardinalDirection = 
  | 'N' | 'NNE' | 'NE' | 'ENE'
  | 'E' | 'ESE' | 'SE' | 'SSE'
  | 'S' | 'SSW' | 'SW' | 'WSW'
  | 'W' | 'WNW' | 'NW' | 'NNW';

export type POICategory = 
  | 'hospital' 
  | 'transit' 
  | 'school' 
  | 'shopping' 
  | 'supermarket'
  | 'park' 
  | 'techpark'
  | 'gym'
  | 'temple'
  | 'airport';

export interface NearbyPlace {
  id: string;
  name: string;
  category: POICategory;
  categoryLabel: string;
  distanceKm: number;
  driveTimeMins: number;
  walkTimeMins?: number;
  direction: CardinalDirection;
  directionDegrees: number; // 0 = North, 90 = East, 180 = South, 270 = West
  coordinates?: { lat: number; lng: number };
  highlight?: string;
}

export interface UserSession {
  userId?: string;
  id?: string;
  token?: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  isLoggedIn: boolean;
  ownerType?: 'OWNER' | 'AGENT';
  location?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocality: string;
  propertyImage: string;
  propertyPrice: string;
  propertyBhk: number;
  date: string;
  timeSlot: string;
  buyerName: string;
  buyerPhone: string;
  sellerName?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface ExpressedInterest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocality: string;
  timestamp: string;
  status: 'Interest Expressed' | 'Seller Contacted' | 'Visit Suggested';
  notes?: string;
}

export interface CompatibleBuyer {
  id: string;
  name: string;
  avatar: string;
  matchPercentage: number;
  intent: 'BUY' | 'RENT';
  budgetDisplay: string;
  preferredBhk: string;
  targetLocality: string;
  workplace: string;
  lifestyleMatchReason: string[];
  lastActive: string;
  contactStage: 'Matched' | 'Interest Received' | 'Visit Requested';
}

export interface SellerListing extends Property {
  viewsCount: number;
  interestsCount: number;
  compatibleBuyersCount: number;
  status: 'Published' | 'Draft' | 'Paused';
  listedDate: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  propertyContext?: {
    id: string;
    title: string;
    locality: string;
    price: string;
  };
}
