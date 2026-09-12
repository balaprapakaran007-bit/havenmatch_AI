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
  ChevronDown
} from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, setRequirements, matches, isLoadingMatches } = useLifestyle();
  const { savedPropertyIds, toggleSaveProperty, comparePropertyIds } = useApp();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<'ALL' | 'BUY' | 'RENT'>('ALL');
  const [filterBhk, setFilterBhk] = useState<number | 'ALL'>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'MATCH' | 'PRICE_ASC' | 'PRICE_DESC'>('MATCH');

  useEffect(() => {
    setIsLoadingProps(true);
    propertyService
      .getProperties()
      .then(setProperties)
      .catch(() => {})
      .finally(() => setIsLoadingProps(false));
  }, []);

  const coimbatoreLocalities = [
    'All Localities',
    'Saravanampatti',
    'Race Course',
    'RS Puram',
    'Peelamedu',
    'Vadavalli',
    'Gandhipuram',
    'Saibaba Colony'
  ];

  const displayedProperties = useMemo(() => {
    let list = [...properties];

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
      list = list.filter(p => p.intent === intentFilter || (intentFilter === 'RENT' ? p.price < 100000 : p.price >= 100000));
    }

    if (filterBhk !== 'ALL') {
      list = list.filter(p => filterBhk === 4 ? p.bhk >= 4 : p.bhk === filterBhk);
    }

    if (selectedLocality !== 'ALL' && selectedLocality !== 'All Localities') {
      list = list.filter(p => p.locality?.toLowerCase().includes(selectedLocality.toLowerCase()));
    }

    list.sort((a, b) => {
      if (sortBy === 'MATCH') {
        const scoreA = matches[a.id]?.overallScore ?? 0;
        const scoreB = matches[b.id]?.overallScore ?? 0;
        return scoreB - scoreA;
      }
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      return 0;
    });

    return list;
  }, [properties, searchQuery, intentFilter, filterBhk, selectedLocality, sortBy, matches]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        {/* Top Search & Filter Bar (Matching Screen 5 of Reference Design) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          
          {/* Search Input Box */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties, locations..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 1, 2, 3, 4] as const).map((bhk) => (
                  <button
                    key={bhk}
                    onClick={() => setFilterBhk(bhk)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      filterBhk === bhk
                        ? 'border-orange-600 bg-orange-50 text-orange-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {bhk === 'ALL' ? 'All BHK' : bhk === 4 ? '4+ BHK' : `${bhk} BHK`}
                  </button>
                ))}
              </div>

              {/* Locality Dropdown */}
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {coimbatoreLocalities.map((loc) => (
                  <option key={loc} value={loc === 'All Localities' ? 'ALL' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="MATCH">Best Match</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {displayedProperties.length} Properties Found
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by 100-point lifestyle compatibility and verified location metrics.
            </p>
          </div>

          {comparePropertyIds.length > 0 && (
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold shadow-xs hover:bg-orange-200 transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({comparePropertyIds.length})</span>
            </Link>
          )}
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
        ) : displayedProperties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-800">No properties match your exact filters.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try broadening your budget, selecting another locality, or resetting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setIntentFilter('ALL');
                setFilterBhk('ALL');
                setSelectedLocality('ALL');
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} match={matches[prop.id]} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
