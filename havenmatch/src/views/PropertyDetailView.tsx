import React, { useState, useEffect } from 'react';
import { Property, MatchResult } from '../types';
import { propertyService } from '../services/propertyService';
import { matchingService } from '../services/matchingService';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { LocationIntelligence } from '../components/location/LocationIntelligence';
import { MatchRadar } from '../components/property/MatchRadar';
import { VisitSchedulerModal } from '../components/visit/VisitSchedulerModal';
import { 
  Heart, 
  Scale, 
  Share2, 
  MapPin, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Send, 
  Compass, 
  Droplets, 
  Zap, 
  Sparkles,
  Phone,
  CheckCircle2
} from 'lucide-react';

export const PropertyDetailView: React.FC = () => {
  const { 
    selectedPropertyId, 
    setActiveView, 
    toggleSaveProperty, 
    isSaved, 
    toggleCompareProperty, 
    isCompared,
    showToast,
    openVisitModal,
    setOpenVisitModal
  } = useApp();
  const { requirements, lifestyle } = useLifestyle();

  const [property, setProperty] = useState<Property | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    if (selectedPropertyId) {
      propertyService.getPropertyById(selectedPropertyId).then((p) => {
        if (p) {
          setProperty(p);
          matchingService.evaluateMatch(p, requirements, lifestyle).then(setMatch);
        }
      });
    }
  }, [selectedPropertyId, requirements, lifestyle]);

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Loading property intelligence...</p>
      </div>
    );
  }

  const saved = isSaved(property.id);
  const compared = isCompared(property.id);
  const matchScore = match?.overallScore || 94;

  const handleExpressInterest = () => {
    setInterestSent(true);
    showToast('Your interest and lifestyle profile were sent directly to the owner!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-32 lg:pb-12">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('discover')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-orange-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleCompareProperty(property.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              compared
                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{compared ? 'In Compare Deck' : 'Compare'}</span>
          </button>

          <button
            onClick={() => toggleSaveProperty(property.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              saved
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showToast('Property link copied to clipboard!');
              }
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Share property"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Property Title & Price Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-white">
              {property.propertyType}
            </span>
            {property.reraApproved && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                RERA: {property.reraId}
              </span>
            )}
            {property.vastuCompliant && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                100% Vastu Compliant
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {property.title}
          </h1>
          <p className="flex items-center text-xs sm:text-sm text-slate-500 mt-1">
            <MapPin className="w-4 h-4 text-orange-600 mr-1 shrink-0" />
            <span>{property.fullAddress}</span>
          </p>
        </div>

        {/* Price Box */}
        <div className="text-left md:text-right bg-orange-50/70 p-3.5 sm:p-4 rounded-2xl border border-orange-200/80 md:min-w-[200px]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {property.intent === 'BUY' ? 'Total Cost' : 'Monthly Rent'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {property.priceDisplay}
          </div>
          {property.pricePerSqFt && (
            <span className="text-xs text-slate-500 font-medium">
              {property.pricePerSqFt} • Maint: {property.maintenanceMonthly}
            </span>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="aspect-[16/10] sm:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-haven-sm relative">
          <img
            src={property.images[activeImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Floating Match Score Badge on Image */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-haven-md border border-orange-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
            <div>
              <span className="text-base sm:text-lg font-black text-orange-800">
                {matchScore}% Match
              </span>
              <span className="text-[10px] block text-slate-500 font-semibold uppercase">
                {match?.tag || 'Lifestyle Fit'}
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {property.images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImageIndex === idx
                    ? 'border-orange-600 ring-2 ring-orange-300/60 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Key Architectural Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-haven p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Configuration</span>
          <p className="text-base font-black text-slate-900 mt-0.5">{property.bhk} BHK</p>
          <span className="text-[10px] text-slate-500">{property.bathrooms} Bath • {property.balconies} Balcony</span>
        </div>

        <div className="card-haven p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Built-up Area</span>
          <p className="text-base font-black text-slate-900 mt-0.5">{property.builtUpAreaSqFt} sq.ft</p>
          <span className="text-[10px] text-slate-500">Carpet: {property.carpetAreaSqFt} sq.ft</span>
        </div>

        <div className="card-haven p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Facing</span>
          <p className="text-base font-black text-slate-900 mt-0.5">{property.facing}</p>
          <span className="text-[10px] text-orange-700 font-semibold">Vastu Aligned</span>
        </div>

        <div className="card-haven p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Floor Level</span>
          <p className="text-base font-black text-slate-900 mt-0.5">{property.floor} of {property.totalFloors}</p>
          <span className="text-[10px] text-slate-500">High-speed lifts</span>
        </div>

        <div className="card-haven p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Parking</span>
          <p className="text-base font-black text-slate-900 mt-0.5 truncate">{property.parking}</p>
          <span className="text-[10px] text-slate-500">Covered & Stilt</span>
        </div>

        <div className="card-haven p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Furnishing</span>
          <p className="text-base font-black text-slate-900 mt-0.5 truncate">{property.furnishing}</p>
          <span className="text-[10px] text-slate-500">{property.possession}</span>
        </div>
      </div>

      {/* Two Column Layout: Explainability & Match Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: "Why This Property" & Honest Trade-offs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* "Why This Property?" Explainability Card */}
          <div className="card-haven p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-orange-900">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">Why This Property Fits You</h3>
                <p className="text-xs text-slate-500">Tailored explanation by HavenMatch AI</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(match?.whyItMatches || []).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50/70 border border-orange-100 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5 font-black" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Honest Trade-offs section */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Honest Trade-off Considerations
              </h4>
              <div className="space-y-2">
                {(match?.tradeOffs || []).map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description & Indian Infrastructure Highlights */}
          <div className="card-haven p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Property Description & Utility Reliability
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>

            {/* Indian Specific Utilities Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs">
                <span className="font-bold text-sky-900 flex items-center gap-1 mb-1">
                  <Droplets className="w-4 h-4 text-sky-600" /> Water Supply
                </span>
                <span className="text-slate-700">{property.waterSupply}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-amber-600" /> Power Backup
                </span>
                <span className="text-slate-700">{property.powerBackup} generator backup for lifts and residence</span>
              </div>
            </div>

            {/* Society Amenities */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Society Amenities & Security
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Embedded Location Intelligence Component with Satellite View */}
          <LocationIntelligence property={property} />

        </div>

        {/* Right 1 Col: Match Radar & Seller Box */}
        <div className="space-y-6">
          
          {/* Multi-Dimensional Match Breakdown */}
          {match && (
            <MatchRadar
              breakdown={match.breakdown}
              overallScore={match.overallScore}
            />
          )}

          {/* Verified Owner / Builder Card */}
          <div className="card-haven p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Direct Owner Contact
            </span>

            <div className="flex items-center gap-3">
              <img
                src={property.seller.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={property.seller.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-400/50"
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{property.seller.name}</h4>
                <p className="text-xs text-slate-500">{property.seller.role}</p>
                <span className="text-[10px] text-orange-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Responds {property.seller.responseRate}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setOpenVisitModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-haven-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Free Visit</span>
              </button>

              <button
                onClick={handleExpressInterest}
                disabled={interestSent}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  interestSent
                    ? 'bg-orange-50 text-orange-800 border-orange-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-orange-600" />
                <span>{interestSent ? 'Interest Sent to Owner' : 'Express Interest'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-16 left-3 right-3 z-30 lg:hidden shadow-2xl">
        <div className="bg-white/95 backdrop-blur-md border border-orange-200 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-haven-lg">
          <div className="min-w-0">
            <span className="text-xs font-black text-slate-900 block truncate">
              {property.priceDisplay}
            </span>
            <span className="text-[10px] font-extrabold text-orange-600">
              {matchScore}% Match
            </span>
          </div>

          <button
            onClick={() => setOpenVisitModal(true)}
            className="py-2.5 px-4 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* Visit Scheduler Modal */}
      <VisitSchedulerModal
        property={property}
        isOpen={openVisitModal}
        onClose={() => setOpenVisitModal(false)}
      />

    </div>
  );
};
