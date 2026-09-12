import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Sparkles, 
  Users, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Clock, 
  IndianRupee,
  Sliders,
  ChevronRight
} from 'lucide-react';

export const SellerPortalPage: React.FC = () => {
  const { setActiveView, setRole, showToast } = useApp();

  // Reverse Match Demand Calculator demo
  const [calcCity, setCalcCity] = useState('Bengaluru');
  const [calcLocality, setCalcLocality] = useState('Indiranagar');
  const [calcBhk, setCalcBhk] = useState(2);
  const [calcType, setCalcType] = useState('Apartment');

  const cityLocalitiesMap: Record<string, string[]> = {
    'Bengaluru': ['Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout'],
    'Mumbai': ['Bandra West', 'Powai', 'Worli', 'Andheri West'],
    'Delhi NCR': ['Gurugram Golf Course Ext', 'Greater Kailash', 'Noida Expressway'],
    'Hyderabad': ['Gachibowli', 'Jubilee Hills', 'HITEC City'],
    'Chennai': ['Adyar', 'OMR Thoraipakkam', 'Anna Nagar'],
    'Pune': ['Koregaon Park', 'Baner'],
    'Coimbatore': ['Peelamedu', 'Race Course', 'RS Puram', 'Saravanampatti', 'Saibaba Colony'],
    'Kochi': ['Marine Drive', 'Kakkanad InfoPark'],
    'Kolkata': ['New Town', 'Salt Lake Sector V'],
    'Ahmedabad': ['SG Highway', 'Bodakdev'],
    'Jaipur': ['Vaishali Nagar'],
    'Chandigarh': ['Aerocity Mohali'],
    'Goa': ['Assagao']
  };

  // Simulated buyer counts based on locality selection
  const buyerDemandMap: Record<string, number> = {
    'Indiranagar': 86,
    'Whitefield': 94,
    'Koramangala': 72,
    'HSR Layout': 68,
    'Bandra West': 112,
    'Powai': 78,
    'Worli': 64,
    'Andheri West': 82,
    'Gurugram Golf Course Ext': 95,
    'Greater Kailash': 58,
    'Noida Expressway': 74,
    'Gachibowli': 89,
    'Jubilee Hills': 45,
    'HITEC City': 92,
    'Adyar': 52,
    'OMR Thoraipakkam': 67,
    'Anna Nagar': 48,
    'Koregaon Park': 61,
    'Baner': 55,
    'Peelamedu': 48,
    'Race Course': 32,
    'RS Puram': 41,
    'Saravanampatti': 64,
    'Saibaba Colony': 29,
    'Marine Drive': 44,
    'Kakkanad InfoPark': 58,
    'New Town': 62,
    'Salt Lake Sector V': 51,
    'SG Highway': 47,
    'Bodakdev': 38,
    'Vaishali Nagar': 34,
    'Aerocity Mohali': 31,
    'Assagao': 39
  };

  const currentDemand = (buyerDemandMap[calcLocality] || 40) + (calcBhk === 3 ? 14 : calcBhk === 4 ? 20 : 0);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-10 sm:pb-16 bg-gradient-to-b from-orange-50/80 via-white to-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-orange-900 text-xs font-bold shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>HavenMatch Owner & Builder Ecosystem</span>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
              Sell or Rent to <br className="hidden sm:inline" />
              <span className="text-orange-600 underline decoration-orange-300 decoration-wavy decoration-2">
                Pre-Matched Lifestyle Buyers
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Don't wait for random calls and unqualified broker inquiries. HavenMatch uses reverse AI matchmaking to instantly pair your property with home seekers whose budget, commute, and family criteria already fit your property.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setRole('SELLER');
                  setActiveView('seller_add_property');
                }}
                className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm sm:text-base shadow-haven-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Property Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setRole('SELLER');
                  setActiveView('seller_dashboard');
                }}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm sm:text-base transition-all flex items-center gap-2 shadow-xs"
              >
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>Open Seller Dashboard</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            <div className="card-haven p-4 bg-white border border-slate-200/90 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 block">12,400+</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Active Verified Buyers</span>
            </div>
            <div className="card-haven p-4 bg-white border border-slate-200/90 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 block">18 Days</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Avg. Match to Visit</span>
            </div>
            <div className="card-haven p-4 bg-white border border-slate-200/90 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 block">0%</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Brokerage Commission</span>
            </div>
            <div className="card-haven p-4 bg-white border border-slate-200/90 rounded-2xl text-center">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 block">100%</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Direct Owner Inquiries</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Reverse Match Demand Estimator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-haven p-6 sm:p-10 bg-white border border-orange-200 rounded-3xl shadow-haven-lg">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-extrabold text-orange-700 uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Instant Demand Gauge
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                See How Many Buyers are Waiting for Your Property
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Select your property parameters to check active verified buyer demand in our SNS Workbench database.
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 text-center md:text-right shrink-0">
              <span className="text-xs font-bold text-slate-600 block">Active Buyer Demand:</span>
              <span className="text-3xl font-black text-orange-600 block">{currentDemand} Buyers</span>
              <span className="text-[10px] text-orange-800 font-semibold block">Searching in {calcLocality}</span>
            </div>
          </div>

          {/* Interactive Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <select
                value={calcCity}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setCalcCity(newCity);
                  const locs = cityLocalitiesMap[newCity] || [];
                  if (locs.length > 0) setCalcLocality(locs[0]);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:border-orange-500"
              >
                {Object.keys(cityLocalitiesMap).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Locality</label>
              <select
                value={calcLocality}
                onChange={(e) => setCalcLocality(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:border-orange-500"
              >
                {(cityLocalitiesMap[calcCity] || [calcLocality]).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms (BHK)</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setCalcBhk(b)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      calcBhk === b ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {b} BHK
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
              <select
                value={calcType}
                onChange={(e) => setCalcType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:border-orange-500"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Matching buyers have verified phone numbers and target budgets between ₹55L – ₹1.2 Cr.</span>
            </p>

            <button
              onClick={() => {
                setRole('SELLER');
                setActiveView('seller_buyers');
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-haven-sm flex items-center justify-center gap-2"
            >
              <span>View Compatible Buyer Profiles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Why List on HavenMatch (3-Pillar Value Proposition) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Why Property Owners Choose HavenMatch AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transforming the residential selling process with intelligence rather than random listings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="card-haven p-6 bg-white border border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Reverse Buyer Matching
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of waiting passively for clicks, HavenMatch ranks qualified buyers by how well your property matches their daily commute, school zones, and family lifestyle.
            </p>
          </div>

          <div className="card-haven p-6 bg-white border border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Zero Unqualified Broker Calls
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never sell your contact details to third-party telemarketers. All in-person visit walkthroughs and chat inquiries are scheduled directly by verified home seekers.
            </p>
          </div>

          <div className="card-haven p-6 bg-white border border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Automated Walkthrough Booking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buyers book scheduled visit slots that fit your availability. Manage bookings (Confirmed, Completed, Rescheduled) effortlessly from your Seller Dashboard.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-haven-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black">
              Ready to List Your Home in Under 3 Minutes?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100">
              Join hundreds of property owners across Coimbatore, Chennai, and Bengaluru.
            </p>
          </div>

          <button
            onClick={() => {
              setRole('SELLER');
              setActiveView('seller_add_property');
            }}
            className="px-6 py-3 rounded-xl bg-white text-orange-900 font-black text-xs sm:text-sm hover:bg-orange-50 transition-all shadow-md shrink-0"
          >
            Create Your Free Listing
          </button>
        </div>
      </section>

    </div>
  );
};
