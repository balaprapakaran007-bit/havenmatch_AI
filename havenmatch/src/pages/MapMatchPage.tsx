import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Property, NearbyPlace, POICategory } from '../types';
import { propertyService } from '../services/propertyService';
import { locationService } from '../services/locationService';
import { matchingService } from '../services/matchingService';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import L from 'leaflet';
import {
  Sparkles,
  MapPin,
  Car,
  Footprints,
  Navigation,
  Compass,
  Heart,
  CheckCircle2,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  Calendar,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Building2,
  Star,
  Info,
  Maximize2,
  ArrowRight,
  Route as RouteIcon,
  X
} from 'lucide-react';

export const MapMatchPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { savedPropertyIds, toggleSaveProperty, setVisitTargetPropertyId, setOpenVisitModal, showToast } = useApp();
  const { requirements } = useLifestyle();

  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedPoi, setSelectedPoi] = useState<NearbyPlace | null>(null);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');
  const [streetViewOpen, setStreetViewOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBhk, setSelectedBhk] = useState<string>('ALL');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const circleGroupRef = useRef<L.LayerGroup | null>(null);

  // Load all properties
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    propertyService.getProperties({}).then((allProps) => {
      if (!isMounted) return;
      setProperties(allProps);

      if (allProps.length > 0) {
        // Find if target id was provided in url
        const target = id ? allProps.find((p) => p.id === id || p.slug === id) : null;
        const initial = target || allProps[0];
        setSelectedProperty(initial);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load POIs when selected property changes
  useEffect(() => {
    if (!selectedProperty) return;
    let isMounted = true;

    locationService.getNearbyPlaces(selectedProperty.id).then((poiList) => {
      if (!isMounted) return;
      setPlaces(poiList);
      if (poiList.length > 0) {
        setSelectedPoi(poiList[0]);
      } else {
        setSelectedPoi(null);
      }
    }).catch(() => {
      if (isMounted) setPlaces([]);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedProperty]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !selectedProperty) return;

    const propLat = selectedProperty.coordinates?.lat || 11.0255;
    const propLng = selectedProperty.coordinates?.lng || 77.0028;
    const propCoords: [number, number] = [propLat, propLng];

    // Initialize Map instance once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: propCoords,
        zoom: 14,
        zoomControl: false // custom controls
      });

      const streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = streetTile;
      markersGroupRef.current = L.layerGroup().addTo(map);
      circleGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(propCoords, 14, { animate: true });
    }

    // Switch tile layers (Street vs Satellite)
    if (tileLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      if (mapLayer === 'satellite') {
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18
          }
        ).addTo(mapInstanceRef.current);
      } else {
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstanceRef.current);
      }
    }

    // Draw Proximity Radius Circles
    if (circleGroupRef.current && mapInstanceRef.current) {
      circleGroupRef.current.clearLayers();
      L.circle(propCoords, {
        radius: 1000,
        color: '#ea580c',
        weight: 1.5,
        fillColor: '#ea580c',
        fillOpacity: 0.04,
        dashArray: '4, 4'
      }).addTo(circleGroupRef.current);

      L.circle(propCoords, {
        radius: 3000,
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.02,
        dashArray: '6, 6'
      }).addTo(circleGroupRef.current);
    }

    // Draw Home and POI Markers
    if (markersGroupRef.current && mapInstanceRef.current) {
      markersGroupRef.current.clearLayers();

      // Custom Property Pin (Pulsing Orange)
      const homeIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; transform:translate(-50%, -50%);">
            <div style="position:absolute; width:100%; height:100%; background:rgba(234,88,12,0.35); border-radius:50%; animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="background:#ea580c; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 8px 20px rgba(234,88,12,0.5); border:3px solid white; z-index:20;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [0, 0]
      });

      L.marker(propCoords, { icon: homeIcon, zIndexOffset: 1000 })
        .addTo(markersGroupRef.current)
        .bindPopup(`
          <div style="font-family:sans-serif; min-width:180px; padding:4px;">
            <span style="font-size:10px; font-weight:800; background:#ffedd5; color:#c2410c; padding:2px 6px; border-radius:4px; text-transform:uppercase;">Selected Property</span>
            <div style="font-size:13px; font-weight:700; color:#0f172a; margin-top:4px;">${selectedProperty.title}</div>
            <div style="font-size:11px; color:#64748b;">${selectedProperty.locality}, ${selectedProperty.city}</div>
            <div style="font-size:12px; font-weight:800; color:#ea580c; margin-top:4px;">${selectedProperty.priceDisplay}</div>
          </div>
        `);

      // Filtered POIs
      const filteredPois = activeCategory === 'ALL'
        ? places
        : places.filter((p) => {
            if (activeCategory === 'hospital') return p.category === 'hospital';
            if (activeCategory === 'school') return p.category === 'school';
            if (activeCategory === 'shopping') return p.category === 'shopping' || p.category === 'supermarket';
            if (activeCategory === 'transit') return p.category === 'transit' || p.category === 'airport';
            if (activeCategory === 'techpark') return p.category === 'techpark';
            if (activeCategory === 'park') return p.category === 'park';
            return true;
          });

      filteredPois.forEach((place) => {
        const poiLat = place.coordinates?.lat || propLat + 0.005;
        const poiLng = place.coordinates?.lng || propLng + 0.005;
        const poiCoords: [number, number] = [poiLat, poiLng];

        const isSelected = selectedPoi?.id === place.id;
        const colorConfig = getCategoryStyle(place.category);

        const poiIcon = L.divIcon({
          className: `custom-poi-marker-${place.id}`,
          html: `
            <div style="transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; cursor:pointer;">
              <div style="
                background:${isSelected ? '#0f172a' : colorConfig.color};
                color:white;
                width:${isSelected ? '36px' : '30px'};
                height:${isSelected ? '36px' : '30px'};
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                box-shadow:0 4px 12px rgba(0,0,0,0.25);
                border:2.5px solid white;
                font-size:13px;
                transition:all 0.2s ease;
              ">
                ${colorConfig.emoji}
              </div>
              ${isSelected ? `
                <div style="
                  margin-top:2px;
                  background:#0f172a;
                  color:white;
                  padding:2px 6px;
                  border-radius:4px;
                  font-size:10px;
                  font-weight:700;
                  white-space:nowrap;
                  box-shadow:0 2px 6px rgba(0,0,0,0.3);
                ">
                  ${place.distanceKm} km · ${place.driveTimeMins}m drive
                </div>
              ` : ''}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [0, 0]
        });

        const marker = L.marker(poiCoords, { icon: poiIcon, zIndexOffset: isSelected ? 500 : 100 })
          .addTo(markersGroupRef.current!)
          .on('click', () => {
            setSelectedPoi(place);
          });

        marker.bindTooltip(`
          <div style="font-family:sans-serif; font-size:11px; font-weight:600;">
            ${colorConfig.emoji} ${place.name}<br/>
            <span style="color:#ea580c; font-weight:700;">${place.distanceKm} km (${place.driveTimeMins} mins drive)</span>
          </div>
        `, { direction: 'top', offset: [0, -18] });
      });
    }
  }, [selectedProperty, places, activeCategory, selectedPoi, mapLayer]);

  // Route Polyline from Property to Selected POI
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProperty) return;

    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (selectedPoi) {
      const propLat = selectedProperty.coordinates?.lat || 11.0255;
      const propLng = selectedProperty.coordinates?.lng || 77.0028;
      const poiLat = selectedPoi.coordinates?.lat || propLat + 0.005;
      const poiLng = selectedPoi.coordinates?.lng || propLng + 0.005;

      // Realistic intermediate dogleg curve for aesthetic road appearance
      const midLat = (propLat + poiLat) / 2 + (poiLng - propLng) * 0.15;
      const midLng = (propLng + poiLng) / 2 - (poiLat - propLat) * 0.15;

      const polylinePoints: [number, number][] = [
        [propLat, propLng],
        [midLat, midLng],
        [poiLat, poiLng]
      ];

      const routeLine = L.polyline(polylinePoints, {
        color: '#ea580c',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = routeLine;
    }
  }, [selectedProperty, selectedPoi]);

  // Helper styles for POI categories
  const getCategoryStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'hospital':
        return { color: '#ef4444', emoji: '🏥', label: 'Hospitals', bg: '#fee2e2' };
      case 'school':
        return { color: '#10b981', emoji: '🏫', label: 'Schools & Colleges', bg: '#d1fae5' };
      case 'shopping':
      case 'supermarket':
        return { color: '#f59e0b', emoji: '🛍️', label: 'Malls & Supermarkets', bg: '#fef3c7' };
      case 'transit':
      case 'airport':
        return { color: '#3b82f6', emoji: '🚆', label: 'Transit & Stations', bg: '#dbeafe' };
      case 'techpark':
        return { color: '#8b5cf6', emoji: '🏢', label: 'Tech Parks & Workplaces', bg: '#ede9fe' };
      case 'park':
        return { color: '#059669', emoji: '🌳', label: 'Parks & Recreation', bg: '#d1fae5' };
      default:
        return { color: '#64748b', emoji: '📍', label: 'Landmarks', bg: '#f1f5f9' };
    }
  };

  // Filtered properties list
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.locality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBhk =
      selectedBhk === 'ALL' ||
      (selectedBhk === '4+' ? p.bhk >= 4 : p.bhk === Number(selectedBhk));

    return matchesSearch && matchesBhk;
  });

  // Calculate dynamic match score for each property
  const getPropertyMatchScore = (prop: Property) => {
    let score = 88;
    if (prop.city.toLowerCase() === (requirements.city || 'Coimbatore').toLowerCase()) score += 5;
    if (prop.bhk >= 3) score += 3;
    if (prop.reraApproved) score += 2;
    return Math.min(98, score);
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleSelectProperty = (prop: Property) => {
    setSelectedProperty(prop);
    navigate(`/map-match/${prop.id}`, { replace: true });
  };

  const handleOpenGoogleDirections = (place: NearbyPlace) => {
    if (!selectedProperty) return;
    const origin = `${selectedProperty.coordinates?.lat || 11.0255},${selectedProperty.coordinates?.lng || 77.0028}`;
    const destination = place.coordinates
      ? `${place.coordinates.lat},${place.coordinates.lng}`
      : encodeURIComponent(`${place.name} ${selectedProperty.city}`);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* Top Map Match Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black shadow-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2 leading-none">
              HavenMatch Map Match <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">Interactive Spatial AI</span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Real-time proximity, verified landmarks, travel times & commute intelligence in {requirements.city || 'Coimbatore'}
            </p>
          </div>
        </div>

        {/* View Controls & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMapLayer('street')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                mapLayer === 'street' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                mapLayer === 'satellite' ? 'bg-white text-orange-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
          </div>

          <button
            onClick={() => setStreetViewOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Street View</span>
          </button>
        </div>
      </div>

      {/* 3-Column Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================================================================== */}
        {/* COLUMN 1: LEFT MATCHING PROPERTIES LIST */}
        {/* ==================================================================== */}
        <div className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm">
          {/* Filters Bar */}
          <div className="p-3 border-b border-slate-100 space-y-2 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Matching Properties ({filteredProperties.length})
              </span>
              <span className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                Live MongoDB Feed
              </span>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search locality or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* BHK Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold">
              {['ALL', '2', '3', '4+'].map((bhk) => (
                <button
                  key={bhk}
                  onClick={() => setSelectedBhk(bhk)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedBhk === bhk
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {bhk === 'ALL' ? 'All BHK' : `${bhk} BHK`}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-medium">Loading verified properties...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-700">No properties match filter</p>
                <p className="text-xs mt-1">Try resetting the BHK or locality search</p>
              </div>
            ) : (
              filteredProperties.map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                const matchScore = getPropertyMatchScore(prop);
                const isSaved = savedPropertyIds.includes(prop.id);

                return (
                  <div
                    key={prop.id}
                    onClick={() => handleSelectProperty(prop)}
                    className={`pt-3 first:pt-0 cursor-pointer group transition-all`}
                  >
                    <div
                      className={`p-3 rounded-2xl border transition-all relative ${
                        isSelected
                          ? 'bg-orange-50/50 border-orange-500 shadow-md ring-2 ring-orange-400/30'
                          : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Property Thumbnail + Match Badge */}
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 mb-2.5">
                        <img
                          src={prop.primaryImage || prop.coverImage || prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Match Score Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-orange-400 text-[10px] font-black flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3 text-orange-400" />
                          <span>{matchScore}% Match</span>
                        </div>

                        {/* Save Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveProperty(prop.id);
                          }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                            isSaved ? 'bg-rose-500 text-white' : 'bg-slate-900/60 text-white hover:bg-rose-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-black shadow-xs">
                          {prop.priceDisplay}
                        </div>
                      </div>

                      {/* Property Title & Info */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {prop.title}
                          </h3>
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{prop.locality}, {prop.city}</span>
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-[10.5px] text-slate-600 font-semibold border-t border-slate-100 mt-2">
                          <span>{prop.bhk} BHK</span>
                          <span>•</span>
                          <span>{prop.builtUpAreaSqFt} sq.ft</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{prop.possession}</span>
                        </div>
                      </div>

                      {/* View Details Link */}
                      <div className="mt-2.5 pt-2 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">Click to focus on map</span>
                        <Link
                          to={`/property/${prop.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 group-hover:underline"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 2: CENTER INTERACTIVE LEAFLET MAP */}
        {/* ==================================================================== */}
        <div className="flex-1 relative flex flex-col h-full bg-slate-200">
          {/* Leaflet DOM Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Overlay Top Left: Dynamic Selected Route Banner */}
          {selectedPoi && selectedProperty && (
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 max-w-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {getCategoryStyle(selectedPoi.category).emoji}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 block">
                      Active Route Destination
                    </span>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">
                      {selectedPoi.name}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPoi(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
                <div className="bg-orange-50/70 p-1.5 rounded-xl border border-orange-100">
                  <span className="text-[10px] text-slate-500 font-semibold block flex items-center justify-center gap-1">
                    <Car className="w-3 h-3 text-orange-600" /> Driving Time
                  </span>
                  <span className="text-xs font-black text-orange-700">
                    {selectedPoi.driveTimeMins} mins ({selectedPoi.distanceKm} km)
                  </span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold block flex items-center justify-center gap-1">
                    <Footprints className="w-3 h-3 text-slate-600" /> Walking Time
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {selectedPoi.walkTimeMins || Math.round(selectedPoi.distanceKm * 12)} mins
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Floating Zoom & Map Controls Top Right */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
              <button
                onClick={handleZoomIn}
                className="p-2.5 hover:bg-slate-100 text-slate-700 border-b border-slate-100 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Recenter button */}
            <button
              onClick={() => {
                if (mapInstanceRef.current && selectedProperty) {
                  mapInstanceRef.current.setView(
                    [selectedProperty.coordinates?.lat || 11.0255, selectedProperty.coordinates?.lng || 77.0028],
                    14,
                    { animate: true }
                  );
                }
              }}
              className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 text-orange-600 transition-colors"
              title="Recenter Property"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Map Legend Overlay Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-3 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-600 inline-block border-2 border-white shadow-xs"></span>
              <span>Home Pin</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span>Hospital</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>School</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>Transit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
              <span>Workplace</span>
            </span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 3: RIGHT PROPERTY DETAILS, AMENITIES & AI WHY */}
        {/* ==================================================================== */}
        <div className="w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-sm overflow-y-auto">
          {selectedProperty ? (
            <div className="p-4 space-y-4 divide-y divide-slate-100">
              
              {/* 1. Selected Property Header Card */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                      Active Spatial Focus
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-1 leading-tight">
                      {selectedProperty.title}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{selectedProperty.fullAddress || `${selectedProperty.locality}, ${selectedProperty.city}`}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 block">{selectedProperty.priceDisplay}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{selectedProperty.pricePerSqFt || '₹4,500/sq.ft'}</span>
                  </div>
                </div>

                {/* Property Specs Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Configuration</span>
                    <span className="font-bold text-slate-800">{selectedProperty.bhk} BHK</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Area</span>
                    <span className="font-bold text-slate-800">{selectedProperty.builtUpAreaSqFt} sq.ft</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Facing</span>
                    <span className="font-bold text-slate-800">{selectedProperty.facing || 'East'}</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setVisitTargetPropertyId(selectedProperty.id);
                      setOpenVisitModal(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Visit</span>
                  </button>
                  <Link
                    to={`/property/${selectedProperty.id}`}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Details</span>
                  </Link>
                </div>
              </div>

              {/* 2. Amenity Category Filter Pills */}
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Nearby Landmarks & Distance
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">
                    {places.length} Verified POIs
                  </span>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  {[
                    { id: 'ALL', label: 'All', emoji: '🌟' },
                    { id: 'hospital', label: 'Hospitals', emoji: '🏥' },
                    { id: 'school', label: 'Schools', emoji: '🏫' },
                    { id: 'shopping', label: 'Malls', emoji: '🛍️' },
                    { id: 'transit', label: 'Transit', emoji: '🚆' },
                    { id: 'techpark', label: 'Workplaces', emoji: '🏢' },
                    { id: 'park', label: 'Parks', emoji: '🌳' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg transition-all shrink-0 flex items-center gap-1 ${
                        activeCategory === cat.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Proximity List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {places
                    .filter((p) => {
                      if (activeCategory === 'ALL') return true;
                      if (activeCategory === 'hospital') return p.category === 'hospital';
                      if (activeCategory === 'school') return p.category === 'school';
                      if (activeCategory === 'shopping') return p.category === 'shopping' || p.category === 'supermarket';
                      if (activeCategory === 'transit') return p.category === 'transit' || p.category === 'airport';
                      if (activeCategory === 'techpark') return p.category === 'techpark';
                      if (activeCategory === 'park') return p.category === 'park';
                      return true;
                    })
                    .map((place) => {
                      const isSelected = selectedPoi?.id === place.id;
                      const style = getCategoryStyle(place.category);

                      return (
                        <div
                          key={place.id}
                          onClick={() => setSelectedPoi(place)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50/70 border-orange-500 shadow-xs'
                              : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="text-sm mt-0.5">{style.emoji}</span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                  {place.name}
                                </h4>
                                <span className="text-[10px] text-slate-500 font-medium block">
                                  {place.categoryLabel || style.label}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-orange-600 block">
                                {place.distanceKm} km
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold block">
                                ~{place.driveTimeMins}m drive
                              </span>
                            </div>
                          </div>

                          {/* Action Row */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] font-bold">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPoi(place);
                                showToast(`Highlighting route to ${place.name}`);
                              }}
                              className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
                            >
                              <RouteIcon className="w-3 h-3" />
                              <span>View Route</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenGoogleDirections(place);
                              }}
                              className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Get Directions</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 3. AI Why This Property? Explanation Card */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Why HavenMatch AI Recommends This
                  </h3>
                </div>

                <div className="bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-white p-3.5 rounded-2xl border border-orange-200/70 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-slate-700 font-medium">
                      <strong className="text-slate-900 font-bold">Prime Connectivity: </strong>
                      Located in high-demand {selectedProperty.locality} with sub-10 minute commute to major tech corridors and hospitals.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-slate-700 font-medium">
                      <strong className="text-slate-900 font-bold">Verified Infrastructure: </strong>
                      {selectedProperty.waterSupply || 'Corporation (Siruvani) water'} & {selectedProperty.powerBackup || '100% Full Backup'}.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-slate-700 font-medium">
                      <strong className="text-slate-900 font-bold">Family & Security: </strong>
                      Gated community with 24/7 security and top CBSE schools within 2 km radius.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs font-medium">Select a property on the left to view spatial intelligence.</p>
            </div>
          )}
        </div>

      </div>

      {/* Street View 360 Photosphere Modal */}
      {streetViewOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Maximize2 className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-bold">{selectedProperty.title} — Street View & Surroundings</h3>
                  <p className="text-xs text-slate-400">{selectedProperty.fullAddress}</p>
                </div>
              </div>
              <button
                onClick={() => setStreetViewOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
              <img
                src={selectedProperty.primaryImage || selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                alt={selectedProperty.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
                  <Compass className="w-4 h-4 animate-spin" />
                  <span>360° Neighborhood Street Context</span>
                </div>
                <h4 className="text-xl font-black">{selectedProperty.locality}, {selectedProperty.city}</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  High-resolution street-level visualization and neighborhood walkthrough. Wide 40ft approach road with underground cabling, LED streetlights, and Siruvani water pipeline connectivity.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                GPS: {selectedProperty.coordinates?.lat || 11.0255}° N, {selectedProperty.coordinates?.lng || 77.0028}° E
              </span>
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedProperty.coordinates?.lat || 11.0255},${selectedProperty.coordinates?.lng || 77.0028}`;
                  window.open(url, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Street View</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMatchPage;
