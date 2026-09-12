import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export const ChooseRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, showToast } = useApp();

  const handleSelectRole = (role: 'BUYER' | 'SELLER') => {
    setRole(role);
    if (role === 'BUYER') {
      showToast('Welcome, Buyer! Let’s find a home that fits your life.');
      navigate('/goal');
    } else {
      showToast('Welcome, Property Owner! Entering owner dashboard.');
      navigate('/owner/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full text-center">
        
        {/* Back Link */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-black text-slate-900">HavenMatch AI</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Choose the option that best describes you.
          </p>
        </div>

        {/* 2 Visual Cards (Matching Screen 3 of Reference Design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Card 1: Buyer */}
          <div
            onClick={() => handleSelectRole('BUYER')}
            className="group cursor-pointer rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-lg hover:border-orange-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden mb-6 bg-orange-50 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Buyer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2">I'm a Buyer</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
              Find a home that fits your lifestyle with verified commute, water, and neighborhood scores.
            </p>

            <button
              type="button"
              className="w-12 h-12 rounded-full bg-orange-600 group-hover:bg-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-600/30 transition-all transform group-hover:scale-110"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Card 2: Seller / Owner */}
          <div
            onClick={() => handleSelectRole('SELLER')}
            className="group cursor-pointer rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-lg hover:border-orange-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
          >
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden mb-6 bg-amber-50 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
                alt="Owner / Seller"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-2">I'm a Seller / Owner</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
              List your property and reach genuine, high-intent buyers with zero brokerage fees.
            </p>

            <button
              type="button"
              className="w-12 h-12 rounded-full bg-orange-100 group-hover:bg-orange-600 text-orange-700 group-hover:text-white flex items-center justify-center shadow-sm transition-all transform group-hover:scale-110"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
