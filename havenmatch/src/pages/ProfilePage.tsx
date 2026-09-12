import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  MapPin,
  Home,
  Briefcase,
  CheckCircle2,
  Edit3,
  ArrowRight,
  Compass,
  Heart,
  Calendar,
  MessageSquare,
  User,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, lifestyle } = useLifestyle();
  const { userSession, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'PREFERENCES' | 'ACTIVITY'>('PERSONAL');

  const name = userSession?.name || 'Priya S.';
  const email = userSession?.email || 'priya@example.com';
  const phone = userSession?.phone || '+91 95765 43210';
  const city = requirements.city || 'Coimbatore';

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation (Matching Screen 14) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 block leading-tight">HavenMatch AI</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Account</span>
                </div>
              </div>

              <nav className="space-y-1">
                <Link to="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Home</span>
                </Link>
                <Link to="/recommendations" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Discover</span>
                </Link>
                <Link to="/buyer/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>My Matches</span>
                </Link>
                <Link to="/buyer/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>Shortlist</span>
                </Link>
                <Link to="/buyer/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Visits</span>
                </Link>
                <Link to="/messages" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Messages</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 shadow-xs">
                  <User className="w-4 h-4 text-orange-600" />
                  <span>Profile</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Right Main Profile Card (Matching Screen 14) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Hero Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                      alt={name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-orange-100 shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900">{name}</h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                        Buyer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Verified Resident • Peelamedu, {city}</p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Member since Jan 2024</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast('Profile edit mode enabled')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Tabs Row (Matching Screen 14) */}
              <div className="flex items-center gap-2 pt-6 pb-4 border-b border-slate-100">
                {[
                  { id: 'PERSONAL', label: 'Personal' },
                  { id: 'PREFERENCES', label: 'Preferences' },
                  { id: 'ACTIVITY', label: 'Activity' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === t.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Personal Details & Brand Quote (Matching Screen 14) */}
              {activeTab === 'PERSONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
                  
                  {/* Personal Fields List */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <span className="text-sm font-bold text-slate-900">{name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                      <span className="text-sm font-bold text-slate-900">{email}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                      <span className="text-sm font-bold text-slate-900">{phone}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Location</span>
                      <span className="text-sm font-bold text-slate-900">Peelamedu, Coimbatore, Tamil Nadu</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target City</span>
                      <span className="text-sm font-bold text-orange-600">{city}</span>
                    </div>
                  </div>

                  {/* Brand Quote Box (Matching Screen 14) */}
                  <div className="md:col-span-5 bg-orange-50/70 rounded-3xl p-6 border border-orange-100 flex flex-col justify-center text-center space-y-3">
                    <span className="text-4xl text-orange-400 font-serif leading-none">“</span>
                    <p className="text-sm font-bold text-slate-800 italic leading-relaxed">
                      A home is not just a place, it's a better life.
                    </p>
                    <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
                      HavenMatch AI
                    </span>
                  </div>

                </div>
              )}

              {/* Tab 2: Lifestyle Priorities */}
              {activeTab === 'PREFERENCES' && (
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                      <span className="text-xs text-slate-400 font-bold block">Target Budget</span>
                      <span className="text-base font-black text-orange-600">₹{(requirements.budgetMax / 100000).toFixed(0)} Lakhs</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200">
                      <span className="text-xs text-slate-400 font-bold block">BHK Layout</span>
                      <span className="text-base font-black text-slate-900">{requirements.bhk.join(', ')} BHK</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">Selected Lifestyle Priorities:</span>
                    <div className="flex flex-wrap gap-2">
                      {['Daily Commute to TIDEL Park', 'Schools for Children', 'Healthcare Nearby', 'Siruvani Drinking Water', '100% East Facing Vastu'].map((p, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Activity */}
              {activeTab === 'ACTIVITY' && (
                <div className="pt-6 space-y-3">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Lifestyle Profile Updated</h4>
                      <p className="text-[11px] text-slate-400">Coimbatore search blueprint configured</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Today</span>
                  </div>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="pt-8 border-t border-slate-100 mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/recommendations')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <span>Explore Recommendations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </main>

        </div>
      </div>
    </div>
  );
};
