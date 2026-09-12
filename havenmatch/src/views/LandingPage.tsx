import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { PropertyCard } from '../components/property/PropertyCard';
import { HomeLocationMap } from '../components/home/HomeLocationMap';
import { INITIAL_PROPERTIES } from '../data/mockData';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Building,
  Satellite,
  Layers,
  PlusCircle,
  UploadCloud
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, setRole, buyerIntent, setBuyerIntent, showToast } = useApp();
  const { requirements, setRequirements, matches } = useLifestyle();

  const [selectedBhk, setSelectedBhk] = useState<number>(2);
  const [selectedLocality, setSelectedLocality] = useState<string>('All Cities');
  const [budgetCap, setBudgetCap] = useState<number>(7500000);

  const localityCityMap: Record<string, string> = {
    'Indiranagar': 'Bengaluru',
    'Whitefield': 'Bengaluru',
    'Koramangala': 'Bengaluru',
    'HSR Layout': 'Bengaluru',
    'Bandra West': 'Mumbai',
    'Powai': 'Mumbai',
    'Worli': 'Mumbai',
    'Andheri West': 'Mumbai',
    'Gurugram Golf Course Ext': 'Delhi NCR',
    'Greater Kailash': 'Delhi NCR',
    'Noida Expressway': 'Delhi NCR',
    'Gachibowli': 'Hyderabad',
    'Jubilee Hills': 'Hyderabad',
    'HITEC City': 'Hyderabad',
    'Adyar': 'Chennai',
    'OMR Thoraipakkam': 'Chennai',
    'Anna Nagar': 'Chennai',
    'Koregaon Park': 'Pune',
    'Baner': 'Pune',
    'Peelamedu': 'Coimbatore',
    'Race Course': 'Coimbatore',
    'RS Puram': 'Coimbatore',
    'Saravanampatti': 'Coimbatore',
    'Saibaba Colony': 'Coimbatore',
    'Marine Drive': 'Kochi',
    'Kakkanad InfoPark': 'Kochi',
    'New Town': 'Kolkata',
    'Salt Lake Sector V': 'Kolkata',
    'SG Highway': 'Ahmedabad',
    'Bodakdev': 'Ahmedabad',
    'Vaishali Nagar': 'Jaipur',
    'Aerocity Mohali': 'Chandigarh',
    'Assagao': 'Goa'
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const city = selectedLocality === 'All Cities' ? 'All Cities' : (localityCityMap[selectedLocality] || 'Coimbatore');
    setRequirements((prev) => ({
      ...prev,
      city,
      intent: buyerIntent,
      bhk: [selectedBhk],
      preferredLocalities: selectedLocality === 'All Cities' ? [] : [selectedLocality],
      budgetMax: budgetCap
    }));
    showToast(`Discovering lifestyle homes in ${selectedLocality === 'All Cities' ? 'India' : selectedLocality}...`);
    setActiveView('discover');
  };

  const featuredProperties = INITIAL_PROPERTIES.slice(0, 6);

  return (
    <div className="space-y-12 sm:space-y-20">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-16 overflow-hidden">
        {/* Ambient warm orange glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/60 via-orange-50/30 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Pill */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>India's 1st Lifestyle & Location-Aware Real Estate Matcher</span>
            </div>
          </div>

          {/* Main Hero Typography */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Find a home that <br className="hidden sm:inline" />
              <span className="text-orange-600 underline decoration-orange-300 decoration-wavy decoration-2">
                fits your life.
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Traditional portals only filter by square feet and price. <strong className="text-slate-800">HavenMatch AI</strong> learns your commute habits, hospital priorities, children’s schools, and quietness preferences to match the right home and explain why.
            </p>

            {/* Quick Action CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md sm:max-w-none mx-auto">
              <button
                onClick={() => {
                  setRole('BUYER');
                  setActiveView('lifestyle_interview');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm sm:text-base shadow-haven-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Personalize My Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setRole('SELLER');
                  setActiveView('seller_add_property');
                  showToast('Opened Seller Property Upload Portal');
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/90 hover:bg-orange-50/80 text-slate-800 border-2 border-orange-200/90 hover:border-orange-500 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-sm group active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-100 group-hover:bg-orange-600 text-orange-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
                <span>List Property (FREE)</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                  Seller Portal
                </span>
              </button>
            </div>
          </div>

          {/* Search Box Component */}
          <div className="max-w-4xl mx-auto card-haven p-4 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-haven-lg">
            
            {/* Buy / Rent Intent Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">I Want To:</span>
              <button
                type="button"
                onClick={() => setBuyerIntent('BUY')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  buyerIntent === 'BUY'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Buy a Home
              </button>
              <button
                type="button"
                onClick={() => setBuyerIntent('RENT')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  buyerIntent === 'RENT'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Rent a Home
              </button>
            </div>

            {/* Quick Filter Inputs Form */}
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* City & Locality */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  City & Locality
                </label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500"
                >
                  <option value="All Cities">🇮🇳 All India (All 34 Properties)</option>
                  <optgroup label="Bengaluru, Karnataka">
                    <option value="Indiranagar">Indiranagar, Bengaluru</option>
                    <option value="Whitefield">Whitefield, Bengaluru</option>
                    <option value="Koramangala">Koramangala, Bengaluru</option>
                    <option value="HSR Layout">HSR Layout, Bengaluru</option>
                  </optgroup>
                  <optgroup label="Mumbai, Maharashtra">
                    <option value="Bandra West">Bandra West, Mumbai</option>
                    <option value="Powai">Powai, Mumbai</option>
                    <option value="Worli">Worli, Mumbai</option>
                    <option value="Andheri West">Andheri West, Mumbai</option>
                  </optgroup>
                  <optgroup label="Delhi NCR">
                    <option value="Gurugram Golf Course Ext">Golf Course Ext, Gurugram</option>
                    <option value="Greater Kailash">Greater Kailash, South Delhi</option>
                    <option value="Noida Expressway">Sector 137, Noida Expressway</option>
                  </optgroup>
                  <optgroup label="Hyderabad, Telangana">
                    <option value="Gachibowli">Gachibowli Financial Dist, Hyderabad</option>
                    <option value="Jubilee Hills">Jubilee Hills, Hyderabad</option>
                    <option value="HITEC City">HITEC City, Hyderabad</option>
                  </optgroup>
                  <optgroup label="Chennai, Tamil Nadu">
                    <option value="Adyar">Adyar Gandhi Nagar, Chennai</option>
                    <option value="OMR Thoraipakkam">OMR Thoraipakkam, Chennai</option>
                    <option value="Anna Nagar">Anna Nagar Central, Chennai</option>
                  </optgroup>
                  <optgroup label="Pune, Maharashtra">
                    <option value="Koregaon Park">Koregaon Park, Pune</option>
                    <option value="Baner">Baner-Pashan, Pune</option>
                  </optgroup>
                  <optgroup label="Coimbatore, Tamil Nadu">
                    <option value="Peelamedu">Peelamedu, Coimbatore</option>
                    <option value="Race Course">Race Course, Coimbatore</option>
                    <option value="RS Puram">RS Puram, Coimbatore</option>
                    <option value="Saravanampatti">Saravanampatti, Coimbatore</option>
                    <option value="Saibaba Colony">Saibaba Colony, Coimbatore</option>
                  </optgroup>
                  <optgroup label="Kochi, Kerala">
                    <option value="Marine Drive">Marine Drive Promenade, Kochi</option>
                    <option value="Kakkanad InfoPark">Kakkanad InfoPark, Kochi</option>
                  </optgroup>
                  <optgroup label="Kolkata, West Bengal">
                    <option value="New Town">New Town Eco Park, Kolkata</option>
                    <option value="Salt Lake Sector V">Salt Lake Sector V, Kolkata</option>
                  </optgroup>
                  <optgroup label="Ahmedabad, Gujarat">
                    <option value="SG Highway">SG Highway, Ahmedabad</option>
                    <option value="Bodakdev">Bodakdev, Ahmedabad</option>
                  </optgroup>
                  <optgroup label="Jaipur, Rajasthan">
                    <option value="Vaishali Nagar">Vaishali Nagar, Jaipur</option>
                  </optgroup>
                  <optgroup label="Chandigarh / Mohali">
                    <option value="Aerocity Mohali">Aerocity Mohali, Chandigarh</option>
                  </optgroup>
                  <optgroup label="Goa">
                    <option value="Assagao">Assagao Village, North Goa</option>
                  </optgroup>
                </select>
              </div>

              {/* BHK Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Bedrooms (BHK)</label>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((bhk) => (
                    <button
                      key={bhk}
                      type="button"
                      onClick={() => setSelectedBhk(bhk)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedBhk === bhk
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bhk}{bhk === 4 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Limit */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex justify-between">
                  <span>Max Budget:</span>
                  <span className="text-orange-700 font-extrabold">
                    {buyerIntent === 'BUY' ? `₹${(budgetCap / 100000).toFixed(0)} Lakhs` : `₹${(budgetCap / 1000).toFixed(0)}k/mo`}
                  </span>
                </label>
                <select
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500"
                >
                  {buyerIntent === 'BUY' ? (
                    <>
                      <option value={5500000}>Up to ₹55 Lakhs</option>
                      <option value={7500000}>Up to ₹75 Lakhs</option>
                      <option value={10000000}>Up to ₹1.00 Crore</option>
                      <option value={20000000}>Up to ₹2.00 Crore</option>
                      <option value={30000000}>Up to ₹3.00 Crore</option>
                    </>
                  ) : (
                    <>
                      <option value={20000}>Up to ₹20,000/mo</option>
                      <option value={30000}>Up to ₹30,000/mo</option>
                      <option value={50000}>Up to ₹50,000/mo</option>
                    </>
                  )}
                </select>
              </div>

              {/* Action Button */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm transition-all shadow-haven-sm flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Personalize Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* The 4-Stage Product Journey Visualizer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-orange-700 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            How HavenMatch Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            The Intelligent Match Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            PERSON → LIFESTYLE → PROPERTY → LOCATION → MATCH → EXPLANATION → DECISION
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Step 1 */}
          <div className="card-haven p-5 bg-white border border-slate-200/90 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-sm mb-3">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Understand You
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We capture your everyday routine: commute tolerance, healthcare needs, elderly parents, school zones, and quietness.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card-haven p-5 bg-white border border-slate-200/90 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-sm mb-3">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Analyze Homes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We evaluate floor layouts, Vastu orientation, water reliability (Siruvani, Corporation), 100% DG backup, and legal RERA titles.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card-haven p-5 bg-white border border-slate-200/90 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-sm mb-3">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-1.5">
              <span>Satellite & GIS</span>
              <Satellite className="w-3.5 h-3.5 text-orange-600" />
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-resolution satellite mapping and real drive-time telemetry to hospitals, tech parks, supermarkets, and schools.
            </p>
          </div>

          {/* Step 4 */}
          <div className="card-haven p-5 bg-white border border-slate-200/90 rounded-2xl relative border-orange-300 ring-1 ring-orange-200">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm mb-3 shadow-haven-sm">
              04
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Explainable Match
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every home comes with an honest match breakdown and trade-off analysis answering: <em>"Why is this property right for me?"</em>
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Location Intelligence Map with Customer Requirements */}
      <HomeLocationMap />

      {/* Dedicated Seller Portal Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-haven p-6 sm:p-8 bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-haven-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
              <Building className="w-3.5 h-3.5 text-orange-600" />
              <span>Dedicated Portal for Property Owners & Sellers</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Own a flat, villa, or penthouse anywhere in India?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Upload your property across Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, or Coimbatore with 0% brokerage. Activate AI reverse matchmaking to connect with active, verified lifestyle buyers searching in your locality today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setRole('SELLER');
                setActiveView('seller_add_property');
                showToast('Opened Property Upload & Listing Portal');
              }}
              className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs sm:text-sm shadow-haven-sm flex items-center justify-center gap-2 transition-all hover:shadow-haven-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload & List Property</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setRole('SELLER');
                setActiveView('seller_portal');
              }}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Seller Insights</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Lifestyle Matches Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-orange-100 text-orange-800">
                AI Curated Matches
              </span>
              <span className="text-xs text-slate-500">Based on active profile</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Top Matches for Your Lifestyle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Ranked with multi-dimensional match scores & satellite verified surroundings.
            </p>
          </div>

          <button
            onClick={() => setActiveView('discover')}
            className="self-start sm:self-auto inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-700 hover:text-orange-800"
          >
            <span>View All Matches</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              match={matches[prop.id]}
            />
          ))}
        </div>
      </section>

      {/* Product Differentiator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-12 relative overflow-hidden border border-slate-800">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400 bg-orange-950/80 px-3 py-1 rounded-full border border-orange-800">
                The Product Differentiator
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-3 leading-tight">
                Lifestyle Intelligence Combined with Satellite Ground Truth
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Generic portals show you thousands of unfiltered results and sell your phone number to brokers. HavenMatch pairs conversational lifestyle understanding with satellite POI mapping for total transparency.
              </p>

              <div className="mt-6 space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Broker Spam:</strong> Connect directly with verified owners and builders.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>Satellite & Road Radii:</strong> Inspect actual aerial views and road drive times.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span><strong>Reverse Matchmaking for Owners:</strong> Sellers see compatible buyers actively seeking their home.</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => setActiveView('lifestyle_interview')}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md"
                >
                  Start 2-Minute Lifestyle Match
                </button>
              </div>
            </div>

            {/* Simulation Preview */}
            <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-5 text-slate-200 text-xs space-y-3 font-mono">
              <div className="text-orange-400 text-[11px] font-bold">
                // SNS Workbench Match Evaluation
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl space-y-2 border border-slate-800">
                <div className="flex justify-between text-[11px]">
                  <span>Buyer: Verified Buyer</span>
                  <span className="text-orange-400 font-bold">94% Match</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Target: Peelamedu | Budget: ₹75L | Commute: TIDEL Park &lt; 15m
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-orange-300">
                  ✓ PSG Hospitals: 1.2 km (High Priority Match)<br />
                  ✓ Satellite Mapped: 4 min actual drive time<br />
                  ✓ 2.5 BHK within ₹68L (₹7L buffer)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
