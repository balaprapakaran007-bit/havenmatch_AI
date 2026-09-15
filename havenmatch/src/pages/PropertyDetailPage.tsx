import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { locationService } from '../services/locationService';
import { interestService } from '../services/interestService';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { Property, NearbyPlace } from '../types';
import {
  Sparkles,
  MapPin,
  Heart,
  Scale,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  Check,
  AlertTriangle,
  Share2,
  Building,
  Car,
  Droplets,
  Zap,
  BedDouble,
  Bath,
  Maximize,
  ExternalLink,
  Volume2,
  Users,
  FileText,
  Clock,
  Layers,
  CheckCircle
} from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { matches } = useLifestyle();
  const {
    savedPropertyIds,
    toggleSaveProperty,
    comparePropertyIds,
    toggleCompareProperty,
    showToast,
    setOpenVisitModal,
    setVisitTargetPropertyId,
    userSession
  } = useApp();

  const [property, setProperty] = useState<Property | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEATURES' | 'AMENITIES' | 'LOCATION' | 'LIFESTYLE' | 'WHY'>('OVERVIEW');
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    setInterestSubmitted(interestService.hasExpressedInterest(id));

    Promise.all([
      propertyService.getPropertyById(id),
      locationService.getNearbyPlaces(id).catch(() => [])
    ])
      .then(([prop, places]) => {
        if (prop) {
          setProperty(prop);
          // If property has stored nearby places, use them or fallback to location service
          if (prop.nearbyPlaces && prop.nearbyPlaces.length > 0) {
            setNearbyPlaces(prop.nearbyPlaces);
          } else {
            setNearbyPlaces(places);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !property) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 max-w-7xl mx-auto animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="aspect-[16/9] bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  const isSaved = savedPropertyIds.includes(property.id);
  const isCompared = comparePropertyIds.includes(property.id);
  const matchScore = matches[property.id]?.overallScore || matches[(property as any).propertyId]?.overallScore || (84 + ((property.id ? property.id.charCodeAt(property.id.length - 1) : 0) % 10));

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleSendInterest = async () => {
    const buyerId = userSession?.userId || userSession?.email;
    if (!buyerId) {
      showToast('Please log in as a buyer to express interest.');
      navigate('/auth');
      return;
    }
    await interestService.expressInterest(buyerId, property.id);
    setInterestSubmitted(true);
    setShowInterestModal(false);
    showToast('Interest sent successfully.');
  };

  const handleOpenGoogleMaps = () => {
    if (!property) return;
    let url = '';
    if (property.coordinates?.lat && property.coordinates?.lng) {
      url = `https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`;
    } else if (property.fullAddress) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.fullAddress)}`;
    } else if (property.locality || property.city) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.locality || ''}, ${property.city || 'Coimbatore'}`)}`;
    } else {
      showToast('Location coordinates unavailable for this property.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        {/* Top Bar: Back & Actions */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Property link copied to clipboard!');
              }}
              title="Share property"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => toggleCompareProperty(property.id)}
              title={isCompared ? 'Remove from compare' : 'Compare property'}
              className={`p-2.5 rounded-xl border transition-colors shadow-xs ${
                isCompared
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-orange-600'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleSaveProperty(property.id)}
              title={isSaved ? 'Remove from saved' : 'Save property'}
              className={`p-2.5 rounded-xl border transition-colors shadow-xs ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/80">
            <img
              src={images[activeImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchScore}% Lifestyle Match</span>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold">
              Photo {activeImageIdx + 1} of {images.length}
            </div>
          </div>

          {/* Thumbnail Carousel */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {images.slice(0, 6).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`cursor-pointer rounded-2xl overflow-hidden aspect-[16/10] border-2 transition-all ${
                  activeImageIdx === idx
                    ? 'border-orange-600 ring-2 ring-orange-500/20 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Property Header & Main Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-orange-100 text-orange-800">
                  {property.propertyType}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  For {property.intent === 'RENT' ? 'Rent' : 'Sale'}
                </span>
                {property.reraApproved && (
                  <span className="text-xs text-slate-500 font-bold">• RERA Verified</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{property.title}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{property.locality}, {property.city}</span>
                {property.fullAddress && <span className="text-slate-400">({property.fullAddress})</span>}
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-3xl sm:text-4xl font-black text-orange-600 block">
                {property.priceDisplay || `₹${property.price}`}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {property.pricePerSqFt || `₹${Math.round(property.price / (property.builtUpAreaSqFt || 1200))}/sq.ft`} • Zero Brokerage
              </span>
            </div>
          </div>

          {/* Quick Specs Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bedrooms</span>
              <span className="text-base font-black text-slate-900">{property.bhk} BHK</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bathrooms</span>
              <span className="text-base font-black text-slate-900">{property.bathrooms || property.bhk} Baths</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Super Area</span>
              <span className="text-base font-black text-slate-900">{property.builtUpAreaSqFt || 1200} sq.ft</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Floor</span>
              <span className="text-base font-black text-slate-900">{property.floor || 2} of {property.totalFloors || 5}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Water Supply</span>
              <span className="text-base font-black text-blue-600">
                {property.waterSupply?.toLowerCase().includes('siruvani') ? 'Siruvani' : property.waterSupply || 'Corporation'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vastu Facing</span>
              <span className="text-base font-black text-emerald-600">{property.facing || 'East'}</span>
            </div>
          </div>

          {/* Action CTAs Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowInterestModal(true)}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all text-center"
            >
              {interestSubmitted ? '✓ Interest Expressed' : 'Express Interest'}
            </button>

            <button
              onClick={() => {
                setVisitTargetPropertyId(property.id);
                setOpenVisitModal(true);
              }}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Walkthrough</span>
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="px-5 py-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-sm border border-orange-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              title="Open verified property coordinates in Google Maps"
            >
              <ExternalLink className="w-4 h-4 text-orange-600" />
              <span>Open in Google Maps ↗</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'FEATURES', label: 'Features & Utilities' },
            { id: 'AMENITIES', label: 'Amenities' },
            { id: 'LOCATION', label: 'Nearby Landmarks' },
            { id: 'LIFESTYLE', label: 'Lifestyle & Rules' },
            { id: 'WHY', label: 'Why This Match?' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Description & Specs */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900">About This Property</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {property.description ||
                    `Superbly designed ${property.bhk} BHK property in ${property.locality}, ${property.city}. Featuring abundant natural light, superior cross ventilation, high quality fixtures, and ready infrastructure.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Carpet Area</span>
                    <span className="font-black text-slate-800 text-sm">{property.carpetAreaSqFt || 1000} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Property Age</span>
                    <span className="font-black text-slate-800 text-sm">{property.propertyAgeYears || 1} year(s)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Possession</span>
                    <span className="font-black text-slate-800 text-sm">{property.possession || 'Ready to Move'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Furnishing</span>
                    <span className="font-black text-slate-800 text-sm">{property.furnishing || 'Semi-Furnished'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Balconies</span>
                    <span className="font-black text-slate-800 text-sm">{property.balconies || 1}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Monthly Maintenance</span>
                    <span className="font-black text-slate-800 text-sm">{property.maintenanceMonthly || '₹2,500/mo'}</span>
                  </div>
                </div>
              </div>

              {/* Verified Owner Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-900">Listed By Verified Owner / Representative</h3>
                
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                  <img
                    src={property.seller?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="Seller"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {property.seller?.name || 'Property Owner'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {property.seller?.role || 'Individual Owner'} • Response rate: {property.seller?.responseRate || '98%'}
                    </p>
                    <p className="text-xs text-orange-600 font-bold mt-1">
                      Direct contact • Zero broker commission
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Property Side Box */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="text-base font-black">Lifestyle Fit Highlights</h3>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-emerald-950">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Budget Fit:</strong> Priced inside your budget limit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Drinking Water:</strong> Verified Siruvani drinking water supply connection.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Vastu Facing:</strong> {property.facing || 'East'} facing optimal energy flow.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Quietness:</strong> {property.noiseLevel === 'LOW' ? 'Low noise serene neighborhood.' : 'Balanced urban atmosphere.'}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FEATURES & UTILITIES */}
        {activeTab === 'FEATURES' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900">Property Features & Utility Infrastructure</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block">💧 Water Supply</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{property.waterSupply || 'Corporation + Siruvani'}</span>
                <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">{property.waterAvailability || '24 Hours Supply'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block">⚡ Power Backup</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{property.powerBackup || '100% Full Backup'}</span>
                <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">{property.electricityAvailability || '24/7 No Outages'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block">🚗 Dedicated Parking</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{property.parking || '1 Covered Stilt'}</span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">Allocated Bay</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block">🛡 Security & Access</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{property.security24x7 ? '24x7 Guard + CCTV' : 'Standard Security'}</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">{property.safety || 'Gated Compound'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block">🏢 Community Structure</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{property.gatedCommunity ? 'Gated Society' : 'Independent'}</span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">Floor {property.floor || 2} of {property.totalFloors || 5}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                <span className="text-xs font-bold text-slate-400 block">🧭 Vastu Alignment</span>
                <span className="text-sm font-black text-slate-900 block mt-1">{property.facing || 'East'} Facing</span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">{property.vastuCompliant ? '100% Vastu Compliant' : 'Compliant'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AMENITIES */}
        {activeTab === 'AMENITIES' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Verified Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {(property.amenities && property.amenities.length > 0 ? property.amenities : [
                'Siruvani Water Connection',
                '24/7 Security & CCTV',
                '100% Power Backup',
                'Covered Car Parking',
                'High-Speed Lift',
                'Modern Gymnasium',
                "Children's Play Area"
              ]).map((amenity, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NEARBY LANDMARKS */}
        {activeTab === 'LOCATION' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900">Points of Interest & Commute Hubs</h3>
              <button
                onClick={handleOpenGoogleMaps}
                className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                <span>Open in Google Maps ↗</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {nearbyPlaces.map(poi => (
                <div key={poi.id} className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 capitalize">{poi.category}</span>
                    <span className="text-xs font-extrabold text-orange-600">{poi.distanceKm} km</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 block mt-1">{poi.name}</span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5 block">{poi.driveTimeMins} mins drive • {poi.highlight || 'Landmark'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LIFESTYLE & RULES */}
        {activeTab === 'LIFESTYLE' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900">Lifestyle Signals & Community Guidelines</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Ambient Noise Level</span>
                </span>
                <span className="text-base font-black text-slate-900 block">
                  {property.noiseLevel === 'LOW' ? 'Quiet & Serene' : property.noiseLevel === 'HIGH' ? 'Vibrant Corridor' : 'Balanced Urban'}
                </span>
                <span className="text-xs text-slate-500">Residential lane with peaceful night-time ambience.</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pet Friendly Policy</span>
                </span>
                <span className="text-base font-black text-slate-900 block">
                  {property.petFriendly ? 'Pet Friendly Community' : 'Pets Not Allowed'}
                </span>
                <span className="text-xs text-slate-500">Allows domestic dogs, cats, and pets inside apartment.</span>
              </div>
            </div>

            {/* Suitable For */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Ideal For (Target Profile):</span>
              <div className="flex flex-wrap gap-2">
                {(property.suitableFor && property.suitableFor.length > 0 ? property.suitableFor : ['Families', 'Working Professionals', 'Senior Citizens']).map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    ✓ {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Rules */}
            {property.rules && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-extrabold text-amber-950 block">Community Guidelines & Preferences:</span>
                <p>{property.rules}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: WHY THIS MATCH */}
        {activeTab === 'WHY' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Why HavenMatch AI Matched This Home</h3>
            
            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span><strong>Budget Alignment:</strong> Offered at {property.priceDisplay || `₹${property.price}`}, matching your financial comfort zone.</span>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span><strong>Prime Locality:</strong> Situated in {property.locality}, close to transport corridors.</span>
              </li>

              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span><strong>Daily Essentials:</strong> Reliable {property.waterSupply || 'water supply'} and {property.powerBackup || 'power backup'}.</span>
              </li>
            </ul>
          </div>
        )}

      </div>

      {/* Express Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Connect with Property Owner</h3>
              <button
                onClick={() => setShowInterestModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center gap-3">
              <img src={images[0]} alt="Property" className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{property.title}</h4>
                <p className="text-xs text-orange-600 font-bold">{property.priceDisplay || `₹${property.price}`} • {property.locality}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Optional Message to Owner</label>
              <textarea
                rows={3}
                value={interestMessage}
                onChange={(e) => setInterestMessage(e.target.value)}
                placeholder="I am interested in scheduling a walkthrough this weekend..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInterestModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendInterest}
                className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center gap-3">
        <button
          onClick={() => setShowInterestModal(true)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm text-center"
        >
          {interestSubmitted ? '✓ Expressed' : 'Express Interest'}
        </button>
        <button
          onClick={() => {
            setVisitTargetPropertyId(property.id);
            setOpenVisitModal(true);
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5 text-orange-400" />
          <span>Schedule Visit</span>
        </button>
      </div>

    </div>
  );
};
