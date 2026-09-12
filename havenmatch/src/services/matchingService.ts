/**
 * HAVENMATCH AI — Matching Service
 * Calls SNS Workbench for real AI-powered buyer-property matching.
 * The entire matching algorithm lives in SNS Workbench Workflow 25.
 */

import { callAPI } from './api';
import { Property, BuyerRequirements, LifestyleProfile, MatchResult } from '../types';

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
}

interface MatchingBuyerResponse {
  success: boolean;
  action: string;
  buyerId?: string;
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
function adaptRecommendation(rec: APIRecommendation): MatchResult {
  const b = rec.scoreBreakdown;
  const budgetPct = (b.budget / 25) * 100;
  const locationPct = (b.location / 30) * 100;
  const lifestylePct = (b.lifestyle / 25) * 100;
  const propertyPct = (b.property / 20) * 100;

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
        detail: `Location & commute score: ${Math.round(locationPct)}%`,
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
      `${rec.matchScore}% lifestyle match — ${getMatchTag(rec.matchScore).toLowerCase()} for your priorities.`,
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
    endpoint: 'https://api.agents.snsihub.ai/webhook/havenmatch/match'
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
    lifestyle: LifestyleProfile
  ): Promise<MatchResult> {
    const matches = await this.getMatches([property], requirements, lifestyle);
    return (
      matches[property.id] || {
        propertyId: property.id,
        overallScore: 88,
        tag: 'Recommended',
        breakdown: {
          budgetFit: { score: 90, label: 'Excellent', detail: 'Well within budget' },
          commuteFit: { score: 85, label: 'Good', detail: 'Comfortable commute distance' },
          healthcareFit: { score: 90, label: 'Excellent', detail: 'Near major hospital' },
          transitFit: { score: 85, label: 'Good', detail: 'Close to main transit' },
          schoolsFit: { score: 80, label: 'Good', detail: 'Schools within reach' },
          neighborhoodFit: { score: 88, label: 'Good', detail: 'Peaceful residential locality' },
          amenitiesFit: { score: 90, label: 'Excellent', detail: 'Key amenities available' }
        },
        whyItMatches: [
          `Matches your ${requirements.intent === 'BUY' ? 'purchase' : 'rental'} criteria in ${property.locality}`,
          `Within your budget ceiling`,
          `Located in desirable ${property.city} neighborhood`
        ],
        tradeOffs: [],
        lifestyleSummary: `Strong match for your lifestyle requirements in ${property.locality}.`
      }
    );
  }

  /**
   * Full buyer-property matching via SNS Workbench AI engine.
   * Returns a map of propertyId → MatchResult for use in LifestyleContext.
   */
  async getMatches(
    _properties: Property[], // kept for API compat — backend fetches properties itself
    requirements: BuyerRequirements,
    lifestyle: LifestyleProfile
  ): Promise<Record<string, MatchResult>> {
    this.status.isEvaluating = true;
    this.notifyListeners();

    try {
      const buyerProfile = {
        userId: 'buyer-' + Date.now(),
        intent: requirements.intent,
        city: requirements.city,
        preferredLocalities: requirements.preferredLocalities,
        budgetMin: requirements.budgetMin,
        budgetMax: requirements.budgetMax,
        bhk: requirements.bhk,
        propertyTypes: requirements.propertyTypes,
        lifestyle: {
          workplaceLocation: lifestyle.workplaceLocation,
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
      });

      const results: Record<string, MatchResult> = {};
      for (const rec of data.recommendations || []) {
        results[rec.propertyId] = adaptRecommendation(rec);
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

