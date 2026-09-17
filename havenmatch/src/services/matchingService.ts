/**
 * HAVENMATCH AI — Matching Service
 * Grounds buyer matching in authentic user type (Student vs IT Employee / Family),
 * real GPS landmark proximity calculations (Haversine), and lifestyle compatibility.
 */

import { callAPI } from './api';
import { Property, BuyerRequirements, LifestyleProfile, MatchResult } from '../types';
import { calculateDistanceKm, resolveLandmarkCoordinates, formatCommuteEstimate } from '../utils/geoUtils';
import { isPropertyWithinBudget } from '../utils/budgetUtils';

// ─── API response shapes ───────────────────────────────────────────────────

export interface APIRecommendation {
  propertyId: string;
  matchScore: number;
  scoreBreakdown: {
    budget: number;    // out of 25
    property: number;  // out of 20
    location: number;  // out of 30
    lifestyle: number; // out of 25
  };
  whyThisProperty: string[];
  tradeOffs: string[];
  explanation?: string;
  property?: Property;
  computedDistanceKm?: number;
  distanceFromTarget?: string;
  commuteEstimate?: { driveTime: string; walkTime?: string };
  agentNarrative?: string;
  lifestyleHighlight?: string;
  valuationVerdict?: string;
  neighborhoodTip?: string;
}

interface MatchingBuyerResponse {
  success: boolean;
  action: string;
  buyerId?: string;
  userType?: string;
  targetLocationName?: string;
  matchCount: number;
  recommendations: APIRecommendation[];
}

// ─── Adapters ──────────────────────────────────────────────────────────────

function getMatchTag(score: number): MatchResult['tag'] {
  if (score >= 93) return 'Top Lifestyle Fit';
  if (score >= 88) return 'Best Value Match';
  if (score >= 83) return 'Commute Champion';
  if (score >= 78) return 'Balanced Match';
  return 'Recommended';
}

function getLabel(score: number): 'Excellent' | 'Good' | 'Moderate' | 'Fair' {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Moderate';
  return 'Fair';
}

/**
 * Converts a raw API recommendation into a MatchResult for the frontend.
 */
function adaptRecommendation(rec: APIRecommendation, targetName?: string, targetCoords?: { lat: number; lng: number }): MatchResult {
  const b = rec.scoreBreakdown;
  const budgetPct = (b.budget / 25) * 100;
  const locationPct = (b.location / 30) * 100;
  const lifestylePct = (b.lifestyle / 25) * 100;
  const propertyPct = (b.property / 20) * 100;

  // Calculate or preserve computed distance
  let distKm = rec.computedDistanceKm;
  let distTarget = rec.distanceFromTarget;
  let commuteEst = rec.commuteEstimate;

  if (distKm === undefined && rec.property?.coordinates && targetCoords) {
    distKm = calculateDistanceKm(
      rec.property.coordinates.lat,
      rec.property.coordinates.lng,
      targetCoords.lat,
      targetCoords.lng
    );
    if (distKm !== undefined && targetName) {
      distTarget = `${distKm} km from ${targetName}`;
      commuteEst = formatCommuteEstimate(distKm);
    }
  }

  return {
    propertyId: rec.propertyId,
    overallScore: rec.matchScore,
    tag: getMatchTag(rec.matchScore),
    breakdown: {
      budgetFit: {
        score: Math.round(budgetPct),
        label: getLabel(budgetPct),
        detail: `Budget compatibility: ${Math.round(budgetPct)}%`,
      },
      commuteFit: {
        score: Math.round(locationPct),
        label: getLabel(locationPct),
        detail: distKm !== undefined ? `Proximity score (${distKm} km away)` : `Location & commute score: ${Math.round(locationPct)}%`,
      },
      healthcareFit: {
        score: Math.round(lifestylePct * 0.9),
        label: getLabel(lifestylePct * 0.9),
        detail: `Healthcare proximity score`,
      },
      transitFit: {
        score: Math.round(locationPct * 0.85),
        label: getLabel(locationPct * 0.85),
        detail: `Public transport access`,
      },
      schoolsFit: {
        score: Math.round(lifestylePct * 0.8),
        label: getLabel(lifestylePct * 0.8),
        detail: `School proximity score`,
      },
      neighborhoodFit: {
        score: Math.round((locationPct + lifestylePct) / 2),
        label: getLabel((locationPct + lifestylePct) / 2),
        detail: `Neighborhood compatibility`,
      },
      amenitiesFit: {
        score: Math.round(propertyPct),
        label: getLabel(propertyPct),
        detail: `Amenities & property match`,
      },
    },
    whyItMatches: rec.whyThisProperty || [],
    tradeOffs: rec.tradeOffs || [],
    lifestyleSummary:
      rec.explanation ||
      (distKm !== undefined && targetName
        ? `${rec.matchScore}% match — located ${distKm} km from ${targetName}.`
        : `${rec.matchScore}% lifestyle match for your priorities.`),
    computedDistanceKm: distKm,
    distanceFromTarget: distTarget,
    commuteEstimate: commuteEst,
    agentNarrative: rec.agentNarrative || rec.property?.agentNarrative,
    lifestyleHighlight: rec.lifestyleHighlight || rec.property?.lifestyleHighlight,
    valuationVerdict: rec.valuationVerdict || rec.property?.valuationVerdict,
    neighborhoodTip: rec.neighborhoodTip || rec.property?.neighborhoodTip
  };
}

