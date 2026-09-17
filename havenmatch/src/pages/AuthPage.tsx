import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { callAPI } from '../services/api';
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
  AlertCircle,
  KeyRound,
  X
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = useApp();

  const redirectParam = new URLSearchParams(location.search).get('redirect') || (location.state as any)?.from;

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [activeTab, setActiveTab] = useState<'EMAIL' | 'MOBILE'>('EMAIL');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const executeLogin = async (
    targetEmail?: string,
    targetPhone?: string,
    targetName?: string,
    targetRole?: 'BUYER' | 'SELLER'
  ) => {
    setErrorMessage(null);

    const emailToUse = (targetEmail || (activeTab === 'EMAIL' ? email.trim() : '')).toLowerCase();
    const phoneToUse = targetPhone || (activeTab === 'MOBILE' ? phone.trim() : '');
    const finalRole = targetRole || selectedRole;
    const finalName = targetName || fullName.trim() || undefined;

    if (!emailToUse && !phoneToUse) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your website password.');
      return;
    }

    if (mode === 'SIGNUP') {
      if (!finalName) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password entry.');
        return;
      }
    }

    setIsLoading(true);

    try {
      await login({
        email: emailToUse,
        phone: phoneToUse,
        name: finalName,
        password: password,
        role: finalRole,
        isSignUp: mode === 'SIGNUP',
        isGoogle: false
      });

      showToast(mode === 'LOGIN' ? 'Welcome back to HavenMatch AI!' : 'Account created successfully!');

      if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (finalRole === 'SELLER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/choose-role');
      }
    } catch (err: any) {
      console.warn('[AuthPage] Authentication error:', err.message);
      // Requirement 2 & 3: Show "Incorrect email or password." on failed login
      setErrorMessage(err.message || 'Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin();
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      setForgotMessage('Please enter your registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const res = await callAPI<any>('auth/forgot-password', { email: targetEmail });
      showToast(res.message || 'Password reset link generated for your account.');
      setForgotMessage(res.message || 'Check your email or use the reset link to update your password.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Failed to send reset link. Please check your email entry.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column: Architectural Photo with Badge */}
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
              <img
                src="/logo.png"
                alt="HavenMatch AI Logo"
                className="w-9 h-9 object-contain rounded-xl shadow-xs"
              />
              <span className="text-lg font-black tracking-tight">HavenMatch AI</span>
            </Link>
          </div>

          {/* Floating Pill Badge */}
          <div className="absolute bottom-8 left-6 right-6 text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Independent Website Password Auth</span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              "Find your home based on true lifestyle fit — commute intelligence, water infrastructure, and direct owner connections."
            </p>
          </div>
        </div>

        {/* Right Column: Clean Authentication Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center text-left">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 lg:hidden">
                <img
                  src="/logo.png"
                  alt="HavenMatch AI Logo"
                  className="w-8 h-8 object-contain rounded-xl shadow-xs"
                />
                <span className="text-lg font-black text-slate-900">HavenMatch AI</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'LOGIN' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'LOGIN' ? 'Sign in with your email and dedicated website password' : 'Create your secure account to start matching properties'}
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email / Mobile Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('EMAIL'); setErrorMessage(null); }}
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
              onClick={() => { setActiveTab('MOBILE'); setErrorMessage(null); }}
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
                    placeholder="Enter your full name"
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
                    placeholder="you@example.com"
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
                <label className="text-xs font-bold text-slate-700">
                  {mode === 'SIGNUP' ? 'Create Website Password' : 'Website Password'}
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(true); setForgotEmail(email); }}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
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
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
              />
            </div>

            {/* Confirm Password Field for Registration */}
            {mode === 'SIGNUP' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Website Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter website password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                />
              </div>
            )}


            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            {mode === 'LOGIN' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('SIGNUP'); setErrorMessage(null); setPassword(''); setConfirmPassword(''); }}
                  className="font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Create website account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); setErrorMessage(null); setPassword(''); setConfirmPassword(''); }}
                  className="font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-left">
            <button
              type="button"
              onClick={() => { setShowForgotModal(false); setForgotMessage(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              Reset Website Password
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter your registered email address. We will send password reset instructions to change your website password.
            </p>

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Instructions'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
