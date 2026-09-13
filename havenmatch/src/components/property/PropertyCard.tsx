import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, MatchResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  Scale, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Compass, 
  ChevronRight,
  Droplets,
  Zap
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  match?: MatchResult;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, match }) => {
  const navigate = useNavigate();
  const { 
    navigateToProperty, 
    toggleSaveProperty, 
    isSaved, 
    toggleCompareProperty, 
    isCompared 
  } = useApp();

  const saved = isSaved(property.id);
  const compared = isCompared(property.id);

  const matchScore = match?.overallScore || 92;
  const matchTag = match?.tag || 'Top Lifestyle Fit';

  // Highlight points (3 bullets)
  const matchHighlights = match?.whyItMatches?.slice(0, 3) || [
    'Within your defined budget range',
    'Major medical centers within 1.5 km',
    'Vastu compliant East facing layout'
  ];

  const handleNavigate = () => {
    navigateToProperty(property.id);
    navigate(`/property/${property.id}`);
  };

  return (
    <article className="card-haven overflow-hidden flex flex-col group transition-all duration-200 bg-white border border-slate-200/90 rounded-2xl hover:border-orange-300 hover:shadow-haven-md">
      
      {/* Property Image & Badges */}
      <div 
        onClick={handleNavigate}
        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Match Score Badge */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-haven-sm border border-orange-100">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-sm font-extrabold text-orange-800 tracking-tight">
              {matchScore}% Match
            </span>
          </div>

          {/* Save & Compare Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCompareProperty(property.id);
              }}
              title={compared ? 'Remove from compare' : 'Compare property'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                compared
                  ? 'bg-orange-600 text-white shadow-haven-sm'
                  : 'bg-white/90 backdrop-blur text-slate-700 hover:bg-white hover:text-orange-700 shadow-sm'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveProperty(property.id);
              }}
              title={saved ? 'Remove from saved' : 'Save property'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                saved
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-white/90 backdrop-blur text-slate-700 hover:bg-white hover:text-rose-600 shadow-sm'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Image Tag: Category & RERA */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
            {property.propertyType}
          </span>
          {property.reraApproved && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-orange-700/90 text-white backdrop-blur-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              RERA
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & BHK Row */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {property.priceDisplay}
              </span>
              {property.pricePerSqFt && (
                <span className="text-xs text-slate-500 ml-2 font-normal">
                  ({property.pricePerSqFt})
                </span>
              )}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200/60">
              {matchTag}
            </span>
          </div>

          {/* Title & Locality */}
          <h3 
            onClick={handleNavigate}
            className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-orange-700 cursor-pointer transition-colors"
          >
            {property.title}
          </h3>

          <p className="flex items-center text-xs text-slate-500 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-600 mr-1 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </p>

          {/* Key Specs Bar (Mobile Responsive & Overflow Safe) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-700 mb-3 border border-slate-100">
            <span className="font-semibold">{property.bhk} BHK</span>
            <span className="text-slate-300">•</span>
            <span>{property.bathrooms} Bath</span>
            <span className="text-slate-300">•</span>
            <span>{property.builtUpAreaSqFt} sq.ft</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">{property.facing} Facing</span>
          </div>

          {/* "Why It Matches" Explainability Box */}
          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100/90 text-xs mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-orange-950 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-orange-600" />
                Why this property matches you:
              </span>
            </div>
            {matchHighlights.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{reason}</span>
              </div>
            ))}
          </div>

          {/* Water & Power spec chips */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-4">
            {property.waterSupply?.toLowerCase().includes('siruvani') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                <Droplets className="w-3 h-3 text-sky-600" /> Siruvani Water
              </span>
            )}
            {property.powerBackup && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">
                <Zap className="w-3 h-3 text-amber-600" /> {property.powerBackup} Backup
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-semibold transition-all shadow-haven-sm hover:shadow-haven-md cursor-pointer"
          >
            <span>View Match Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
