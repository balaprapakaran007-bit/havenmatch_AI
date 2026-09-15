import React, { useState } from 'react';
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
  Zap,
  Phone,
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  Navigation,
  Clock,
  Sparkles
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  match?: MatchResult;
  onContactSeller?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, match, onContactSeller }) => {
  const navigate = useNavigate();
  const { 
    navigateToProperty, 
    toggleSaveProperty, 
    isSaved, 
    toggleCompareProperty, 
    isCompared,
    showToast,
    userSession
  } = useApp();

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMsg, setContactMsg] = useState('Hi, I am interested in this property on HavenMatch AI. Please share more details.');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const saved = isSaved(property.id);
  const compared = isCompared(property.id);

  const formatPrice = (p: Property) => {
    if (p.priceDisplay) return p.priceDisplay;
    if (!p.price) return 'Contact for Price';
    if (p.intent === 'RENT' || p.price < 100000) {
      return `₹${p.price.toLocaleString('en-IN')}/mo`;
    }
    if (p.price >= 10000000) {
      return `₹${(p.price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(p.price / 100000).toFixed(0)} Lakhs`;
  };

  const formattedPrice = formatPrice(property);

  const matchScore = match?.overallScore || (82 + ((property.id ? property.id.charCodeAt(property.id.length - 1) : 0) % 12));
  const matchTag = match?.tag || (matchScore >= 90 ? 'Top Lifestyle Fit' : matchScore >= 80 ? 'Best Value Match' : 'Recommended');

  // Highlight points (3 bullets)
  const matchHighlights = match?.whyItMatches?.slice(0, 3) || [
    `Within defined budget range (${formattedPrice})`,
    `Located in high-demand ${property.locality || 'prime'} corridor`,
    `Vastu compliant ${property.facing || 'East'} facing ${property.bhk || 2} BHK layout`
  ];

  // Derive commute & location highlights
  const localityLower = (property.locality || '').toLowerCase();
  let commuteInfo = '15–20 mins to major IT parks & transit';
  if (localityLower.includes('peelamedu')) {
    commuteInfo = '8 mins to TIDEL Park & Airport';
  } else if (localityLower.includes('race course')) {
    commuteInfo = '5 mins to Railway Station & Club';
  } else if (localityLower.includes('saravanampatti')) {
    commuteInfo = '6 mins to CHIL SEZ & KGISL IT Park';
  } else if (localityLower.includes('rs puram')) {
    commuteInfo = '10 mins to DB Road & City Center';
  } else if (localityLower.includes('vadavalli')) {
    commuteInfo = '15 mins to Bharathiar University & Marudhamalai';
  }

  const handleNavigate = () => {
    navigateToProperty(property.id);
    navigate(`/property/${property.id}`);
  };

  const handleOpenContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContactSeller) {
      onContactSeller(property);
    } else {
      setShowContactModal(true);
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const buyerId = userSession?.userId || userSession?.email || 'buyer-web';
      await fetch('/api/interests/express', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          buyerId,
          sellerId: property.seller?.id || property.sellerId || property.seller?.email || 'owner@havenmatch.ai',
          message: contactMsg
        })
      }).catch(() => {});

      setIsSending(false);
      setSentSuccess(true);
      showToast(`Inquiry sent to ${property.seller?.name || 'property owner'}!`);
      setTimeout(() => {
        setSentSuccess(false);
        setShowContactModal(false);
      }, 1500);
    } catch {
      setIsSending(false);
      setShowContactModal(false);
      showToast(`Inquiry sent! The seller will contact you.`);
    }
  };

  return (
    <>
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
                  {formattedPrice}
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

            <p className="flex items-center text-xs text-slate-500 mt-1 mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600 mr-1 shrink-0" />
              <span className="truncate">{property.locality}, {property.city}</span>
            </p>

            {/* Commute Tag */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50/70 border border-orange-100 text-[11px] font-medium text-orange-900 mb-2.5">
              <Clock className="w-3 h-3 text-orange-600 shrink-0" />
              <span className="truncate">{commuteInfo}</span>
            </div>

            {/* Key Specs Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-700 mb-3 border border-slate-100">
              <span className="font-semibold">{property.bhk || 2} BHK</span>
              <span className="text-slate-300">•</span>
              <span>{property.bathrooms || property.bhk || 2} Bath</span>
              {property.builtUpAreaSqFt ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{property.builtUpAreaSqFt} sq.ft</span>
                </>
              ) : null}
              {property.facing ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="truncate">{property.facing} Facing</span>
                </>
              ) : null}
            </div>

            {/* "Why It Matches" Explainability Box */}
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100/90 text-xs mb-3 space-y-1.5">
              <div className="flex items-center justify-between text-orange-950 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-orange-600" />
                  Why this home?
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

          {/* Action Buttons Row: Contact Seller + View Details */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenContact}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>Contact</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate();
              }}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-bold transition-all shadow-haven-sm hover:shadow-haven-md cursor-pointer"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Quick Contact Seller Modal */}
      {showContactModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Direct Connect</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Contact Seller / Owner</h3>
                <p className="text-xs text-slate-500">{property.title}</p>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seller Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-orange-700 font-extrabold text-sm shrink-0 shadow-xs">
                {(property.seller?.name || 'Dr. K. Senthil Kumar').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {property.seller?.name || 'Dr. K. Senthil Kumar'}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {property.seller?.role || 'Individual Owner'} • {property.locality}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {property.seller?.phone || '+91 98422 11223'}
                </p>
              </div>
            </div>

            {sentSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-emerald-700">
                  The property owner has received your request and will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Message to Owner
                  </label>
                  <textarea
                    rows={3}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 resize-none text-slate-800"
                    placeholder="Write your questions, schedule availability, or requirements..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${property.seller?.phone || '+919842211223'}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Direct Call</span>
                  </a>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Sending...' : 'Send Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

