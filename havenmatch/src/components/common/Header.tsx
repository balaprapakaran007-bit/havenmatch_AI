import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLifestyle } from '../../context/LifestyleContext';
import { 
  Sparkles, 
  Compass, 
  Heart, 
  Scale, 
  Calendar, 
  MessageSquare, 
  Building2, 
  Users, 
  PlusCircle, 
  Menu, 
  X,
  MapPin,
  ArrowRight,
  LogOut,
  User,
  Palette
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    role, 
    setRole, 
    activeView, 
    setActiveView, 
    bgTheme,
    cycleBgTheme,
    userSession,
    logout,
    savedPropertyIds, 
    comparePropertyIds,
    showToast
  } = useApp();
  const { requirements, setRequirements } = useLifestyle();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cities = ['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai'];

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setRequirements((prev) => ({ ...prev, city: selectedCity }));
    showToast(`Exploring properties in ${selectedCity}`);
  };

  const navItemClass = (isActive: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-orange-700 bg-orange-50 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => setActiveView('landing')}
              className="flex items-center gap-2 text-left focus:outline-none shrink-0"
            >
              <img
                src="/logo.png"
                alt="HavenMatch AI Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-haven-sm shrink-0"
              />
              <div className="min-w-0">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none">
                  HAVENMATCH <span className="text-orange-600 font-black">AI</span>
                </span>
                <p className="text-[10px] tracking-wide text-slate-500 font-medium hidden sm:block mt-0.5">
                  Right Home. Right Lifestyle. Right Match.
                </p>
              </div>
            </button>

            {/* City Selector */}
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-200">
              <MapPin className="w-4 h-4 text-orange-600 mr-1.5" />
              <select
                value={requirements.city}
                onChange={handleCityChange}
                className="bg-transparent text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none pr-2 py-1 hover:text-orange-700"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {role === 'BUYER' ? (
              <>
                <button
                  onClick={() => setActiveView('discover')}
                  className={navItemClass(activeView === 'discover')}
                >
                  <Compass className="w-4 h-4" />
                  Discover
                </button>

                <button
                  onClick={() => setActiveView('lifestyle_profile')}
                  className={navItemClass(activeView === 'lifestyle_profile' || activeView === 'lifestyle_interview')}
                >
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Lifestyle Profile
                </button>

                <button
                  onClick={() => setActiveView('saved')}
                  className={navItemClass(activeView === 'saved')}
                >
                  <Heart className="w-4 h-4" />
                  Saved
                  {savedPropertyIds.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-orange-100 text-orange-800">
                      {savedPropertyIds.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView('compare')}
                  className={navItemClass(activeView === 'compare')}
                >
                  <Scale className="w-4 h-4" />
                  Compare
                  {comparePropertyIds.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-slate-200 text-slate-700">
                      {comparePropertyIds.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView('visits')}
                  className={navItemClass(activeView === 'visits')}
                >
                  <Calendar className="w-4 h-4" />
                  Visits
                </button>

                <button
                  onClick={() => {
                    setRole('SELLER');
                    setActiveView('seller_add_property');
                    showToast('Opened Property Upload & Listing Portal');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-700 bg-orange-50/90 hover:bg-orange-100 border border-orange-200/90 transition-all ml-2 shadow-xs group"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
                  <span>Post Property <span className="bg-orange-600 text-white text-[9px] px-1 py-0.2 rounded font-extrabold ml-0.5">FREE</span></span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('seller_portal')}
                  className={navItemClass(activeView === 'seller_portal')}
                >
                  <Building2 className="w-4 h-4" />
                  Seller Overview
                </button>

                <button
                  onClick={() => setActiveView('seller_dashboard')}
                  className={navItemClass(activeView === 'seller_dashboard')}
                >
                  <Sparkles className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveView('seller_buyers')}
                  className={navItemClass(activeView === 'seller_buyers')}
                >
                  <Users className="w-4 h-4" />
                  Compatible Buyers
                  <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-orange-100 text-orange-800">
                    4
                  </span>
                </button>

                <button
                  onClick={() => setActiveView('seller_add_property')}
                  className={navItemClass(activeView === 'seller_add_property')}
                >
                  <PlusCircle className="w-4 h-4 text-orange-600" />
                  List Property
                </button>

                <button
                  onClick={() => setActiveView('messages')}
                  className={navItemClass(activeView === 'messages')}
                >
                  <MessageSquare className="w-4 h-4" />
                  Inquiries
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Role Switcher & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Role Switcher Pill */}
            <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => {
                  setRole('BUYER');
                  if (activeView.startsWith('seller')) setActiveView('discover');
                  showToast('Switched to Buyer Mode');
                }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs transition-all ${
                  role === 'BUYER'
                    ? 'bg-white dark:bg-slate-900 text-orange-700 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => {
                  setRole('SELLER');
                  setActiveView('seller_portal');
                  showToast('Welcome to Seller Portal');
                }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs transition-all ${
                  role === 'SELLER'
                    ? 'bg-white dark:bg-slate-900 text-orange-700 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Seller</span><span className="hidden sm:inline"> / Owner</span>
              </button>
            </div>

            {/* Atmosphere Theme Switcher */}
            <button
              onClick={cycleBgTheme}
              title={`Active Atmosphere: ${bgTheme.toUpperCase()} (Click to toggle theme)`}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-200/80 dark:border-slate-700"
            >
              <Palette className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden xl:inline capitalize">{bgTheme}</span>
            </button>

            {/* User Session / Sign Out */}
            {userSession ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                    {userSession.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block leading-tight">
                    {userSession.phone.slice(-10)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    showToast('Signed out successfully');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('login')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-xs hover:bg-orange-700"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</span>
            <select
              value={requirements.city}
              onChange={handleCityChange}
              className="bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 px-2 py-1"
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {role === 'BUYER' ? (
              <>
                <button
                  onClick={() => { setActiveView('discover'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Compass className="w-5 h-5 text-orange-600" />
                  Discover Matches
                </button>
                <button
                  onClick={() => { setActiveView('lifestyle_profile'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  My Lifestyle Profile
                </button>
                <button
                  onClick={() => { setActiveView('saved'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Heart className="w-5 h-5 text-orange-600" />
                  Saved Properties ({savedPropertyIds.length})
                </button>
                <button
                  onClick={() => { setActiveView('compare'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Scale className="w-5 h-5 text-orange-600" />
                  Compare ({comparePropertyIds.length})
                </button>
                <button
                  onClick={() => { setActiveView('visits'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Scheduled Visits
                </button>
                <button
                  onClick={() => { 
                    setRole('SELLER');
                    setActiveView('seller_add_property'); 
                    setMobileMenuOpen(false); 
                    showToast('Opened Property Upload & Listing Portal');
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200"
                >
                  <PlusCircle className="w-5 h-5 text-orange-600" />
                  <span>Upload & List Property (FREE)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveView('seller_portal'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Building2 className="w-5 h-5 text-orange-600" />
                  Seller Overview Page
                </button>
                <button
                  onClick={() => { setActiveView('seller_dashboard'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  Seller Dashboard
                </button>
                <button
                  onClick={() => { setActiveView('seller_buyers'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <Users className="w-5 h-5 text-orange-600" />
                  Compatible Buyers
                </button>
                <button
                  onClick={() => { setActiveView('seller_add_property'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  <PlusCircle className="w-5 h-5 text-orange-600" />
                  List New Property
                </button>
              </>
            )}

            {/* Mobile User Profile & Logout */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between px-2">
              {userSession ? (
                <>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">{userSession.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{userSession.phone}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      showToast('Signed out successfully');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setActiveView('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-orange-600 text-white text-xs font-bold text-center"
                >
                  Sign In to HavenMatch AI
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
