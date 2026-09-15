import React, { useState, useEffect, useMemo } from 'react';
import { Property } from '../types';
import { propertyService } from '../services/propertyService';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { PropertyCard } from '../components/property/PropertyCard';
import { POPULAR_INDIAN_CITIES } from '../data/mockData';
import { 
  SlidersHorizontal, 
  Sparkles, 
  Search, 
  MapPin, 
  ArrowUpDown, 
  X, 
  RotateCcw, 
  Check, 
  Building2, 
  Filter 
} from 'lucide-react';

export const DiscoverView: React.FC = () => {
  const { requirements, setRequirements, lifestyle, matches, isLoadingMatches } = useLifestyle();
  const { buyerIntent, setBuyerIntent, setActiveView } = useApp();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'price_asc' | 'price_desc'>('match');
  const [selectedBhk, setSelectedBhk] = useState<number[]>(requirements.bhk);
  const [furnishingFilter, setFurnishingFilter] = useState<string>('all');
  const [vastuOnly, setVastuOnly] = useState<boolean>(false);
  const [selectedIntent, setSelectedIntent] = useState<'ALL' | 'BUY' | 'RENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const filters = { ...requirements };
    if (selectedIntent !== 'ALL') {
      filters.intent = selectedIntent;
    } else {
      delete filters.intent;
    }
    propertyService.getProperties(filters).then(setProperties);
  }, [requirements, selectedIntent]);

  // Compute property counts per city for quick badge
  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Cities': properties.length };
    properties.forEach((p) => {
      counts[p.city] = (counts[p.city] || 0) + 1;
    });
    return counts;
  }, [properties]);

  // Handle city selection
  const handleCitySelect = (cityName: string) => {
    setRequirements((prev) => ({
      ...prev,
      city: cityName,
      preferredLocalities: [] // Clear localities so full city is visible
    }));
  };

  // Handle BHK toggle
  const toggleBhk = (bhk: number) => {
    const updated = selectedBhk.includes(bhk)
      ? selectedBhk.filter((b) => b !== bhk)
      : [...selectedBhk, bhk];
    setSelectedBhk(updated);
    setRequirements((prev) => ({ ...prev, bhk: updated.length > 0 ? updated : [1, 2, 3, 4] }));
  };

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    if (sortBy === 'match') {
      const scoreA = matches[a.id]?.overallScore || 85;
      const scoreB = matches[b.id]?.overallScore || 85;
      return scoreB - scoreA;
    }
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  // Filter based on UI filters and search query
  const displayedProperties = sortedProperties.filter((p) => {
    if (vastuOnly && !p.vastuCompliant) return false;
    if (furnishingFilter !== 'all' && p.furnishing !== furnishingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.amenities.some((a) => a.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }
    return true;
  });

  const activeCityName = requirements.city || 'All Cities';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5">
      
      {/* Top Banner / Match Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-haven-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Lifestyle Homes</span>
              <span className="text-orange-600 font-extrabold text-sm sm:text-base">
                in {activeCityName === 'All Cities' ? 'India' : activeCityName}
              </span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
              {displayedProperties.length} Properties
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ranked for <strong className="text-slate-800">{activeCityName}</strong> based on your {lifestyle.atmospherePreference.toLowerCase()} lifestyle & commute priorities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locality, pool, metro..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
            <span>Filters</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
            >
              <option value="match">Highest Match</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* City Switcher Pill Bar (All India & Top Cities) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-haven-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            Select City in India:
          </span>
          <button
            onClick={() => handleCitySelect('All Cities')}
            className={`text-xs font-bold transition-colors ${
              activeCityName === 'All Cities' ? 'text-orange-600 underline' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            View All ({properties.length})
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {/* All Cities Button */}
          <button
            type="button"
            onClick={() => handleCitySelect('All Cities')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all active:scale-95 flex items-center gap-1.5 ${
              activeCityName === 'All Cities'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>🇮🇳 All India</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeCityName === 'All Cities' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {cityCounts['All Cities']}
            </span>
          </button>

          {/* Popular Cities */}
          {POPULAR_INDIAN_CITIES.map((c) => {
            const count = cityCounts[c.name] || 0;
            const isSelected = activeCityName.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleCitySelect(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{c.name}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Quick Filter Bar (Bedrooms, Buy/Rent, Vastu) */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs overflow-x-auto no-scrollbar">
        {/* Buy / Rent Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Intent:</span>
          {(['ALL', 'BUY', 'RENT'] as const).map((intent) => (
            <button
              key={intent}
              onClick={() => setSelectedIntent(intent)}
              className={`px-3 py-1 rounded-lg font-bold border transition-all text-xs ${
                selectedIntent === intent
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {intent === 'ALL' ? 'All' : intent === 'BUY' ? 'Buy' : 'Rent'}
            </button>
          ))}
        </div>

        {/* Bedroom Chips */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Bedrooms:</span>
          {[1, 2, 3, 4].map((b) => (
            <button
              key={b}
              onClick={() => toggleBhk(b)}
              className={`px-2.5 py-1 rounded-lg font-bold border transition-all text-xs ${
                selectedBhk.includes(b)
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {b} BHK
            </button>
          ))}
        </div>

        {/* Vastu & Tune Priorities */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={vastuOnly}
              onChange={(e) => setVastuOnly(e.target.checked)}
              className="accent-orange-600 rounded"
            />
            <span>100% Vastu</span>
          </label>

          <button
            onClick={() => setActiveView('lifestyle_interview')}
            className="text-orange-700 font-bold hover:underline flex items-center gap-1 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tune Priorities</span>
          </button>
        </div>
      </div>

      {/* Main Properties Grid */}
      {isLoadingMatches ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700">Evaluating lifestyle dimensions & commute times across India...</p>
        </div>
      ) : displayedProperties.length === 0 ? (
        <div className="card-haven p-8 text-center bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching homes found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try switching to "All India", resetting bedroom filters, or clearing search keywords.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                handleCitySelect('All Cities');
                setVastuOnly(false);
                setFurnishingFilter('all');
                setSelectedBhk([1, 2, 3, 4]);
                setSelectedIntent('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm"
            >
              Browse All Properties in India
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayedProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              match={matches[prop.id]}
            />
          ))}
        </div>
      )}

      {/* Mobile Filters Drawer / Modal */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                  Filter Matches
                </h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  Select City
                </label>
                <select
                  value={activeCityName}
                  onChange={(e) => handleCitySelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-orange-500"
                >
                  <option value="All Cities">🇮🇳 All Cities in India ({properties.length})</option>
                  {POPULAR_INDIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, {c.state} ({cityCounts[c.name] || 0} homes)
                    </option>
                  ))}
                </select>
              </div>

              {/* Intent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Buy or Rent</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ALL', 'BUY', 'RENT'] as const).map((intent) => (
                    <button
                      key={intent}
                      onClick={() => setSelectedIntent(intent)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedIntent === intent
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {intent === 'ALL' ? 'All' : intent === 'BUY' ? 'Buy' : 'Rent'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">BHK Configuration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((b) => (
                    <button
                      key={b}
                      onClick={() => toggleBhk(b)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedBhk.includes(b)
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {b} BHK
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Furnishing Status</label>
                <select
                  value={furnishingFilter}
                  onChange={(e) => setFurnishingFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5"
                >
                  <option value="all">All Furnishings</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Vastu Compliant */}
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                <label className="flex items-center gap-2 text-xs font-bold text-orange-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vastuOnly}
                    onChange={(e) => setVastuOnly(e.target.checked)}
                    className="accent-orange-600 rounded w-4 h-4"
                  />
                  <span>Show only 100% Vastu-Compliant Homes</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setVastuOnly(false);
                  setFurnishingFilter('all');
                  setSelectedBhk([1, 2, 3, 4]);
                  setSelectedIntent('ALL');
                  setSearchQuery('');
                }}
                className="w-1/2 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-600"
              >
                Reset All
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-1/2 py-3 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-haven-sm"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
