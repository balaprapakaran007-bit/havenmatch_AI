import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { APIRecommendation } from '../services/matchingService';
import { propertyService } from '../services/propertyService';
import { callAPI } from '../services/api';
import { Property, MatchResult, PropertyType } from '../types';
import {
  Sparkles,
  MapPin,
  Heart,
  Scale,
  ArrowRight,
  CheckCircle2,
  Clock,
  Check,
  Hospital,
  GraduationCap,
  Trees,
  AlertCircle,
  Loader2,
  ChevronRight,
  Home,
  Building,
  Briefcase,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const AIMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    userSession,
    toggleSaveProperty,
    isSaved,
    toggleCompareProperty,
    isCompared,
    navigateToProperty,
    showToast
  } = useApp();

  const { requirements, setRequirements, lifestyle, setLifestyle } = useLifestyle();

  // Redirect if not signed in
  useEffect(() => {
    if (!userSession) {
      navigate('/auth?redirect=/ai-matching', { replace: true });
    }
  }, [userSession, navigate]);

  // Form State (Screen 2)
  const [naturalQuery, setNaturalQuery] = useState(
    'I need a 2 BHK in Coimbatore under ₹70 lakhs, close to Tidel Park, quiet area with good hospitals and schools.'
  );
  const [intent, setIntent] = useState<'BUY' | 'RENT'>(requirements.intent || 'BUY');
  const [budgetMax, setBudgetMax] = useState<number>(requirements.budgetMax || 7000000);
  const [selectedBhk, setSelectedBhk] = useState<number[]>(requirements.bhk || [2, 3]);
  const [city, setCity] = useState(requirements.city || 'Coimbatore');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(
    requirements.preferredLocalities && requirements.preferredLocalities.length > 0
      ? requirements.preferredLocalities
      : ['Saravanampatti', 'Peelamedu']
  );
  const [workLocation, setWorkLocation] = useState(lifestyle.workplaceLocation || 'Tidel Park, Coimbatore');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Quiet Area',
    'Good Hospitals',
    'Near Top Schools',
    'Siruvani Water'
  ]);

  // Results State (Screen 3)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<Array<{ property: Property; match: MatchResult }>>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilterChip, setActiveFilterChip] = useState<'Best Match' | 'Near to Work' | 'Budget Friendly' | 'Quiet Area'>('Best Match');
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    propertyService.getProperties().then(setAllProperties);
  }, []);

  const availableLocalities = [
    'Saravanampatti',
    'Peelamedu',
    'Race Course',
    'RS Puram',
    'Vadavalli',
    'Saibaba Colony',
    'Gandhipuram',
    'Singanallur'
  ];

  const quickPrompts = [
    { label: '⚡ 2 BHK near IT Corridor', text: 'I need a 2 BHK in Coimbatore under ₹70 lakhs, close to Tidel Park, quiet area with good hospitals and schools.', budget: 7000000, bhk: [2], work: 'Tidel Park' },
    { label: '🌿 Quiet 3 BHK in Vadavalli', text: 'Looking for a quiet 3 BHK villa in Vadavalli with green space and near top schools under ₹95 lakhs.', budget: 9500000, bhk: [3], work: 'RS Puram' },
    { label: '💼 Rental 2 BHK near TIDEL', text: 'Rental 2 BHK flat near Tidel Park under ₹22,000/month with 24/7 security and water.', budget: 22000, bhk: [2], work: 'Tidel Park', intent: 'RENT' as const }
  ];

  const preferenceOptions = [
    'Quiet Area',
    'Good Hospitals',
    'Near Top Schools',
    'Siruvani Water',
    'Pet Friendly',
    'East Facing / Vastu',
    'Power Backup 100%'
  ];

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const toggleLocality = (loc: string) => {
    setSelectedLocalities((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const executeAIMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEvaluating(true);
    setHasSearched(true);

    try {
      const updatedReq = {
        ...requirements,
        intent,
        city,
        preferredLocalities: selectedLocalities,
        budgetMax,
        bhk: selectedBhk
      };
      setRequirements(updatedReq);

      const buyerPayload = {
        userId: userSession?.id || 'usr-guest',
        name: userSession?.name || 'Buyer',
        email: userSession?.email || '',
        phone: userSession?.phone || '',
        intent,
        city,
        preferredLocalities: selectedLocalities,
        budgetMax,
        budgetMin: 0,
        bhk: selectedBhk,
        naturalQuery,
        lifestyle: {
          workplaceLocation: workLocation,
          priorities: selectedPreferences
        }
      };

      const response = await callAPI<{
        success: boolean;
        recommendations: APIRecommendation[];
      }>('matching/buyer', {
        action: 'matching/buyer',
        buyer: buyerPayload
      });

      const loadedProps = allProperties.length > 0 ? allProperties : await propertyService.getProperties();
      const propMap = new Map(loadedProps.map((p) => [p.id, p]));

      const matchedPairs: Array<{ property: Property; match: MatchResult }> = [];

      if (response && response.recommendations && response.recommendations.length > 0) {
        for (const rec of response.recommendations) {
          const prop = propMap.get(rec.propertyId) || (rec.property as Property);
          if (prop) {
            const matchResult: MatchResult = {
              propertyId: prop.id,
              overallScore: rec.matchScore || 92,
              tag: rec.matchScore >= 90 ? 'Top Lifestyle Fit' : 'Recommended',
              breakdown: {
                budgetFit: { score: 95, label: 'Excellent', detail: 'Budget match' },
                commuteFit: { score: 90, label: 'Excellent', detail: `Commute to ${workLocation}` },
                healthcareFit: { score: 92, label: 'Excellent', detail: 'Healthcare access' },
                transitFit: { score: 88, label: 'Good', detail: 'Transit access' },
                schoolsFit: { score: 90, label: 'Good', detail: 'Schools access' },
                neighborhoodFit: { score: 94, label: 'Excellent', detail: 'Neighborhood match' },
                amenitiesFit: { score: 90, label: 'Excellent', detail: 'Amenities' }
              },
              whyItMatches: rec.whyThisProperty && rec.whyThisProperty.length > 0
                ? rec.whyThisProperty
                : [
                    'Within your budget',
                    `Fits your ${prop.bhk} BHK requirement`,
                    'Close to your workplace',
                    'Matches your preference for a quiet neighbourhood',
                    'Good access to healthcare and schools'
                  ],
              tradeOffs: rec.tradeOffs || [],
              lifestyleSummary: rec.explanation || `${rec.matchScore}% match for your lifestyle.`
            };

            matchedPairs.push({ property: prop, match: matchResult });
          }
        }
      }

      setResults(matchedPairs);
      showToast(`Found ${matchedPairs.length} homes that fit your lifestyle!`);

      setTimeout(() => {
        document.getElementById('ai-match-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err) {
      console.error('[AIMatchingPage] Error executing match:', err);
      showToast('Failed to evaluate matches from AI engine.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!userSession) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Title (Screen 2) */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-orange-600 font-extrabold text-xl sm:text-2xl tracking-tight">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-slate-900">AI Match</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Tell us about your lifestyle. Our AI will find homes that fit you.
          </p>
        </div>

        {/* AI Bot Greeting Card (Screen 2) */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 rounded-3xl p-4 sm:p-5 border border-orange-200/80 shadow-xs flex items-center gap-4 text-left">
          {/* Cute 3D Bot Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center justify-center shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Speech Bubble */}
          <div className="relative bg-white rounded-2xl p-3 sm:p-4 border border-orange-100 shadow-sm flex-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
              Hi! I'm <span className="text-orange-600 font-extrabold">Haven AI</span> 👋
              <br />
              Let's find a home that fits your life. What are you looking for?
            </p>
          </div>
        </div>

        {/* Form Container (Screen 2 Lifestyle Inputs) */}
        <form onSubmit={executeAIMatch} className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-200/90 space-y-5 text-left">
          
          {/* Natural Language Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Describe Naturally in Plain Words</span>
            </label>
            <textarea
              rows={2}
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="e.g. I need a 2 BHK in Coimbatore under ₹70 lakhs, close to Tidel Park, quiet area with good hospitals and schools."
              className="w-full rounded-2xl p-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 text-xs sm:text-sm text-slate-800 focus:outline-none transition-all resize-none"
            />
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNaturalQuery(qp.text);
                    setBudgetMax(qp.budget);
                    setSelectedBhk(qp.bhk);
                    setWorkLocation(qp.work);
                    if (qp.intent) setIntent(qp.intent);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-semibold transition-colors cursor-pointer"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Interactive Form Fields matching Screen 2 */}
          <div className="space-y-3">
            
            {/* 1. Buy or Rent */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Buy or Rent?</span>
                  <span className="text-[11px] text-slate-500">
                    {intent === 'BUY' ? 'Looking to Buy a home' : 'Looking for Rental'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIntent('BUY');
                    setBudgetMax(7000000);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    intent === 'BUY' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntent('RENT');
                    setBudgetMax(25000);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    intent === 'RENT' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Rent
                </button>
              </div>
            </div>

            {/* 2. Your Budget */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Your Budget</span>
                    <span className="text-[11px] text-slate-500">
                      {intent === 'BUY' ? 'e.g. ₹40 - ₹70 Lakhs' : 'e.g. ₹15,000 - ₹30,000/mo'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-orange-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {intent === 'BUY'
                    ? budgetMax >= 10000000
                      ? `₹${(budgetMax / 10000000).toFixed(2)} Cr`
                      : `₹${(budgetMax / 100000).toFixed(0)} Lakhs`
                    : `₹${budgetMax.toLocaleString('en-IN')}/mo`}
                </span>
              </div>
              <input
                type="range"
                min={intent === 'BUY' ? 2000000 : 8000}
                max={intent === 'BUY' ? 20000000 : 60000}
                step={intent === 'BUY' ? 500000 : 1000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 3. Bedrooms / BHK */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Bedrooms</span>
                  <span className="text-[11px] text-slate-500">e.g. 2 or 3 BHK</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSelectedBhk((prev) =>
                        prev.includes(num) ? prev.filter((b) => b !== num) : [...prev, num]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedBhk.includes(num)
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {num} BHK{num === 4 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Preferred Location */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Preferred Location</span>
                  <span className="text-[11px] text-slate-500">e.g. Coimbatore ({city})</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {availableLocalities.map((loc) => {
                  const isSel = selectedLocalities.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocality(loc)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                        isSel
                          ? 'bg-orange-50 text-orange-800 border-orange-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 text-orange-600" />}
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Work / College Location */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Work / College Location</span>
                  <span className="text-[11px] text-slate-500">e.g. Tidel Park, Saravanampatti</span>
                </div>
              </div>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="e.g. Tidel Park, Peelamedu"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 6. Lifestyle Preferences */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Lifestyle Preferences</span>
                  <span className="text-[11px] text-slate-500">Quiet area, schools, hospitals...</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {preferenceOptions.map((pref) => {
                  const isSel = selectedPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                        isSel
                          ? 'bg-orange-50 text-orange-800 border-orange-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 text-orange-600" />}
                      <span>{pref}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Primary CTA Button (Screen 2) */}
          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-base shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI is understanding your lifestyle...</span>
              </>
            ) : (
              <>
                <span>Find My Matches</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Results Section (Screen 3: Your AI Matches) */}
        {hasSearched && (
          <div id="ai-match-results" className="space-y-5 pt-4 text-left">
            
            {/* Results Header (Screen 3) */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-orange-600 font-extrabold text-lg sm:text-xl">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-slate-900">Your AI Matches</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                We found {results.length} homes that fit your lifestyle.
              </p>
            </div>

            {/* Filter Chips (Screen 3: Best Match, Near to Work, Budget Friendly, Quiet Area) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['Best Match', 'Near to Work', 'Budget Friendly', 'Quiet Area'] as const).map((chip) => {
                const isActive = activeFilterChip === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setActiveFilterChip(chip)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Property Match Cards (Screen 3) */}
            {results.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900">No properties matched all strict criteria</h3>
                <p className="text-xs text-slate-500 mt-1">Try broadening budget or location selections.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {results.map(({ property, match }) => {
                  const saved = isSaved(property.id);

                  return (
                    <article
                      key={property.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all"
                    >
                      {/* Image with Match Badge & Save Button */}
                      <div
                        onClick={() => {
                          navigateToProperty(property.id);
                          navigate(`/property/${property.id}`);
                        }}
                        className="relative aspect-[16/9] sm:aspect-[16/8] overflow-hidden bg-slate-100 cursor-pointer group"
                      >
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Top Left: Match Badge (Screen 3) */}
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{match.overallScore}% Match</span>
                        </div>

                        {/* Top Right: Heart Save Icon */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveProperty(property.id);
                          }}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 sm:p-6 space-y-4">
                        
                        {/* Price, BHK, Location */}
                        <div className="space-y-1">
                          <p className="text-xl sm:text-2xl font-black text-slate-900">
                            {property.priceDisplay || `₹${(property.price / 100000).toFixed(0)} Lakhs`}
                          </p>
                          <h3 className="text-sm sm:text-base font-bold text-slate-800">
                            {property.bhk} BHK {property.propertyType}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>{property.locality}, {property.city}</span>
                          </p>
                        </div>

                        {/* Highlight indicators (Screen 3: Commute, Schools, Hospitals) */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            <span>18 min commute</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Near schools</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100">
                            <Hospital className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Good Hospitals</span>
                          </span>
                        </div>

                        {/* "Why this home?" Accordion / Box (Screen 3) */}
                        <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-2">
                          <span className="text-xs font-extrabold text-orange-950 block">Why this home?</span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {match.whyItMatches.map((reason, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[3]" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions (Screen 3: View Details & Contact Seller) */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigateToProperty(property.id);
                              navigate(`/property/${property.id}`);
                            }}
                            className="py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Connecting with seller of ${property.title}...`);
                              navigate('/messages');
                            }}
                            className="py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                          >
                            Contact Seller
                          </button>
                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
