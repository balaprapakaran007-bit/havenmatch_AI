/**
 * HAVENMATCH AI — Location Service
 * Fetches real nearby POIs (Points of Interest) from SNS Workbench
 * which computes them using OpenStreetMap / Haversine for a given property.
 */

import { callAPI } from './api';
import { NearbyPlace, POICategory } from '../types';

interface LocationPOIResponse {
  success: boolean;
  action: string;
  propertyId: string;
  nearbyPlaces: NearbyPlace[];
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  source?: string;
}

export interface DiscoverPlacesResult {
  coordinates: { latitude: number; longitude: number };
  totalPlaces: number;
  nearbyPlaces: NearbyPlace[];
  categorized?: Record<string, NearbyPlace[]>;
}

class LocationService {
  private cache = new Map<string, { data: NearbyPlace[]; timestamp: number }>();
  private inFlightPromises = new Map<string, Promise<NearbyPlace[]>>();
  private readonly CACHE_TTL_MS = 5 * 60_000; // 5 minutes

  async getNearbyPlaces(propertyId: string): Promise<NearbyPlace[]> {
    if (!propertyId) return [];

    const cached = this.cache.get(propertyId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (this.inFlightPromises.has(propertyId)) {
      return this.inFlightPromises.get(propertyId)!;
    }

    const fetchPromise = (async () => {
      try {
        const data = await callAPI<LocationPOIResponse>('location/poi', { propertyId });
        const places = data.nearbyPlaces || [];
        this.cache.set(propertyId, { data: places, timestamp: Date.now() });
        return places;
      } catch (err) {
        // If error, return whatever is in cache if available, or empty array
        const fallback = this.cache.get(propertyId);
        return fallback ? fallback.data : [];
      }
    })().finally(() => {
      this.inFlightPromises.delete(propertyId);
    });

    this.inFlightPromises.set(propertyId, fetchPromise);
    return fetchPromise;
  }

  /**
   * Geocode a property address using real Nominatim API via backend
   */
  async geocodeLocation(details: {
    address?: string;
    locality?: string;
    city?: string;
    pincode?: string;
    landmark?: string;
  }): Promise<GeocodeResult | null> {
    try {
      const res = await callAPI<{
        success: boolean;
        coordinates?: { latitude?: number; longitude?: number; lat?: number; lng?: number };
        latitude?: number;
        longitude?: number;
        displayName?: string;
        formattedAddress?: string;
        source?: string;
      }>('location/geocode', details);

      if (res) {
        const lat = res.latitude || res.coordinates?.latitude || res.coordinates?.lat;
        const lng = res.longitude || res.coordinates?.longitude || res.coordinates?.lng;
        if (lat && lng) {
          return {
            latitude: Number(lat),
            longitude: Number(lng),
            formattedAddress: res.displayName || res.formattedAddress,
            source: res.source || 'OpenStreetMap'
          };
        }
      }
      return null;
    } catch (e) {
      console.error('Geocoding error:', e);
      return null;
    }
  }

  /**
   * Discover real nearby places around coordinates across 12 categories
   */
  async discoverPlaces(params: {
    latitude: number;
    longitude: number;
    propertyType?: string;
    radiusKm?: number;
  }): Promise<DiscoverPlacesResult | null> {
    try {
      const res = await callAPI<{
        success: boolean;
        coordinates?: { latitude?: number; longitude?: number; lat?: number; lng?: number };
        totalPlaces?: number;
        count?: number;
        nearbyPlaces?: NearbyPlace[];
        categorized?: Record<string, NearbyPlace[]>;
      }>('location/discover', params);

      if (res && res.nearbyPlaces) {
        const places = res.nearbyPlaces || [];
        const lat = res.coordinates?.latitude || res.coordinates?.lat || params.latitude;
        const lng = res.coordinates?.longitude || res.coordinates?.lng || params.longitude;
        return {
          coordinates: { latitude: Number(lat), longitude: Number(lng) },
          totalPlaces: res.count || res.totalPlaces || places.length,
          nearbyPlaces: places,
          categorized: res.categorized
        };
      }
      return null;
    } catch (e) {
      console.error('Discover places error:', e);
      return null;
    }
  }

  /**
   * Filter nearby places by category
   */
  filterByCategory(places: NearbyPlace[], category: POICategory | 'all'): NearbyPlace[] {
    if (category === 'all') return places;
    return places.filter(p => p.category === category);
  }

  /**
   * Get top N closest places for a given category
   */
  getClosest(places: NearbyPlace[], category: POICategory, limit = 3): NearbyPlace[] {
    return places
      .filter(p => p.category === category)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }
}

export const locationService = new LocationService();
