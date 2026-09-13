import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Home,
  Building,
  Briefcase,
  MapPin,
  Clock,
  Compass,
  Check,
  CheckCircle2,
  Trees,
  Hospital,
  GraduationCap,
  ShoppingBag,
  Bus,
  Car,
  DollarSign,
  BedDouble,
  Heart,
  Scale
} from 'lucide-react';

export const AIMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSession, showToast } = useApp();
  const { requirements, setRequirements, lifestyle, setLifestyle, refreshMatches } = useLifestyle();

  // Redirect to Auth if not logged in
  useEffect(() => {
    if (!userSession) {
      navigate('/auth?redirect=/ai-matching', { replace: true });
    }
  }, [userSession, navigate]);

  // Step state (1 to 8: 1-7 questions, 8 is Review step)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [intent, setIntent] = useState<'BUY' | 'RENT'>(requirements.intent || 'BUY');
  const [budgetMin, setBudgetMin] = useState<number>(
    intent === 'BUY' ? (requirements.budgetMin || 4000000) : 10000
  );
  const [budgetMax, setBudgetMax] = useState<number>(
    intent === 'BUY' ? (requirements.budgetMax || 7000000) : 35000
  );
  const [selectedBhk, setSelectedBhk] = useState<number>(
    requirements.bhk?.[0] || 2
  );
  const [selectedLocality, setSelectedLocality] = useState<string>(
    requirements.preferredLocalities?.[0] || 'Saravanampatti'
  );
  const [localitySearch, setLocalitySearch] = useState<string>('');
  
  const [workLocation, setWorkLocation] = useState<string>(
    lifestyle.workplaceLocation || 'Tidel Park'
  );
  const [workSearch, setWorkSearch] = useState<string>('');
  
  const [commuteTime, setCommuteTime] = useState<string>('Within 15 minutes');
  
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([
    'Quiet Neighbourhood',
    'Good Hospitals'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Data
  const localitiesList = [
    'Saravanampatti',
    'Peelamedu',
    'Race Course',
    'RS Puram',
    'Tidel Park (Keeranatham)',
    'Saibaba Colony',
    'Vadavalli',
    'Gandhipuram',
    'Singanallur',
    'Kovaipudur'
  ];

  const workLocationsList = [
    'Tidel Park',
    'Saravanampatti',
    'Peelamedu',
    'Coimbatore IT Park',
    'RS Puram',
    'Gandhipuram',
    'Other'
  ];

  const commuteOptions = [
    { label: 'Within 15 minutes', icon: '👉' },
    { label: 'Within 30 minutes', icon: '👉' },
    { label: 'Within 45 minutes', icon: '⏱️' },
    { label: 'No preference', icon: '🧭' }
  ];

  const lifestyleOptions = [
    { id: 'quiet', label: 'Quiet Neighbourhood', icon: Trees, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'hospitals', label: 'Good Hospitals', icon: Hospital, color: 'text-rose-600 bg-rose-50' },
    { id: 'schools', label: 'Reputed Schools', icon: GraduationCap, color: 'text-sky-600 bg-sky-50' },
    { id: 'parks', label: 'Parks & Greenery', icon: Trees, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'shopping', label: 'Shopping & Malls', icon: ShoppingBag, color: 'text-pink-600 bg-pink-50' },
    { id: 'transit', label: 'Public Transport', icon: Bus, color: 'text-cyan-600 bg-cyan-50' }
  ];

  const toggleLifestyleOption = (label: string) => {
    setSelectedLifestyle((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleNext = () => {
    if (step < 8) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      navigate('/');
    }
  };

  const handleFindMatches = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Lifestyle Context requirements
      const updatedReq = {
        ...requirements,
        intent,
        city: 'Coimbatore',
        preferredLocalities: [selectedLocality],
        budgetMin,
        budgetMax,
        bhk: [selectedBhk]
      };
      setRequirements(updatedReq);

      // 2. Update Lifestyle Context preferences
      const updatedLife = {
        ...lifestyle,
        workplaceLocation: workLocation,
        maxCommuteMins: commuteTime.includes('15') ? 15 : commuteTime.includes('30') ? 30 : commuteTime.includes('45') ? 45 : 60,
        priorities: {
          ...lifestyle.priorities,
          quietness: selectedLifestyle.includes('Quiet Neighbourhood') ? 'HIGH' : 'MEDIUM',
          healthcare: selectedLifestyle.includes('Good Hospitals') ? 'HIGH' : 'MEDIUM',
          schools: selectedLifestyle.includes('Reputed Schools') ? 'HIGH' : 'MEDIUM',
          parks: selectedLifestyle.includes('Parks & Greenery') ? 'HIGH' : 'MEDIUM',
          supermarkets: selectedLifestyle.includes('Shopping & Malls') ? 'HIGH' : 'MEDIUM',
          transit: selectedLifestyle.includes('Public Transport') ? 'HIGH' : 'MEDIUM'
        } as any
      };
      setLifestyle(updatedLife);

      showToast('Finding your perfect lifestyle matches...');
      
      // Auto-trigger matches calculation
      await refreshMatches().catch(() => {});
      
      navigate('/recommendations');
    } catch (err) {
      console.error('Error submitting match requirements:', err);
      navigate('/recommendations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudgetDisplay = () => {
    if (intent === 'BUY') {
      const minLakhs = Math.round(budgetMin / 100000);
      const maxLakhs = Math.round(budgetMax / 100000);
      return `₹${minLakhs} Lakhs - ₹${maxLakhs} Lakhs`;
    } else {
      return `₹${budgetMin.toLocaleString('en-IN')} - ₹${budgetMax.toLocaleString('en-IN')}/mo`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between py-4 px-4 sm:px-6 max-w-lg mx-auto pb-32 md:pb-12 text-left select-none">
      
      {/* Top Header & Segmented Progress Bar */}
      <div className="w-full space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
              HavenMatch <span className="text-orange-600">AI</span>
            </span>
          </div>

          <div className="w-9" /> {/* Spacer for balance */}
        </div>

        {/* Top Progress Bar (Steps 1 to 7) */}
        {step <= 7 ? (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        ) : (
          <div className="w-full bg-orange-600 h-1.5 rounded-full" />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 py-6 flex flex-col justify-center space-y-6">
        
        {/* =================================================================== */}
        {/* STEP 1: What are you looking for? (Buy / Rent) */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 1 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                What are you looking for?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Let's start with the basics.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Buy Card */}
              <div
                onClick={() => setIntent('BUY')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                  intent === 'BUY'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  intent === 'BUY' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Buy</h3>
                  <p className="text-xs sm:text-sm text-slate-500">I want to buy a home</p>
                </div>
              </div>

              {/* Rent Card */}
              <div
                onClick={() => setIntent('RENT')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer ${
                  intent === 'RENT'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  intent === 'RENT' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Rent</h3>
                  <p className="text-xs sm:text-sm text-slate-500">I want to rent a home</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: What's your budget? */}
        {/* =================================================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 2 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                What's your budget?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Set your preferred price range.
              </p>
            </div>

            {/* Price Pill */}
            <div className="flex justify-center pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-900 font-extrabold text-sm sm:text-base shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>{formatBudgetDisplay()}</span>
              </div>
            </div>

            {/* Slider Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="space-y-2">
                <input
                  type="range"
                  min={intent === 'BUY' ? 2000000 : 5000}
                  max={intent === 'BUY' ? 20000000 : 80000}
                  step={intent === 'BUY' ? 500000 : 2000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{intent === 'BUY' ? '₹20L' : '₹5k'}</span>
                  <span>{intent === 'BUY' ? '₹70L' : '₹35k'}</span>
                  <span>{intent === 'BUY' ? '₹2 Cr+' : '₹80k+'}</span>
                </div>
              </div>

              {/* Tip Box */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>We'll show homes within your budget.</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: How many bedrooms? */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 3 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                How many bedrooms?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your preferred home size.
              </p>
            </div>

            {/* BHK Grid */}
            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {[1, 2, 3, 4].map((bhk) => {
                const isSelected = selectedBhk === bhk;
                return (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => setSelectedBhk(bhk)}
                    className={`py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>{bhk === 4 ? '4' : bhk}</div>
                    <div className="text-[11px] font-semibold">{bhk === 4 ? 'BHK+' : 'BHK'}</div>
                  </button>
                );
              })}
            </div>

            {/* Tip Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {selectedBhk === 2
                  ? 'Perfect! 2 BHK is a popular choice in Coimbatore.'
                  : selectedBhk === 3
                  ? 'Great! 3 BHK offers spacious living for families.'
                  : selectedBhk === 1
                  ? 'Ideal for young professionals and couples.'
                  : 'Luxury 4+ BHK residences with premium amenities.'}
              </span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: Where do you want to live? */}
        {/* =================================================================== */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 4 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Where do you want to live?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your preferred location.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                placeholder="Search locality or area..."
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            {/* Locality Chips Cloud */}
            <div className="flex flex-wrap gap-2 pt-1">
              {localitiesList
                .filter((loc) => loc.toLowerCase().includes(localitySearch.toLowerCase()))
                .map((loc) => {
                  const isSelected = selectedLocality === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocality(loc)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 text-orange-800 border-orange-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: Where do you work or study? */}
        {/* =================================================================== */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 5 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Where do you work or study?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                This helps us suggest homes with better commute.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={workSearch}
                onChange={(e) => setWorkSearch(e.target.value)}
                placeholder="Search location..."
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            {/* Work Location Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {workLocationsList
                .filter((loc) => loc.toLowerCase().includes(workSearch.toLowerCase()))
                .map((loc) => {
                  const isSelected = workLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setWorkLocation(loc)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 text-orange-800 border-orange-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                      <span>{loc}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 6: What's your preferred commute time? */}
        {/* =================================================================== */}
        {step === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 6 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                What's your preferred commute time?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Choose how far you're comfortable travelling.
              </p>
            </div>

            {/* Commute Options List */}
            <div className="space-y-2.5 pt-1">
              {commuteOptions.map((opt) => {
                const isSelected = commuteTime === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setCommuteTime(opt.label)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm transition-all border flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-orange-950 border-orange-500 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                  </button>
                );
              })}
            </div>

            {/* Tip Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <Car className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>We'll prioritize homes closer to your workplace.</span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 7: What matters most to you? (Lifestyle Priorities) */}
        {/* =================================================================== */}
        {step === 7 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 7 <span className="text-slate-400 font-normal">of 7</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                What matters most to you?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your lifestyle preferences (multiple choice)
              </p>
            </div>

            {/* 3-Column Lifestyle Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {lifestyleOptions.map((opt) => {
                const isSelected = selectedLifestyle.includes(opt.label);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleLifestyleOption(opt.label)}
                    className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[100px] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* FINAL STEP: Review your preferences */}
        {/* =================================================================== */}
        {step === 8 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Final Step
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Review your preferences
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Looks good? Let's find your matches!
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <span className="font-extrabold">{intent === 'BUY' ? 'Buy' : 'Rent'}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="font-extrabold">{formatBudgetDisplay()}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <BedDouble className="w-4 h-4" />
                </div>
                <span className="font-extrabold">{selectedBhk === 4 ? '4+ BHK' : `${selectedBhk} BHK`}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-extrabold">{selectedLocality}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-extrabold">{workLocation} (Work)</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <span className="font-extrabold">{commuteTime}</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-800">
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <Trees className="w-4 h-4" />
                </div>
                <span className="font-extrabold truncate">
                  {selectedLifestyle.length > 0 ? selectedLifestyle.join(', ') : 'Balanced Lifestyle'}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Buttons */}
      <div className="w-full pt-4 space-y-3">
        {step < 8 ? (
          step > 1 ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm border border-slate-200 transition-all cursor-pointer text-center"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-2 py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm transition-all shadow-haven-sm hover:shadow-haven-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-sm transition-all shadow-haven-sm hover:shadow-haven-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFindMatches}
              className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-black text-base transition-all shadow-haven-md hover:shadow-haven-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Analyzing 100+ Factors...' : 'Find My Matches'}</span>
              <Sparkles className="w-5 h-5 text-amber-200" />
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              HavenMatch AI will analyze 100+ factors to find the best homes for you.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
