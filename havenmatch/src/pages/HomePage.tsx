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
      {/* 1. HERO SECTION (Matching Screen 1 of Reference Design) */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Search */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Next-Gen Lifestyle Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Find a home <br />
                that fits <span className="text-orange-600">your life.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Search beyond price and location. HavenMatch AI understands your lifestyle and connects you with homes that actually fit the way you live.
              </p>

              {/* Integrated Search Box */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-1 w-full px-3 py-2">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search city, locality, or property type..."
                      className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedIntent}
                      onChange={(e) => setSelectedIntent(e.target.value as 'BUY' | 'RENT')}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="BUY">Buy</option>
                      <option value="RENT">Rent</option>
                    </select>

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
                    >
                      <span>Search</span>
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Action Buttons & Social Proof */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleFindMyHome}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>Find My Home</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/owner/add-property')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
                >
                  <span>List My Property</span>
                </button>

                {/* Social Proof Pill */}
                <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Buyer" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Buyer" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Buyer" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block leading-tight">5,000+</span>
                    <span className="text-[11px] text-slate-500 font-medium block leading-tight">Happy Families</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Residential Imagery with Floating Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] lg:aspect-[5/4]">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Floating "A better way to home" badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900">A better way to home.</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold mb-1">
                    95% Lifestyle Match
                  </div>
                  <h3 className="text-base font-bold leading-snug">3 BHK Luxury Residence, Race Course</h3>
                  <p className="text-xs text-slate-200">Coimbatore • ₹1.35 Crores • Siruvani Water • 100% Vastu</p>
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
