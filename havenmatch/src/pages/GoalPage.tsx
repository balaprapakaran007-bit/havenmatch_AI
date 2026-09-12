import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Key,
  ShieldCheck,
  CheckCircle2,
  BadgePercent,
  Home
} from 'lucide-react';

export const GoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, setRequirements } = useLifestyle();
  const { setBuyerIntent, showToast } = useApp();

  const [selectedGoal, setSelectedGoal] = useState<'BUY' | 'RENT'>(
    requirements.intent || 'BUY'
  );

  const handleContinue = () => {
    setBuyerIntent(selectedGoal);
    setRequirements((prev) => ({
      ...prev,
      intent: selectedGoal,
      budgetMin: selectedGoal === 'BUY' ? 5000000 : 15000,
      budgetMax: selectedGoal === 'BUY' ? 8500000 : 35000
    }));
    showToast(`Goal set to ${selectedGoal === 'BUY' ? 'Buy a Property' : 'Rent a Property'}`);
    navigate('/basic-details');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-2xl w-full">
        {/* Progress Bar & Back */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/choose-role"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <span className="text-xs font-bold text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
            Step 2 of 5
          </span>
        </div>

        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            What are you looking for?
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            Select your goal so we can match you with verified properties and pricing models.
          </p>
        </div>

        {/* 2 Main Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Buy Card */}
          <div
            onClick={() => setSelectedGoal('BUY')}
            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-200 relative bg-white flex flex-col justify-between ${
              selectedGoal === 'BUY'
                ? 'border-orange-600 shadow-lg shadow-orange-600/10 ring-2 ring-orange-600/20'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {selectedGoal === 'BUY' && (
              <div className="absolute top-4 right-4 text-orange-600">
                <CheckCircle2 className="w-6 h-6 fill-orange-600 text-white" />
              </div>
            )}

            <div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  selectedGoal === 'BUY'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Home className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">Buy a Property</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Long-term ownership, ready-to-move apartments, and luxury villas with verified RERA certificates.
              </p>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Verified title deeds & legal clearance</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-orange-600" />
                  <span>Home loan assistance from SBI & HDFC</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-orange-700">
              <span>Budget in Lakhs / Crores</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Rent Card */}
          <div
            onClick={() => setSelectedGoal('RENT')}
            className={`cursor-pointer rounded-3xl p-6 border-2 transition-all duration-200 relative bg-white flex flex-col justify-between ${
              selectedGoal === 'RENT'
                ? 'border-orange-600 shadow-lg shadow-orange-600/10 ring-2 ring-orange-600/20'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {selectedGoal === 'RENT' && (
              <div className="absolute top-4 right-4 text-orange-600">
                <CheckCircle2 className="w-6 h-6 fill-orange-600 text-white" />
              </div>
            )}

            <div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  selectedGoal === 'RENT'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Key className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">Rent a Property</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Furnished and semi-furnished rental homes near workplaces, top schools, and transit corridors.
              </p>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Zero brokerage direct owner listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span>Flexible leases & transparent deposits</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-orange-700">
              <span>Monthly rental pricing</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/choose-role')}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-md shadow-orange-600/20 transition-all hover:scale-[1.02]"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
