import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { POICategory, NearbyPlace, Property } from '../types';
import { propertyService } from '../services/propertyService';
import { locationService } from '../services/locationService';
import L from 'leaflet';
import {
  Sparkles,
  ArrowLeft,
  MapPin,
  Car,
  HeartPulse,
  Bus,
  GraduationCap,
  ShoppingBag,
  Trees,
  Briefcase,
  CheckCircle2,
  Maximize2,
  Navigation,
  Compass,
  Search,
  Footprints,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const LocationIntelligencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const circlesRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([
      propertyService.getPropertyById(id),
      locationService.getNearbyPlaces(id).catch(() => [])
    ]).then(([prop, pois]) => {
      if (prop) {
        setProperty(prop);
        setPlaces(pois);
        if (pois.length > 0) {
          setSelectedPlaceId(pois[0].id);
        }
      }
    }).finally(() => setIsLoading(false));
  }, [id]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!property || !mapContainerRef.current) return;

    const coords: [number, number] = [
      property.coordinates?.lat || 11.0255,
      property.coordinates?.lng || 77.0028
    ];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add distance radius circles (1 km, 2 km, 3 km)
      circlesRef.current = L.layerGroup().addTo(map);
      L.circle(coords, { radius: 1000, color: '#ea580c', weight: 1.5, fillOpacity: 0.05, dashArray: '4, 4' }).addTo(circlesRef.current);
      L.circle(coords, { radius: 2000, color: '#3b82f6', weight: 1, fillOpacity: 0.02, dashArray: '6, 6' }).addTo(circlesRef.current);
      L.circle(coords, { radius: 3000, color: '#10b981', weight: 1, fillOpacity: 0.01, dashArray: '8, 8' }).addTo(circlesRef.current);

      // Central Home Marker (Orange Pin with Pulsing Wave)
      const homeIcon = L.divIcon({
        className: 'custom-home-pin',
        html: `
          <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center; transform:translate(-50%, -50%);">
            <div style="position:absolute; width:100%; height:100%; background:rgba(234,88,12,0.3); border-radius:50%; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="background-color:#ea580c; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; box-shadow:0 10px 25px rgba(234,88,12,0.5); border:3px solid white; z-index:10;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [0, 0]
      });

      L.marker(coords, { icon: homeIcon }).addTo(map).bindPopup(`
        <div style="padding:6px; font-family:sans-serif; min-width:160px;">
          <div style="display:inline-block; font-size:10px; font-weight:800; background:#ffedd5; color:#c2410c; padding:2px 6px; border-radius:4px; margin-bottom:4px;">SUBJECT PROPERTY</div>
          <strong style="font-size:13px; color:#0f172a; display:block; line-height:1.2;">${property.title}</strong>
          <span style="font-size:11px; color:#64748b; display:block; margin-top:2px;">${property.locality}, Coimbatore</span>
          <div style="margin-top:6px; font-size:12px; font-weight:bold; color:#ea580c;">${property.priceDisplay}</div>
        </div>
      `);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(coords, 14);
    }
  }, [property]);

  // Compute POI color styles
  const getPOIColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'school': return { color: '#16a34a', bg: '#dcfce7', label: 'School / College', border: '#86efac' };
      case 'hospital': return { color: '#dc2626', bg: '#fee2e2', label: 'Hospital & Healthcare', border: '#fca5a5' };
      case 'transit': return { color: '#2563eb', bg: '#dbeafe', label: 'Transit & Airport', border: '#93c5fd' };
      case 'supermarket':
      case 'shopping': return { color: '#d97706', bg: '#fef3c7', label: 'Shopping & Malls', border: '#fcd34d' };
      case 'park': return { color: '#059669', bg: '#d1fae5', label: 'Park & Greenery', border: '#6ee7b7' };
      case 'techpark': return { color: '#7c3aed', bg: '#ede9fe', label: 'IT Tech Park', border: '#c4b5fd' };
      default: return { color: '#475569', bg: '#f1f5f9', label: 'Landmark', border: '#cbd5e1' };
    }
  };

  // Helper to compute place coordinates
  const getPlaceCoords = (place: NearbyPlace, baseLat: number, baseLng: number): [number, number] => {
    if (place.coordinates) {
      return [place.coordinates.lat, place.coordinates.lng];
    }
    const angleRad = (place.directionDegrees || 45) * (Math.PI / 180);
    const latOffset = (place.distanceKm / 111) * Math.cos(angleRad);
    const lngOffset = (place.distanceKm / 108.5) * Math.sin(angleRad);
    return [baseLat + latOffset, baseLng + lngOffset];
  };

  // Update POI markers on map when places or category filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current || !property) return;

    markersRef.current.clearLayers();

    const baseLat = property.coordinates?.lat || 11.0255;
    const baseLng = property.coordinates?.lng || 77.0028;

    // Filter places
    const filtered = places.filter(p => {
      const matchCat = activeCategory === 'ALL' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.highlight && p.highlight.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    filtered.forEach(poi => {
      const poiCoords = getPlaceCoords(poi, baseLat, baseLng);
      const style = getPOIColor(poi.category);
      const isSelected = selectedPlaceId === poi.id;

      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="background-color:white; border:2px solid ${isSelected ? '#ea580c' : style.color}; padding:4px 8px; border-radius:12px; display:flex; align-items:center; gap:5px; box-shadow:0 4px 14px rgba(0,0,0,0.18); font-family:sans-serif; transform:translate(-50%, -50%); white-space:nowrap; cursor:pointer;">
            <span style="width:9px; height:9px; border-radius:50%; background-color:${style.color}; flex-shrink:0;"></span>
            <span style="font-size:11px; font-weight:800; color:#0f172a;">${poi.name.split('(')[0].trim().slice(0, 24)}</span>
            <span style="font-size:10px; font-weight:700; color:${style.color}; background:${style.bg}; padding:1px 5px; border-radius:6px;">${poi.distanceKm} km</span>
          </div>
        `,
        iconSize: [140, 32],
        iconAnchor: [0, 0]
      });

      const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${baseLat},${baseLng}&destination=${encodeURIComponent(poi.name + ', Coimbatore')}`;

      const marker = L.marker(poiCoords, { icon: poiIcon }).addTo(markersRef.current!);

      marker.bindPopup(`
        <div style="padding:6px; font-family:sans-serif; min-width:190px;">
          <div style="font-size:10px; font-weight:800; color:${style.color}; text-transform:uppercase; margin-bottom:2px;">${poi.categoryLabel || style.label}</div>
          <strong style="font-size:13px; color:#0f172a; display:block;">${poi.name}</strong>
          <div style="margin-top:4px; display:flex; gap:8px; font-size:11px; color:#64748b;">
            <span>📍 <strong>${poi.distanceKm} km</strong></span>
            <span>🚗 <strong>${poi.driveTimeMins || Math.round(poi.distanceKm * 2.5)} mins</strong></span>
            <span>🚶 <strong>${Math.round(poi.distanceKm * 12)} mins</strong></span>
          </div>
          ${poi.highlight ? `<p style="margin-top:6px; font-size:11px; color:#334155; background:#f8fafc; padding:4px 6px; border-radius:6px; border:1px solid #e2e8f0;">${poi.highlight}</p>` : ''}
          <div style="margin-top:8px;">
            <a href="${gmapsDirUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; padding:5px 10px; background:#ea580c; color:white; font-size:11px; font-weight:bold; border-radius:8px; text-decoration:none;">
              Open in Google Maps ↗
            </a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedPlaceId(poi.id);
      });
    });

  }, [places, activeCategory, searchQuery, selectedPlaceId, property]);

  // Handle click on place card to pan map
  const handleSelectPlace = (place: NearbyPlace) => {
    setSelectedPlaceId(place.id);
    if (mapInstanceRef.current && property) {
      const baseLat = property.coordinates?.lat || 11.0255;
      const baseLng = property.coordinates?.lng || 77.0028;
      const coords = getPlaceCoords(place, baseLat, baseLng);
      mapInstanceRef.current.setView(coords, 15, { animate: true });
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && property) {
      const coords: [number, number] = [
        property.coordinates?.lat || 11.0255,
        property.coordinates?.lng || 77.0028
      ];
      mapInstanceRef.current.setView(coords, 14, { animate: true });
    }
  };

  const handleOpenGoogleMaps = () => {
    if (!property) return;
    let url = '';
    if (property.coordinates?.lat && property.coordinates?.lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`;
    } else if (property.fullAddress) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.fullAddress)}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.locality || ''}, ${property.city || 'Coimbatore'}`)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openPlaceInGoogleMaps = (place: NearbyPlace, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const origin = (property?.coordinates?.lat && property?.coordinates?.lng)
      ? `${property.coordinates.lat},${property.coordinates.lng}`
      : encodeURIComponent(`${property?.locality || ''}, Coimbatore`);
    const destination = encodeURIComponent(`${place.name}, Coimbatore`);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-8 max-w-7xl mx-auto animate-pulse flex flex-col gap-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-8 h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'ALL', label: 'All Services', icon: MapPin, count: places.length },
    { id: 'school', label: 'Schools & Colleges', icon: GraduationCap, count: places.filter(p => p.category === 'school').length, highlight: true },
    { id: 'hospital', label: 'Hospitals', icon: HeartPulse, count: places.filter(p => p.category === 'hospital').length },
    { id: 'transit', label: 'Transit & Metro', icon: Bus, count: places.filter(p => p.category === 'transit').length },
    { id: 'supermarket', label: 'Shopping', icon: ShoppingBag, count: places.filter(p => p.category === 'supermarket' || p.category === 'shopping').length },
    { id: 'park', label: 'Parks & Greenery', icon: Trees, count: places.filter(p => p.category === 'park').length },
    { id: 'techpark', label: 'IT Tech Parks', icon: Briefcase, count: places.filter(p => p.category === 'techpark').length }
  ];

  const filteredPlaces = places.filter(p => {
    const matchCat = activeCategory === 'ALL' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.highlight && p.highlight.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const schoolCount = places.filter(p => p.category === 'school').length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              to={`/property/${property.id}`}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to Property"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900">Location & Map Matching Agent</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping"></span>
                  Live OpenStreetMap
                </span>
              </div>
              <p className="text-xs text-slate-500">{property.title} • {property.locality}, {property.city} • <strong className="text-orange-600 font-bold">{property.priceDisplay}</strong></p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleRecenter}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-orange-600" />
              <span>Center Property</span>
            </button>
            <button
              onClick={handleOpenGoogleMaps}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open verified location in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
              <span>Open in Google Maps ↗</span>
            </button>
            <Link
              to={`/property/${property.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View Property</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Nearby Services Directory & School Proximity Index */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* School & Family Priority Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200 text-left">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-950">School & Education Proximity</h4>
                  <p className="text-[11px] text-emerald-700 font-semibold">{schoolCount} top-rated schools & colleges within 2.6 km</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                98/100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/80 text-center">
              <div className="p-1.5 bg-white/80 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">Closest School</span>
                <span className="text-xs font-black text-emerald-900">0.9 km</span>
              </div>
              <div className="p-1.5 bg-white/80 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">Avg Drive Time</span>
                <span className="text-xs font-black text-emerald-900">4.5 mins</span>
              </div>
              <div className="p-1.5 bg-white/80 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">Safety Index</span>
                <span className="text-xs font-black text-emerald-900">9.6 / 10</span>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nearby schools, hospitals, transit..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((c) => {
                const IconComponent = c.icon;
                const isSelected = activeCategory.toLowerCase() === c.id.toLowerCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-orange-600 text-white shadow-xs'
                        : c.highlight
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-orange-700 text-orange-100' : 'bg-slate-200 text-slate-700'}`}>
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Places List (Scrollable Cards) */}
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredPlaces.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No matching places found</p>
                <button
                  onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = selectedPlaceId === place.id;
                const style = getPOIColor(place.category);
                const walkMins = place.walkTimeMins || Math.round(place.distanceKm * 12);
                const driveMins = place.driveTimeMins || Math.round(place.distanceKm * 2.5);

                return (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left bg-white ${
                      isSelected
                        ? 'border-orange-500 shadow-md ring-1 ring-orange-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                            style={{ backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                          >
                            {place.categoryLabel || style.label}
                          </span>
                          {place.category === 'school' && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-800">
                              🎓 Top Tier
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                          {place.name}
                        </h5>

                        {place.highlight && (
                          <p className="text-[11px] text-slate-600 leading-tight">
                            {place.highlight}
                          </p>
                        )}
                      </div>

                      {/* Distance Badge */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-black text-orange-600 block">
                          {place.distanceKm} km
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">straight-line</span>
                      </div>
                    </div>

                    {/* Commute Indicators & 1-Click Google Maps Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{driveMins} mins</strong> drive
                        </span>
                        <span className="flex items-center gap-1">
                          <Footprints className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{walkMins} mins</strong> walk
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => openPlaceInGoogleMaps(place, e)}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white text-[11px] font-bold border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title={`Open directions to ${place.name} in Google Maps`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Maps ↗</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 text-[11px] font-bold flex items-center gap-0.5">
                          <span>Map</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Live Interactive Leaflet Map */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[520px] relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-slate-100">
          
          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[520px] z-10" />

          {/* Floating Distance Legend Card (Top Right) */}
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200 shadow-md text-left text-[11px] space-y-1.5 hidden sm:block">
            <span className="font-black text-slate-800 block text-xs mb-1">Radar Proximity</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-orange-500 border-dashed"></span>
              <span className="font-bold text-slate-700">1.0 km Immediate Radius</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-blue-500 border-dashed"></span>
              <span className="font-bold text-slate-700">2.0 km Commute Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-emerald-500 border-dashed"></span>
              <span className="font-bold text-slate-700">3.0 km Extended Sector</span>
            </div>
          </div>

          {/* Floating Bottom Card: "Lifestyle Location Analysis" */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">Elite Peelamedu & TIDEL Hub Fit</h5>
                    <p className="text-[11px] text-slate-500">Schools, healthcare, and IT employment corridor within 3 km.</p>
                  </div>
                </div>

                <Link
                  to={`/property/${property.id}`}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline"
                >
                  <span>Property Details</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
