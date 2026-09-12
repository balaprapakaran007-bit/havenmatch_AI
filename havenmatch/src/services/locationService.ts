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
