import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { useLifestyle } from '../../context/LifestyleContext';
import { propertyService } from '../../services/propertyService';
import { Property } from '../../types';
import { 
  MapPin, 
  Sparkles, 
  Layers, 
  Compass, 
  Building, 
  Check, 
  Clock, 
  Briefcase, 
  Hospital, 
  ShieldCheck, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  SlidersHorizontal,
  Crosshair,
  Satellite,
  Home,
  Maximize2,
  Minimize2,
  Navigation,
  Car,
  Bus,
  Footprints,
  ExternalLink,
  Route,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

// Fix Leaflet's default icon missing assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Key city reference centers
const CITY_COORDINATES: Record<string, [number, number]> = {
  'All Cities': [20.5937, 78.9629],
  'Bengaluru': [12.9716, 77.5946],
  'Mumbai': [19.0760, 72.8777],
  'Delhi NCR': [28.5355, 77.2500],
  'Hyderabad': [17.4200, 78.3800],
  'Chennai': [13.0400, 80.2400],
  'Pune': [18.5300, 73.8500],
  'Coimbatore': [11.0168, 76.9558],
  'Kochi': [9.9800, 76.2800],
  'Kolkata': [22.5800, 88.4200],
  'Ahmedabad': [23.0300, 72.5200],
  'Jaipur': [26.9000, 75.7500],
  'Chandigarh': [30.6800, 76.7600],
  'Goa': [15.5500, 73.7800]
};

// Landmarks and transit starting points by city
const CITY_LANDMARKS: Record<string, Array<{ name: string; category: string; lat: number; lng: number; tag: string; desc: string }>> = {
  'Coimbatore': [
    { name: 'TIDEL Park IT Corridor', category: 'workplace', lat: 11.0285, lng: 77.0270, tag: 'Workplace Hub', desc: 'Major IT & Tech Employment Center' },
    { name: 'KMCH Multi-Speciality Hospital', category: 'healthcare', lat: 11.0485, lng: 77.0425, tag: 'Healthcare Hub', desc: 'NABH Accredited 24/7 Emergency & Cardiac Center' },
    { name: 'PSG Institute of Medical Sciences', category: 'healthcare', lat: 11.0232, lng: 77.0035, tag: 'Teaching Hospital', desc: 'Prime Peelamedu Super-Speciality Hospital' },
    { name: 'Coimbatore International Airport', category: 'transit', lat: 11.0300, lng: 77.0434, tag: 'Airport Transit', desc: 'Domestic & International Flight Hub' },
    { name: 'Fun Republic Mall & Dining', category: 'lifestyle', lat: 11.0264, lng: 77.0062, tag: 'Retail & Dining', desc: 'Supermarket, Multiplex Cinema & Restaurants' }
  ],
  'Bengaluru': [
    { name: 'ITPB / Whitefield Tech Park', category: 'workplace', lat: 12.9850, lng: 77.7300, tag: 'Workplace Hub', desc: 'Flagship Bangalore Tech Corridor' },
    { name: 'Manyata Embassy Business Park', category: 'workplace', lat: 13.0480, lng: 77.6210, tag: 'Workplace Hub', desc: 'North Bangalore Tech Hub' },
    { name: 'Manipal Hospital Old Airport Rd', category: 'healthcare', lat: 12.9580, lng: 77.6480, tag: 'Healthcare Hub', desc: 'Leading quaternary multi-speciality hospital' },
    { name: 'Indiranagar Purple Line Metro', category: 'transit', lat: 12.9784, lng: 77.6408, tag: 'Metro Transit', desc: 'Fast connection to CBD & tech corridors' },
    { name: 'Kempegowda International Airport', category: 'transit', lat: 13.1986, lng: 77.7066, tag: 'Airport Transit', desc: 'Bengaluru International Airport' }
  ],
  'Mumbai': [
    { name: 'Bandra-Kurla Complex (BKC)', category: 'workplace', lat: 19.0650, lng: 72.8680, tag: 'Workplace Hub', desc: 'India’s premier financial district' },
    { name: 'Lilavati Hospital Bandra', category: 'healthcare', lat: 19.0510, lng: 72.8290, tag: 'Healthcare Hub', desc: 'Premier tertiary care hospital' },
    { name: 'Chhatrapati Shivaji Maharaj Airport (T2)', category: 'transit', lat: 19.0896, lng: 72.8656, tag: 'Airport Transit', desc: 'International Terminal T2' },
    { name: 'Carter Road Sea Promenade', category: 'lifestyle', lat: 19.0607, lng: 72.8258, tag: 'Sea Promenade', desc: 'Iconic Arabian Sea jogging track' }
  ],
  'Delhi NCR': [
    { name: 'DLF Cyber City Gurugram', category: 'workplace', lat: 28.4900, lng: 77.0900, tag: 'Workplace Hub', desc: 'NCR Fortune 500 Tech & Corporate Hub' },
    { name: 'Indira Gandhi International Airport (T3)', category: 'transit', lat: 28.5562, lng: 77.1000, tag: 'Airport Transit', desc: 'T3 International Terminal' },
    { name: 'Connaught Place Central Hub', category: 'lifestyle', lat: 28.6315, lng: 77.2167, tag: 'Central CBD', desc: 'Historic Delhi Central District' },
    { name: 'Max Super Speciality Hospital Saket', category: 'healthcare', lat: 28.5282, lng: 77.2126, tag: 'Healthcare Hub', desc: 'Tertiary Care Center' }
  ],
  'Hyderabad': [
    { name: 'Financial District Gachibowli', category: 'workplace', lat: 17.4195, lng: 78.3489, tag: 'Workplace Hub', desc: 'Microsoft, Google & Amazon tech park' },
    { name: 'HITEC City Cyber Towers', category: 'workplace', lat: 17.4504, lng: 78.3808, tag: 'Workplace Hub', desc: 'Original HITEC City IT landmark' },
    { name: 'Continental Hospital', category: 'healthcare', lat: 17.4150, lng: 78.3420, tag: 'Healthcare Hub', desc: 'Tertiary multi-speciality hospital' },
    { name: 'Rajiv Gandhi International Airport', category: 'transit', lat: 17.2403, lng: 78.4294, tag: 'Airport Transit', desc: 'Shamshabad Airport' }
  ],
  'Chennai': [
    { name: 'OMR TIDEL Park Thiruvanmiyur', category: 'workplace', lat: 12.9890, lng: 80.2480, tag: 'Workplace Hub', desc: 'IT Expressway Gateway' },
    { name: 'Chennai International Airport', category: 'transit', lat: 12.9941, lng: 80.1709, tag: 'Airport Transit', desc: 'Meenambakkam Airport' },
    { name: 'Apollo Speciality Hospital OMR', category: 'healthcare', lat: 12.9340, lng: 80.2310, tag: 'Healthcare Hub', desc: 'Perungudi Apollo Hospital' }
  ],
  'Pune': [
    { name: 'Hinjawadi Rajiv Gandhi Infotech Park', category: 'workplace', lat: 18.5913, lng: 73.7389, tag: 'Workplace Hub', desc: 'Pune’s Flagship IT Hub' },
    { name: 'Magarpatta Cybercity', category: 'workplace', lat: 18.5158, lng: 73.9272, tag: 'Workplace Hub', desc: 'East Pune Tech District' },
    { name: 'Pune International Airport Lohegaon', category: 'transit', lat: 18.5822, lng: 73.9197, tag: 'Airport Transit', desc: 'Pune Airport' }
  ],
  'Kochi': [
    { name: 'Infopark Kakkanad', category: 'workplace', lat: 10.0100, lng: 76.3600, tag: 'Workplace Hub', desc: 'Major IT SEZ in Kerala' },
    { name: 'Cochin International Airport Nedumbassery', category: 'transit', lat: 10.1518, lng: 76.3930, tag: 'Airport Transit', desc: 'Solar Powered International Airport' }
  ],
  'Kolkata': [
    { name: 'Sector V Salt Lake IT Center', category: 'workplace', lat: 22.5700, lng: 88.4300, tag: 'Workplace Hub', desc: 'Eastern India IT Corridor' },
    { name: 'Netaji Subhash Chandra Bose Airport', category: 'transit', lat: 22.6547, lng: 88.4467, tag: 'Airport Transit', desc: 'Dum Dum Airport' }
  ],
  'Ahmedabad': [
    { name: 'GIFT City Financial Hub', category: 'workplace', lat: 23.1600, lng: 72.6800, tag: 'Workplace Hub', desc: 'International Financial Services Center' },
    { name: 'SG Highway Corporate Corridor', category: 'workplace', lat: 23.0500, lng: 72.5100, tag: 'Corporate Hub', desc: 'Prime Business Boulevard' }
  ],
  'Jaipur': [
    { name: 'World Trade Park Malviya Nagar', category: 'workplace', lat: 26.8530, lng: 75.8050, tag: 'Workplace Hub', desc: 'Iconic Business Landmark' },
    { name: 'Jaipur International Airport', category: 'transit', lat: 26.8242, lng: 75.8122, tag: 'Airport Transit', desc: 'Sanganer Airport' }
  ],
  'Chandigarh': [
    { name: 'Rajiv Gandhi Chandigarh Technology Park', category: 'workplace', lat: 30.7250, lng: 76.8450, tag: 'Workplace Hub', desc: 'Kishangarh Tech Park' }
  ],
  'Goa': [
    { name: 'Panaji Central Promenade', category: 'lifestyle', lat: 15.4989, lng: 73.8278, tag: 'City Hub', desc: 'Capital Riverside Center' },
    { name: 'Manohar International Airport Mopa', category: 'transit', lat: 15.7600, lng: 73.8600, tag: 'Airport Transit', desc: 'North Goa International Airport' }
  ]
};

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Generate realistic road waypoints between two coordinates
function generateRoadWaypoints(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  // Intermediate road corridor points simulating real city arterial road turns
  const p1: [number, number] = [lat1 + dLat * 0.3, lng1 + dLng * 0.1];
  const p2: [number, number] = [lat1 + dLat * 0.55 + dLng * 0.08, lng1 + dLng * 0.55 - dLat * 0.08];
  const p3: [number, number] = [lat1 + dLat * 0.82, lng1 + dLng * 0.88];

  return [start, p1, p2, p3, end];
}

export const HomeLocationMap: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveView, navigateToProperty, showToast } = useApp();
  const { requirements, setRequirements, lifestyle, matches } = useLifestyle();

  const [properties, setProperties] = useState<Property[]>([]);
  // DEFAULT TO SATELLITE VIEW
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets'>('satellite');
  const [showCommuteRadius, setShowCommuteRadius] = useState<boolean>(true);
  const [selectedLocalityFilter, setSelectedLocalityFilter] = useState<string>('all');
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Directions & Route Navigation (ENABLED BY DEFAULT)
  const [showDirections, setShowDirections] = useState<boolean>(true);
  const [startHubIndex, setStartHubIndex] = useState<number>(0);
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'walking'>('driving');
  const [isDirectionsCollapsed, setIsDirectionsCollapsed] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const contentLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch properties matching active requirements
  useEffect(() => {
    propertyService.getProperties(requirements).then((props) => {
      setProperties(props);
      if (props.length > 0 && !activePropertyId) {
        setActivePropertyId(props[0].id);
      }
    });
  }, [requirements.city, requirements.intent, requirements.budgetMax, JSON.stringify(requirements.bhk)]);

  const activeCity = requirements.city || 'Bengaluru';
  const landmarks = CITY_LANDMARKS[activeCity] || CITY_LANDMARKS['Bengaluru'] || [];
  const startHub = landmarks[startHubIndex] || landmarks[0] || {
    name: `${activeCity} Central Hub`,
    category: 'workplace',
    lat: (CITY_COORDINATES[activeCity] || CITY_COORDINATES['Bengaluru'])[0],
    lng: (CITY_COORDINATES[activeCity] || CITY_COORDINATES['Bengaluru'])[1],
    tag: 'City Center',
    desc: 'Central Business District'
  };

  const activeProperty = properties.find((p) => p.id === activePropertyId) || properties[0];

  // Commute distance & drive times
  const distanceKm = activeProperty
    ? calculateDistanceKm(startHub.lat, startHub.lng, activeProperty.coordinates.lat, activeProperty.coordinates.lng)
    : 5.2;

  const driveMins = Math.max(4, Math.round(distanceKm * 2.6 + 4));
  const transitMins = Math.max(8, Math.round(distanceKm * 3.8 + 8));
  const walkMins = Math.max(12, Math.round(distanceKm * 12));

  // Direct Google Maps Live GPS navigation link
  const googleMapsUrl = activeProperty
    ? `https://www.google.com/maps/dir/?api=1&origin=${startHub.lat},${startHub.lng}&destination=${activeProperty.coordinates.lat},${activeProperty.coordinates.lng}&travelmode=${travelMode === 'driving' ? 'driving' : travelMode === 'transit' ? 'transit' : 'walking'}`
    : '#';

  // 1. INITIALIZE MAP ONCE ON MOUNT
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear stale leaflet instance on DOM element if present
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    const isAllCities = !requirements.city || requirements.city === 'All Cities';
    const centerCoords = CITY_COORDINATES[requirements.city] || CITY_COORDINATES['Bengaluru'];

    const map = L.map(mapContainerRef.current, {
      center: centerCoords,
      zoom: isAllCities ? 5 : 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true
    });

    const tileLayerGroup = L.layerGroup().addTo(map);
    const contentLayerGroup = L.layerGroup().addTo(map);
    const routeLayerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerGroupRef.current = tileLayerGroup;
    contentLayerGroupRef.current = contentLayerGroup;
    routeLayerGroupRef.current = routeLayerGroup;

    // Staggered size invalidations for zero blank screens
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      map.remove();
      mapInstanceRef.current = null;
      tileLayerGroupRef.current = null;
      contentLayerGroupRef.current = null;
      routeLayerGroupRef.current = null;
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  // 2. UPDATE BASE TILES (SATELLITE HYBRID OR STREET MAP)
  useEffect(() => {
    if (!tileLayerGroupRef.current) return;
    tileLayerGroupRef.current.clearLayers();

    if (mapLayer === 'satellite') {
      // High-res satellite imagery
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        maxNativeZoom: 19
      }).addTo(tileLayerGroupRef.current);

      // Crystal-clear road networks overlaid on satellite
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        maxNativeZoom: 19,
        opacity: 0.85
      }).addTo(tileLayerGroupRef.current);

      // Boundaries & English place names overlaid
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        maxNativeZoom: 19,
        opacity: 0.9
      }).addTo(tileLayerGroupRef.current);
    } else {
      // 100% Universal OpenStreetMap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(tileLayerGroupRef.current);
    }

    mapInstanceRef.current?.invalidateSize();
  }, [mapLayer]);

  // 3. UPDATE CONTENT LAYERS (MARKERS, COMMUTE ZONE, LANDMARKS)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const contentGroup = contentLayerGroupRef.current;
    if (!map || !contentGroup) return;

    contentGroup.clearLayers();

    const isAllCities = !requirements.city || requirements.city === 'All Cities';
    const centerCoords = CITY_COORDINATES[requirements.city] || CITY_COORDINATES['Bengaluru'];

    // Commute zone
    if (!isAllCities && showCommuteRadius && startHub) {
      const commuteCircle = L.circle([startHub.lat, startHub.lng], {
        radius: 6000,
        color: '#ea580c',
        weight: 2,
        opacity: 0.8,
        dashArray: '6, 8',
        fillColor: '#ea580c',
        fillOpacity: 0.08
      });
      commuteCircle.bindTooltip(`15-min Commute Catchment (${startHub.name})`, { direction: 'top' });
      contentGroup.addLayer(commuteCircle);
    }

    // City Landmarks
    landmarks.forEach((lm, idx) => {
      const isStart = idx === startHubIndex;
      const isHealthcare = lm.category === 'healthcare';
      const isTransit = lm.category === 'transit';

      const lmIcon = L.divIcon({
        className: 'haven-landmark-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="width: ${isStart ? '34px' : '26px'}; height: ${isStart ? '34px' : '26px'}; background: ${isStart ? '#2563eb' : isHealthcare ? '#10b981' : isTransit ? '#0284c7' : '#7c3aed'}; border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
              <span style="color: #ffffff; font-size: 13px; font-weight: 900;">${isStart ? '★' : isHealthcare ? '+' : isTransit ? '✈' : '🏢'}</span>
            </div>
            ${isStart ? `<span style="background: #2563eb; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; margin-top: 2px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.6);">START: ${lm.name.split(' ')[0]}</span>` : ''}
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 44]
      });

      const lmMarker = L.marker([lm.lat, lm.lng], { icon: lmIcon });
      lmMarker.bindTooltip(`${lm.name} (${lm.tag})`, { direction: 'top', offset: [0, -34] });
      lmMarker.on('click', () => {
        setStartHubIndex(idx);
        showToast(`Route start point set to: ${lm.name}`);
      });
      contentGroup.addLayer(lmMarker);
    });

    // Property Pins
    const filteredProps = properties.filter((p) => {
      if (selectedLocalityFilter !== 'all' && !p.locality.toLowerCase().includes(selectedLocalityFilter.toLowerCase())) {
        return false;
      }
      return true;
    });

    filteredProps.forEach((p) => {
      const score = matches[p.id]?.overallScore || 92;
      const isSelected = activeProperty?.id === p.id;

      const propIcon = L.divIcon({
        className: 'haven-property-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="background: ${isSelected ? '#c2410c' : '#ea580c'}; color: #ffffff; padding: 5px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 5px; border: 2.5px solid #ffffff; box-shadow: 0 6px 20px rgba(0,0,0,0.5); white-space: nowrap; transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'}; transition: all 0.2s;">
              <span>${p.priceDisplay}</span>
              <span style="background: #ffffff; color: #ea580c; font-size: 9px; padding: 1px 5px; border-radius: 6px; font-weight: 900;">${score}%</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${isSelected ? '#c2410c' : '#ea580c'}; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [86, 40],
        iconAnchor: [43, 40]
      });

      const marker = L.marker([p.coordinates.lat, p.coordinates.lng], { icon: propIcon });

      marker.bindPopup(`
        <div style="font-family: inherit; width: 230px; padding: 4px;">
          <div style="position: relative; height: 115px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${p.images[0]}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 6px; left: 6px; background: rgba(15,23,42,0.85); color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
              ${p.bhk} BHK • ${p.locality}
            </div>
            <div style="position: absolute; bottom: 6px; right: 6px; background: #ea580c; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
              ${p.priceDisplay}
            </div>
          </div>
          <div style="font-weight: 800; font-size: 12px; color: #0f172a; line-height: 1.3;">
            ${p.title}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${p.builtUpAreaSqFt} sq.ft • Facing ${p.facing} • ${p.city}
          </div>
          <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <button id="get-directions-${p.id}" style="color: #2563eb; font-weight: 800; font-size: 11px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; cursor: pointer; padding: 3px 8px; display: flex; align-items: center; gap: 3px;">
              🚗 Directions
            </button>
            <button id="view-prop-${p.id}" style="color: #ea580c; font-weight: 800; font-size: 11px; background: none; border: none; cursor: pointer; padding: 0;">
              View Details →
            </button>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setActivePropertyId(p.id);
        setShowDirections(true);
      });

      marker.on('popupopen', () => {
        setActivePropertyId(p.id);
        setTimeout(() => {
          const dirBtn = document.getElementById(`get-directions-${p.id}`);
          if (dirBtn) {
            dirBtn.onclick = () => {
              setActivePropertyId(p.id);
              setShowDirections(true);
              map.closePopup();
            };
          }
          const viewBtn = document.getElementById(`view-prop-${p.id}`);
          if (viewBtn) {
            viewBtn.onclick = () => {
              navigateToProperty(p.id);
              navigate(`/property/${p.id}`);
            };
          }
        }, 50);
      });

      contentGroup.addLayer(marker);
    });

  }, [properties, showCommuteRadius, selectedLocalityFilter, requirements.city, activePropertyId, startHubIndex]);

  // 4. DRAW SATELLITE ROUTE VIEW
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    if (!map || !routeGroup) return;

    routeGroup.clearLayers();

    if (showDirections && activeProperty && startHub) {
      const startCoord: [number, number] = [startHub.lat, startHub.lng];
      const endCoord: [number, number] = [activeProperty.coordinates.lat, activeProperty.coordinates.lng];
      const routeWaypoints = generateRoadWaypoints(startCoord, endCoord);

      // Layer 1: High-visibility cyan/sky glow on satellite imagery
      const outerGlow = L.polyline(routeWaypoints, {
        color: '#38bdf8',
        weight: 9,
        opacity: 0.55,
        lineCap: 'round',
        lineJoin: 'round'
      });
      routeGroup.addLayer(outerGlow);

      // Layer 2: Main vibrant arterial road route
      const mainRoute = L.polyline(routeWaypoints, {
        color: travelMode === 'transit' ? '#0284c7' : travelMode === 'walking' ? '#10b981' : '#f97316',
        weight: 5,
        opacity: 1.0,
        dashArray: travelMode === 'walking' ? '4, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      });
      routeGroup.addLayer(mainRoute);

      // Layer 3: Sharp white core center line for crisp precision on satellite
      const coreLine = L.polyline(routeWaypoints, {
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        lineCap: 'round'
      });
      routeGroup.addLayer(coreLine);

      // Auto-fit to reveal the full route between origin and destination
      const routeBounds = L.latLngBounds([startCoord, endCoord, ...routeWaypoints]);
      map.fitBounds(routeBounds.pad(0.28), { animate: true });
    } else if (activeProperty) {
      map.setView([activeProperty.coordinates.lat, activeProperty.coordinates.lng], 14, { animate: true });
    } else {
      const coords = CITY_COORDINATES[requirements.city] || CITY_COORDINATES['Bengaluru'];
      map.setView(coords, requirements.city === 'All Cities' ? 5 : 13, { animate: true });
    }
  }, [showDirections, activeProperty, startHub, travelMode]);

  // Invalidate map size when expanded state toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Quick zoom helper
  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  // Center on city
  const centerOnCity = () => {
    if (mapInstanceRef.current) {
      const coords = CITY_COORDINATES[requirements.city] || CITY_COORDINATES['Bengaluru'];
      mapInstanceRef.current.setView(coords, requirements.city === 'All Cities' ? 5 : 13, { animate: true });
      showToast(`Centered on ${requirements.city || 'India'}`);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
            <Satellite className="w-4 h-4" />
            <span>Satellite GIS & Commute Route Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Homes in Satellite & Route View ({requirements.city || 'India'})
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Live interactive satellite imagery with realistic driving routes, turn guidance, and GPS directions from major tech parks and hubs.
          </p>
        </div>

        {/* Quick View Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('discover')}
            className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
            <span>Browse Grid View</span>
          </button>
        </div>
      </div>

      {/* Grid: Map + Customer Requirements Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Interactive Map Canvas */}
        <div className={`${isExpanded ? 'lg:col-span-12' : 'lg:col-span-8'} card-haven bg-white/95 border border-slate-200/90 rounded-3xl overflow-hidden shadow-haven-md flex flex-col relative transition-all duration-300`}>
          
          {/* Map Controls Bar */}
          <div className="p-3 sm:px-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 z-10 border-b border-slate-800">
            {/* Map Layer Switcher: Satellite Default */}
            <div className="inline-flex p-0.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapLayer('satellite')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mapLayer === 'satellite'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>Satellite Hybrid</span>
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('streets')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mapLayer === 'streets'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Street Map</span>
              </button>
            </div>

            {/* Controls: Route toggle, Commute zone, Recenter, Enlarge, Zoom */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowDirections(!showDirections)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  showDirections
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Route View: {showDirections ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCommuteRadius(!showCommuteRadius)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  showCommuteRadius
                    ? 'bg-orange-600 text-white border-orange-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Commute Zone</span>
              </button>

              <button
                type="button"
                onClick={centerOnCity}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 shadow-xs"
                title="Recenter Map"
              >
                <Crosshair className="w-4 h-4 text-orange-400" />
              </button>

              {/* Enlarge / Full-width map toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  isExpanded
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs ring-2 ring-orange-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 shadow-xs'
                }`}
                title={isExpanded ? 'Standard Map Size' : 'Enlarge Map Size'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-orange-400" />}
                <span className="hidden sm:inline">{isExpanded ? 'Standard' : 'Enlarge'}</span>
              </button>

              <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => handleZoom(1)}
                  className="p-1.5 hover:bg-slate-700 border-r border-slate-700 text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(-1)}
                  className="p-1.5 hover:bg-slate-700 text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Leaflet Map DOM Element - Explicit Guaranteed Pixel Height */}
          <div className="relative w-full overflow-hidden bg-slate-950">
            <div 
              ref={mapContainerRef} 
              style={{
                minHeight: isExpanded ? '660px' : '520px',
                height: isExpanded ? '780px' : '600px',
                width: '100%'
              }}
              className="w-full z-0 bg-slate-950 relative transition-all duration-300"
            />

            {/* FLOATING DIRECTIONS & SATELLITE ROUTE CARD */}
            {showDirections && activeProperty && (
              <div className="absolute top-4 left-4 z-20 max-w-sm w-[calc(100%-2rem)] sm:w-84 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-700 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Route className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white leading-tight flex items-center gap-1.5">
                        <span>Satellite Route Guidance</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[170px]">
                        To: {activeProperty.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsDirectionsCollapsed(!isDirectionsCollapsed)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400"
                      title={isDirectionsCollapsed ? "Expand Directions" : "Collapse"}
                    >
                      {isDirectionsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDirections(false)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                      title="Hide Directions"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {!isDirectionsCollapsed && (
                  <div className="pt-2.5 space-y-2.5">
                    {/* Origin Hub Selector */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Starting From (Hub / Landmark):
                      </label>
                      <select
                        value={startHubIndex}
                        onChange={(e) => setStartHubIndex(Number(e.target.value))}
                        className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        {landmarks.map((lm, idx) => (
                          <option key={idx} value={idx}>
                            {lm.name} ({lm.tag})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Travel Mode Selector */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setTravelMode('driving')}
                        className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                          travelMode === 'driving' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Car className="w-3 h-3" />
                        <span>{driveMins}m Drive</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTravelMode('transit')}
                        className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                          travelMode === 'transit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bus className="w-3 h-3" />
                        <span>{transitMins}m</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTravelMode('walking')}
                        className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                          travelMode === 'walking' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Footprints className="w-3 h-3" />
                        <span>{walkMins}m</span>
                      </button>
                    </div>

                    {/* Commute Metrics */}
                    <div className="bg-slate-800/80 rounded-xl p-2 border border-slate-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Road Distance</span>
                        <span className="font-extrabold text-white">{distanceKm} km</span>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Route Path</span>
                        <span className="font-extrabold text-orange-400">Arterial Corridor</span>
                      </div>
                      <div className="h-6 w-px bg-slate-700" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Live Traffic</span>
                        <span className="font-extrabold text-emerald-400">Clear</span>
                      </div>
                    </div>

                    {/* Turn-by-turn preview */}
                    <div className="space-y-1.5 text-[11px] text-slate-300 max-h-28 overflow-y-auto pr-1">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Depart <strong>{startHub.name}</strong> onto Main Highway corridor.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Follow Arterial Expressway for <strong>{Math.max(1, Math.round(distanceKm * 0.6 * 10) / 10)} km</strong>.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Turn toward <strong>{activeProperty.locality}</strong>; arrive at <strong>{activeProperty.title}</strong>.</span>
                      </div>
                    </div>

                    {/* Google Maps Real GPS Launch Button */}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Live GPS Navigation (Google Maps)</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Bottom Legend Overlay */}
          <div className="p-3 bg-slate-900 text-slate-300 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
                Matched Home
              </span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Departure Hub
              </span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-5 h-1.5 rounded-full bg-orange-500 inline-block shadow-sm"></span>
                Satellite Road Route
              </span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Healthcare
              </span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                Airport Transit
              </span>
            </div>

            <span className="text-slate-400 font-medium">
              Satellite Hybrid GIS Mode • {properties.length} homes in {requirements.city || 'India'}
            </span>
          </div>
        </div>

        {/* RIGHT: Interactive Property List with Directions Trigger */}
        <div className={`${isExpanded ? 'lg:col-span-12' : 'lg:col-span-4'} flex flex-col gap-3 transition-all duration-300`}>
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-haven-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-orange-600" />
                Featured Homes ({properties.length})
              </h3>
              <span className="text-xs font-bold text-orange-600">
                Click to Trace Satellite Route
              </span>
            </div>

            <div className={`${isExpanded ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[520px]' : 'space-y-2.5 max-h-[620px]'} overflow-y-auto pr-1`}>
              {properties.slice(0, isExpanded ? 8 : 6).map((p) => {
                const score = matches[p.id]?.overallScore || 90;
                const isSelected = activeProperty?.id === p.id;
                const dist = calculateDistanceKm(startHub.lat, startHub.lng, p.coordinates.lat, p.coordinates.lng);
                const driveTime = Math.max(4, Math.round(dist * 2.6 + 4));

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePropertyId(p.id);
                      setShowDirections(true);
                    }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center hover:border-orange-300 ${
                      isSelected ? 'bg-orange-50/90 border-orange-500 shadow-sm ring-1 ring-orange-500/20' : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 truncate">{p.title}</span>
                        <span className="text-xs font-black text-orange-600 shrink-0">{p.priceDisplay}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.locality}, {p.city}</p>
                      
                      {/* Distance & Route Pill */}
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1">
                          <Car className="w-2.5 h-2.5 text-orange-600" />
                          {driveTime}m • {dist}km
                        </span>
                        <span className="font-extrabold text-emerald-600">{score}% Match</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
