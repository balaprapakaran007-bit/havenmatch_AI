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
  refreshMatches: () => Promise<void>;
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
  workplaceLocation: 'TIDEL Park / Avinashi Road',
  maxCommuteMins: 20,
  hasElderlyFamily: true,
  hasSchoolGoingKids: false,
  hasPets: false,
  atmospherePreference: 'Peaceful & Quiet',
};

const LifestyleContext = createContext<LifestyleContextType | undefined>(undefined);

export const LifestyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requirements, setRequirements] = useState<BuyerRequirements>(DEFAULT_REQUIREMENTS);
  const [lifestyle, setLifestyle] = useState<LifestyleProfile>(DEFAULT_LIFESTYLE);
  const [matches, setMatches] = useState<Record<string, MatchResult>>({});
  const [isLoadingMatches, setIsLoadingMatches] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const refreshMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    setMatchError(null);
    try {
      const evaluatedMatches = await matchingService.getMatches([], requirements, lifestyle);
      setMatches(evaluatedMatches);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate matches';
      setMatchError(message);
      console.error('[LifestyleContext] Match error:', message);
    } finally {
      setIsLoadingMatches(false);
    }
  }, [requirements, lifestyle]);

  const updatePriority = (category: LifestyleCategory, priority: PriorityLevel) => {
    setLifestyle(prev => ({
      ...prev,
      priorities: { ...prev.priorities, [category]: priority },
    }));
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
