import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { propertyService } from '../services/propertyService';
import { Property } from '../types';
import {
  Sparkles,
  Search,
  MapPin,
  Building,
  ShieldCheck,
  Compass,
  ArrowRight,
  CheckCircle2,
  Home,
  Users,
  Building2
} from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';
import { AddPropertyModal } from '../components/property/AddPropertyModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, setRequirements } = useLifestyle();
  const { userSession } = useApp();

  const [selectedIntent, setSelectedIntent] = useState<'BUY' | 'RENT'>('BUY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(requirements.city || 'Coimbatore');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);

  useEffect(() => {
    propertyService.getProperties().then((props) => {
      setFeaturedProperties(props.slice(0, 6));
    }).catch(() => {});
  }, []);

  const handleFindMyHome = () => {
    if (userSession) {
      navigate('/ai-matching');
    } else {
      navigate('/auth?redirect=/ai-matching');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequirements((prev) => ({
      ...prev,
      intent: selectedIntent,
      city: selectedCity,
      preferredLocalities: searchQuery ? [searchQuery] : prev.preferredLocalities
    }));
    navigate('/recommendations');
  };

  const popularCities = [
    {
      name: 'Coimbatore',
      count: '2,450+ properties',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Chennai',
      count: '4,120+ properties',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bangalore',
      count: '5,680+ properties',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Hyderabad',
      count: '3,220+ properties',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16 md:pb-0">
      {/* 1. HERO SECTION (Screen 1 Layout) */}
      <section 
        className="relative pt-6 pb-12 lg:pt-14 lg:pb-20 overflow-hidden bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80')" }}
      >
        {/* Warm Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/88 to-white/75 backdrop-blur-[1px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto lg:mx-0 space-y-5 text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50/90 border border-orange-200/90 text-orange-950 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Next-Gen Lifestyle Intelligence</span>
            </div>

            {/* Main Headline & Handwritten Accent */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Find a home <br />
                that fits <span className="text-orange-600">your life.</span>
              </h1>
              <span className="text-xs sm:text-sm font-serif italic text-slate-500 self-start sm:self-end">
                More than houses. A better you.
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-xl">
              Search beyond price and location. HavenMatch AI understands your lifestyle and connects you with homes that actually fit the way you live.
            </p>

            {/* Integrated Search Box */}
            <form onSubmit={handleSearchSubmit} className="pt-1">
              <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-200/90 flex flex-col gap-2.5 max-w-xl">
                {/* Search Input Row */}
                <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, locality, or property type..."
                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>

                {/* Intent Dropdown + Search Button Row */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4 sm:col-span-4">
                    <select
                      value={selectedIntent}
                      onChange={(e) => setSelectedIntent(e.target.value as 'BUY' | 'RENT')}
                      className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer text-center"
                    >
                      <option value="BUY">Buy</option>
                      <option value="RENT">Rent</option>
                    </select>
                  </div>

                  <div className="col-span-8 sm:col-span-8">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Action Buttons: Find My Home & List My Property Side-by-Side (Screen 1) */}
            <div className="grid grid-cols-2 gap-3 max-w-xl pt-1">
              {/* Primary Orange CTA: Find My Home */}
              <button
                type="button"
                onClick={handleFindMyHome}
                className="w-full p-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-md shadow-orange-600/20 transition-all cursor-pointer text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold block leading-tight truncate">Find My Home</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-[10px] text-orange-100 font-medium block leading-tight mt-0.5">AI-powered matching</span>
                </div>
              </button>

              {/* Secondary White CTA: List My Property */}
              <button
                type="button"
                onClick={() => navigate('/owner/add-property')}
                className="w-full p-3.5 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 border border-slate-200/90 shadow-sm transition-all cursor-pointer text-left flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-extrabold block leading-tight truncate">List My Property</span>
                  <span className="text-[10px] text-slate-500 font-medium block leading-tight mt-0.5">Sell or Rent Out</span>
                </div>
              </button>
            </div>

            {/* Feature Pills Trio (Screen 1) */}
            <div className="pt-2 max-w-xl">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 shadow-md grid grid-cols-3 gap-2 text-center">
                <div className="flex items-center justify-center gap-2 py-1 px-1.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">AI-Powered</span>
                    <span className="text-[10px] text-slate-500 font-medium block leading-tight">Smarter Matches</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 px-1.5 border-x border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">Lifestyle First</span>
                    <span className="text-[10px] text-slate-500 font-medium block leading-tight">Homes that fit you</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 px-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">Real People</span>
                    <span className="text-[10px] text-slate-500 font-medium block leading-tight">Real Homes</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. POPULAR CITIES (Screen 1) */}
      <section className="py-10 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 text-left">Popular Cities</h2>
            <Link
              to="/recommendations"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {popularCities.map((city) => (
              <div
                key={city.name}
                onClick={() => {
                  setRequirements((prev) => ({ ...prev, city: city.name }));
                  navigate('/recommendations');
                }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 cursor-pointer shadow-xs hover:shadow-md transition-all text-left"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent"></div>
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-sm font-bold block leading-tight">{city.name}</span>
                  <span className="text-[10.5px] text-slate-200 font-medium block leading-tight mt-0.5">{city.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div className="text-left">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Top Rated Homes</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Properties in Coimbatore</h2>
              <p className="text-sm text-slate-500 mt-1">Verified listings with 100-point lifestyle compatibility evaluations.</p>
            </div>

            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <span>Explore All {featuredProperties.length}+ Homes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </section>

      {/* Add Property Bottom Sheet */}
      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
      />
    </div>
  );
};
