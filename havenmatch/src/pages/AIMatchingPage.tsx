import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { BuyerType } from '../types';
import {
  resolveLandmarkCoordinates
} from '../utils/geoUtils';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Home,
  Building,
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
  Scale,
  User,
  Users,
  Wifi,
  UtensilsCrossed,
  ShieldCheck,
  SlidersHorizontal,
  Dumbbell,
  Droplets
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

  // Persona State: Student | Bachelor | Family | IT Employee / Working Professional
  const [buyerType, setBuyerType] = useState<BuyerType>(
    requirements.buyerType || requirements.userType || 'Student'
  );

  // Step state
  const [step, setStep] = useState<number>(1);

  // Dynamic total steps per buyer type
  const totalSteps = useMemo(() => {
    switch (buyerType) {
      case 'Student':
        return 5;
      case 'Bachelor':
        return 5;
      case 'Family':
        return 7;
      default:
        return 5;
    }
  }, [buyerType]);


  // Common Form State
  const [intent, setIntent] = useState<'BUY' | 'RENT'>(
    buyerType === 'Student' || buyerType === 'Bachelor' ? 'RENT' : requirements.intent || 'BUY'
  );
  const [budgetMin, setBudgetMin] = useState<number>(
    buyerType === 'Student' ? 3000 :
    buyerType === 'Bachelor' ? 6000 :
    intent === 'BUY' ? (requirements.budgetMin || 4000000) : 15000
  );
  const [budgetMax, setBudgetMax] = useState<number>(
    buyerType === 'Student' ? 15000 :
    buyerType === 'Bachelor' ? 25000 :
    intent === 'BUY' ? (requirements.budgetMax || 7500000) : 40000
  );
  const [selectedBhk, setSelectedBhk] = useState<number>(
    buyerType === 'Student' ? 1 : buyerType === 'Bachelor' ? 1 : requirements.bhk?.[0] || 2
  );
  const [selectedLocality, setSelectedLocality] = useState<string>(
    requirements.preferredLocalities?.[0] || 'Saravanampatti'
  );
  const [localitySearch, setLocalitySearch] = useState<string>('');

  // Lifestyle Priorities for each flow
  const [selectedStudentPriorities, setSelectedStudentPriorities] = useState<string[]>([
    'Quiet Study Atmosphere',
    'Affordable Food & Mess',
    'High-Speed Wi-Fi'
  ]);

  const [selectedBachelorPriorities, setSelectedBachelorPriorities] = useState<string[]>([
    'High-Speed Wi-Fi',
    'Public Transport & Bus Route',
    'Food Delivery & Dining'
  ]);

  const [selectedFamilyPriorities, setSelectedFamilyPriorities] = useState<string[]>([
    'Good Hospitals',
    'Reputed Schools',
    'Gated Society & 24x7 Security',
    'Siruvani Water Supply'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const localitiesList = [
    'Saravanampatti',
    'Peelamedu',
    'Race Course',
    'RS Puram',
    'Saibaba Colony',
    'Vadavalli',
    'Gandhipuram',
    'Singanallur',
    'Kovaipudur'
  ];

  const studentPriorityOptions = [
    { id: 'study', label: 'Quiet Study Atmosphere', icon: Trees, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'mess', label: 'Affordable Food & Mess', icon: UtensilsCrossed, color: 'text-amber-600 bg-amber-50' },
    { id: 'wifi', label: 'High-Speed Wi-Fi', icon: Wifi, color: 'text-sky-600 bg-sky-50' },
    { id: 'transit', label: 'Bus Stop & Transit', icon: Bus, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'safety', label: 'Safe & Gated Area', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' }
  ];

  const bachelorPriorityOptions = [
    { id: 'wifi', label: 'High-Speed Wi-Fi', icon: Wifi, color: 'text-sky-600 bg-sky-50' },
    { id: 'transit', label: 'Public Transport & Bus Route', icon: Bus, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'dining', label: 'Food Delivery & Dining', icon: UtensilsCrossed, color: 'text-amber-600 bg-amber-50' },
    { id: 'gym', label: 'Gym & Fitness Nearby', icon: Dumbbell, color: 'text-rose-600 bg-rose-50' },
    { id: 'quiet', label: 'Low Noise & Peaceful', icon: Trees, color: 'text-emerald-600 bg-emerald-50' }
  ];

  const familyPriorityOptions = [
    { id: 'schools', label: 'Reputed Schools', icon: GraduationCap, color: 'text-sky-600 bg-sky-50' },
    { id: 'hospitals', label: 'Good Hospitals', icon: Hospital, color: 'text-rose-600 bg-rose-50' },
    { id: 'security', label: 'Gated Society & 24x7 Security', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' },
    { id: 'water', label: 'Siruvani Water Supply', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
    { id: 'parks', label: 'Parks & Green Spaces', icon: Trees, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'shopping', label: 'Supermarkets & Malls', icon: ShoppingBag, color: 'text-pink-600 bg-pink-50' }
  ];

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const handleNext = () => {
    if (step < totalSteps) {
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

  // Determine active target name and coordinates based on selected locality
  const activeTargetLocation = useMemo(() => {
    return selectedLocality;
  }, [selectedLocality]);

  const activeTargetCoordinates = useMemo(() => {
    return activeTargetLocation ? resolveLandmarkCoordinates(activeTargetLocation) : undefined;
  }, [activeTargetLocation]);

  const handleFindMatches = async () => {
    setIsSubmitting(true);
    try {
      const updatedReq = {
        ...requirements,
        buyerType,
        userType: buyerType,
        targetLocationName: selectedLocality,
        targetCoordinates: activeTargetCoordinates,
        maxDistanceKm: undefined,
        isCustomDistance: false,
        intent,
        city: 'Coimbatore',
        preferredLocalities: [selectedLocality],
        budgetMin,
        budgetMax,
        bhk: [selectedBhk]
      };
      setRequirements(updatedReq);

      const isStudent = buyerType === 'Student';
      const isBachelor = buyerType === 'Bachelor';
      const isFamily = buyerType === 'Family';

      const updatedLife = {
        ...lifestyle,
        buyerType,
        userType: buyerType,
        targetLocationName: selectedLocality,
        targetCoordinates: activeTargetCoordinates,
        maxDistanceKm: undefined,
        isCustomDistance: false,
        workplaceLocation: selectedLocality,
        maxCommuteMins: 20,
        priorities: {
          ...lifestyle.priorities,
          quietness: (isStudent ? selectedStudentPriorities.includes('Quiet Study Atmosphere') : isFamily ? selectedFamilyPriorities.includes('Parks & Green Spaces') : 'MEDIUM') as any,
          healthcare: (isFamily && selectedFamilyPriorities.includes('Good Hospitals')) ? 'HIGH' : 'LOW',
          schools: (isFamily && selectedFamilyPriorities.includes('Reputed Schools')) ? 'HIGH' : 'LOW',
          transit: (isStudent ? selectedStudentPriorities.includes('Bus Stop & Transit') : isBachelor ? selectedBachelorPriorities.includes('Public Transport & Bus Route') : 'MEDIUM') as any,
          safety: 'HIGH'
        } as any
      };
      setLifestyle(updatedLife);

      showToast(`Finding best properties for ${buyerType}...`);
      
      await refreshMatches(updatedReq, updatedLife).catch(() => {});
      navigate('/recommendations');
    } catch (err) {
      console.error('Error submitting match requirements:', err);
      navigate('/recommendations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePriorities = useMemo(() => {
    if (buyerType === 'Student') return selectedStudentPriorities;
    if (buyerType === 'Bachelor') return selectedBachelorPriorities;
    return selectedFamilyPriorities;
  }, [buyerType, selectedStudentPriorities, selectedBachelorPriorities, selectedFamilyPriorities]);

  const handleIntentChange = (newIntent: 'BUY' | 'RENT') => {
    setIntent(newIntent);
    if (newIntent === 'BUY') {
      if (budgetMax < 100000) {
        setBudgetMin(4000000);
        setBudgetMax(7500000);
      }
    } else {
      if (budgetMin >= 100000) {
        setBudgetMin(buyerType === 'Student' ? 3000 : buyerType === 'Bachelor' ? 6000 : 15000);
        setBudgetMax(buyerType === 'Student' ? 15000 : buyerType === 'Bachelor' ? 25000 : 40000);
      }
    }
  };

  const formatBudgetDisplay = () => {
    if (intent === 'BUY') {
      const minL = Math.round(budgetMin / 100000);
      const maxL = Math.round(budgetMax / 100000);
      const formatLakhs = (val: number) => {
        if (val >= 100) {
          const cr = val / 100;
          return `${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
        }
        return `${val} Lakhs`;
      };
      return `₹${formatLakhs(minL)} – ₹${formatLakhs(maxL)}`;
    } else {
      return `₹${budgetMin.toLocaleString('en-IN')} – ₹${budgetMax.toLocaleString('en-IN')} / month`;
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
            <img
              src="/logo.png"
              alt="HavenMatch AI Logo"
              className="w-7 h-7 object-contain rounded-lg shadow-xs"
            />
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
              HavenMatch <span className="text-orange-600">AI</span>
            </span>
          </div>

          <div className="w-9" />
        </div>

        {/* Top Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-orange-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 py-6 flex flex-col justify-center space-y-6">
        
        {/* =================================================================== */}
        {/* STEP 1: Who are you? (Student / Bachelor / Family / IT Professional) */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 1 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Who are you?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your profile to personalize matching and avoid unnecessary questions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Option 1: Student */}
              <div
                onClick={() => {
                  setBuyerType('Student');
                  setIntent('RENT');
                  setBudgetMin(3000);
                  setBudgetMax(15000);
                  setSelectedBhk(1);
                  setSelectedLocality('Saravanampatti');
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  buyerType === 'Student'
                    ? 'border-orange-500 bg-orange-50/60 shadow-2xs ring-2 ring-orange-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    buyerType === 'Student' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  {buyerType === 'Student' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Student</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Find rooms & PGs in your preferred area</p>
                </div>
              </div>

              {/* Option 2: Bachelor */}
              <div
                onClick={() => {
                  setBuyerType('Bachelor');
                  setIntent('RENT');
                  setBudgetMin(6000);
                  setBudgetMax(25000);
                  setSelectedBhk(1);
                  setSelectedLocality('Peelamedu');
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  buyerType === 'Bachelor'
                    ? 'border-orange-500 bg-orange-50/60 shadow-2xs ring-2 ring-orange-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    buyerType === 'Bachelor' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  {buyerType === 'Bachelor' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Bachelor</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Bachelor-friendly rentals with zero hassle</p>
                </div>
              </div>

              {/* Option 3: Family */}
              <div
                onClick={() => {
                  setBuyerType('Family');
                  setBudgetMin(intent === 'BUY' ? 4000000 : 18000);
                  setBudgetMax(intent === 'BUY' ? 8000000 : 45000);
                  setSelectedBhk(2);
                  setSelectedLocality('Race Course');
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  buyerType === 'Family'
                    ? 'border-orange-500 bg-orange-50/60 shadow-2xs ring-2 ring-orange-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    buyerType === 'Family' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Users className="w-5 h-5" />
                  </div>
                  {buyerType === 'Family' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Family</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Homes near schools, hospitals & parks</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {buyerType === 'Student' && 'Student Mode: Directly find rooms & PGs in your preferred locality without unnecessary questions.'}
                {buyerType === 'Bachelor' && 'Bachelor Mode: Shows rentals open to single professionals with zero awkward restrictions.'}
                {buyerType === 'Family' && 'Family Mode: Focuses on gated communities, schools, Siruvani water, and safe environments.'}
              </span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STUDENT & BACHELOR FLOW — STEP 2: Preferred Locality */}
        {/* =================================================================== */}
        {(buyerType === 'Student' || buyerType === 'Bachelor') && step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 2 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Where do you want to live?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your preferred neighborhood in Coimbatore.
              </p>
            </div>

            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                placeholder="Search locality (e.g. Saravanampatti, Peelamedu)..."
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>

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
        {/* STUDENT FLOW — STEP 3: Budget & Room Type */}
        {/* =================================================================== */}
        {buyerType === 'Student' && step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 3 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Monthly rent & room type
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Set comfortable rent and preferred room sharing.
              </p>
            </div>

            {/* Budget Pill */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-900 font-extrabold text-sm shadow-2xs">
                <span>{formatBudgetDisplay()}</span>
              </div>
            </div>

            {/* Slider */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <input
                type="range"
                min={3000}
                max={25000}
                step={1000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>₹3,000</span>
                <span>₹12,000</span>
                <span>₹25,000+</span>
              </div>
            </div>

            {/* Room Type Options */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[
                { bhk: 1, title: '1 BHK / Room', sub: 'Single room / PG' },
                { bhk: 2, title: '2 BHK', sub: 'Twin sharing' },
                { bhk: 3, title: '3 BHK', sub: 'Group sharing' }
              ].map((opt) => (
                <button
                  key={opt.bhk}
                  type="button"
                  onClick={() => setSelectedBhk(opt.bhk)}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                    selectedBhk === opt.bhk
                      ? 'border-orange-500 bg-orange-50/60 shadow-2xs text-orange-950 font-black'
                      : 'border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm">{opt.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STUDENT FLOW — STEP 4: Student Lifestyle Priorities */}
        {/* =================================================================== */}
        {buyerType === 'Student' && step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 4 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Student lifestyle priorities
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select features important for your student life and study.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {studentPriorityOptions.map((opt) => {
                const isSelected = selectedStudentPriorities.includes(opt.label);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleArrayItem(setSelectedStudentPriorities, opt.label)}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[95px] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}


        {/* =================================================================== */}
        {/* BACHELOR FLOW — STEP 3: Budget & BHK */}
        {/* =================================================================== */}
        {buyerType === 'Bachelor' && step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 3 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Monthly rent & flat size
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Bachelor-friendly rentals within your budget.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-900 font-extrabold text-sm shadow-2xs">
                <span>{formatBudgetDisplay()}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <input
                type="range"
                min={5000}
                max={40000}
                step={1000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>₹5k</span>
                <span>₹20k</span>
                <span>₹40k+</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[1, 2, 3].map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => setSelectedBhk(bhk)}
                  className={`py-3.5 rounded-2xl font-extrabold text-sm transition-all border cursor-pointer ${
                    selectedBhk === bhk
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bhk} BHK
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* BACHELOR FLOW — STEP 4: Bachelor Lifestyle Priorities */}
        {/* =================================================================== */}
        {buyerType === 'Bachelor' && step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 4 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Bachelor lifestyle priorities
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select features important for your independent lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {bachelorPriorityOptions.map((opt) => {
                const isSelected = selectedBachelorPriorities.includes(opt.label);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleArrayItem(setSelectedBachelorPriorities, opt.label)}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[95px] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}


        {/* =================================================================== */}
        {/* FAMILY FLOW — STEP 2: Intent (Buy / Rent) */}
        {/* =================================================================== */}
        {buyerType === 'Family' && step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 2 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                What are you looking for?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Are you looking to buy a family home or rent?
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
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
                  <p className="text-xs sm:text-sm text-slate-500">I want to buy a home or villa for my family</p>
                </div>
              </div>

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
                  <p className="text-xs sm:text-sm text-slate-500">I want to rent an apartment for my family</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* FAMILY FLOW — STEP 3: Budget */}
        {/* =================================================================== */}
        {buyerType === 'Family' && step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 3 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Family budget target
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Set your family's preferred price range.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-900 font-extrabold text-sm shadow-2xs">
                <span>{formatBudgetDisplay()}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <input
                type="range"
                min={intent === 'BUY' ? 2000000 : 10000}
                max={intent === 'BUY' ? 30000000 : 80000}
                step={intent === 'BUY' ? 500000 : 2000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{intent === 'BUY' ? '₹20L' : '₹10k'}</span>
                <span>{intent === 'BUY' ? '₹75L' : '₹35k'}</span>
                <span>{intent === 'BUY' ? '₹3 Cr+' : '₹80k+'}</span>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* FAMILY FLOW — STEP 4: Bedrooms */}
        {/* =================================================================== */}
        {buyerType === 'Family' && step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 4 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                How many bedrooms for your family?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your preferred family home size.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {[1, 2, 3, 4].map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => setSelectedBhk(bhk)}
                  className={`py-4 rounded-2xl font-extrabold text-sm sm:text-base transition-all border cursor-pointer ${
                    selectedBhk === bhk
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>{bhk === 4 ? '4+' : bhk}</div>
                  <div className="text-[11px] font-semibold">{bhk === 4 ? 'BHK+' : 'BHK'}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* FAMILY FLOW — STEP 5: Locality */}
        {/* =================================================================== */}
        {buyerType === 'Family' && step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 5 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Where do you want to live?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select your family's preferred residential area.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {localitiesList.map((loc) => {
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
        {/* FAMILY FLOW — STEP 6: Family Lifestyle Priorities */}
        {/* =================================================================== */}
        {buyerType === 'Family' && step === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Step 6 <span className="text-slate-400 font-normal">of {totalSteps}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                What matters most to your family?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select essential amenities for your family's daily comfort.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {familyPriorityOptions.map((opt) => {
                const isSelected = selectedFamilyPriorities.includes(opt.label);
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleArrayItem(setSelectedFamilyPriorities, opt.label)}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[100px] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* UNIFIED FINAL REVIEW STEP (Student, Bachelor, Family) */}
        {/* =================================================================== */}
        {step === totalSteps && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">
                Final Step
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {intent === 'BUY' ? 'Review your home search' : 'Review your rental search'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Review your preferences before finding your matches.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm divide-y divide-slate-100">
              
              {/* Row 1: Profile Type */}
              <div className="flex items-center justify-between gap-3 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    {buyerType === 'Student' ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : buyerType === 'Bachelor' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profile Type</div>
                    <div className="text-sm font-extrabold text-slate-900">{buyerType}</div>
                  </div>
                </div>
              </div>

              {/* Row 2: Search Intent */}
              <div className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Intent</div>
                    <div className="text-xs font-medium text-slate-500">{intent === 'BUY' ? 'Buy Property' : 'Rent Property'}</div>
                  </div>
                </div>
                <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleIntentChange('BUY')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      intent === 'BUY'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIntentChange('RENT')}
                    className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      intent === 'RENT'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    RENT
                  </button>
                </div>
              </div>

              {/* Row 3: Preferred Area */}
              <div className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preferred Area</div>
                    <div className="text-sm font-extrabold text-slate-900">{selectedLocality?.trim() || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              {/* Row 4: Budget */}
              <div className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {intent === 'BUY' ? 'Target Budget' : 'Monthly Rent Budget'}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">{formatBudgetDisplay()}</div>
                  </div>
                </div>
              </div>

              {/* Row 5: Home Preference */}
              <div className="flex items-center justify-between gap-3 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Home Preference</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {selectedBhk} BHK • {requirements.propertyTypes?.[0] || 'Apartment'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Priorities */}
              <div className="flex items-start justify-between gap-3 pt-3.5">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priorities</div>
                  </div>
                </div>
                <div className="text-right max-w-[210px] sm:max-w-[240px]">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 break-words leading-relaxed">
                    {activePriorities.length > 0 ? activePriorities.join(' • ') : 'No priorities selected'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Buttons */}
      <div className="w-full pt-4 space-y-3">
        {step < totalSteps ? (
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-4 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm border border-slate-200 transition-all cursor-pointer text-center"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFindMatches}
                className="flex-2 py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-black text-base transition-all shadow-haven-md hover:shadow-haven-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                   {isSubmitting ? 'Analyzing Matches...' : 'Find My Matches'}
                </span>
                <Sparkles className="w-5 h-5 text-amber-200" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              HavenMatch AI will use your profile and preferences to find suitable homes.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
