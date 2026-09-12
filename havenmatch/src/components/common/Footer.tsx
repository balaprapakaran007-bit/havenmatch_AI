import React from 'react';
import { Sparkles, Shield, MapPin, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView, setRole } = useApp();

  return (
    <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 mt-16 pb-24 lg:pb-12 text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-haven-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                HAVENMATCH <span className="text-orange-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              "Find a home that fits your life."
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              India's first residential discovery platform powered by lifestyle intelligence, satellite proximity evaluation, and explainable property matching.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-orange-700 font-semibold pt-1">
              <Shield className="w-3.5 h-3.5" /> 100% RERA & Vastu Verified Listings
            </div>
          </div>

          {/* Col 2: Buyer Workflows */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Buyer Experience
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveView('discover')} className="hover:text-orange-700">
                  Discover Matched Homes
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('lifestyle_interview')} className="hover:text-orange-700">
                  Lifestyle Priority Interview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('lifestyle_profile')} className="hover:text-orange-700">
                  My Lifestyle Profile Radar
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('compare')} className="hover:text-orange-700">
                  Property Comparison Deck
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('visits')} className="hover:text-orange-700">
                  Book In-Person Visits
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Seller Workflows */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Property Owners
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => {
                    setRole('SELLER');
                    setActiveView('seller_portal');
                  }} 
                  className="hover:text-orange-700 font-bold text-orange-700"
                >
                  Dedicated Seller Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setRole('SELLER');
                    setActiveView('seller_dashboard');
                  }} 
                  className="hover:text-orange-700"
                >
                  Seller Intelligence Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setRole('SELLER');
                    setActiveView('seller_buyers');
                  }} 
                  className="hover:text-orange-700"
                >
                  Reverse Buyer Matching
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setRole('SELLER');
                    setActiveView('seller_add_property');
                  }} 
                  className="hover:text-orange-700"
                >
                  List Residential Property
                </button>
              </li>
              <li>
                <span className="text-slate-400">SNS Workbench AI Integration</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Indian Cities */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Active Hubs
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai'].map((c) => (
                <span key={c} className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 pt-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-600" /> Focus areas: RS Puram, Race Course, Peelamedu, OMR, Indiranagar.
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center sm:flex sm:justify-between text-xs text-slate-500">
          <p>© 2026 HavenMatch AI Technologies. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Home Seekers
          </p>
        </div>
      </div>
    </footer>
  );
};
