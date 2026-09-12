/**
 * HAVENMATCH AI — Seller Service
 * Manages seller listings and reverse buyer matching.
 */

import { callAPI } from './api';
import { Property } from '../types';

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

interface SellerListingsResponse {
  success: boolean;
  action: string;
  listings: SellerListing[];
  total: number;
}

interface CompatibleBuyersResponse {
  success: boolean;
  action: string;
  buyers: CompatibleBuyer[];
  total: number;
}

class SellerService {
  async getListings(sellerId: string): Promise<SellerListing[]> {
    const data = await callAPI<SellerListingsResponse>('seller/listings', { sellerId });
    return data.listings || [];
  }

  async getCompatibleBuyers(sellerId: string, propertyId?: string): Promise<CompatibleBuyer[]> {
    try {
      const data = await callAPI<CompatibleBuyersResponse>('seller/compatible-buyers', {
        sellerId,
        propertyId,
      });
      return data.buyers || [];
    } catch {
      // If not yet supported, return empty
      return [];
    }
  }
}

export const sellerService = new SellerService();
