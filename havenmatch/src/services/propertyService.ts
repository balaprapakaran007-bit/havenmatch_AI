/**
 * HAVENMATCH AI — Property Service
 * Fetches and persists real properties to MongoDB Atlas via Workbench webhook / REST API.
 * Single Source of Truth: MongoDB Atlas
 */

import { callAPI } from './api';
import { Property, BuyerRequirements } from '../types';
import { isPropertyWithinBudget } from '../utils/budgetUtils';

export interface PropertyFilters {
  city?: string;
  intent?: 'BUY' | 'RENT';
  listingType?: 'BUY' | 'RENT';
  bhk?: number[];
  budgetMax?: number;
  propertyTypes?: string[];
  ownerId?: string;
  sellerId?: string;
  userEmail?: string;
  status?: string;
}

interface PropertiesListResponse {
  success: boolean;
  action: string;
  properties: Property[];
  total: number;
}

interface PropertyGetResponse {
  success: boolean;
  action: string;
  property: Property | null;
}

interface PropertyCreateResponse {
  success: boolean;
  action: string;
  property: Property;
  propertyId: string;
}

class PropertyService {
  private cache: { data: Property[]; timestamp: number; key: string } | null = null;
  private propertyCacheById = new Map<string, { data: Property; timestamp: number }>();
  private inFlightListPromise: Promise<Property[]> | null = null;
  private inFlightGetPromises = new Map<string, Promise<Property | null>>();
  private readonly CACHE_TTL_MS = 10_000; // 10 seconds for real-time reactivity

  async getProperties(requirements?: BuyerRequirements | PropertyFilters): Promise<Property[]> {
    const filters: PropertyFilters = {};
    if (requirements) {
      if ('city' in requirements && requirements.city) filters.city = requirements.city;
      if ('intent' in requirements && requirements.intent) filters.intent = requirements.intent;
      if ('bhk' in requirements && requirements.bhk) filters.bhk = requirements.bhk;
      if ('budgetMax' in requirements && requirements.budgetMax) filters.budgetMax = requirements.budgetMax;
      if ('ownerId' in requirements && (requirements as any).ownerId) filters.ownerId = (requirements as any).ownerId;
      if ('sellerId' in requirements && (requirements as any).sellerId) filters.sellerId = (requirements as any).sellerId;
      if ('userEmail' in requirements && (requirements as any).userEmail) filters.userEmail = (requirements as any).userEmail;
    }

    const cacheKey = JSON.stringify(filters);
    if (this.cache && this.cache.key === cacheKey && Date.now() - this.cache.timestamp < this.CACHE_TTL_MS) {
      return this.applyClientFilters(this.cache.data, requirements);
    }

    if (this.inFlightListPromise) {
      const allProps = await this.inFlightListPromise;
      return this.applyClientFilters(allProps, requirements);
    }

    const fetchPromise = (async () => {
      let properties: Property[] = [];
      try {
        const data = await callAPI<PropertiesListResponse>('properties/list', { filters });
        properties = data.properties || [];
      } catch (err: any) {
        console.error('[PropertyService] Failed to load properties from database:', err.message);
        if (this.cache && this.cache.key === cacheKey) {
          return this.cache.data;
        }
        properties = [];
      }

      this.cache = { data: properties, timestamp: Date.now(), key: cacheKey };
      for (const p of properties) {
        if (p.id) this.propertyCacheById.set(p.id, { data: p, timestamp: Date.now() });
        if (p.slug) this.propertyCacheById.set(p.slug, { data: p, timestamp: Date.now() });
      }

      return properties;
    })();

    this.inFlightListPromise = fetchPromise;
    try {
      const allProps = await fetchPromise;
      return this.applyClientFilters(allProps || [], requirements);
    } finally {
      this.inFlightListPromise = null;
    }
  }

  private applyClientFilters(properties: Property[], requirements?: BuyerRequirements | PropertyFilters): Property[] {
    if (!properties || !Array.isArray(properties)) return [];
    if (!requirements) return properties;
    let filtered = [...properties];

    const req = requirements as (BuyerRequirements & PropertyFilters);
    if (req.intent) {
      const targetIntent = req.intent.toUpperCase();
      filtered = filtered.filter(p => {
        const pIntent = (p.intent || (p as any).listingType || (p.price < 100000 ? 'RENT' : 'BUY')).toUpperCase();
        if (targetIntent === 'BUY') {
          return pIntent === 'BUY' || pIntent === 'SELL';
        }
        if (targetIntent === 'RENT') {
          return pIntent === 'RENT' || pIntent === 'RENT_OUT';
        }
        return true;
      });
    }

    if (req.city && req.city !== 'All Cities') {
      filtered = filtered.filter(p => p.city?.toLowerCase() === req.city?.toLowerCase());
    }
    if (req.bhk?.length) {
      filtered = filtered.filter(p => req.bhk!.some(b => b === p.bhk || (b === 4 && p.bhk >= 4)));
    }
    const userBudget = Number(req.budgetMax || (req as any).budget || (req as any).userBudget || 0);
    if (userBudget > 0) {
      filtered = filtered.filter(p => isPropertyWithinBudget(p, userBudget, req.intent));
    }

    return filtered;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    if (!id) return null;

    // Check ID-specific cache
    const idCached = this.propertyCacheById.get(id);
    if (idCached && Date.now() - idCached.timestamp < this.CACHE_TTL_MS) {
      return idCached.data;
    }

    // Check in-flight promise
    if (this.inFlightGetPromises.has(id)) {
      return this.inFlightGetPromises.get(id)!;
    }

    const fetchPromise = (async () => {
      try {
        const data = await callAPI<PropertyGetResponse>('properties/get', { propertyId: id });
        if (data?.property) {
          this.propertyCacheById.set(id, { data: data.property, timestamp: Date.now() });
          if (data.property.id) this.propertyCacheById.set(data.property.id, { data: data.property, timestamp: Date.now() });
          if (data.property.slug) this.propertyCacheById.set(data.property.slug, { data: data.property, timestamp: Date.now() });
          return data.property;
        }
      } catch (e: any) {
        console.warn(`[PropertyService] properties/get failed for ${id}:`, e.message);
      }

      const all = await this.getProperties();
      const match = all.find(p => p.id === id || p.slug === id) || null;
      if (match) {
        this.propertyCacheById.set(id, { data: match, timestamp: Date.now() });
      }
      return match;
    })().finally(() => {
      this.inFlightGetPromises.delete(id);
    });

    this.inFlightGetPromises.set(id, fetchPromise);
    return fetchPromise;
  }

