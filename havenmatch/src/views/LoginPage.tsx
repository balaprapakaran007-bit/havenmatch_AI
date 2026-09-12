import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Sparkles, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Compass
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, showToast } = useApp();

  const [role, setRole] = useState<UserRole>('BUYER');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Please enter a password with at least 4 characters');
      return;
    }

    const userName = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

    login({
      email,
      phone: `+91 ${cleanPhone.slice(-10)}`,
      name: formattedName,
      role
    });

    showToast(`Welcome back, ${formattedName}! Signed in as ${role === 'BUYER' ? 'Home Buyer' : 'Property Owner'}.`);
  };

  const fillDemoBuyer = () => {
    setRole('BUYER');
    setEmail('akash.sundaram@havenmatch.ai');
    setPhone('9840123456');
    setPassword('lifestyle2026');
    setErrorMsg('');
  };

  const fillDemoSeller = () => {
    setRole('SELLER');
    setEmail('dr.senthil@havenmatch.ai');
    setPhone('9840011223');
    setPassword('ownerverified2026');
    setErrorMsg('');
  };

  const handleGuestContinue = () => {
    login({
      email: 'guest@havenmatch.ai',
      phone: '+91 98765 43210',
      name: 'Guest Explorer',
      role: 'BUYER'
    });
    showToast('Logged in as Guest Explorer');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-transparent">
      <div className="w-full max-w-md sm:max-w-lg space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2.5 mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-haven-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 flex items-center gap-1.5">
                HAVENMATCH <span className="text-orange-600 font-black">AI</span>
              </span>
              <p className="text-xs tracking-wide text-slate-500 font-medium">
                Right Home. Right Lifestyle. Right Match.
              </p>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 pt-2 tracking-tight">
            Sign In to HavenMatch AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs sm:max-w-sm mx-auto">
            Access personalized lifestyle matching, live satellite telemetry, and direct owner listings.
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-haven p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-haven-md">
          
          {/* Role Switcher Tabs */}
          <div className="p-1 bg-slate-100 rounded-2xl flex gap-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'BUYER'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Home Buyer / Tenant</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'SELLER'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Owner / Seller</span>
            </button>
          </div>

          {/* Error message alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email ID Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-orange-600" />
                <span>Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@havenmatch.ai"
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                />
              </div>
            </div>

            {/* Phone Number Field with +91 Prefix */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Mobile Phone Number</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  className="flex-1 px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent to your registered phone & email.')}
                  className="text-[11px] font-bold text-orange-700 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret password"
                  required
                  className="w-full px-3.5 py-3 pr-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Consent */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span>Keep me signed in</span>
              </label>

              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                256-Bit SSL
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm sm:text-base shadow-haven-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In as {role === 'BUYER' ? 'Buyer / Tenant' : 'Property Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* One-Click Demo Login Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Test / 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoBuyer}
                className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950">Demo Buyer</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-200 text-orange-900 font-bold">Auto-Fill</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Akash Sundaram • Coimbatore</p>
              </button>

              <button
                type="button"
                onClick={fillDemoSeller}
                className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950">Demo Owner</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-200 text-orange-900 font-bold">Auto-Fill</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Dr. Senthil Kumar • Peelamedu</p>
              </button>
            </div>
          </div>

          {/* Continue as Guest */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs font-bold text-slate-500 hover:text-orange-700 transition-colors inline-flex items-center gap-1"
            >
              <span>Skip authentication & explore as Guest</span>
              <Compass className="w-3.5 h-3.5 text-orange-600" />
            </button>
          </div>

        </div>

        {/* Security & Indian Real Estate Trust Strip */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
              100% RERA Verified Listings
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
              Zero Broker Spam Calls
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
              Satellite Aerial Telemetry
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            By continuing, you agree to HavenMatch AI Terms of Service and Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
};
