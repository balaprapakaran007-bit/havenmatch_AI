import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, MapPin, Heart, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1 leading-none">
                  HavenMatch <span className="text-orange-400">AI</span>
                </span>
                <p className="text-[11px] tracking-wide text-slate-400 font-medium mt-0.5">
                  Find a home that fits your life.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India's leading intelligent real-estate discovery platform. We match homebuyers and tenants with verified homes based on lifestyle priorities, commute times, and neighborhood intelligence.
            </p>

            <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold bg-orange-950/60 border border-orange-800/60 rounded-xl px-3 py-2 w-fit">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>100% RERA Verified & Vastu Compliant Listings</span>
            </div>
          </div>

          {/* Col 2: For Buyers */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              For Buyers & Tenants
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/choose-role" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Lifestyle Match Wizard
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Top Recommendations
                </Link>
              </li>
              <li>
                <Link to="/basic-details" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Search by Locality & Budget
                </Link>
              </li>
              <li>
                <Link to="/preferences" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Set Lifestyle Priorities
                </Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Buyer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Owners / Sellers */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              For Owners & Builders
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/owner/dashboard" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner/add-property" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400" /> Post Property (FREE)
                </Link>
              </li>
              <li>
                <Link to="/owner/matches" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Reverse Buyer Matches
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500" /> Owner Login / Signup
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Locations */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Covered Cities
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai'].map((city) => (
                <span
                  key={city}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 hover:border-orange-500 transition-colors"
                >
                  {city}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 pt-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Smart English CartoDB maps across all metro regions.</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 HavenMatch AI Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/auth" className="hover:text-orange-400">Privacy Policy</Link>
            <Link to="/auth" className="hover:text-orange-400">Terms of Service</Link>
            <Link to="/auth" className="hover:text-orange-400">RERA Compliance</Link>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Indian Homeowners
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
