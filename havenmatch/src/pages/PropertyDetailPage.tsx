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
  Check,
  AlertTriangle,
  Share2,
  MessageSquare,
  Building,
  Car,
  Droplets,
  Zap,
  BedDouble,
  Bath,
  Maximize,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AMENITIES' | 'LOCATION' | 'WHY' | 'NEARBY'>('OVERVIEW');
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
          setNearbyPlaces(places);
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
  const matchScore = matches[property.id]?.overallScore || 0;

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleSendInterest = async () => {
    const buyerId = userSession?.userId || userSession?.email;
    if (!buyerId) {
      showToast('Please log in as a buyer to express interest.');
      navigate('/login');
      return;
    }
    await interestService.expressInterest(buyerId, property.id);
    setInterestSubmitted(true);
    setShowInterestModal(false);
    showToast('Interest sent successfully to property owner!');
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
        
        {/* Top Bar: Back & Actions (Matching Screen 7) */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate('/recommendations')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to results</span>
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

        {/* Hero Gallery (Matching Screen 7) */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/80">
            <img
              src={images[activeImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3.5 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchScore}% Lifestyle Match</span>
            </div>
          </div>

          {/* Thumbnail Carousel */}
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((img, idx) => (
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

        {/* Property Header & Main Info (Matching Screen 7) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-orange-100 text-orange-800">
                  {property.propertyType}
                </span>
                <span className="text-xs text-slate-400 font-medium">• Verified Listing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{property.title}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{property.locality}, {property.city}</span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-3xl font-black text-orange-600 block">₹{property.priceDisplay || property.price}</span>
              <span className="text-xs text-slate-400 font-medium">₹6,480 / sq.ft • Zero Brokerage</span>
            </div>
          </div>

          {/* Specs Row */}
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
              <span className="text-base font-black text-slate-900">{property.builtUpAreaSqFt} sq.ft</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Furnishing</span>
              <span className="text-base font-black text-slate-900">{property.furnishing || 'Semi-Furnished'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Water Supply</span>
              <span className="text-base font-black text-blue-600">{property.waterSupply?.toLowerCase().includes('siruvani') ? 'Siruvani Water' : property.waterSupply || 'Corporation'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vastu Score</span>
              <span className="text-base font-black text-emerald-600">{property.vastuCompliant ? '100%' : '90%'} Compliant</span>
            </div>
          </div>

          {/* Action CTAs Row (Matching Screen 7) */}
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
              <span>Schedule Visit</span>
            </button>

            <Link
              to={`/property/${property.id}/location`}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Location Map</span>
            </Link>

            <button
              onClick={handleOpenGoogleMaps}
              className="px-5 py-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-sm border border-orange-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              title="Open verified property coordinates in Google Maps"
            >
              <ExternalLink className="w-4 h-4 text-orange-600" />
              <span>Open in Google Maps ↗</span>
            </button>

            <button
              onClick={() => toggleCompareProperty(property.id)}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-colors"
            >
              {isCompared ? 'Compared' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Tabs Bar (Matching Screen 7) */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'AMENITIES', label: 'Amenities' },
            { id: 'LOCATION', label: 'Location' },
            { id: 'WHY', label: 'Why This Property?' },
            { id: 'NEARBY', label: 'Nearby Places' }
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

        {/* Tab 1: Overview & "Why this property?" Side-by-Side (Matching Screen 7) */}
        {(activeTab === 'OVERVIEW' || activeTab === 'WHY') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Why this property? Checklist */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Why this property?</h3>
              </div>

              <ul className="space-y-3 pt-2 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Within your preferred budget:</strong> Priced at ₹{property.priceDisplay || property.price}, perfectly aligned with your ceiling.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>{property.bhk} BHK space fit:</strong> Spacious layout with {property.builtUpAreaSqFt} sq.ft super built-up area and dedicated car parking.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Healthcare access:</strong> Reputed multi-specialty hospitals and emergency care within 1.2 km.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Infrastructure:</strong> 24x7 Siruvani drinking water supply, power backup, and 100% East-facing Vastu compliance.</span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Peaceful neighborhood:</strong> Located in {property.locality} with low ambient traffic noise and green tree cover.</span>
                </li>
              </ul>
            </div>

            {/* Right: Potential Trade-offs Callout Box (Matching Screen 7) */}
            <div className="lg:col-span-5 bg-amber-50/70 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black">Potential trade-offs</h3>
              </div>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Commute to western industrial zone is slightly longer (approx. 28 mins in peak hours).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Fewer ultra-high-end clubhouse amenities compared to mega-township projects.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>High demand residential cluster with limited visitor parking bays.</span>
                </li>
              </ul>

              <div className="pt-2 text-xs font-semibold text-amber-800/80">
                💡 HavenMatch AI displays honest trade-offs so you can decide with total clarity.
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Amenities */}
        {activeTab === 'AMENITIES' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900">Verified Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {[
                '💧 Siruvani Water Supply',
                '✓ 100% Vastu Compliant',
                '🏢 Gated Community',
                '🛡 24x7 Security & CCTV',
                '🚗 Covered Car Parking',
                '⚡ Power Backup Generator',
                '🌳 Landscaped Park',
                '🛗 High-Speed Lift',
                '🏊 Swimming Pool',
                '🏋️ Modern Fitness Gym',
                '🏸 Badminton Court',
                '👶 Children Play Area'
              ].map((amenity, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Nearby Places & Transit */}
        {(activeTab === 'LOCATION' || activeTab === 'NEARBY') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900">Points of Interest Around Property</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenGoogleMaps}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                  <span>Open in Google Maps ↗</span>
                </button>
                <Link
                  to={`/property/${property.id}/location`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>Interactive Map View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-left">
                <span className="text-xs font-bold text-slate-400 block">🏥 Healthcare</span>
                <span className="text-base font-bold text-slate-900 block mt-1">KMCH & PSG Hospitals</span>
                <span className="text-xs text-orange-600 font-extrabold mt-0.5 block">1.2 km (4 mins)</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-left">
                <span className="text-xs font-bold text-slate-400 block">🎓 Education</span>
                <span className="text-base font-bold text-slate-900 block mt-1">Delhi Public School</span>
                <span className="text-xs text-orange-600 font-extrabold mt-0.5 block">1.8 km (6 mins)</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-left">
                <span className="text-xs font-bold text-slate-400 block">🚌 Transit</span>
                <span className="text-base font-bold text-slate-900 block mt-1">Saravanampatti Bus Terminus</span>
                <span className="text-xs text-orange-600 font-extrabold mt-0.5 block">450 m (Walking)</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 text-left">
                <span className="text-xs font-bold text-slate-400 block">🛒 Groceries</span>
                <span className="text-base font-bold text-slate-900 block mt-1">Nilgiris Supermarket</span>
                <span className="text-xs text-orange-600 font-extrabold mt-0.5 block">650 m (2 mins)</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Express Interest Modal (Matching Screen 13) */}
      {showInterestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Interested in this property?</h3>
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
                <p className="text-xs text-orange-600 font-bold">₹{property.priceDisplay || property.price} • {property.locality}</p>
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
                Send Interest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
