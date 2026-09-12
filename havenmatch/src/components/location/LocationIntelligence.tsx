import React, { useState, useEffect, useRef } from 'react';
import { Property, NearbyPlace, POICategory } from '../../types';
import { locationService } from '../../services/locationService';
import { useLifestyle } from '../../context/LifestyleContext';
import L from 'leaflet';
import { 
  Hospital, 
  Bus, 
  GraduationCap, 
  ShoppingBag, 
  Trees, 
  Briefcase, 
  Clock, 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Navigation, 
  Satellite, 
  Dumbbell, 
  Landmark, 
  Plane, 
  ArrowUp, 
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface LocationIntelligenceProps {
  property: Property;
}

export const LocationIntelligence: React.FC<LocationIntelligenceProps> = ({ property }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<POICategory | 'all'>('all');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'N' | 'E' | 'S' | 'W'>('ALL');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'radar'>('satellite');
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { lifestyle } = useLifestyle();

  // Invalidate map size when toggling expanded state
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  // Load nearby places
  useEffect(() => {
    locationService.getNearbyPlaces(property.id).then((res) => {
      setPlaces(res);
      if (res.length > 0) setSelectedPlaceId(res[0].id);
    });
  }, [property.id]);

  const categories: { id: POICategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Landmarks', icon: MapPin },
    { id: 'gym', label: 'Gyms & Fitness', icon: Dumbbell },
    { id: 'temple', label: 'Temples & Spiritual', icon: Landmark },
    { id: 'airport', label: 'Airports', icon: Plane },
    { id: 'hospital', label: 'Hospitals', icon: Hospital },
    { id: 'transit', label: 'Transit & Metro', icon: Bus },
    { id: 'school', label: 'Schools & Colleges', icon: GraduationCap },
    { id: 'techpark', label: 'IT Parks', icon: Briefcase },
    { id: 'shopping', label: 'Supermarkets', icon: ShoppingBag },
    { id: 'park', label: 'Parks & Greenery', icon: Trees }
  ];

  // Helper to compute exact coordinates for any place
  const getPlaceCoords = (place: NearbyPlace): [number, number] => {
    if (place.coordinates) {
      return [place.coordinates.lat, place.coordinates.lng];
    }
    const angleRad = place.directionDegrees * (Math.PI / 180);
    const latOffset = (place.distanceKm / 111) * Math.cos(angleRad);
    const lngOffset = (place.distanceKm / 108.5) * Math.sin(angleRad);
    return [property.coordinates.lat + latOffset, property.coordinates.lng + lngOffset];
  };

  // Filtered places
  const filteredPlaces = places.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (directionFilter === 'N' && !['N', 'NE', 'NW', 'NNE', 'NNW'].includes(p.direction)) return false;
    if (directionFilter === 'E' && !['E', 'NE', 'SE', 'ENE', 'ESE'].includes(p.direction)) return false;
    if (directionFilter === 'S' && !['S', 'SE', 'SW', 'SSE', 'SSW'].includes(p.direction)) return false;
    if (directionFilter === 'W' && !['W', 'NW', 'SW', 'WNW', 'WSW'].includes(p.direction)) return false;
    return true;
  });

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || filteredPlaces[0] || null;

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapLayer === 'radar') return; // Radar is custom SVG

    const propLat = property.coordinates.lat;
    const propLng = property.coordinates.lng;

    // Create map if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [propLat, propLng],
        zoom: zoomLevel,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected Tile Layer (Esri Satellite vs OpenStreetMap Streets)
    if (mapLayer === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        subdomains: ['server', 'services']
      }).addTo(map);

      // Add high-contrast road transportation overlay over satellite
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.85
      }).addTo(map);

      // Add high-contrast road labels overlay over satellite
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.9
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
      }).addTo(map);
    }

    // Refresh markers & vector lines
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();

      // 1. Center Property Pin
      const centerIcon = L.divIcon({
        className: 'haven-center-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="width: 44px; height: 44px; background: #ea580c; border: 3px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); animation: pulse 2s infinite;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3" fill="#ea580c"/>
              </svg>
            </div>
            <span style="margin-top: 4px; background: #ffffff; color: #0f172a; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 1px solid #fed7aa; white-space: nowrap;">
              ${property.title.split(' ')[0]} (Subject Property)
            </span>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44]
      });

      L.marker([propLat, propLng], { icon: centerIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <b style="color: #ea580c; font-size: 13px;">${property.title}</b><br/>
            <span>${property.locality}, ${property.city}</span><br/>
            <span style="font-weight: bold; color: #334155;">Coordinates: ${propLat.toFixed(4)}°N, ${propLng.toFixed(4)}°E</span>
          </div>
        `)
        .addTo(layerGroupRef.current);

      // 2. Add Requirement Markers (Gyms, Temples, Airport, Hospitals, etc.)
      filteredPlaces.forEach((place) => {
        const coords = getPlaceCoords(place);
        const isSelected = selectedPlace?.id === place.id;

        const pinColor = isSelected ? '#ea580c' : '#0f172a';
        const ringColor = isSelected ? '#fed7aa' : 'rgba(255,255,255,0.4)';

        const markerIcon = L.divIcon({
          className: `haven-poi-pin-${place.id}`,
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
              <div style="background: ${pinColor}; color: #ffffff; padding: 4px 8px; border-radius: 9999px; border: 2px solid ${ringColor}; display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; box-shadow: 0 6px 15px rgba(0,0,0,0.4); white-space: nowrap;">
                <span>${place.name.split(' ')[0]}</span>
                <span style="color: #fdba74; font-family: monospace; font-size: 10px;">${place.distanceKm}km</span>
                <span style="background: #ffffff; color: #7c2d12; padding: 1px 4px; border-radius: 4px; font-size: 9px;">${place.direction}</span>
              </div>
            </div>
          `,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });

        const marker = L.marker(coords, { icon: markerIcon }).addTo(layerGroupRef.current!);
        marker.on('click', () => {
          setSelectedPlaceId(place.id);
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <b style="font-size: 13px; color: #0f172a;">${place.name}</b>
              <span style="background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; padding: 1px 6px; border-radius: 6px; font-weight: bold;">
                ${place.distanceKm} km
              </span>
            </div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
              Direction: <b>${place.direction} (${place.directionDegrees}°)</b> • Drive: <b>${place.driveTimeMins} mins</b>
            </div>
            <div style="color: #334155; font-size: 11px; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              ${place.highlight || place.categoryLabel}
            </div>
          </div>
        `);
      });

      // 3. Draw Directional Polyline from property to selected landmark
      if (selectedPlace) {
        const destCoords = getPlaceCoords(selectedPlace);
        if (polylineRef.current) {
          map.removeLayer(polylineRef.current);
        }

        const polyline = L.polyline([[propLat, propLng], destCoords], {
          color: '#ea580c',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.95
        }).addTo(map);

        polylineRef.current = polyline;
      }
    }

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, [property, filteredPlaces, selectedPlace, mapLayer, zoomLevel]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      setZoomLevel(mapInstanceRef.current.getZoom());
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      setZoomLevel(mapInstanceRef.current.getZoom());
    }
  };

  const handleFocusPlace = (place: NearbyPlace) => {
    setSelectedPlaceId(place.id);
    const coords = getPlaceCoords(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, Math.max(14, mapInstanceRef.current.getZoom()), {
        duration: 1.2
      });
    }
  };

  const getCategoryIcon = (category: POICategory) => {
    switch (category) {
      case 'gym': return Dumbbell;
      case 'temple': return Landmark;
      case 'airport': return Plane;
      case 'hospital': return Hospital;
      case 'transit': return Bus;
      case 'school': return GraduationCap;
      case 'techpark': return Briefcase;
      case 'shopping': return ShoppingBag;
      case 'park': return Trees;
      default: return MapPin;
    }
  };

  return (
    <div className="card-haven p-4 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-haven-sm space-y-5">
      
      {/* Header with Title & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Satellite className="w-5 h-5 text-orange-600" />
              <span>Interactive Satellite GIS & Requirements Telemetry</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-800 border border-orange-200">
              Live Satellite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real satellite imagery showing exact distance (km) and compass direction to customer requirements: <strong className="text-slate-800">Gyms, Temples, Airport, Hospitals & Schools</strong> from {property.locality}.
          </p>
        </div>

        {/* Map Layer Mode Switcher & Enlarge Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapLayer === 'satellite' ? 'bg-white text-orange-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Esri Satellite</span>
            </button>
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapLayer === 'streets' ? 'bg-white text-orange-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Street GIS</span>
            </button>
            <button
              onClick={() => setMapLayer('radar')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapLayer === 'radar' ? 'bg-white text-orange-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Compass Radar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isExpanded
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
            }`}
            title={isExpanded ? 'Standard Map Size' : 'Enlarge Map Size'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-orange-600" />}
            <span className="hidden sm:inline">{isExpanded ? 'Standard' : 'Enlarge Map'}</span>
          </button>
        </div>
      </div>

      {/* Direction & Active Target Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-50/70 p-3 rounded-2xl border border-orange-200/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-orange-950 flex items-center gap-1">
            <Compass className="w-4 h-4 text-orange-600" />
            Filter by Direction:
          </span>
          <div className="flex items-center gap-1">
            {(['ALL', 'N', 'E', 'S', 'W'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  directionFilter === dir
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-orange-200/60 hover:bg-orange-100'
                }`}
              >
                {dir === 'ALL' ? 'All (360°)' : `${dir} Bearing`}
              </button>
            ))}
          </div>
        </div>

        {selectedPlace && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-orange-900">
            <span>Target: <strong>{selectedPlace.name}</strong></span>
            <span className="px-2 py-0.5 rounded bg-white text-orange-700 border border-orange-200 font-mono">
              {selectedPlace.distanceKm} km • {selectedPlace.direction} ({selectedPlace.directionDegrees}°)
            </span>
          </div>
        )}
      </div>

      {/* Main Map Container - Enlarged */}
      <div className={`relative w-full ${isExpanded ? 'h-[620px] sm:h-[720px] lg:h-[780px]' : 'h-[480px] sm:h-[580px] lg:h-[620px]'} rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner transition-all duration-300`}>
        
        {/* Leaflet Real GIS Map Viewport */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full z-10 ${mapLayer === 'radar' ? 'hidden' : 'block'}`}
          style={{ minHeight: isExpanded ? '620px' : '480px', height: '100%', width: '100%' }}
        />

        {/* Fallback / Compass Radar Mode */}
        {mapLayer === 'radar' && (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-orange-500/20 flex items-center justify-center">
              <span className="absolute top-2 text-[10px] text-orange-400/60 font-mono">5.0 km outer radius</span>
            </div>
            <div className="absolute w-52 sm:w-64 h-52 sm:h-64 rounded-full border border-orange-500/30 flex items-center justify-center">
              <span className="absolute top-2 text-[10px] text-orange-400/80 font-mono">2.5 km commute zone</span>
            </div>
            <div className="absolute w-32 sm:w-40 h-32 sm:h-40 rounded-full border border-orange-400/50 bg-orange-500/10 flex items-center justify-center">
              <span className="absolute top-1 text-[9px] text-orange-300 font-mono">1.0 km walkable</span>
            </div>

            {/* Radar scanner sweep */}
            <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-transparent via-orange-500/10 to-transparent pointer-events-none animate-spin origin-center" style={{ animationDuration: '8s' }}></div>

            {/* Radar crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-orange-500/20"></div>
              <div className="absolute h-full w-[1px] bg-orange-500/20"></div>
            </div>

            {/* Center property anchor */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg ring-4 ring-orange-400/30">
                <MapPin className="w-6 h-6 fill-white text-orange-600" />
              </div>
              <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white text-slate-900 text-xs font-black shadow-md">
                {property.locality}
              </span>
            </div>

            {/* Filtered Landmark points on radar */}
            {filteredPlaces.map((place) => {
              const angleRad = (place.directionDegrees - 90) * (Math.PI / 180);
              const radiusPercent = Math.min(42, Math.max(12, (place.distanceKm / 12) * 38 + 10));
              const x = 50 + radiusPercent * Math.cos(angleRad);
              const y = 50 + radiusPercent * Math.sin(angleRad);
              const isSelected = selectedPlace?.id === place.id;
              const Icon = getCategoryIcon(place.category);

              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`absolute z-20 group cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg border backdrop-blur-md ${
                    isSelected
                      ? 'bg-orange-600 text-white border-white ring-2 ring-orange-300'
                      : 'bg-slate-900/90 text-slate-200 border-white/20 hover:bg-orange-600 hover:text-white'
                  }`}>
                    <Icon className="w-3 h-3 text-orange-400" />
                    <span>{place.name.split(' ')[0]}</span>
                    <span className="text-orange-300 font-mono">({place.distanceKm}k)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compass Dial Indicator HUD in Top-Left */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md p-2 rounded-2xl border border-slate-800 text-white flex items-center gap-2.5 z-20 shadow-xl select-none pointer-events-none">
          <div className="relative w-8 h-8 rounded-full border border-orange-500/40 flex items-center justify-center font-mono font-bold text-[9px]">
            <span className="absolute top-0 text-orange-400 font-black">N</span>
            <span className="absolute right-0.5 text-slate-400">E</span>
            <span className="absolute bottom-0 text-slate-400">S</span>
            <span className="absolute left-0.5 text-slate-400">W</span>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
          </div>
          <div className="text-[11px] leading-tight">
            <span className="text-orange-400 font-bold block">Compass Heading</span>
            <span className="text-[10px] text-slate-400">0° True North</span>
          </div>
        </div>

        {/* Zoom & View Controls in Top-Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur flex items-center justify-center shadow-md border border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur flex items-center justify-center shadow-md border border-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([property.coordinates.lat, property.coordinates.lng], 14);
              }
            }}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-orange-600 text-white backdrop-blur flex items-center justify-center shadow-md border border-slate-700"
            title="Recenter Property"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Bottom Telemetry Strip */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs flex flex-wrap items-center justify-between gap-2 border border-slate-800 z-20">
          <div className="flex items-center gap-2 text-[11px] text-orange-400 font-mono">
            <Compass className="w-3.5 h-3.5 text-orange-500" />
            <span>{property.coordinates.lat.toFixed(4)}°N, {property.coordinates.lng.toFixed(4)}°E</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-sans">{filteredPlaces.length} Landmarks Mapped</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-orange-300">
              <Dumbbell className="w-3 h-3" /> Gyms
            </span>
            <span className="flex items-center gap-1 text-orange-300">
              <Landmark className="w-3 h-3" /> Temples
            </span>
            <span className="flex items-center gap-1 text-orange-300">
              <Plane className="w-3 h-3" /> Airport
            </span>
          </div>
        </div>

      </div>

      {/* Category Pills Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-orange-600" />
            Customer Requirements Filter:
          </span>
          <span className="text-[11px] text-slate-400">
            Showing {filteredPlaces.length} of {places.length} places
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            const count = cat.id === 'all' 
              ? places.length 
              : places.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-haven-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-orange-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Requirement Cards Grid (with KM & Direction) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        {filteredPlaces.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          const Icon = getCategoryIcon(place.category);

          return (
            <div
              key={place.id}
              onClick={() => handleFocusPlace(place)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-50/90 border-orange-400 ring-2 ring-orange-300/70 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-white text-orange-700 border border-slate-200 shadow-xs'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {place.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {place.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Distance in Kilometers */}
                <span className="text-xs font-black text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded-lg shrink-0">
                  {place.distanceKm} km
                </span>
              </div>

              {place.highlight && (
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-1">
                  {place.highlight}
                </p>
              )}

              {/* Direction & Drive Time Bar */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[11px]">
                <span className="flex items-center text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {place.driveTimeMins} mins drive
                </span>

                {/* Compass Direction Badge */}
                <span className="inline-flex items-center gap-1 font-bold text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded-md text-[10px]">
                  <ArrowUp 
                    className="w-3 h-3 text-orange-600 transition-transform duration-300"
                    style={{ transform: `rotate(${place.directionDegrees}deg)` }}
                  />
                  <span>{place.direction} ({place.directionDegrees}°)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