  invalidateCache() {
    this.cache = null;
    this.propertyCacheById.clear();
    this.inFlightListPromise = null;
    this.inFlightGetPromises.clear();
  }

  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    this.invalidateCache();
    const id = propertyData.id || `prop-${Date.now()}`;
    const intent = propertyData.intent || (propertyData as any).listingType || 'BUY';

    const fullProp: Partial<Property> = {
      ...propertyData,
      id,
      intent,
      listingType: intent as any,
      status: 'ACTIVE' as any,
      city: propertyData.city || 'Coimbatore',
      locality: propertyData.locality || 'Peelamedu',
      pincode: propertyData.pincode || '641004',
      fullAddress: propertyData.fullAddress || `${propertyData.locality || 'Peelamedu'}, ${propertyData.city || 'Coimbatore'}`,
      coordinates: propertyData.coordinates || { lat: 11.0255, lng: 77.0028 },
      price: propertyData.price || 6500000,
      priceDisplay: propertyData.priceDisplay || (intent === 'RENT' ? `₹${(propertyData.price || 25000).toLocaleString()}/mo` : `₹${((propertyData.price || 6500000) / 100000).toFixed(0)} Lakhs`),
      pricePerSqFt: propertyData.pricePerSqFt || `₹${Math.round((propertyData.price || 6500000) / (propertyData.builtUpAreaSqFt || 1200))}/sq.ft`,
      maintenanceMonthly: propertyData.maintenanceMonthly || '₹2,500/month',
      bhk: propertyData.bhk || 2,
      bathrooms: propertyData.bathrooms || 2,
      balconies: propertyData.balconies || 1,
      builtUpAreaSqFt: propertyData.builtUpAreaSqFt || 1200,
      carpetAreaSqFt: propertyData.carpetAreaSqFt || 1000,
      floor: propertyData.floor || 2,
      totalFloors: propertyData.totalFloors || 5,
      facing: propertyData.facing || 'East',
      furnishing: propertyData.furnishing || 'Semi-Furnished',
      propertyAgeYears: propertyData.propertyAgeYears || 1,
      possession: propertyData.possession || 'Ready to Move',
      reraApproved: propertyData.reraApproved ?? true,
      vastuCompliant: propertyData.vastuCompliant ?? true,
      parking: propertyData.parking || '1 Covered Stilt',
      powerBackup: propertyData.powerBackup || '100% Full Backup',
      waterSupply: propertyData.waterSupply || 'Corporation + Siruvani',
      gatedCommunity: propertyData.gatedCommunity ?? true,
      security24x7: propertyData.security24x7 ?? true,
      noiseLevel: propertyData.noiseLevel || 'LOW',
      safety: propertyData.safety || 'Gated & Guarded',
      waterAvailability: propertyData.waterAvailability || '24 Hours Supply',
      electricityAvailability: propertyData.electricityAvailability || '24/7 No Powercuts',
      petFriendly: propertyData.petFriendly ?? true,
      amenities: propertyData.amenities || ['Power Backup', '24/7 Security', 'Covered Parking'],
      images: propertyData.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      featured: propertyData.featured ?? true
    };

    const data = await callAPI<PropertyCreateResponse>('properties/create', { propertyData: fullProp });
    if (!data?.success || !data?.property) {
      throw new Error((data as any)?.error || 'Failed to create property in database');
    }

    this.invalidateCache();
    if (data.property.id) {
      this.propertyCacheById.set(data.property.id, { data: data.property, timestamp: Date.now() });
    }
    return data.property;
  }

  async updateProperty(propertyData: Partial<Property>, userId?: string, userEmail?: string): Promise<Property> {
    this.invalidateCache();
    const targetId = propertyData.id || propertyData.slug;
    if (!targetId) throw new Error('Property ID is required to update property.');

    const res = await callAPI<{ success: boolean; property: Property }>('properties/update', {
      propertyId: targetId,
      propertyData,
      userId,
      userEmail
    });

    if (!res?.success || !res?.property) {
      throw new Error((res as any)?.error || 'Failed to update property');
    }

    this.invalidateCache();
    if (res.property.id) {
      this.propertyCacheById.set(res.property.id, { data: res.property, timestamp: Date.now() });
    }
    return res.property;
  }

  async deleteProperty(propertyId: string, userId?: string, userEmail?: string): Promise<{ success: boolean }> {
    this.invalidateCache();

    const res = await callAPI<{ success: boolean; message: string }>('properties/delete', {
      propertyId,
      userId,
      userEmail
    });

    if (!res?.success) {
      throw new Error((res as any)?.error || 'Failed to delete property');
    }

    this.invalidateCache();
    return { success: true };
  }
}

export const propertyService = new PropertyService();
