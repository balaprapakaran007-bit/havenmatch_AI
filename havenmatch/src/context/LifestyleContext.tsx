import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BuyerRequirements, LifestyleProfile, MatchResult, LifestyleCategory, PriorityLevel } from '../types';
import { matchingService } from '../services/matchingService';

interface LifestyleContextType {
  requirements: BuyerRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<BuyerRequirements>>;
  lifestyle: LifestyleProfile;
  setLifestyle: React.Dispatch<React.SetStateAction<LifestyleProfile>>;
  updatePriority: (category: LifestyleCategory, priority: PriorityLevel) => void;
  matches: Record<string, MatchResult>;
  isLoadingMatches: boolean;
  matchError: string | null;
  refreshMatches: (reqsOverride?: BuyerRequirements, lifeOverride?: LifestyleProfile) => Promise<Record<string, MatchResult> | void>;
}

const DEFAULT_REQUIREMENTS: BuyerRequirements = {
  intent: 'BUY',
  city: 'Coimbatore',
  preferredLocalities: ['Peelamedu', 'Race Course', 'Saravanampatti', 'RS Puram'],
  budgetMin: 5000000,
  budgetMax: 7500000,
  bhk: [2, 3],
  propertyTypes: ['Apartment', 'Villa'],
  possession: ['Ready to Move', 'Immediate'],
  furnishing: ['Semi-Furnished', 'Fully Furnished'],
  vastuRequired: true,
  parkingRequired: true,
  userType: 'Student',
  buyerType: 'Student',
  targetLocationName: 'Saravanampatti',
  targetCoordinates: { lat: 11.0850, lng: 76.9980 },
  maxDistanceKm: 3,
  isCustomDistance: false,
};

const DEFAULT_LIFESTYLE: LifestyleProfile = {
  priorities: {
    healthcare: 'HIGH',
    commute: 'HIGH',
    transit: 'HIGH',
    quietness: 'HIGH',
    supermarkets: 'HIGH',
    schools: 'MEDIUM',
    parks: 'MEDIUM',
    safety: 'HIGH',
    fitness: 'MEDIUM',
    dining: 'LOW',
    petFriendly: 'LOW',
  },
  workplaceLocation: 'Saravanampatti',
  maxCommuteMins: 20,
  hasElderlyFamily: true,
  hasSchoolGoingKids: false,
  hasPets: false,
  atmospherePreference: 'Peaceful & Quiet',
  userType: 'Student',
  buyerType: 'Student',
  targetLocationName: 'Saravanampatti',
  targetCoordinates: { lat: 11.0850, lng: 76.9980 },
  maxDistanceKm: 3,
  isCustomDistance: false,
};

const getInitialRequirements = (): BuyerRequirements => {
  try {
    const saved = localStorage.getItem('havenmatch_active_requirements');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return DEFAULT_REQUIREMENTS;
};

const getInitialLifestyle = (): LifestyleProfile => {
  try {
    const saved = localStorage.getItem('havenmatch_active_lifestyle');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return DEFAULT_LIFESTYLE;
};

const LifestyleContext = createContext<LifestyleContextType | undefined>(undefined);

export const LifestyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requirements, setRequirementsState] = useState<BuyerRequirements>(getInitialRequirements);
  const [lifestyle, setLifestyleState] = useState<LifestyleProfile>(getInitialLifestyle);
  const [matches, setMatches] = useState<Record<string, MatchResult>>({});
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const setRequirements = useCallback((action: React.SetStateAction<BuyerRequirements>) => {
    setRequirementsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('havenmatch_active_requirements', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const setLifestyle = useCallback((action: React.SetStateAction<LifestyleProfile>) => {
    setLifestyleState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('havenmatch_active_lifestyle', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  }, []);

  const refreshMatches = useCallback(async (reqsOverride?: BuyerRequirements, lifeOverride?: LifestyleProfile) => {
    setIsLoadingMatches(true);
    setMatchError(null);
    const activeReqs = reqsOverride || requirements;
    const activeLife = lifeOverride || lifestyle;
    try {
      const evaluatedMatches = await matchingService.getMatches([], activeReqs, activeLife);
      setMatches(evaluatedMatches);
      return evaluatedMatches;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate matches';
      setMatchError(message);
      console.error('[LifestyleContext] Match error:', message);
    } finally {
      setIsLoadingMatches(false);
    }
  }, [requirements, lifestyle]);

  const updatePriority = (category: LifestyleCategory, priority: PriorityLevel) => {
    setLifestyle(prev => {
      const next = {
        ...prev,
        priorities: { ...prev.priorities, [category]: priority },
      };
      return next;
    });
  };

  return (
    <LifestyleContext.Provider
      value={{
        requirements,
        setRequirements,
        lifestyle,
        setLifestyle,
        updatePriority,
        matches,
        isLoadingMatches,
        matchError,
        refreshMatches,
      }}
    >
      {children}
    </LifestyleContext.Provider>
  );
};

export const useLifestyle = () => {
  const context = useContext(LifestyleContext);
  if (!context) throw new Error('useLifestyle must be used within LifestyleProvider');
  return context;
};
