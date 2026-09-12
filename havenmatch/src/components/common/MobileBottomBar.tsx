import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, Sparkles, Heart, Calendar, Building2, Users } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { role, activeView, setActiveView, savedPropertyIds } = useApp();

  const isBuyer = role === 'BUYER';

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 lg:hidden px-2 py-1 shadow-haven-lg pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-colors"
    >
      <div className="flex items-center justify-around">
        {isBuyer ? (
          <>
            <button
              onClick={() => setActiveView('landing')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-all active:scale-95 ${
                activeView === 'landing' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => setActiveView('discover')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${
                activeView === 'discover' || activeView === 'property_detail'
                  ? 'text-orange-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Discover</span>
            </button>

            <button
              onClick={() => setActiveView('lifestyle_profile')}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors relative ${
                activeView === 'lifestyle_profile' || activeView === 'lifestyle_interview'
                  ? 'text-orange-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 mb-0.5 text-orange-600" />
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              </div>
              <span className="text-[10px]">Match AI</span>
            </button>

            <button
              onClick={() => setActiveView('saved')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors relative ${
                activeView === 'saved' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Heart className="w-5 h-5 mb-0.5" />
                {savedPropertyIds.length > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-orange-600 text-white leading-tight">
                    {savedPropertyIds.length}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Saved</span>
            </button>

            <button
              onClick={() => setActiveView('visits')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${
                activeView === 'visits' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Visits</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveView('seller_portal')}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                activeView === 'seller_portal' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Overview</span>
            </button>

            <button
              onClick={() => setActiveView('seller_dashboard')}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                activeView === 'seller_dashboard' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('seller_buyers')}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors relative ${
                activeView === 'seller_buyers' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Users className="w-5 h-5 mb-0.5 text-orange-600" />
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-orange-600 text-white leading-tight">
                  4
                </span>
              </div>
              <span className="text-[10px]">Matches</span>
            </button>

            <button
              onClick={() => setActiveView('seller_add_property')}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-colors ${
                activeView === 'seller_add_property' ? 'text-orange-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-haven-sm mb-0.5">
                +
              </div>
              <span className="text-[10px] font-semibold text-orange-700">List New</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
