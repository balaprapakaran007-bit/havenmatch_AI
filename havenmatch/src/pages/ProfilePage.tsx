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
  ShieldCheck,
  TrendingUp,
  Droplets,
  Trees,
  GraduationCap,
  Hospital,
  Car,
  DollarSign,
  Sliders,
  Check
} from 'lucide-react';
import { EditProfileModal } from '../components/owner/EditProfileModal';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, lifestyle } = useLifestyle();
  const { userSession, savedPropertyIds, showToast, role } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PREFERENCES' | 'ACTIVITY'>('OVERVIEW');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const name = userSession?.name || (userSession?.email ? userSession.email.split('@')[0] : 'Bala');
  const email = userSession?.email || 'bala@havenmatch.ai';
  const phone = userSession?.phone || '+91 98401 23456';
  const location = userSession?.location || 'Peelamedu, Coimbatore';
  const avatar = userSession?.avatarUrl || (userSession as any)?.avatar || (userSession as any)?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const city = requirements.city || 'Coimbatore';
  const isSeller = role === 'SELLER';

  // Format Budget Display
  const formatBudget = () => {
    if (requirements.intent === 'RENT') {
      return `₹${(requirements.budgetMin || 15000).toLocaleString('en-IN')} - ₹${(requirements.budgetMax || 35000).toLocaleString('en-IN')}/mo`;
    }
    const minLakhs = Math.round((requirements.budgetMin || 5000000) / 100000);
    const maxLakhs = Math.round((requirements.budgetMax || 9000000) / 100000);
    return `₹${minLakhs} Lakhs - ₹${maxLakhs} Lakhs`;
  };

  const lifestylePrioritiesList = [
    { label: 'Short Commute to Workplace', value: lifestyle.workplaceLocation ? `${lifestyle.workplaceLocation} (< 20 mins)` : 'TIDEL Park SEZ', icon: Car, rating: 'High Priority' },
    { label: 'Quiet & Peaceful Atmosphere', value: 'Residential Green Corridor', icon: Trees, rating: 'High Priority' },
    { label: 'Reputed Schools Nearby', value: 'Within 3 km radius', icon: GraduationCap, rating: 'Essential' },
    { label: 'Super-Specialty Hospitals', value: 'KMCH, PSG & Ganga Hospitals', icon: Hospital, rating: 'Essential' },
    { label: 'Drinking Water Supply', value: '24/7 Siruvani Corporation Water', icon: Droplets, rating: 'High Priority' },
    { label: 'Gated Security & CCTV', value: '24/7 Security Guard & Intercom', icon: ShieldCheck, rating: 'Essential' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-6 sm:py-8 text-left pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-base text-slate-900 block leading-tight">HavenMatch AI</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                    {isSeller ? 'Owner Portal' : 'Buyer Profile'}
                  </span>
                </div>
              </div>

              <nav className="space-y-1">
                <Link to="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Home</span>
                </Link>
                <Link to="/recommendations" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>Explore Homes</span>
                </Link>
                <Link to="/ai-matching" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>AI Lifestyle Match</span>
                </Link>
                <Link to="/saved" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>Saved Homes ({savedPropertyIds.length})</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 shadow-2xs">
                  <User className="w-4 h-4 text-orange-600" />
                  <span>Profile & Preferences</span>
                </Link>
              </nav>
            </div>

            {/* AI Profile Readiness Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-haven-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-100">AI Match Readiness</span>
                <span className="text-lg font-black text-white">88%</span>
              </div>
              <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '88%' }} />
              </div>
              <p className="text-[11px] text-orange-100 leading-relaxed">
                Your lifestyle profile is highly active. AI uses this blueprint to rank matching homes in real-time.
              </p>
              <button
                type="button"
                onClick={() => navigate('/ai-matching')}
                className="w-full py-2 px-3 rounded-xl bg-white text-orange-800 font-bold text-xs hover:bg-orange-50 transition-colors shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Improve Match Accuracy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* 1. Header Profile Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-orange-500 shadow-sm bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900">{name}</h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                        {isSeller ? 'Verified Owner' : 'Verified Buyer'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>{location}</span>
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {phone}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                {[
                  { id: 'OVERVIEW', label: 'Search & Lifestyle Overview' },
                  { id: 'PREFERENCES', label: 'Detailed Preferences' },
                  { id: 'ACTIVITY', label: 'Activity & Saved' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 pt-2">
                  
                  {/* Section: My Home Search */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Home className="w-4 h-4 text-orange-600" />
                        <span>My Home Search</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => navigate('/ai-matching')}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Edit Search</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Looking To</span>
                        <span className="text-sm font-black text-orange-700 mt-0.5 block">
                          {requirements.intent === 'RENT' ? 'RENT A HOME' : 'BUY A HOME'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Budget</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {formatBudget()}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BHK Layout</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {requirements.bhk?.length ? `${requirements.bhk.join(', ')} BHK` : '2 & 3 BHK'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Localities</span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block truncate">
                          {requirements.preferredLocalities?.length ? requirements.preferredLocalities.join(', ') : 'Peelamedu, Saravanampatti'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section: My Lifestyle Priorities */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span>My Lifestyle Priorities</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => navigate('/ai-matching')}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Update Priorities</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lifestylePrioritiesList.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 block leading-tight">{item.label}</span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">{item.value}</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-100 text-orange-800 shrink-0">
                              {item.rating}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: My Activity Cards */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span>My Activity & Interactions</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Link
                        to="/saved"
                        className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 hover:bg-orange-50 transition-all text-left block group"
                      >
                        <div className="flex items-center justify-between">
                          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                          <span className="text-2xl font-black text-slate-900">{savedPropertyIds.length}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 mt-2 block group-hover:text-orange-700">Saved Properties</span>
                        <span className="text-[11px] text-slate-500 block">View your shortlist</span>
                      </Link>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                        <div className="flex items-center justify-between">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="text-2xl font-black text-slate-900">3</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 mt-2 block">Interested Inquiries</span>
                        <span className="text-[11px] text-slate-500 block">Responses from owners</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                        <div className="flex items-center justify-between">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                          <span className="text-2xl font-black text-slate-900">1</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 mt-2 block">Scheduled Visits</span>
                        <span className="text-[11px] text-slate-500 block">Upcoming site walk</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: DETAILED PREFERENCES */}
              {activeTab === 'PREFERENCES' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Target City & Localities</h4>
                    <p className="text-sm font-bold text-slate-900">
                      Coimbatore • {requirements.preferredLocalities?.join(', ') || 'Peelamedu, Saravanampatti, Race Course, RS Puram'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Workplace Commute Target</h4>
                    <p className="text-sm font-bold text-slate-900">
                      Workplace: {lifestyle.workplaceLocation || 'TIDEL Park IT SEZ'} • Maximum commute: {lifestyle.maxCommuteMins || 20} mins
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Key Amenities Filter</h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Siruvani Water', '100% Power Backup', 'Gated Community 24/7 Security', 'Covered Car Parking', 'Lift Access', 'Children Play Area', 'East / North Vastu'].map((am, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-orange-600" />
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/ai-matching')}
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Re-run AI Questionnaire</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ACTIVITY */}
              {activeTab === 'ACTIVITY' && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Lifestyle Profile Blueprint Updated</h4>
                      <p className="text-[11px] text-slate-500">Coimbatore verified preferences configured</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Active Today</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">AI Matches Synchronized</h4>
                      <p className="text-[11px] text-slate-500">Evaluated real-time inventory for top compatibility</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Today</span>
                  </div>
                </div>
              )}

              {/* Bottom Recommendations CTA */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-slate-500">
                  HavenMatch AI matches update dynamically as new verified listings are added.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/recommendations')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm shadow-haven-sm transition-all cursor-pointer"
                >
                  <span>Explore 10 AI Recommended Homes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </main>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          showToast('Profile photo and details updated!');
        }}
      />
    </div>
  );
};

