import React from 'react';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Edit3, 
  Compass, 
  Hospital, 
  Briefcase, 
  Bus, 
  GraduationCap, 
  ShoppingBag, 
  Trees, 
  VolumeX, 
  ShieldCheck, 
  CheckCircle,
  MapPin,
  Clock,
  Home
} from 'lucide-react';

export const LifestyleProfileView: React.FC = () => {
  const { lifestyle, requirements } = useLifestyle();
  const { setActiveView } = useApp();

  const getPriorityBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-400 border border-slate-100">N/A</span>;
    }
  };

  const priorityItems = [
    { label: 'Healthcare Access', icon: Hospital, level: lifestyle.priorities.healthcare },
    { label: 'Workplace Commute', icon: Briefcase, level: lifestyle.priorities.commute },
    { label: 'Public Transit & Metro', icon: Bus, level: lifestyle.priorities.transit },
    { label: 'Quiet & Serene Surroundings', icon: VolumeX, level: lifestyle.priorities.quietness },
    { label: 'Daily Groceries & Essentials', icon: ShoppingBag, level: lifestyle.priorities.supermarkets },
    { label: 'Schools & Education', icon: GraduationCap, level: lifestyle.priorities.schools },
    { label: 'Parks & Walking Promenades', icon: Trees, level: lifestyle.priorities.parks },
    { label: 'Gated Security & Guard 24/7', icon: ShieldCheck, level: lifestyle.priorities.safety }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="card-haven p-6 sm:p-8 bg-gradient-to-tr from-orange-950 via-orange-900 to-orange-800 text-white rounded-3xl relative overflow-hidden shadow-haven-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-800/80 text-orange-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-300" />
              <span>Lifestyle DNA Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Your Lifestyle Match Profile
            </h1>
            <p className="text-xs sm:text-sm text-orange-100/80 mt-1 max-w-xl">
              Properties on HavenMatch are ranked specifically against this fingerprint. Every match score explains how well the home matches these parameters.
            </p>
          </div>

          <button
            onClick={() => setActiveView('lifestyle_interview')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-orange-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow hover:bg-orange-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-orange-700" />
            <span>Edit Priorities</span>
          </button>
        </div>
      </div>

      {/* Snapshot Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-haven p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target City</span>
          <p className="text-base font-black text-slate-900 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-orange-600" />
            {requirements.city}
          </p>
          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
            {requirements.preferredLocalities.join(', ')}
          </span>
        </div>

        <div className="card-haven p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Budget</span>
          <p className="text-base font-black text-slate-900 mt-1">
            ₹{(requirements.budgetMin / 100000).toFixed(0)}L – ₹{(requirements.budgetMax / 100000).toFixed(0)}L
          </p>
          <span className="text-[10px] text-orange-700 font-semibold block mt-0.5">
            {requirements.intent === 'BUY' ? 'Purchase Outright' : 'Monthly Rent'}
          </span>
        </div>

        <div className="card-haven p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Home Size</span>
          <p className="text-base font-black text-slate-900 mt-1 flex items-center gap-1">
            <Home className="w-4 h-4 text-orange-600" />
            {requirements.bhk.join(' & ')} BHK
          </p>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {requirements.propertyTypes.join(', ')}
          </span>
        </div>

        <div className="card-haven p-4 bg-white border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Work Commute</span>
          <p className="text-base font-black text-slate-900 mt-1 flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-600" />
            &le; {lifestyle.maxCommuteMins} mins
          </p>
          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
            To: {lifestyle.workplaceLocation || 'City IT Hubs'}
          </span>
        </div>
      </div>

      {/* Priority Dimension Grid */}
      <div className="card-haven p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Lifestyle Priority Weightings
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated using SNS Workbench matching algorithms
            </p>
          </div>
          <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {lifestyle.atmospherePreference}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {priorityItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white text-orange-700 shadow-xs border border-slate-200 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                </div>
                {getPriorityBadge(item.level)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Household & Family Context Card */}
      <div className="card-haven p-5 bg-orange-50/60 border border-orange-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-orange-950 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-orange-600" />
            Special Household Parameters Included
          </h4>
          <p className="text-xs text-slate-600">
            {lifestyle.hasElderlyFamily ? '✓ Senior Citizens at home (Hospitals & Lift access priority) ' : ''}
            {lifestyle.hasSchoolGoingKids ? '✓ School-going kids (CBSE proximity) ' : ''}
            {lifestyle.hasPets ? '✓ Pet friendly community required ' : ''}
          </p>
        </div>

        <button
          onClick={() => setActiveView('discover')}
          className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-all shadow-haven-sm flex items-center justify-center gap-2 shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>View Matched Properties</span>
        </button>
      </div>

    </div>
  );
};
