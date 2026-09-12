import React, { useState } from 'react';
import { useLifestyle } from '../context/LifestyleContext';
import { useApp } from '../context/AppContext';
import { LifestyleCategory, PriorityLevel } from '../types';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Hospital, 
  Briefcase, 
  Bus, 
  GraduationCap, 
  ShoppingBag, 
  Trees, 
  VolumeX, 
  ShieldCheck, 
  Dumbbell, 
  Utensils, 
  Check, 
  Clock, 
  MapPin
} from 'lucide-react';

interface QuestionCategory {
  id: LifestyleCategory;
  title: string;
  subtitle: string;
  icon: any;
}

export const LifestyleInterviewView: React.FC = () => {
  const { lifestyle, setLifestyle, updatePriority, refreshMatches } = useLifestyle();
  const { setActiveView, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: {
    title: string;
    description: string;
    categories: QuestionCategory[];
  }[] = [
    {
      title: 'Daily Commute & Essentials',
      description: 'Your everyday transit and routine requirements',
      categories: [
        { id: 'commute', title: 'Workplace Commute', subtitle: 'Proximity to your office/business hub', icon: Briefcase },
        { id: 'transit', title: 'Public Transport & Metro', subtitle: 'Bus stops, metro stations, airport access', icon: Bus },
        { id: 'supermarkets', title: 'Daily Essentials & Groceries', subtitle: 'Supermarkets, pharmacies, local fresh markets', icon: ShoppingBag }
      ]
    },
    {
      title: 'Family, Health & Learning',
      description: 'Healthcare and education infrastructure around your home',
      categories: [
        { id: 'healthcare', title: 'Healthcare Access', subtitle: 'Hospitals, specialty clinics, 24x7 pharmacies', icon: Hospital },
        { id: 'schools', title: 'Schools & Education', subtitle: 'CBSE/ICSE schools, daycares, colleges', icon: GraduationCap },
        { id: 'safety', title: 'Gated Security & Safety', subtitle: '24x7 security guard, CCTV perimeter, safe streets', icon: ShieldCheck }
      ]
    },
    {
      title: 'Living Environment & Recreation',
      description: 'Atmosphere, greenery, wellness, and downtime',
      categories: [
        { id: 'quietness', title: 'Peace & Quietness', subtitle: 'Low traffic noise, calm residential surroundings', icon: VolumeX },
        { id: 'parks', title: 'Parks & Walking Tracks', subtitle: 'Green spaces, tree-lined walking avenues', icon: Trees },
        { id: 'fitness', title: 'Fitness & Gym Facilities', subtitle: 'Gyms, swimming pools, badminton courts', icon: Dumbbell },
        { id: 'dining', title: 'Cafes & Dining', subtitle: 'Boutiques, bakeries, weekend dining spots', icon: Utensils }
      ]
    }
  ];

  const totalSteps = steps.length + 1;

  const priorityOptions: { level: PriorityLevel; label: string; desc: string }[] = [
    { level: 'HIGH', label: 'High Priority', desc: 'Must have nearby' },
    { level: 'MEDIUM', label: 'Medium Priority', desc: 'Desirable, not dealbreaker' },
    { level: 'LOW', label: 'Low Priority', desc: 'Nice to have' },
    { level: 'NOT_IMPORTANT', label: 'Not Important', desc: 'Irrelevant' }
  ];

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await refreshMatches();
      showToast('Lifestyle profile generated! Recalibrating matches...');
      setActiveView('lifestyle_profile');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveView('discover');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="font-bold text-orange-700">Step {currentStep + 1} of {totalSteps}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="card-haven p-5 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-haven-sm">
        
        {currentStep < steps.length ? (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Lifestyle Profiler</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {steps[currentStep].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {steps[currentStep].categories.map((cat) => {
                const Icon = cat.icon;
                const currentPriority = lifestyle.priorities[cat.id];

                return (
                  <div key={cat.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white text-orange-700 shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-slate-900">{cat.title}</h3>
                        <p className="text-xs text-slate-500">{cat.subtitle}</p>
                      </div>
                    </div>

                    {/* Priority Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {priorityOptions.map((opt) => {
                        const isSelected = currentPriority === opt.level;
                        return (
                          <button
                            key={opt.level}
                            type="button"
                            onClick={() => updatePriority(cat.id, opt.level)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{opt.label.split(' ')[0]}</span>
                            <span className={`text-[10px] font-normal ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Workplace & Family Context</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Where do you work & who lives with you?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                HavenMatch calculates your door-to-door drive time and adjusts for elderly or school needs.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  Your Primary Office / Workplace Location
                </label>
                <input
                  type="text"
                  value={lifestyle.workplaceLocation}
                  onChange={(e) => setLifestyle({ ...lifestyle, workplaceLocation: e.target.value })}
                  placeholder="e.g. TIDEL Park Coimbatore, Keeranatham CHIL SEZ, Guindy Chennai"
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    Maximum Acceptable One-Way Commute
                  </span>
                  <span className="text-orange-700 font-black">{lifestyle.maxCommuteMins} minutes</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={lifestyle.maxCommuteMins}
                  onChange={(e) => setLifestyle({ ...lifestyle, maxCommuteMins: Number(e.target.value) })}
                  className="w-full accent-orange-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>10 mins</span>
                  <span>25 mins</span>
                  <span>40 mins</span>
                  <span>60 mins</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <span className="block text-xs font-bold text-slate-700">Household Considerations:</span>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80">
                  <input
                    type="checkbox"
                    checked={lifestyle.hasElderlyFamily}
                    onChange={(e) => setLifestyle({ ...lifestyle, hasElderlyFamily: e.target.checked })}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Elderly Parents / Senior Citizens at Home</span>
                    <span className="text-slate-500 text-[11px]">Boosts weighting for nearby hospitals, quiet surroundings, ground/low floor or lift access.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80">
                  <input
                    type="checkbox"
                    checked={lifestyle.hasSchoolGoingKids}
                    onChange={(e) => setLifestyle({ ...lifestyle, hasSchoolGoingKids: e.target.checked })}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">School-Going Children</span>
                    <span className="text-slate-500 text-[11px]">Prioritizes properties within 3 km of reputable CBSE / ICSE schools and children’s play zones.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80">
                  <input
                    type="checkbox"
                    checked={lifestyle.hasPets}
                    onChange={(e) => setLifestyle({ ...lifestyle, hasPets: e.target.checked })}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Pet Friendly Preference</span>
                    <span className="text-slate-500 text-[11px]">Ensures gated communities permit pets and have green spaces for dog walking.</span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preferred Neighborhood Atmosphere
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Peaceful & Quiet', 'Balanced Urban', 'Vibrant & Connected'] as const).map((atm) => (
                    <button
                      key={atm}
                      type="button"
                      onClick={() => setLifestyle({ ...lifestyle, atmospherePreference: atm })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        lifestyle.atmospherePreference === atm
                          ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {atm}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-haven-sm flex items-center gap-2"
          >
            <span>{currentStep === totalSteps - 1 ? 'Build Lifestyle Profile' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
