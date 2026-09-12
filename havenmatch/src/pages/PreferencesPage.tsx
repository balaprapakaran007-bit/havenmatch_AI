import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLifestyle } from '../context/LifestyleContext';
import { LifestyleCategory, PriorityLevel } from '../types';
import {
  Sparkles,
  HeartPulse,
  Bus,
  GraduationCap,
  ShoppingBag,
  VolumeX,
  Trees,
  Briefcase,
  Users,
  Coffee,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface PriorityOption {
  id: LifestyleCategory;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    id: 'commute',
    title: 'Commute to work',
    subtitle: 'Close to tech parks & major office zones',
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    id: 'schools',
    title: 'Schools for children',
    subtitle: 'Top reputed CBSE / ICSE schools nearby',
    icon: <GraduationCap className="w-6 h-6" />
  },
  {
    id: 'healthcare',
    title: 'Healthcare nearby',
    subtitle: 'Multi-specialty hospitals & 24/7 care',
    icon: <HeartPulse className="w-6 h-6" />
  },
  {
    id: 'transit',
    title: 'Public transport',
    subtitle: 'Walking distance to bus routes & metro',
    icon: <Bus className="w-6 h-6" />
  },
  {
    id: 'supermarkets',
    title: 'Shopping & essentials',
    subtitle: 'Supermarkets, daily groceries & retail',
    icon: <ShoppingBag className="w-6 h-6" />
  },
  {
    id: 'parks',
    title: 'Parks & green spaces',
    subtitle: 'Jogging tracks, lung spaces & gardens',
    icon: <Trees className="w-6 h-6" />
  },
  {
    id: 'quietness',
    title: 'Quiet neighbourhood',
    subtitle: 'Peaceful residential pocket without traffic noise',
    icon: <VolumeX className="w-6 h-6" />
  },
  {
    id: 'safety',
    title: 'Family friendly',
    subtitle: 'Safe gated communities with active security',
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 'fitness',
    title: 'Lifestyle & entertainment',
    subtitle: 'Cafes, fitness clubs, restaurants & cinemas',
    icon: <Coffee className="w-6 h-6" />
  }
];

export const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { lifestyle, setLifestyle, updatePriority } = useLifestyle();

  const isSelected = (cat: LifestyleCategory) => {
    const p = lifestyle.priorities[cat];
    return p === 'HIGH';
  };

  const togglePriority = (cat: LifestyleCategory) => {
    const current = lifestyle.priorities[cat];
    const next: PriorityLevel = current === 'HIGH' ? 'LOW' : 'HIGH';
    updatePriority(cat, next);
  };

  const handleNext = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Step Header (Matching Screen 4) */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <Link
            to="/basic-details"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Step 4 of 6
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="text-left mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            What matters most in your daily life?
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Select your top priorities (you can choose multiple)
          </p>
        </div>

        {/* 9 Visual Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PRIORITY_OPTIONS.map((opt) => {
            const active = isSelected(opt.id);
            return (
              <div
                key={opt.id}
                onClick={() => togglePriority(opt.id)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 text-left flex flex-col justify-between ${
                  active
                    ? 'border-orange-600 bg-orange-50/60 shadow-md shadow-orange-600/5'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {opt.icon}
                  </div>

                  {active && (
                    <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`text-base font-bold mb-1 ${active ? 'text-orange-950' : 'text-slate-900'}`}>
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/basic-details')}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
