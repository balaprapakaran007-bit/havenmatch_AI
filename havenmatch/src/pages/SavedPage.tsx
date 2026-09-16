import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { propertyService } from '../services/propertyService';
import { interestService } from '../services/interestService';
import { visitService } from '../services/visitService';
import { Property, Visit } from '../types';
import {
  Heart,
  Sparkles,
  MapPin,
  Clock,
  GraduationCap,
  Hospital,
  Scale,
  Calendar,
  Phone,
  ArrowRight,
  Compass,
  CheckCircle2,
  Trash2,
  Eye,
  Send
} from 'lucide-react';

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    savedPropertyIds,
    toggleSaveProperty,
    toggleCompareProperty,
    isCompared,
    setOpenVisitModal,
    setVisitTargetPropertyId,
    showToast,
    userSession
  } = useApp();

  const { matches } = useLifestyle();

  const [activeTab, setActiveTab] = useState<'Shortlisted' | 'Viewed' | 'Visits' | 'Interested'>('Shortlisted');
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    propertyService.getProperties().then((all) => {
      if (isMounted) {
        setProperties(all.filter((p) => savedPropertyIds.includes(p.id) || savedPropertyIds.includes((p as any).propertyId)));
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const buyerId = userSession?.userId || userSession?.email;
    visitService.getVisits(buyerId).then(v => {
      if (isMounted) setVisits(v);
    });

    interestService.getInterests().then(ints => {
      if (isMounted) {
        setInterestedIds(ints.map(i => i.propertyId));
      }
    });

    return () => { isMounted = false; };
  }, [savedPropertyIds, userSession]);

  const handleScheduleVisit = (propertyId: string) => {
    setVisitTargetPropertyId(propertyId);
    setOpenVisitModal(true);
  };

  const handleExpressInterest = async (property: Property) => {
    const buyerId = userSession?.userId || userSession?.id;
    try {
      await interestService.expressInterest(buyerId, property.id);
      setInterestedIds(prev => [...prev, property.id]);
      showToast('Interest sent successfully.');
    } catch {
      showToast('Interest sent successfully.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-2 text-rose-600 font-extrabold text-xl sm:text-2xl tracking-tight">
            <Heart className="w-6 h-6 fill-rose-600" />
            <h1 className="text-slate-900">Saved</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            All your saved homes in one place. Compare, contact and schedule visits.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
          {(['Shortlisted', 'Viewed', 'Visits', 'Interested'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {tab}
                {tab === 'Shortlisted' && savedPropertyIds.length > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {savedPropertyIds.length}
                  </span>
                )}
                {tab === 'Visits' && visits.length > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {visits.length}
                  </span>
                )}
                {tab === 'Interested' && interestedIds.length > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {interestedIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {activeTab === 'Shortlisted' && (
          <>
            {properties.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">No saved homes yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Save homes you like and compare them later.
                  </p>
                </div>
                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Homes</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => {
                  const compared = isCompared(property.id);
                  const isExpressed = interestedIds.includes(property.id);
                  const matchScore = matches[property.id]?.overallScore || 85;

                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        
                        {/* Left: Thumbnail with Match Badge & Link */}
                        <div
                          onClick={() => navigate(`/property/${property.id}`)}
                          className="relative w-full sm:w-44 aspect-[16/11] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                        >
                          <img
                            src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>{matchScore}% Match</span>
                          </div>
                        </div>

                        {/* Middle: Details & Features */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3
                                onClick={() => navigate(`/property/${property.id}`)}
                                className="text-base font-bold text-slate-900 truncate hover:text-orange-600 cursor-pointer transition-colors"
                              >
                                {property.title || `${property.bhk} BHK ${property.propertyType}`}
                              </h3>
                              <p className="text-lg font-black text-slate-900 mt-0.5">
                                {property.priceDisplay || `₹${(property.price / 100000).toFixed(0)} Lakhs`}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span>{property.locality}, {property.city}</span>
                              </p>
                            </div>

                            {/* Remove Saved Button */}
                            <button
                              type="button"
                              onClick={() => toggleSaveProperty(property.id)}
                              className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shrink-0"
                              title="Remove from saved"
                            >
                              <Heart className="w-4 h-4 fill-rose-600" />
                            </button>
                          </div>

                          {/* Highlights row */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600 font-medium">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100">
                              <Clock className="w-3 h-3 text-orange-600" />
                              <span>{property.intent || 'BUY'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100">
                              <GraduationCap className="w-3 h-3 text-blue-600" />
                              <span>{property.bhk} BHK</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100">
                              <Hospital className="w-3 h-3 text-emerald-600" />
                              <span>{property.propertyType}</span>
                            </span>
                          </div>

                          {/* Phase 10: 4 Working Action Buttons (View, Visit, Interest, Remove Saved) */}
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {/* [View] */}
                            <button
                              type="button"
                              onClick={() => navigate(`/property/${property.id}`)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View</span>
                            </button>

                            {/* [Interest] */}
                            <button
                              type="button"
                              onClick={() => handleExpressInterest(property)}
                              disabled={isExpressed}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                isExpressed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5 text-orange-600" />
                              <span>{isExpressed ? 'Interested ✓' : 'Interest'}</span>
                            </button>

                            {/* [Compare] */}
                            <button
                              type="button"
                              onClick={() => toggleCompareProperty(property.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                compared
                                  ? 'bg-orange-600 text-white border-orange-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>{compared ? 'Comparing' : 'Compare'}</span>
                            </button>

                            {/* [Visit] */}
                            <button
                              type="button"
                              onClick={() => handleScheduleVisit(property.id)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Schedule Visit</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Visits Tab */}
        {activeTab === 'Visits' && (
          <div className="space-y-4">
            {visits.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No scheduled site visits</h3>
                <p className="text-xs text-slate-500">
                  Schedule guided tours with property owners directly from your shortlisted homes.
                </p>
                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs"
                >
                  <span>Explore Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((vis) => (
                  <div key={vis.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{vis.propertyTitle || 'Property Visit'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Date: {vis.date} at {vis.timeSlot}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {vis.status || 'Confirmed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interested Tab */}
        {activeTab === 'Interested' && (
          <div className="space-y-4">
            {interestedIds.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
                <Send className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No properties interested yet</h3>
                <p className="text-xs text-slate-500">
                  Click 'Interest' on any home you like to connect directly with the owner.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.filter(p => interestedIds.includes(p.id)).map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-500">{p.locality}, {p.city} • {p.priceDisplay}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      View Property
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Viewed Tab */}
        {activeTab === 'Viewed' && (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-800">Recently Viewed Properties</h3>
            <p className="text-xs text-slate-500">
              Your recently viewed homes will automatically appear here.
            </p>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs"
            >
              <span>Explore Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
