/**
 * HAVENMATCH AI — Property Service
 * Fetches real properties from MongoDB Atlas via SNS Workbench webhook.
 * Action: "properties/list" | "properties/get" | "properties/create"
 */

import { callAPI, APIError } from './api';
import { Property, BuyerRequirements } from '../types';

export interface PropertyFilters {
  city?: string;
  intent?: 'BUY' | 'RENT';
  bhk?: number[];
  budgetMax?: number;
  propertyTypes?: string[];
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

const LOCAL_PROPERTIES_KEY = 'havenmatch_user_properties';

function getLocalProperties(): Property[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProperty(prop: Property) {
  try {
    const existing = getLocalProperties();
    const updated = [prop, ...existing.filter(p => p.id !== prop.id)];
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

function deleteLocalProperty(propertyId: string) {
  try {
    const existing = getLocalProperties();
    const updated = existing.filter(p => p.id !== propertyId && p.slug !== propertyId);
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

class PropertyService {
  private cache: { data: Property[]; timestamp: number } | null = null;
  private propertyCacheById = new Map<string, { data: Property; timestamp: number }>();
  private inFlightListPromise: Promise<Property[]> | null = null;
  private inFlightGetPromises = new Map<string, Promise<Property | null>>();
  private readonly CACHE_TTL_MS = 60_000; // 1 minute

  async getProperties(requirements?: BuyerRequirements | PropertyFilters): Promise<Property[]> {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL_MS) {
      return this.applyClientFilters(this.cache.data, requirements);
    }

    // Reuse in-flight list promise if already running
    if (this.inFlightListPromise) {
      const allProps = await this.inFlightListPromise;
      return this.applyClientFilters(allProps, requirements);
    }

    const filters: PropertyFilters = {};
    if (requirements) {
      if ('city' in requirements) filters.city = (requirements as BuyerRequirements).city;
      if ('intent' in requirements) filters.intent = (requirements as BuyerRequirements).intent;
      if ('bhk' in requirements) filters.bhk = (requirements as BuyerRequirements).bhk;
      if ('budgetMax' in requirements) filters.budgetMax = (requirements as BuyerRequirements).budgetMax;
    }

    this.inFlightListPromise = (async () => {
      let properties: Property[] = [];
      try {
        const data = await callAPI<PropertiesListResponse>('properties/list', { filters });
        properties = data.properties || [];
      } catch {
        // If network fails, use local properties
        properties = getLocalProperties();
      }

      // Merge any user-added local properties
      const localProps = getLocalProperties();
      for (const lp of localProps) {
        if (!properties.some(p => p.id === lp.id)) {
          properties.unshift(lp);
        }
      }

      // Populate both list cache and individual property ID cache
      this.cache = { data: properties, timestamp: Date.now() };
      for (const p of properties) {
        if (p.id) this.propertyCacheById.set(p.id, { data: p, timestamp: Date.now() });
        if (p.slug) this.propertyCacheById.set(p.slug, { data: p, timestamp: Date.now() });
      }

      return properties;
    })().finally(() => {
      this.inFlightListPromise = null;
    });

    const allProps = await this.inFlightListPromise;
    return this.applyClientFilters(allProps, requirements);
  }

  private applyClientFilters(properties: Property[], requirements?: BuyerRequirements | PropertyFilters): Property[] {
    if (!requirements) return properties;
    let filtered = [...properties];

    const req = requirements as (BuyerRequirements & PropertyFilters);
    if (req.intent) {
      const targetIntent = req.intent.toUpperCase();
      filtered = filtered.filter(p => {
        const pIntent = (p.intent || p.listingType || (p.price < 100000 ? 'RENT' : 'BUY')).toUpperCase();
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
      filtered = filtered.filter(p => p.city?.toLowerCase() === req.city.toLowerCase());
    }
    if (req.bhk?.length) {
      filtered = filtered.filter(p => req.bhk.some(b => b === p.bhk || (b === 4 && p.bhk >= 4)));
    }
    if (req.budgetMax && req.budgetMax > 0) {
      filtered = filtered.filter(p => p.price <= req.budgetMax);
    }

    return filtered;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    if (!id) return null;

    // 1. Check ID-specific cache
    const idCached = this.propertyCacheById.get(id);
    if (idCached && Date.now() - idCached.timestamp < this.CACHE_TTL_MS) {
      return idCached.data;
    }

    // 2. Check full list cache
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL_MS) {
      const cached = this.cache.data.find(p => p.id === id || p.slug === id);
      if (cached) {
        this.propertyCacheById.set(id, { data: cached, timestamp: Date.now() });
        return cached;
      }
    }

    // 3. Check local user created properties
    const localMatch = getLocalProperties().find(p => p.id === id || p.slug === id);
    if (localMatch) {
      this.propertyCacheById.set(id, { data: localMatch, timestamp: Date.now() });
      return localMatch;
    }

    // 4. Reuse in-flight promise for this ID
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
      } catch {
        // Fallback to getProperties if get single fails
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
    const fullProp: Property = {
      id,
      title: propertyData.title || 'New Property Listing',
      slug: propertyData.slug || 'new-property',
      tagline: propertyData.tagline || '',
      description: propertyData.description || '',
      propertyType: propertyData.propertyType || 'Apartment',
      intent: propertyData.intent || 'BUY',
      city: propertyData.city || 'Coimbatore',
      locality: propertyData.locality || 'Peelamedu',
      pincode: propertyData.pincode || '641004',
      fullAddress: propertyData.fullAddress || `${propertyData.locality || 'Peelamedu'}, ${propertyData.city || 'Coimbatore'}`,
      coordinates: propertyData.coordinates || { lat: 11.0255, lng: 77.0028 },
      price: propertyData.price || 6500000,
      priceDisplay: propertyData.priceDisplay || (propertyData.intent === 'RENT' ? `₹${(propertyData.price || 25000).toLocaleString()}/mo` : `₹${((propertyData.price || 6500000) / 100000).toFixed(0)} Lakhs`),
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
      reraId: propertyData.reraId || 'TN/11/Building/0244/2024',
      vastuCompliant: propertyData.vastuCompliant ?? true,
      parking: propertyData.parking || '1 Covered Stilt',
      powerBackup: propertyData.powerBackup || '100% Full',
      waterSupply: propertyData.waterSupply || 'Corporation + Siruvani',
      gatedCommunity: propertyData.gatedCommunity ?? true,
      security24x7: propertyData.security24x7 ?? true,
      noiseLevel: propertyData.noiseLevel || 'LOW',
      safety: propertyData.safety || 'Gated & Guarded',
      waterAvailability: propertyData.waterAvailability || '24 Hours Supply',
      electricityAvailability: propertyData.electricityAvailability || '24/7 No Powercuts',
      petFriendly: propertyData.petFriendly ?? true,
      suitableFor: propertyData.suitableFor || ['Families', 'Working Professionals'],
      rules: propertyData.rules || '',
      additionalDetails: propertyData.additionalDetails || '',
      nearbyPlaces: propertyData.nearbyPlaces || [],
      amenities: propertyData.amenities || ['Power Backup', '24/7 Security', 'Covered Parking'],
      images: propertyData.images || ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      featured: propertyData.featured ?? true,
      seller: propertyData.seller || {
        id: 'S001',
        name: 'Property Owner',
        role: 'Individual Owner',
        phone: '+91 98422 11223',
        verified: true,
        responseRate: '98%'
      }
    };

    // Save locally first
    saveLocalProperty(fullProp);

    // Sync to MongoDB Atlas backend
    try {
      const data = await callAPI<PropertyCreateResponse>('properties/create', { propertyData: fullProp });
      if (data?.property) {
        saveLocalProperty(data.property);
        return data.property;
      }
    } catch (e: any) {
      console.warn('[PropertyService] Backend sync deferred, saved locally:', e.message);
    }

    return fullProp;
  }

  async updateProperty(propertyData: Partial<Property>, userId?: string, userEmail?: string): Promise<Property> {
    this.invalidateCache();
    const targetId = propertyData.id || propertyData.slug;
    if (!targetId) throw new Error('Property ID is required to update property.');

    // Save locally
    if (propertyData.id) {
      const existingLocal = getLocalProperties().find(p => p.id === propertyData.id);
      if (existingLocal) {
        saveLocalProperty({ ...existingLocal, ...propertyData } as Property);
      }
    }

    // Call backend API
    const res = await callAPI<{ success: boolean; property: Property }>('properties/update', {
      propertyId: targetId,
      propertyData,
      userId,
      userEmail
    });

    if (res?.property) {
      saveLocalProperty(res.property);
      return res.property;
    }

    return propertyData as Property;
  }

  async deleteProperty(propertyId: string, userId?: string, userEmail?: string): Promise<{ success: boolean }> {
    this.invalidateCache();
    deleteLocalProperty(propertyId);

    const res = await callAPI<{ success: boolean; message: string }>('properties/delete', {
      propertyId,
      userId,
      userEmail
    });

    return { success: res?.success ?? true };
  }
}

export const propertyService = new PropertyService();