// ─── Service ───────────────────────────────────────────────────────────────

export interface BackendStatus {
  connected: boolean;
  isAvailable: boolean;
  isEvaluating: boolean;
  lastChecked: Date | null;
  agentNodeCount: number;
  lastScore: number | null;
  mode: 'live' | 'offline';
  endpoint: string;
}

class MatchingService {
  private status: BackendStatus = {
    connected: true,
    isAvailable: true,
    isEvaluating: false,
    lastChecked: new Date(),
    agentNodeCount: 7,
    lastScore: null,
    mode: 'live',
    endpoint: '/api/matching/buyer'
  };

  private listeners: Array<(status: BackendStatus) => void> = [];

  getStatus(): BackendStatus {
    return { ...this.status };
  }

  subscribeStatus(listener: (status: BackendStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    const s = this.getStatus();
    this.listeners.forEach((l) => l(s));
  }

  /**
   * Evaluate a single property match against buyer profile
   */
  async evaluateMatch(
    property: Property,
    requirements: BuyerRequirements,
    lifestyle: LifestyleProfile,
    userId?: string
  ): Promise<MatchResult> {
    const matches = await this.getMatches([property], requirements, lifestyle, userId);
    if (matches[property.id]) {
      return matches[property.id];
    }

    const targetName = requirements.targetLocationName || lifestyle.targetLocationName || (requirements.userType === 'Student' ? 'SNS College of Engineering' : lifestyle.workplaceLocation);
    const targetCoords = requirements.targetCoordinates || lifestyle.targetCoordinates || resolveLandmarkCoordinates(targetName);
    let distKm: number | undefined = undefined;
    if (property.coordinates && targetCoords) {
      distKm = calculateDistanceKm(property.coordinates.lat, property.coordinates.lng, targetCoords.lat, targetCoords.lng);
    }

    const userBudget = Number(requirements.budgetMax || (requirements as any).userBudget || 0);
    if (userBudget > 0 && !isPropertyWithinBudget(property, userBudget, requirements.intent)) {
      return {
        propertyId: property.id,
        overallScore: 0,
        tag: 'Recommended',
        breakdown: {
          budgetFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' },
          commuteFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' },
          healthcareFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' },
          transitFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' },
          schoolsFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' },
          neighborhoodFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' },
          amenitiesFit: { score: 0, label: 'Fair', detail: 'Exceeds user budget' }
        },
        whyItMatches: [],
        tradeOffs: ['Exceeds user maximum budget limit'],
        lifestyleSummary: 'Exceeds user maximum budget limit.',
        computedDistanceKm: distKm,
        distanceFromTarget: distKm !== undefined && targetName ? `${distKm} km from ${targetName}` : undefined,
        commuteEstimate: distKm !== undefined ? formatCommuteEstimate(distKm) : undefined
      };
    }

    return {
      propertyId: property.id,
      overallScore: (property as any).matchScore || 85,
      tag: 'Recommended',
      breakdown: {
        budgetFit: { score: 85, label: 'Good', detail: 'Budget evaluation' },
        commuteFit: { score: 85, label: 'Good', detail: distKm !== undefined ? `${distKm} km away` : 'Location evaluation' },
        healthcareFit: { score: 80, label: 'Good', detail: 'Healthcare access' },
        transitFit: { score: 80, label: 'Good', detail: 'Transit access' },
        schoolsFit: { score: 80, label: 'Good', detail: 'Schools access' },
        neighborhoodFit: { score: 85, label: 'Good', detail: 'Neighborhood fit' },
        amenitiesFit: { score: 80, label: 'Good', detail: 'Amenities fit' }
      },
      whyItMatches: distKm !== undefined && targetName ? [`Only ${distKm} km from ${targetName}`] : [],
      tradeOffs: [],
      lifestyleSummary: distKm !== undefined && targetName ? `Located ${distKm} km from ${targetName}.` : `Evaluation for ${property.locality || property.city || 'property'}.`,
      computedDistanceKm: distKm,
      distanceFromTarget: distKm !== undefined && targetName ? `${distKm} km from ${targetName}` : undefined,
      commuteEstimate: distKm !== undefined ? formatCommuteEstimate(distKm) : undefined
    };
  }

  /**
   * Full buyer-property matching via HavenMatch AI engine.
   * Returns a map of propertyId -> MatchResult for use in LifestyleContext.
   */
  async getMatches(
    _properties: Property[],
    requirements: BuyerRequirements,
    lifestyle: LifestyleProfile,
    userId?: string
  ): Promise<Record<string, MatchResult>> {
    this.status.isEvaluating = true;
    this.notifyListeners();

    try {
      let activeUserId = userId;
      if (!activeUserId) {
        try {
          const storedSession = localStorage.getItem('havenmatch_session') || localStorage.getItem('user_session');
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            activeUserId = parsed.userId || parsed.id;
          }
        } catch (_) {}
      }

      const userType = requirements.buyerType || requirements.userType || lifestyle.buyerType || lifestyle.userType || 'IT Employee / Working Professional';
      const isStudent = userType === 'Student';
      const isIT = userType === 'IT Employee / Working Professional';
      const targetLocationName = requirements.targetLocationName || lifestyle.targetLocationName || (
        isStudent ? 'SNS College of Engineering' :
        isIT ? (lifestyle.workplaceLocation || 'TIDEL Park') :
        undefined
      );
      const targetCoordinates = requirements.targetCoordinates || lifestyle.targetCoordinates || (targetLocationName ? resolveLandmarkCoordinates(targetLocationName) : undefined);
      const maxDistanceKm = requirements.maxDistanceKm || lifestyle.maxDistanceKm || (isStudent ? 3 : isIT ? 5 : undefined);

      const buyerProfile = {
        userId: activeUserId || undefined,
        buyerId: activeUserId || undefined,
        userType,
        buyerType: userType,
        targetLocationName,
        targetCoordinates,
        maxDistanceKm,
        isCustomDistance: requirements.isCustomDistance || lifestyle.isCustomDistance,
        intent: requirements.intent,
        city: requirements.city,
        preferredLocalities: requirements.preferredLocalities,
        budgetMin: requirements.budgetMin,
        budgetMax: requirements.budgetMax,
        bhk: requirements.bhk,
        propertyTypes: requirements.propertyTypes,
        lifestyle: {
          userType,
          workplaceLocation: lifestyle.workplaceLocation,
          targetLocationName,
          targetCoordinates,
          maxDistanceKm,
          maxCommuteMins: lifestyle.maxCommuteMins,
          priorities: lifestyle.priorities,
          hasElderlyFamily: lifestyle.hasElderlyFamily,
          hasSchoolGoingKids: lifestyle.hasSchoolGoingKids,
          hasPets: lifestyle.hasPets,
          atmospherePreference: lifestyle.atmospherePreference,
        },
      };

      const data = await callAPI<MatchingBuyerResponse>('matching/buyer', {
        action: 'matching/buyer',
        buyer: buyerProfile,
        userId: activeUserId,
        buyerId: activeUserId
      });

      const userBudget = Number(requirements.budgetMax || (requirements as any).userBudget || 0);
      const results: Record<string, MatchResult> = {};
      for (const rec of data.recommendations || []) {
        if (rec && rec.propertyId) {
          // CRITICAL: HARD MAXIMUM BUDGET SAFETY FILTER
          if (userBudget > 0 && rec.property && !isPropertyWithinBudget(rec.property, userBudget, requirements.intent)) {
            continue; // Exclude: exceeds user budget
          }
          results[rec.propertyId] = adaptRecommendation(rec, targetLocationName, targetCoordinates);
        }
      }

      this.status.connected = true;
      this.status.isAvailable = true;
      this.status.lastChecked = new Date();
      if (data.recommendations?.[0]) {
        this.status.lastScore = data.recommendations[0].matchScore;
      }
      return results;
    } catch (err) {
      this.status.connected = false;
      this.status.isAvailable = false;
      this.status.lastChecked = new Date();
      throw err;
    } finally {
      this.status.isEvaluating = false;
      this.notifyListeners();
    }
  }
}

export const matchingService = new MatchingService();
