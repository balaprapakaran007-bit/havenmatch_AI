import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { propertyService } from '../services/propertyService';
import { visitService } from '../services/visitService';
import { Property, Visit } from '../types';
import {
  Sparkles,
  Heart,
  Calendar,
  MessageSquare,
  Compass,
  MapPin,
  ArrowRight,
  Trash2,
  Phone,
  Home,
  Building2,
  Users,
  CheckCircle2,
  Check,
  Scale,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { PropertyCard } from '../components/property/PropertyCard';

export const BuyerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSession, savedPropertyIds, toggleSaveProperty, showToast } = useApp();
  const { requirements } = useLifestyle();

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [topMatch, setTopMatch] = useState<Property | null>(null);
  const [recommendedList, setRecommendedList] = useState<Property[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'MATCHES' | 'SAVED' | 'VISITS'>('MATCHES');

  useEffect(() => {
    visitService.getVisits().then(setVisits);
    propertyService.getProperties().then((props) => {
      setAllProperties(props);
      if (props.length > 0) {
        setTopMatch(props[0]);
        setRecommendedList(props.slice(1, 4));
      }
    });
  }, []);

  const savedProperties = allProperties.filter((p) => savedPropertyIds.includes(p.id));
  const userName = userSession?.name || (userSession?.email ? userSession.email.split('@')[0] : 'Home Buyer');

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation (Matching Screen 6) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm text-left">
              {/* Brand Header */}
              <div className="flex items-center gap-2.5 pb-5 mb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 block leading-tight">HavenMatch AI</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Buyer Portal</span>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/recommendations"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Discover</span>
                </Link>

                <button
                  onClick={() => setActiveTab('MATCHES')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                    activeTab === 'MATCHES'
                      ? 'bg-orange-50 text-orange-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>My Matches</span>
                </button>

                <button
                  onClick={() => setActiveTab('SAVED')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                    activeTab === 'SAVED'
                      ? 'bg-orange-50 text-orange-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>Shortlist</span>
                  </div>
                  {savedPropertyIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
                      {savedPropertyIds.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('VISITS')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                    activeTab === 'VISITS'
                      ? 'bg-orange-50 text-orange-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Visits</span>
                  </div>
                  {visits.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                      {visits.length}
                    </span>
                  )}
                </button>

                <Link
                  to="/messages"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile</span>
                </Link>
              </nav>

              {/* Quick Lifestyle Snapshot */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Search Criteria</span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target City:</span>
                    <span className="font-bold text-slate-800">{requirements.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget:</span>
                    <span className="font-bold text-orange-700">₹{(requirements.budgetMax / 100000).toFixed(0)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">BHK:</span>
                    <span className="font-bold text-slate-800">{requirements.bhk.join(', ')} BHK</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-9 space-y-6 sm:space-y-8 text-left">
            
            {/* Greeting Header (Matching Screen 6) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Good morning, {userName} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Let's find a place that fits your life.
                </p>
              </div>

              <Link
                to="/recommendations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                <span>Find More Matches</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Tab Switcher Bar */}
            <div className="lg:hidden flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('MATCHES')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'MATCHES'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Matches</span>
              </button>
              <button
                onClick={() => setActiveTab('SAVED')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'SAVED'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Shortlist ({savedPropertyIds.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('VISITS')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'VISITS'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Visits ({visits.length})</span>
              </button>
            </div>

            {activeTab === 'MATCHES' && (
              <>
                {/* "Your Top Match" Featured Card (Matching Screen 6) */}
                {topMatch && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Your Top Match</h2>
                      <span className="text-xs font-bold text-orange-600">Calculated by HavenMatch AI</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Property Image with Match Badge */}
                      <div className="md:col-span-6 relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100">
                        <img
                          src={topMatch.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                          alt={topMatch.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>95% Match</span>
                        </div>
                        <button
                          onClick={() => toggleSaveProperty(topMatch.id)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center shadow-md hover:text-rose-600"
                        >
                          <Heart className={`w-4 h-4 ${savedPropertyIds.includes(topMatch.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Right: Property Details & "Why it fits you?" */}
                      <div className="md:col-span-6 space-y-4">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{topMatch.propertyType}</span>
                          <h3 className="text-xl font-black text-slate-900 leading-snug">{topMatch.title}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            <span>{topMatch.locality}, {topMatch.city}</span>
                          </p>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-orange-600">₹{topMatch.priceDisplay || topMatch.price}</span>
                          <span className="text-xs text-slate-400 font-medium">({topMatch.bhk} BHK • {topMatch.builtUpAreaSqFt} sq.ft)</span>
                        </div>

                        {/* Why it fits you? Checklist (Matching Screen 6) */}
                        <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-1.5">
                          <span className="text-xs font-bold text-orange-950 block mb-1">Why it fits you?</span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                              <span>Within your defined budget ceiling</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                              <span>{topMatch.bhk} BHK matches your space requirement</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                              <span>Multi-specialty hospital within 1.2 km</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                              <span>Direct transport corridor to tech hubs</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                              <span>Quiet residential pocket with Siruvani water</span>
                            </li>
                          </ul>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <Link
                            to={`/property/${topMatch.id}`}
                            className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center shadow-sm transition-colors"
                          >
                            View Property
                          </Link>
                          <Link
                            to={`/property/${topMatch.id}/location`}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                          >
                            Location Map
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* "Recommended for You" Section (Matching Screen 6) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Recommended for You</h2>
                    <Link to="/recommendations" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                      See All →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedList.map((prop) => (
                      <PropertyCard key={prop.id} property={prop} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Shortlist Tab */}
            {activeTab === 'SAVED' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    My Shortlist ({savedProperties.length})
                  </h2>
                </div>

                {savedProperties.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
                    <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Your shortlist is waiting.</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Save properties while exploring to compare match scores, commute times, and pricing side-by-side.
                    </p>
                    <Link
                      to="/recommendations"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm"
                    >
                      Explore Matches
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((prop) => (
                      <PropertyCard key={prop.id} property={prop} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visits Tab */}
            {activeTab === 'VISITS' && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Scheduled Site Visits</h2>
                {visits.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">No upcoming property visits scheduled.</p>
                    <p className="text-xs text-slate-400 mt-1">Schedule a site tour on any property detail page.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visits.map((v) => (
                      <div key={v.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-600">{v.timeSlot}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {v.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{v.propertyTitle}</h4>
                        <p className="text-xs text-slate-500">{v.date}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
};
