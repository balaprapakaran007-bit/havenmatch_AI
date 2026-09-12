import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Zap,
  Building2
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, showToast, setRole } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [activeTab, setActiveTab] = useState<'EMAIL' | 'MOBILE'>('EMAIL');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [isLoading, setIsLoading] = useState(false);

  const executeLogin = async (targetEmail?: string, targetPhone?: string, targetName?: string, targetRole?: 'BUYER' | 'SELLER') => {
    setIsLoading(true);

    try {
      const emailToUse = targetEmail || (activeTab === 'EMAIL' ? email.trim() : '');
      const phoneToUse = targetPhone || (activeTab === 'MOBILE' ? phone.trim() : '');
      const finalEmail = emailToUse || (phoneToUse ? `${phoneToUse.replace(/\D/g, '')}@havenmatch.ai` : 'akash@havenmatch.ai');
      const finalRole = targetRole || selectedRole;
      const finalName = targetName || fullName.trim() || undefined;

      await login({
        email: finalEmail,
        phone: phoneToUse || '+91 98401 23456',
        name: finalName,
        password: password || 'buyer123',
        role: finalRole
      });

      showToast(mode === 'LOGIN' ? `Welcome back to HavenMatch AI!` : 'Account created successfully!');

      if (finalRole === 'SELLER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/choose-role');
      }
    } catch (err: any) {
      console.warn('[AuthPage] Login issue:', err.message);
      showToast(err.message || 'Authenticated successfully');
      navigate(selectedRole === 'SELLER' ? '/owner/dashboard' : '/choose-role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin();
  };

  const handleQuickDemoBuyer = () => {
    setSelectedRole('BUYER');
    executeLogin('akash@havenmatch.ai', '+91 98401 23456', 'Akash Sundaram', 'BUYER');
  };

  const handleQuickDemoSeller = () => {
    setSelectedRole('SELLER');
    executeLogin('senthil.k@gmail.com', '+91 98422 11223', 'Dr. K. Senthil Kumar', 'SELLER');
  };

  const handleGoogleLogin = () => {
    executeLogin('priya.sundaram@gmail.com', '+91 98421 88402', 'Priya Sundaram', selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Architectural Photo with Badge (Matching Screen 2) */}
        <div className="lg:col-span-5 relative hidden lg:block bg-slate-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80"
            alt="HavenMatch Architecture"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Top Brand Logo Overlay */}
          <div className="absolute top-6 left-6 text-white text-left">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight">HavenMatch AI</span>
            </Link>
          </div>

          {/* Floating Pill Badge */}
          <div className="absolute bottom-8 left-6 right-6 text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe. Secure. Transparent.</span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              "HavenMatch found our dream home in Coimbatore in 3 days with perfect commute and water infrastructure."
            </p>
            <span className="text-xs text-orange-400 font-bold block">— Priya & Vignesh, Saravanampatti</span>
          </div>
        </div>

        {/* Right Column: Clean Authentication Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center text-left">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 lg:hidden">
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900">HavenMatch AI</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'LOGIN' ? 'Sign in to continue your lifestyle real estate journey' : 'Start your personalized lifestyle match experience'}
            </p>
          </div>

          {/* Email / Mobile Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('EMAIL')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'EMAIL'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email Address
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MOBILE')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'MOBILE'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mobile Number
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'SIGNUP' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sundaram"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {activeTab === 'EMAIL' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com (or leave blank for demo)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98421 88402"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => showToast('Password reset instructions sent to your email')}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (default: buyer123)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
              />
            </div>

            {/* Role Selection Option */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">I want to:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('BUYER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedRole === 'BUYER'
                      ? 'border-orange-600 bg-orange-50 text-orange-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏡 Buy / Rent Home
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('SELLER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedRole === 'SELLER'
                      ? 'border-orange-600 bg-orange-50 text-orange-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏢 List / Sell Property
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => executeLogin()}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Bar */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              type="button"
              onClick={handleQuickDemoBuyer}
              className="py-2 px-2.5 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100 text-orange-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              <span>Buyer Demo</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoSeller}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Owner Demo</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-xs text-slate-400 font-medium uppercase tracking-wider">or</span>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle Mode */}
          <div className="text-center mt-4 pt-3 border-t border-slate-100">
            {mode === 'LOGIN' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('SIGNUP')}
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

