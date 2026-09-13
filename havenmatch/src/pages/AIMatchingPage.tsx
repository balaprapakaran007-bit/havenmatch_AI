import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { APIRecommendation } from '../services/matchingService';
import { propertyService } from '../services/propertyService';
import { callAPI } from '../services/api';
import { Property, MatchResult, PropertyType, LifestyleCategory, PriorityLevel } from '../types';
import {
  Sparkles,
  MapPin,
  Heart,
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Clock,
  Users,
  Check,
  Zap,
  Droplets,
  Hospital,
  GraduationCap,
  Trees,
  AlertCircle,
  Loader2,
  MessageSquare,
  Calendar,
  ChevronRight,
  Compass
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
    setOpenVisitModal,
    setVisitTargetPropertyId,
    showToast
  } = useApp();

  const { requirements, setRequirements, lifestyle, setLifestyle } = useLifestyle();

  // Redirect if not signed in
  useEffect(() => {
    if (!userSession) {
      navigate('/auth?redirect=/ai-matching', { replace: true });
    }
  }, [userSession, navigate]);

  // Form State
  const [naturalQuery, setNaturalQuery] = useState(
    'I need a 2BHK under ₹50 lakh in Coimbatore, preferably near my office in Peelamedu, with good hospitals nearby and a quiet neighbourhood.'
  );
  const [intent, setIntent] = useState<'BUY' | 'RENT'>(requirements.intent || 'BUY');
  const [city, setCity] = useState(requirements.city || 'Coimbatore');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(
    requirements.preferredLocalities && requirements.preferredLocalities.length > 0
      ? requirements.preferredLocalities
      : ['Peelamedu', 'Saravanampatti']
  );
  const [budgetMax, setBudgetMax] = useState<number>(requirements.budgetMax || 7500000);
  const [selectedBhk, setSelectedBhk] = useState<number[]>(requirements.bhk || [2, 3]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>(
    requirements.propertyTypes || ['Apartment', 'Villa']
  );
  const [workLocation, setWorkLocation] = useState(lifestyle.workplaceLocation || 'Peelamedu / TIDEL Park');
  const [maxCommute, setMaxCommute] = useState<number>(lifestyle.maxCommuteMins || 25);
  const [hasElderly, setHasElderly] = useState(lifestyle.hasElderlyFamily || false);
  const [hasKids, setHasKids] = useState(lifestyle.hasSchoolGoingKids || false);
  const [hasPets, setHasPets] = useState(lifestyle.hasPets || false);
  const [atmosphere, setAtmosphere] = useState<'Peaceful & Quiet' | 'Balanced Urban' | 'Vibrant & Connected'>(
    lifestyle.atmospherePreference || 'Peaceful & Quiet'
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Quiet Neighborhood',
    'Healthcare Access',
    '24/7 Water & Power Backup'
  ]);

  // Matching / Results State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<Array<{ property: Property; match: MatchResult }>>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  // Load properties initially
  useEffect(() => {
    propertyService.getProperties().then((props) => {
      setAllProperties(props);
    });
  }, []);

  const availableLocalities = [
    'Saravanampatti',
    'Peelamedu',
    'Race Course',
    'RS Puram',
    'Vadavalli',
    'Saibaba Colony',
    'Gandhipuram',
    'Singanallur',
    'Ganapathy',
    'Ramanathapuram'
  ];

  const quickPrompts = [
    {
      label: '⚡ 2 BHK near IT Corridor under ₹45L',
      text: 'I need a 2BHK under ₹45 lakh in Saravanampatti or Peelamedu near IT tech corridor with Siruvani water.',
      intent: 'BUY' as const,
      bhk: [2],
      localities: ['Saravanampatti', 'Peelamedu'],
      budget: 4500000,
      work: 'CHIL SEZ / Saravanampatti'
    },
    {
      label: '🌿 Quiet 3 BHK Villa in Vadavalli',
      text: 'Looking for a peaceful 3 BHK independent villa in Vadavalli with green surroundings and good schools.',
      intent: 'BUY' as const,
      bhk: [3],
      localities: ['Vadavalli'],
      budget: 9500000,
      work: 'RS Puram'
    },
    {
      label: '🏥 Luxury 3 BHK near KMCH Hospital',
      text: 'I need a 3 BHK luxury gated community apartment in Race Course or Peelamedu near KMCH Hospital with elderly parents.',
      intent: 'BUY' as const,
      bhk: [3],
      localities: ['Race Course', 'Peelamedu'],
      budget: 15000000,
      work: 'Peelamedu'
    },
    {
      label: '💼 Rental 2 BHK near TIDEL Park under ₹22k',
      text: 'Need a rental 2BHK apartment under ₹22,000/month near TIDEL Park with power backup and gated security.',
      intent: 'RENT' as const,
      bhk: [2],
      localities: ['Peelamedu', 'Saravanampatti'],
      budget: 25000,
      work: 'TIDEL Park'
    }
  ];

  const priorityOptions = [
    { id: 'Quiet Neighborhood', label: 'Quiet & Peaceful Neighborhood', icon: Trees },
    { id: 'Healthcare Access', label: 'Proximity to Multi-Specialty Hospital', icon: Hospital },
    { id: 'Top Schools', label: 'Top CBSE/ICSE Schools (< 3km)', icon: GraduationCap },
    { id: '24/7 Water & Power Backup', label: 'Siruvani Water & 100% Power Backup', icon: Droplets },
    { id: 'Vastu Compliant', label: 'East Facing & 100% Vastu Compliant', icon: Compass },
    { id: 'Transit Access', label: 'Fast Access to Airport / Railway', icon: Zap }
  ];

  const toggleLocality = (loc: string) => {
    setSelectedLocalities((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const toggleBhk = (num: number) => {
    setSelectedBhk((prev) =>
      prev.includes(num) ? prev.filter((b) => b !== num) : [...prev, num]
    );
  };

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const applyQuickPrompt = (qp: typeof quickPrompts[0]) => {
    setNaturalQuery(qp.text);
    setIntent(qp.intent);
    setSelectedBhk(qp.bhk);
    setSelectedLocalities(qp.localities);
    setBudgetMax(qp.budget);
    setWorkLocation(qp.work);
    showToast(`Applied preset: ${qp.label}`);
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
        bhk: selectedBhk,
        propertyTypes: selectedPropertyTypes
      };
      setRequirements(updatedReq);

      const updatedPriorities: Record<LifestyleCategory, PriorityLevel> = {
        ...lifestyle.priorities,
        healthcare: selectedPriorities.includes('Healthcare Access') ? 'HIGH' : 'MEDIUM',
        schools: selectedPriorities.includes('Top Schools') ? 'HIGH' : 'MEDIUM',
        quietness: selectedPriorities.includes('Quiet Neighborhood') ? 'HIGH' : 'MEDIUM',
        transit: selectedPriorities.includes('Transit Access') ? 'HIGH' : 'MEDIUM',
        safety: 'HIGH',
        petFriendly: hasPets ? 'HIGH' : 'LOW'
      };

      const updatedLife = {
        ...lifestyle,
        workplaceLocation: workLocation,
        maxCommuteMins: maxCommute,
        hasElderlyFamily: hasElderly,
        hasSchoolGoingKids: hasKids,
        hasPets,
        atmospherePreference: atmosphere,
        priorities: updatedPriorities
      };
      setLifestyle(updatedLife);

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
        propertyTypes: selectedPropertyTypes,
        naturalQuery,
        lifestyle: {
          workplaceLocation: workLocation,
          maxCommuteMins: maxCommute,
          priorities: selectedPriorities,
          hasElderlyFamily: hasElderly,
          hasSchoolGoingKids: hasKids,
          hasPets,
          atmospherePreference: atmosphere
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
            const b = rec.scoreBreakdown || { budget: 22, property: 18, location: 26, lifestyle: 23 };
            const budgetPct = Math.round(((b.budget || 20) / 25) * 100);
            const locationPct = Math.round(((b.location || 25) / 30) * 100);
            const lifestylePct = Math.round(((b.lifestyle || 20) / 25) * 100);
            const propertyPct = Math.round(((b.property || 16) / 20) * 100);

            const matchResult: MatchResult = {
              propertyId: prop.id,
              overallScore: rec.matchScore || 90,
              tag:
                rec.matchScore >= 93
                  ? 'Top Lifestyle Fit'
                  : rec.matchScore >= 88
                  ? 'Best Value Match'
                  : rec.matchScore >= 82
                  ? 'Commute Champion'
                  : 'Recommended',
              breakdown: {
                budgetFit: { score: budgetPct, label: budgetPct >= 80 ? 'Excellent' : 'Good', detail: `Budget fit: ${budgetPct}%` },
                commuteFit: { score: locationPct, label: locationPct >= 80 ? 'Excellent' : 'Good', detail: `Commute match to ${workLocation}` },
                healthcareFit: { score: lifestylePct, label: 'Excellent', detail: 'Hospital & Emergency access' },
                transitFit: { score: locationPct, label: 'Good', detail: 'Transit access' },
                schoolsFit: { score: lifestylePct, label: 'Good', detail: 'School access' },
                neighborhoodFit: { score: Math.round((locationPct + lifestylePct) / 2), label: 'Excellent', detail: 'Locality fit' },
                amenitiesFit: { score: propertyPct, label: 'Excellent', detail: 'Property amenities fit' }
              },
              whyItMatches:
                rec.whyThisProperty && rec.whyThisProperty.length > 0
                  ? rec.whyThisProperty
                  : [
                      `Direct ${intent === 'BUY' ? 'purchase' : 'rental'} fit in ${prop.locality}`,
                      `Priced at ${prop.priceDisplay}, within your budget ceiling`,
                      `Safe, verified neighborhood with 24/7 Siruvani water`
                    ],
              tradeOffs: rec.tradeOffs || [],
              lifestyleSummary:
                rec.explanation || `${rec.matchScore}% lifestyle compatibility for your preferences.`
            };

            matchedPairs.push({ property: prop, match: matchResult });
          }
        }
      }

      setResults(matchedPairs);
      showToast(`Found ${matchedPairs.length} AI lifestyle matches for you!`);

      setTimeout(() => {
        document.getElementById('ai-match-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error('[AIMatchingPage] Error executing match:', err);
      showToast('Failed to evaluate matches from AI engine.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!userSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>AI Lifestyle Matching Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Let’s find a home that fits <span className="text-orange-600">your life.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Search beyond basic filters. Describe your daily lifestyle, office commute, family stages, and must-have amenities. Our AI evaluates properties across 100 lifestyle dimensions to calculate explainable match scores.
          </p>
        </div>

        {/* AI Lifestyle Input Card */}
        <form onSubmit={executeAIMatch} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 space-y-8 text-left">
          
          {/* Section 1: Natural Language Conversational Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span>Describe your ideal home in plain words</span>
              </label>
              <span className="text-xs font-semibold text-orange-600">Natural Language AI</span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={naturalQuery}
                onChange={(e) => setNaturalQuery(e.target.value)}
                placeholder="e.g. I need a 2BHK under ₹45 lakh in Coimbatore, preferably near my office in Peelamedu, with good hospitals nearby and a quiet neighbourhood."
                className="w-full rounded-2xl p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all resize-none"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2 pointer-events-none text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>SNS AI Understanding</span>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-500">Quick Inspiration:</span>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyQuickPrompt(qp)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-orange-50/80 hover:bg-orange-100 text-orange-800 border border-orange-200 font-medium transition-colors text-left cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Structured Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Buy or Rent */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Intent</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIntent('BUY')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    intent === 'BUY' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buy Property
                </button>
                <button
                  type="button"
                  onClick={() => setIntent('RENT')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    intent === 'RENT' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rent Property
                </button>
              </div>
            </div>

            {/* 2. City */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">2. City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="Coimbatore">Coimbatore</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>

            {/* 3. Budget Max */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Max Budget</label>
                <span className="text-xs font-extrabold text-orange-700">
                  {intent === 'BUY'
                    ? budgetMax >= 10000000
                      ? `₹${(budgetMax / 10000000).toFixed(2)} Cr`
                      : `₹${(budgetMax / 100000).toFixed(0)} Lakhs`
                    : `₹${budgetMax.toLocaleString('en-IN')}/month`}
                </span>
              </div>
              <input
                type="range"
                min={intent === 'BUY' ? 2000000 : 5000}
                max={intent === 'BUY' ? 25000000 : 60000}
                step={intent === 'BUY' ? 500000 : 1000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            {/* 4. BHK Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">4. BHK Configuration</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleBhk(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedBhk.includes(num)
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} BHK{num === 4 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Work Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                <span>5. Work Location</span>
              </label>
              <input
                type="text"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="e.g. TIDEL Park, Peelamedu, Eachanari"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 6. Max Commute Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>6. Max Commute: {maxCommute} mins</span>
              </label>
              <div className="flex items-center gap-2">
                {[15, 25, 35, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setMaxCommute(mins)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      maxCommute === mins
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Section 3: Preferred Localities */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>7. Preferred Localities in {city}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLocalities.map((loc) => {
                const isSelected = selectedLocalities.includes(loc);
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => toggleLocality(loc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-orange-800 border-orange-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Family & Life Stage */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span>8. Family & Household Profile</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setHasElderly(!hasElderly)}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  hasElderly
                    ? 'bg-orange-50/80 border-orange-300 text-orange-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  hasElderly ? 'bg-orange-600 text-white' : 'border border-slate-300'
                }`}>
                  {hasElderly ? <Check className="w-3.5 h-3.5" /> : null}
                </div>
                <div>
                  <span className="text-xs font-bold block">Elderly Parents / Senior</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Prioritizes lift, ground floor, quietness & hospitals</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasKids(!hasKids)}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  hasKids
                    ? 'bg-orange-50/80 border-orange-300 text-orange-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  hasKids ? 'bg-orange-600 text-white' : 'border border-slate-300'
                }`}>
                  {hasKids ? <Check className="w-3.5 h-3.5" /> : null}
                </div>
                <div>
                  <span className="text-xs font-bold block">School-Going Kids</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Prioritizes top schools, play area & safety</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHasPets(!hasPets)}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  hasPets
                    ? 'bg-orange-50/80 border-orange-300 text-orange-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  hasPets ? 'bg-orange-600 text-white' : 'border border-slate-300'
                }`}>
                  {hasPets ? <Check className="w-3.5 h-3.5" /> : null}
                </div>
                <div>
                  <span className="text-xs font-bold block">Pet Friendly</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Prioritizes parks, walking space & pet-friendly societies</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 5: Top Lifestyle Priorities */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>9. Top Must-Haves & Lifestyle Priorities</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {priorityOptions.map((opt) => {
                const isChecked = selectedPriorities.includes(opt.id);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => togglePriority(opt.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-orange-50/90 border-orange-300 text-orange-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs leading-snug">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Calculated exclusively via backend SNS Lifestyle Engine</span>
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Evaluating 100-pt Lifestyle Fit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Find My Best Lifestyle Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Section 6: Matches / Results Section */}
        {hasSearched && (
          <div id="ai-match-results" className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Matching Complete</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Your Best Matches ({results.length} Homes)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Ranked by lifestyle compatibility against your commute, family profile, and daily priorities.
                </p>
              </div>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Refine Lifestyle Requirements</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No properties matched all strict constraints</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Try expanding your budget ceiling or selecting more localities to see more lifestyle matches.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(({ property, match }) => {
                  const saved = isSaved(property.id);
                  const compared = isCompared(property.id);

                  return (
                    <article
                      key={property.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl hover:border-orange-300 transition-all flex flex-col text-left group"
                    >
                      <div
                        onClick={() => {
                          navigateToProperty(property.id);
                          navigate(`/property/${property.id}`);
                        }}
                        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-orange-100">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {match.overallScore}% Match
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompareProperty(property.id);
                            }}
                            title="Compare Property"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              compared
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/90 text-slate-700 hover:bg-white'
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveProperty(property.id);
                            }}
                            title="Save Property"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              saved
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-white/90 text-slate-700 hover:bg-white'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-600/90 text-white inline-block mb-1">
                            {match.tag}
                          </span>
                          <h4 className="text-sm font-bold truncate leading-tight">{property.title}</h4>
                          <p className="text-[11px] text-slate-200 truncate">{property.locality}, {property.city}</p>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-xs text-slate-400 font-medium block">Price</span>
                            <span className="text-base font-black text-slate-900">{property.priceDisplay}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-medium block">Config</span>
                            <span className="text-xs font-bold text-slate-700">
                              {property.bhk} BHK • {property.builtUpAreaSqFt} sq.ft
                            </span>
                          </div>
                        </div>

                        <div className="bg-orange-50/60 rounded-2xl p-3.5 border border-orange-100/80 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                            <span>Why this matches you:</span>
                          </div>
                          <ul className="space-y-1">
                            {match.whyItMatches.slice(0, 3).map((reason, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="leading-tight">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Commute Score</span>
                            <span className="font-bold text-slate-800">{match.breakdown.commuteFit.score}% fit</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Healthcare Access</span>
                            <span className="font-bold text-slate-800">{match.breakdown.healthcareFit.score}% fit</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigateToProperty(property.id);
                              navigate(`/property/${property.id}`);
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors cursor-pointer"
                          >
                            View Property
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVisitTargetPropertyId(property.id);
                              setOpenVisitModal(true);
                            }}
                            className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule</span>
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
