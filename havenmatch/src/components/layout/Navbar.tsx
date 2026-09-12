import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLifestyle } from '../../context/LifestyleContext';
import { matchingService, BackendStatus } from '../../services/matchingService';
import {
  Sparkles,
  Compass,
  Heart,
  Scale,
  Building2,
  Users,
  PlusCircle,
  Menu,
  X,
  MapPin,
  LogOut,
  User,
  CheckCircle2,
  Zap,
  Radio,
  Home
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    role,
    setRole,
    userSession,
    logout,
    savedPropertyIds,
    showToast
  } = useApp();
  const { requirements, setRequirements } = useLifestyle();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(matchingService.getStatus());

  useEffect(() => {
    const unsubscribe = matchingService.subscribeStatus((status) => {
      setBackendStatus(status);
    });
    return unsubscribe;
  }, []);

  const cities = ['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai'];


  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    setRequirements((prev) => ({ ...prev, city: selectedCity }));
    showToast(`Exploring properties in ${selectedCity}`);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? 'text-orange-700 bg-orange-50 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-left focus:outline-none group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1 leading-none">
                  HavenMatch <span className="text-orange-600 font-black">AI</span>
                </span>
                <p className="text-[10.5px] tracking-wide text-slate-500 font-medium hidden sm:block mt-0.5">
                  Find a home that fits your life.
                </p>
              </div>
            </Link>

            {/* City Selector */}
            <div className="hidden lg:flex items-center ml-3 pl-3 border-l border-slate-200">
              <MapPin className="w-4 h-4 text-orange-600 mr-1.5" />
              <select
                value={requirements.city}
                onChange={handleCityChange}
                aria-label="Select City"
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
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link to="/" className={navLinkClass(isActive('/'))}>
              Home
            </Link>

            <Link to="/recommendations" className={navLinkClass(isActive('/recommendations'))}>
              <Compass className="w-4 h-4 text-orange-600" />
              Properties
            </Link>

            <Link to="/choose-role" className={navLinkClass(isActive('/choose-role') || isActive('/goal') || isActive('/basic-details') || isActive('/preferences'))}>
              <Sparkles className="w-4 h-4 text-orange-600" />
              Match Wizard
            </Link>

            {role === 'BUYER' ? (
              <Link to="/buyer/dashboard" className={navLinkClass(isActive('/buyer/dashboard'))}>
                Dashboard
                {savedPropertyIds.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800">
                    {savedPropertyIds.length}
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/owner/dashboard" className={navLinkClass(isActive('/owner/dashboard'))}>
                <Building2 className="w-4 h-4 text-orange-600" />
                Owner Portal
              </Link>
            )}

            <Link
              to="/owner/add-property"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all ml-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>List Property <span className="bg-orange-600 text-white text-[9px] px-1 py-0.2 rounded font-black ml-0.5">FREE</span></span>
            </Link>
          </nav>

          {/* Right Action: Role Selector & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SNS Workbench Agent Backend Indicator */}
            <div
              title={`SNS Workbench AI Agent: ${backendStatus.endpoint} (${backendStatus.mode.toUpperCase()})`}
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                backendStatus.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${backendStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="truncate max-w-[130px]">
                {backendStatus.connected ? 'SNS Agent Live' : 'SNS Agent Ready'}
              </span>
            </div>

            {/* Role switch toggle */}
            <div className="hidden sm:inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => {
                  setRole('BUYER');
                  showToast('Switched to Buyer Mode');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  role === 'BUYER'
                    ? 'bg-white text-orange-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => {
                  setRole('SELLER');
                  navigate('/owner/dashboard');
                  showToast('Switched to Owner Mode');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  role === 'SELLER'
                    ? 'bg-white text-orange-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Owner
              </button>
            </div>

            {/* Auth button or User Menu */}
            {userSession ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                    {userSession.name}
                  </span>
                  <span className="text-[10px] text-orange-600 font-medium block leading-tight flex items-center justify-end gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {role}
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
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-xs hover:bg-orange-700 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</span>
            <select
              value={requirements.city}
              onChange={handleCityChange}
              aria-label="Select City (Mobile)"
              className="bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 px-2 py-1"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              Home
            </Link>
            <Link
              to="/choose-role"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              Start Lifestyle Match Wizard
            </Link>
            <Link
              to="/recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              <Compass className="w-4 h-4 text-orange-600" />
              Property Recommendations
            </Link>
            <Link
              to="/buyer/dashboard"
              onClick={() => {
                setRole('BUYER');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              <Heart className="w-4 h-4 text-orange-600" />
              Buyer Dashboard ({savedPropertyIds.length} Saved)
            </Link>
            <Link
              to="/owner/dashboard"
              onClick={() => {
                setRole('SELLER');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              <Building2 className="w-4 h-4 text-orange-600" />
              Owner Dashboard
            </Link>
            <Link
              to="/owner/matches"
              onClick={() => {
                setRole('SELLER');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
            >
              <Users className="w-4 h-4 text-orange-600" />
              Buyer Matches (For Owners)
            </Link>
            <Link
              to="/owner/add-property"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200"
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              List Property (FREE)
            </Link>

            <div className="pt-3 mt-2 border-t border-slate-100">
              {userSession ? (
                <div className="flex items-center justify-between px-2">
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
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 rounded-xl bg-orange-600 text-white text-xs font-bold text-center"
                >
                  Sign In to HavenMatch AI
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-5 items-center justify-around text-center">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive('/') ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </Link>

          <Link
            to="/recommendations"
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive('/recommendations') ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span>Explore</span>
          </Link>

          <Link
            to="/owner/add-property"
            className="flex flex-col items-center justify-center -mt-3.5"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-bold text-orange-600 mt-0.5">Post Free</span>
          </Link>

          <Link
            to="/choose-role"
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive('/choose-role') || isActive('/goal') || isActive('/basic-details') || isActive('/preferences')
                ? 'text-orange-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>AI Match</span>
          </Link>

          <Link
            to={role === 'BUYER' ? '/buyer/dashboard' : '/owner/dashboard'}
            className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive('/buyer/dashboard') || isActive('/owner/dashboard')
                ? 'text-orange-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {role === 'BUYER' ? (
              <>
                <Heart className="w-5 h-5 mb-0.5" />
                <span>Saved ({savedPropertyIds.length})</span>
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 mb-0.5" />
                <span>Owner</span>
              </>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};
