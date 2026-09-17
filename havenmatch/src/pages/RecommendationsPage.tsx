import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { Property } from '../types';
import {
  Sparkles,
  Search,
  Compass,
  Heart,
  Scale,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Navigation,
  RefreshCw,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  GraduationCap,
  Briefcase,
  User,
  Users
} from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';
import { isPropertyWithinBudget, getPropertyPrice } from '../utils/budgetUtils';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, setRequirements, matches, isLoadingMatches, refreshMatches } = useLifestyle();
  const { savedPropertyIds, toggleSaveProperty, comparePropertyIds } = useApp();

  const buyerType = requirements.buyerType || (requirements as any).userType || 'IT Employee / Working Professional';
  const isStudent = buyerType === 'Student';
  const isBachelor = buyerType === 'Bachelor';
  const defaultIntent = (requirements.intent === 'RENT' || isStudent || isBachelor) ? 'RENT' : requirements.intent === 'BUY' ? 'BUY' : 'ALL';

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<'ALL' | 'BUY' | 'RENT'>(defaultIntent);
  const [filterBhk, setFilterBhk] = useState<number | 'ALL'>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'MATCH' | 'PRICE_ASC' | 'PRICE_DESC'>('MATCH');

  useEffect(() => {
    const intended = (requirements.intent === 'RENT' || isStudent || isBachelor) ? 'RENT' : requirements.intent === 'BUY' ? 'BUY' : 'ALL';
    setIntentFilter(intended);
  }, [requirements.intent, requirements.buyerType, isStudent, isBachelor]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingProps(true);

    propertyService
      .getProperties()
      .then((props) => {
        if (isMounted) {
          setProperties(props);
          setIsLoadingProps(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load properties:', err);
        if (isMounted) setIsLoadingProps(false);
      });

    // Auto-trigger matching engine
    refreshMatches().catch((err) => {
      console.warn('Matching engine background sync:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const coimbatoreLocalities = [
    'All Localities',
    'Peelamedu',
    'Race Course',
    'RS Puram',
    'Saravanampatti',
    'Vadavalli',
    'Gandhipuram',
    'Saibaba Colony'
  ];

  const userBudget = Number(requirements.budgetMax || (requirements as any).budget || 0);

  const displayedProperties = useMemo(() => {
    // Deduplicate properties by propertyId / id
    const uniqueMap = new Map<string, Property>();
    for (const p of properties) {
      const pId = p.id || (p as any).propertyId || String((p as any)._id);
      if (pId && !uniqueMap.has(pId)) {
        uniqueMap.set(pId, p);
      }
    }
    let list = Array.from(uniqueMap.values());

    // 1. HARD MAXIMUM BUDGET FILTER — MUST HAPPEN BEFORE SORTING, RANKING, AND AI MATCHING
    if (userBudget > 0) {
      const activeIntent = intentFilter !== 'ALL' ? intentFilter : requirements.intent;
      const isRentBudget = userBudget < 200000;
      if (intentFilter === 'ALL' || (activeIntent === 'RENT' && isRentBudget) || (activeIntent === 'BUY' && !isRentBudget)) {
        list = list.filter((p) => isPropertyWithinBudget(p, userBudget, activeIntent));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p => p.title.toLowerCase().includes(q) ||
             p.locality.toLowerCase().includes(q) ||
             p.city.toLowerCase().includes(q) ||
             p.propertyType.toLowerCase().includes(q)
      );
    }

    if (intentFilter !== 'ALL') {
      list = list.filter(p => {
        const pIntent = (p.intent || p.listingType || (p.price < 100000 ? 'RENT' : 'BUY')).toUpperCase();
        if (intentFilter === 'BUY') return pIntent === 'BUY' || pIntent === 'SELL';
        if (intentFilter === 'RENT') return pIntent === 'RENT' || pIntent === 'RENT_OUT';
        return true;
      });
    }

    if (filterBhk !== 'ALL') {
      list = list.filter(p => filterBhk === 5 ? p.bhk >= 5 : p.bhk === filterBhk);
    }

    if (selectedLocality !== 'ALL' && selectedLocality !== 'All Localities') {
      list = list.filter(p => p.locality?.toLowerCase().includes(selectedLocality.toLowerCase()));
    }

    list.sort((a, b) => {
      const idA = a.id || (a as any).propertyId || '';
      const idB = b.id || (b as any).propertyId || '';
      if (sortBy === 'MATCH') {
        const scoreA = matches[idA]?.overallScore ?? (a as any).matchScore ?? 0;
        const scoreB = matches[idB]?.overallScore ?? (b as any).matchScore ?? 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      return 0;
    });

    return list;
  }, [properties, searchQuery, intentFilter, filterBhk, selectedLocality, sortBy, matches, userBudget, requirements.intent]);

  // FINAL SAFETY FILTER: Enforce hard budget limit immediately before rendering results
  const safeProperties = useMemo(() => {
    if (userBudget > 0) {
      const activeIntent = intentFilter !== 'ALL' ? intentFilter : requirements.intent;
      const isRentBudget = userBudget < 200000;
      if (intentFilter === 'ALL' || (activeIntent === 'RENT' && isRentBudget) || (activeIntent === 'BUY' && !isRentBudget)) {
        return displayedProperties.filter((property) => isPropertyWithinBudget(property, userBudget, activeIntent));
      }
    }
    return displayedProperties;
  }, [displayedProperties, userBudget, intentFilter, requirements.intent]);

  const top10Properties = useMemo(() => {
    return safeProperties.slice(0, 10);
  }, [safeProperties]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 sm:py-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        {/* Dynamic AI Matches Heading Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Your AI Matches
              </h1>
              {!isLoadingProps && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-600 text-white shadow-xs">
                  {top10Properties.length} {top10Properties.length === 1 ? 'Home' : 'Homes'} Selected
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isLoadingProps
                ? 'Evaluating lifestyle compatibility and verified local amenities...'
                : top10Properties.length > 0
                ? `${top10Properties.length} ${top10Properties.length === 1 ? 'home' : 'homes'} selected for your lifestyle, commute, and budget.`
                : userBudget > 0
                ? 'No properties found within your budget.'
                : 'No homes match your current filter combination.'}
            </p>
          </div>

          {comparePropertyIds.length > 0 && (
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold shadow-xs hover:bg-orange-200 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({comparePropertyIds.length})</span>
            </Link>
          )}
        </div>

        {/* Active Persona & Proximity Context Banner */}
        {requirements?.buyerType && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-orange-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                requirements.buyerType === 'Student' ? 'bg-orange-100 text-orange-600' :
                requirements.buyerType === 'Bachelor' ? 'bg-amber-100 text-amber-600' :
                requirements.buyerType === 'Family' ? 'bg-rose-100 text-rose-600' :
                'bg-teal-100 text-teal-700'
              }`}>
                {requirements.buyerType === 'Student' ? <GraduationCap className="w-5 h-5" /> :
                 requirements.buyerType === 'Bachelor' ? <User className="w-5 h-5" /> :
                 requirements.buyerType === 'Family' ? <Users className="w-5 h-5" /> :
                 <Briefcase className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                    {requirements.buyerType} Mode
                  </span>
                  {requirements.maxDistanceKm && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                      Target: Within {requirements.maxDistanceKm} km
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                  {requirements.targetLocationName
                    ? <span>Properties prioritized near <span className="text-orange-600">{requirements.targetLocationName}</span></span>
                    : requirements.buyerType === 'Bachelor'
                    ? <span>Showing rentals suitable for <span className="text-orange-600">Bachelors & Single Tenants</span></span>
                    : requirements.buyerType === 'Family'
                    ? <span>Showing verified <span className="text-orange-600">Family Homes & Gated Communities</span></span>
                    : <span>Showing curated AI matches</span>}
                </h3>
              </div>
            </div>

            <button
              onClick={() => navigate('/ai-matching')}
              className="px-3.5 py-2 rounded-xl border border-orange-200 text-orange-800 hover:bg-orange-50 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Adjust Criteria</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          
          {/* Search Input Box */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties, localities (e.g. Peelamedu, Race Course, 3 BHK)..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills & Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Quick Intent Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200">
                {(['ALL', 'BUY', 'RENT'] as const).map((intent) => (
                  <button
                    key={intent}
                    onClick={() => setIntentFilter(intent)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      intentFilter === intent
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {intent === 'ALL' ? 'All' : intent === 'BUY' ? 'Buy' : 'Rent'}
                  </button>
                ))}
              </div>

              {/* BHK Pills */}
              <div className="flex items-center gap-1">
                {(['ALL', 1, 2, 3, 4, 5] as const).map((bhk) => (
                  <button
                    key={bhk}
                    onClick={() => setFilterBhk(bhk)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterBhk === bhk
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bhk === 'ALL' ? 'All BHK' : bhk === 5 ? '5+ BHK' : `${bhk} BHK`}
                  </button>
                ))}
              </div>
            </div>

            {/* Locality & Sort Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-800 focus:outline-none cursor-pointer"
              >
                {coimbatoreLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="MATCH">Best Match Score</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Properties Grid */}
        {isLoadingProps ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm animate-pulse space-y-3">
                <div className="aspect-[16/10] bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                <div className="h-8 bg-orange-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : top10Properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-800">
              {userBudget > 0 ? "No properties found within your budget." : "No properties match your exact filters."}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {userBudget > 0
                ? `We couldn't find any verified listings under ₹${userBudget.toLocaleString('en-IN')}. Try increasing your maximum budget or exploring neighboring localities.`
                : "Try broadening your budget, selecting another locality, or resetting your filters."}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setIntentFilter('ALL');
                setFilterBhk('ALL');
                setSelectedLocality('All Localities');
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer hover:bg-orange-700 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {top10Properties.map((prop) => {
              const propId = prop.id || (prop as any).propertyId || '';
              return <PropertyCard key={propId} property={{ ...prop, id: propId }} match={matches[propId]} />;
            })}
          </div>
        )}

      </div>
    </div>
  );
};

