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
  TrendingUp,
  Star,
  Layers,
  Heart,
  Droplets,
  Zap,
  SlidersHorizontal,
  Home,
  Users
} from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, setRequirements } = useLifestyle();
  const { savedPropertyIds, toggleSaveProperty, userSession } = useApp();

  const [selectedIntent, setSelectedIntent] = useState<'BUY' | 'RENT'>('BUY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(requirements.city || 'Coimbatore');
  const [selectedBhk, setSelectedBhk] = useState<number>(2);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

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

  const localities = [
    { name: 'Saravanampatti', tag: 'IT & Tech Corridor', count: '48 Homes', bhk: '2 & 3 BHK', price: '₹48L - ₹85L' },
    { name: 'Race Course', tag: 'Ultra Luxury & Elite', count: '22 Homes', bhk: '3 & 4 BHK', price: '₹1.2Cr - ₹3.5Cr' },
    { name: 'RS Puram', tag: 'Heritage & Shopping Hub', count: '35 Homes', bhk: '2 & 3 BHK', price: '₹65L - ₹1.8Cr' },
    { name: 'Peelamedu', tag: 'Airport & Education', count: '41 Homes', bhk: '2 & 3 BHK', price: '₹55L - ₹1.1Cr' },
    { name: 'Vadavalli', tag: 'Scenic & Peaceful', count: '29 Homes', bhk: '2 & 3 BHK Villas', price: '₹42L - ₹95L' },
    { name: 'Saibaba Colony', tag: 'Central Residential', count: '31 Homes', bhk: '2 & 3 BHK', price: '₹58L - ₹1.4Cr' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* 1. HERO SECTION (Matching Mobile & Desktop Reference Design) */}
      <section className="relative pt-6 pb-12 lg:pt-14 lg:pb-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80')" }}>
        {/* Subtle Warm Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/85 to-white/70 backdrop-blur-[1px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto lg:mx-0 space-y-5 text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50/90 border border-orange-200/90 text-orange-900 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Next-Gen Lifestyle Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Find a home <br />
              that fits <span className="text-orange-600">your life.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-xl">
              Search beyond price and location. HavenMatch AI understands your lifestyle and connects you with homes that actually fit the way you live.
            </p>

            {/* Integrated Search Box */}
            <form onSubmit={handleSearchSubmit} className="pt-1">
              <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-200/90 flex flex-col gap-2.5 max-w-xl">
                {/* Search Input Row */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50/80 rounded-xl border border-slate-100">
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
                      <span>Search</span>
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Action Buttons: Find My Home & List My Property Side-by-Side */}
            <div className="grid grid-cols-2 gap-3 max-w-xl pt-1">
              <button
                type="button"
                onClick={handleFindMyHome}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 transition-all cursor-pointer"
              >
                <span>Find My Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/owner/add-property')}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-sm transition-all cursor-pointer"
              >
                <span>List My Property</span>
              </button>
            </div>

            {/* Feature Pills Trio (Matching Reference Screen 1) */}
            <div className="pt-2 max-w-xl">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border border-white/80 shadow-md grid grid-cols-3 gap-2 text-center">
                <div className="flex items-center justify-center gap-2 py-1 px-1.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">AI-Powered</span>
                    <span className="text-[10px] text-slate-500 font-medium block leading-tight">Matches</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 px-1.5 border-x border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-extrabold text-slate-900 block leading-tight">Lifestyle</span>
                    <span className="text-[10px] text-slate-500 font-medium block leading-tight">First</span>
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

      {/* 2. FOUR CORE CAPABILITIES (Matching Screen 1 Cards) */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">AI Lifestyle Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects commute times, daily rhythms, Siruvani drinking water, and Vastu into a personalized 100-pt fit score.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Personalized Recommendations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Curated property feeds sorted by lifestyle alignment rather than sponsored broker advertisements.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Location Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Precise OpenStreetMap distance analysis to hospitals, top schools, tech parks, and public transit nodes.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Explainable Match Scores</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent breakdown highlighting why each home fits your criteria, plus honest potential trade-offs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED LIFESTYLE MATCHES */}
      <section className="py-16">
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

      {/* 4. COIMBATORE LOCALITY HUBS */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Neighborhood Intelligence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore Coimbatore Neighborhoods</h2>
            <p className="text-sm text-slate-500 mt-1">Discover prime residential pockets matched to your commute and lifestyle rhythm.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {localities.map((loc) => (
              <div
                key={loc.name}
                onClick={() => {
                  setRequirements((prev) => ({ ...prev, city: 'Coimbatore', preferredLocalities: [loc.name] }));
                  navigate('/recommendations');
                }}
                className="p-5 rounded-2xl bg-[#FAF9F6] border border-slate-200/80 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{loc.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">{loc.count}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{loc.tag}</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-3 border-t border-slate-200/60">
                  <span>{loc.bhk}</span>
                  <span className="text-orange-700 font-bold">{loc.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUST & ZERO BROKERAGE BANNER */}
      <section className="py-16 bg-gradient-to-tr from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>100% Verified & Broker-Free Direct Connect</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            Right Home. Right Lifestyle. <span className="text-orange-400">Right Match.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Say goodbye to endless spam calls and irrelevant listings. HavenMatch AI connects verified buyers and owners directly with complete transparency.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleFindMyHome}
              className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Start Matching Now
            </button>
            <button
              onClick={() => navigate('/owner/add-property')}
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              Post Property Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
