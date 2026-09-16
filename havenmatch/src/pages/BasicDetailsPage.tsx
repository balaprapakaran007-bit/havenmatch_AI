import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLifestyle } from '../context/LifestyleContext';
import { PropertyType } from '../types';
import {
  Sparkles,
  MapPin,
  Building,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

export const BasicDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { requirements, setRequirements } = useLifestyle();

  const isBuy = requirements.intent === 'BUY';

  const [city, setCity] = useState(requirements.city || 'Coimbatore');
  const [localitiesInput, setLocalitiesInput] = useState(
    requirements.preferredLocalities.join(', ')
  );
  const [budgetMin, setBudgetMin] = useState(
    requirements.budgetMin || (isBuy ? 4000000 : 15000)
  );
  const [budgetMax, setBudgetMax] = useState(
    requirements.budgetMax || (isBuy ? 7500000 : 35000)
  );
  const [selectedBhk, setSelectedBhk] = useState<number[]>(
    requirements.bhk?.length ? requirements.bhk : [2, 3]
  );
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>(
    requirements.propertyTypes?.length
      ? requirements.propertyTypes
      : ['Apartment', 'Villa']
  );

  const cities = [
    'All Cities',
    'Bengaluru',
    'Mumbai',
    'Delhi NCR',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Coimbatore',
    'Kochi',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Chandigarh',
    'Goa'
  ];

  const availableTypes: PropertyType[] = [
    'Apartment',
    'Villa',
    'Independent House',
    'Builder Floor'
  ];

  const toggleBhk = (bhk: number) => {
    setSelectedBhk((prev) =>
      prev.includes(bhk)
        ? prev.length > 1
          ? prev.filter((b) => b !== bhk)
          : prev
        : [...prev, bhk]
    );
  };

  const toggleType = (type: PropertyType) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1
          ? prev.filter((t) => t !== type)
          : prev
        : [...prev, type]
    );
  };

  const formatPrice = (amount: number) => {
    if (isBuy) {
      if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(2)} Cr`;
      }
      return `₹${(amount / 100000).toFixed(0)} Lakhs`;
    }
    return `₹${amount.toLocaleString()}/mo`;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLocalities = localitiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setRequirements((prev) => ({
      ...prev,
      city,
      preferredLocalities: parsedLocalities.length > 0 ? parsedLocalities : ['Peelamedu', 'RS Puram'],
      budgetMin,
      budgetMax,
      bhk: selectedBhk,
      propertyTypes: selectedPropertyTypes
    }));

    navigate('/preferences');
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Navigation & Step */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/goal"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <span className="text-xs font-bold text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
            Step 3 of 5
          </span>
        </div>

        {/* Title Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Where are you looking?
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            Specify your preferred localities, budget ceiling, and preferred living space.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleContinue} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 ring-1 ring-slate-900/5 space-y-6">
          {/* City & Localities */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                City
              </label>
              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Localities or Pincode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={localitiesInput}
                  onChange={(e) => setLocalitiesInput(e.target.value)}
                  placeholder="e.g. Peelamedu, Race Course, RS Puram"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Separate multiple localities with commas
              </p>
            </div>
          </div>

          {/* Budget Range */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Budget Ceiling
              </label>
              <span className="text-sm font-extrabold text-orange-700 bg-orange-50 px-3 py-1 rounded-lg">
                Up to {formatPrice(budgetMax)}
              </span>
            </div>

            <input
              type="range"
              min={isBuy ? 3000000 : 10000}
              max={isBuy ? 25000000 : 100000}
              step={isBuy ? 500000 : 2000}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full accent-orange-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
              <span>{isBuy ? '₹30 Lakhs' : '₹10,000/mo'}</span>
              <span>{isBuy ? '₹1.50 Cr' : '₹50,000/mo'}</span>
              <span>{isBuy ? '₹2.50+ Cr' : '₹1 Lakh/mo'}</span>
            </div>
          </div>

          {/* BHK Configuration */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              BHK Space (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5].map((bhk) => {
                const isSelected = selectedBhk.includes(bhk);
                return (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => toggleBhk(bhk)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50 text-orange-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    <span>{bhk === 5 ? '5+ BHK' : `${bhk} BHK`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Property Types */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Property Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableTypes.map((type) => {
                const isSelected = selectedPropertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50 text-orange-800 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/goal')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all hover:scale-[1.02]"
            >
              <span>Continue to Lifestyle Preferences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
