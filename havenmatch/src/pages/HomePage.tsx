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

  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    propertyService.getProperties().then((props) => {
      setAllProperties(props);
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
      count: `${allProperties.filter(p => p.city?.toLowerCase() === 'coimbatore').length || '12'} properties`,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Chennai',
      count: `${allProperties.filter(p => p.city?.toLowerCase() === 'chennai').length || '8'} properties`,
      image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Bangalore',
      count: `${allProperties.filter(p => p.city?.toLowerCase() === 'bangalore' || p.city?.toLowerCase() === 'bengaluru').length || '15'} properties`,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Hyderabad',
      count: `${allProperties.filter(p => p.city?.toLowerCase() === 'hyderabad').length || '6'} properties`,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const localityDefinitions = [
    { name: 'Saravanampatti', tag: 'IT & Tech Corridor', bhk: '2 & 3 BHK', price: '₹48L - ₹85L' },
    { name: 'Race Course', tag: 'Ultra Luxury & Elite', bhk: '3 & 4 BHK', price: '₹1.2Cr - ₹3.5Cr' },
    { name: 'RS Puram', tag: 'Heritage & Shopping Hub', bhk: '2 & 3 BHK', price: '₹65L - ₹1.8Cr' },
    { name: 'Peelamedu', tag: 'Airport & Education', bhk: '2 & 3 BHK', price: '₹55L - ₹1.1Cr' },
    { name: 'Vadavalli', tag: 'Scenic & Peaceful', bhk: '2 & 3 BHK Villas', price: '₹42L - ₹95L' },
    { name: 'Saibaba Colony', tag: 'Central Residential', bhk: '2 & 3 BHK', price: '₹58L - ₹1.4Cr' }
  ];

  const localities = localityDefinitions.map(loc => {
    const matchedCount = allProperties.filter(p => 
      p.locality?.toLowerCase().includes(loc.name.toLowerCase()) || 
      p.fullAddress?.toLowerCase().includes(loc.name.toLowerCase())
    ).length;
    return {
      ...loc,
      count: `${matchedCount} Home${matchedCount === 1 ? '' : 's'}`
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16 md:pb-0">
      
      {/* =========================================================================
          1A. MOBILE HERO SECTION (< 768px: Mobile Viewport Only)
          Matches 10/10 mobile design with warm backdrop, high contrast & quick CTAs
          ========================================================================= */}
      <section 
        className="md:hidden relative pt-6 pb-10 overflow-hidden bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80')" }}
      >
        {/* Subtle Warm Gradient Overlay for Readability on Mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/88 to-white/75 backdrop-blur-[1px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 space-y-4 text-left">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50/90 border border-orange-200/90 text-orange-950 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Next-Gen Lifestyle Intelligence</span>
          </div>

          {/* Headline & Handwritten Accent */}
          <div className="flex flex-col justify-between gap-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Find a home <br />
              that fits <span className="text-orange-600">your life.</span>
            </h1>
            <span className="text-xs font-serif italic text-slate-500">
              More than houses. A better you.
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Search beyond price and location. HavenMatch AI understands your lifestyle and connects you with homes that actually fit the way you live.
          </p>

          {/* Mobile Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-1">
            <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-200/90 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, locality, or property type..."
                  className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <select
                    value={selectedIntent}
                    onChange={(e) => setSelectedIntent(e.target.value as 'BUY' | 'RENT')}
                    className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer text-center"
                  >
                    <option value="BUY">Buy</option>
                    <option value="RENT">Rent</option>
                  </select>
                </div>

                <div className="col-span-7">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-md"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Mobile Action Buttons: Find My Home & List My Property */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleFindMyHome}
              className="w-full p-3 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-md shadow-orange-600/20 text-left flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold block leading-tight truncate">Find My Home</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <span className="text-[9.5px] text-orange-100 font-medium block leading-tight mt-0.5">AI-powered matching</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/owner/add-property')}
              className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 border border-slate-200/90 shadow-sm text-left flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-slate-700" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-extrabold block leading-tight truncate">List My Property</span>
                <span className="text-[9.5px] text-slate-500 font-medium block leading-tight mt-0.5">Sell or Rent Out</span>
              </div>
            </button>
          </div>

          {/* Mobile Feature Pills Trio */}
          <div className="pt-1">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 border border-white/80 shadow-md grid grid-cols-3 gap-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 py-1 px-1">
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-slate-900 block leading-tight">AI-Powered</span>
                  <span className="text-[9px] text-slate-500 font-medium block leading-tight">Smarter Matches</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-1 px-1 border-x border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-slate-900 block leading-tight">Lifestyle First</span>
                  <span className="text-[9px] text-slate-500 font-medium block leading-tight">Homes that fit you</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-1 px-1">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-extrabold text-slate-900 block leading-tight">Real People</span>
                  <span className="text-[9px] text-slate-500 font-medium block leading-tight">Real Homes</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          1B. DESKTOP & TABLET HERO SECTION (>= 768px: Restored Original Desktop UI)
          Split 2-column layout with high-res showcase imagery, full search & social proof
          ========================================================================= */}
      <section className="hidden md:block relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (7 cols): Editorial Headline, Wide Search & CTAs */}
            <div className="col-span-12 lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Next-Gen Lifestyle Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Find a home <br />
                that fits <span className="text-orange-600">your life.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Search beyond price and location. HavenMatch AI understands your lifestyle and connects you with homes that actually fit the way you live.
              </p>

              {/* Restored Desktop Search Bar (Wide Horizontal Input) */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg border border-slate-200/90 flex items-center gap-3 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search city, locality, or property type..."
                      className="w-full text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={selectedIntent}
                      onChange={(e) => setSelectedIntent(e.target.value as 'BUY' | 'RENT')}
                      className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="BUY">Buy</option>
                      <option value="RENT">Rent</option>
                    </select>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                    >
                      <span>Search</span>
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Action Buttons & Social Proof Stack */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleFindMyHome}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                >
                  <span>Find My Home</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/owner/add-property')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all cursor-pointer"
                >
                  <span>List My Property</span>
                </button>

                {/* Social Proof Avatars */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
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

            {/* Right Column (5 cols): High-Resolution Visual Showcase Card */}
            <div className="col-span-12 lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] lg:aspect-[5/4] group">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Luxury Modern Residence"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Floating "A better way to home" badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-bold text-slate-900">A better way to home.</span>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold mb-1 shadow-sm">
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

      {/* =========================================================================
          2. FOUR CORE CAPABILITIES (Desktop & Tablet Presentation)
          ========================================================================= */}
      <section className="hidden md:block py-12 bg-white border-y border-slate-200/80">
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

      {/* =========================================================================
          3. POPULAR CITIES (Clean Responsive Grid with 4 Unique City Images)
          ========================================================================= */}
      <section className="py-10 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 text-left">Popular Cities</h2>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">Explore active verified listings across prime metropolitan hubs</p>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
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

      {/* =========================================================================
          4. FEATURED PROPERTIES
          ========================================================================= */}
      <section className="py-12 lg:py-16">
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

      {/* =========================================================================
          5. COIMBATORE NEIGHBORHOODS (Desktop & Tablet)
          ========================================================================= */}
      <section className="hidden sm:block py-16 bg-white border-t border-slate-200/80">
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

      {/* =========================================================================
          6. TRUST & ZERO BROKERAGE BANNER
          ========================================================================= */}
      <section className="py-12 sm:py-16 bg-gradient-to-tr from-slate-900 to-slate-800 text-white">
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
              type="button"
              onClick={handleFindMyHome}
              className="px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Start Matching Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/owner/add-property')}
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              Post Property Free
            </button>
          </div>
        </div>
      </section>

      {/* Add Property Bottom Sheet Modal */}
      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
      />
    </div>
  );
};
