import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sellerService, CompatibleBuyer } from '../services/sellerService';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Briefcase,
  Send,
  Check,
  Users,
  MessageSquare,
  ShieldCheck,
  Heart
} from 'lucide-react';

export const BuyerMatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, userSession } = useApp();

  const [connectedBuyers, setConnectedBuyers] = useState<string[]>([]);

  const defaultBuyers = [
    {
      id: 'b-1',
      name: 'Priya & Vignesh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      matchScore: 91,
      bhk: '3 BHK Apartment / Villa',
      locality: 'Peelamedu / Saravanampatti, Coimbatore',
      budget: '₹60L – ₹75L',
      lifestylePriorities: ['Daily Tech Commute', 'Top Schools Nearby', 'Siruvani Drinking Water', '100% Vastu Compliant']
    },
    {
      id: 'b-2',
      name: 'Karthik Sundaram',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      matchScore: 88,
      bhk: '2 & 3 BHK Apartment',
      locality: 'RS Puram / Race Course, Coimbatore',
      budget: '₹1.1Cr – ₹1.4Cr',
      lifestylePriorities: ['Healthcare & Emergency', 'Quiet Neighborhood', 'Walking to Transit', 'Covered Parking']
    },
    {
      id: 'b-3',
      name: 'Dr. Ananya R.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      matchScore: 85,
      bhk: '3 BHK Independent House',
      locality: 'Vadavalli, Coimbatore',
      budget: '₹85L – ₹1.1Cr',
      lifestylePriorities: ['Family Friendly', 'Green Parks & Lung Space', 'Scenic Mountain Air', '24x7 Security']
    }
  ];

  const handleConnect = (id: string, name: string) => {
    setConnectedBuyers((prev) => [...prev, id]);
    showToast(`Connection request sent to ${name}!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation & Header (Matching Screen 13) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Owner Dashboard</span>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Compatible Buyers</h1>
            <p className="text-xs text-slate-500">People whose requirements fit your property.</p>
          </div>

          <div className="w-8"></div>
        </div>

        {/* Compatible Buyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultBuyers.map((b) => {
            const isConnected = connectedBuyers.includes(b.id);
            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={b.avatar} alt={b.name} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-orange-100" />
                      <div>
                        <h3 className="text-base font-black text-slate-900">{b.name}</h3>
                        <p className="text-xs text-slate-500">{b.locality}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
                      {b.matchScore}% Match
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-slate-200 space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Requirement:</span>
                      <span className="font-bold text-slate-800">{b.bhk}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Budget Range:</span>
                      <span className="font-extrabold text-orange-600">{b.budget}</span>
                    </div>
                  </div>

                  {/* Lifestyle Compatibility Tags */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Lifestyle Compatibility
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {b.lifestylePriorities.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200/60">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleConnect(b.id, b.name)}
                    disabled={isConnected}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {isConnected ? '✓ Request Sent' : 'Connect'}
                  </button>

                  <Link
                    to="/messages"
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Message buyer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
