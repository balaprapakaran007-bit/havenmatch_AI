/**
 * HAVENMATCH AI — LOCATION CONTROLLER
 * Endpoints for Real Geocoding & Automatic Location Intelligence POI Discovery.
 */

import { geocodeAddress, discoverNearbyPlaces } from '../utils/locationUtils.js';

/**
 * POST /api/location/geocode
 * Converts address, city, locality, pincode, landmark into verified coordinates.
 */
export async function geocodeLocation(req, res, next) {
  try {
    const payload = req.method === 'GET' ? req.query : req.body;
    const { address, locality, city, pincode, landmark } = payload || {};

    if (!city && !locality && !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a city, locality, or address to geocode.'
      });
    }

    const geoResult = await geocodeAddress({ address, locality, city, pincode, landmark });

    if (!geoResult) {
      return res.json({
        success: false,
        message: 'Unable to determine this location. Please verify the address.'
      });
    }

    return res.json({
      success: true,
      coordinates: {
        lat: geoResult.latitude,
        lng: geoResult.longitude
      },
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      displayName: geoResult.displayName,
      placeId: geoResult.placeId
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/location/discover
 * Automatically discovers genuine nearby facilities around coordinates or an address.
 */
export async function discoverLocationPlaces(req, res, next) {
  try {
    const payload = req.method === 'GET' ? req.query : req.body;
    let lat = parseFloat(payload?.latitude || payload?.lat);
    let lng = parseFloat(payload?.longitude || payload?.lng);
    const radiusKm = parseFloat(payload?.radiusKm || payload?.radius || 5);

    // If coordinates not directly provided, geocode the address
    if (isNaN(lat) || isNaN(lng)) {
      const geoResult = await geocodeAddress({
        address: payload?.address || payload?.fullAddress,
        locality: payload?.locality,
        city: payload?.city,
        pincode: payload?.pincode,
        landmark: payload?.landmark
      });

      if (!geoResult) {
        return res.json({
          success: false,
          message: 'Unable to identify this property location. Please verify the address.',
          nearbyPlaces: []
        });
      }

      lat = geoResult.latitude;
      lng = geoResult.longitude;
    }

    const discovery = await discoverNearbyPlaces({
      latitude: lat,
      longitude: lng,
      radiusKm
    });

    return res.json({
      success: true,
      coordinates: { lat, lng },
      latitude: lat,
      longitude: lng,
      count: discovery.nearbyPlaces?.length || 0,
      nearbyPlaces: discovery.nearbyPlaces || []
    });
  } catch (err) {
    next(err);
  }
}
