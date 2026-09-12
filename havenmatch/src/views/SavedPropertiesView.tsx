import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { propertyService } from '../services/propertyService';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { PropertyCard } from '../components/property/PropertyCard';
import { Heart, Compass, ArrowRight } from 'lucide-react';

export const SavedPropertiesView: React.FC = () => {
  const { savedPropertyIds, setActiveView } = useApp();
  const { matches } = useLifestyle();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    Promise.all(savedPropertyIds.map((id) => propertyService.getPropertyById(id))).then((res) => {
      setProperties(res.filter(Boolean) as Property[]);
    });
  }, [savedPropertyIds]);

  if (properties.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">No saved properties yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tap the heart icon on any property card to bookmark homes that match your lifestyle priorities.
          </p>
        </div>
        <button
          onClick={() => setActiveView('discover')}
          className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-haven-sm transition-all inline-flex items-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Discover Your Matches</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Saved Properties ({properties.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Homes you've bookmarked for in-person visits and owner contact.
          </p>
        </div>
        <button
          onClick={() => setActiveView('discover')}
          className="text-xs font-bold text-orange-700 hover:underline flex items-center gap-1"
        >
          <span>Find More Matches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {properties.map((prop) => (
          <PropertyCard
            key={prop.id}
            property={prop}
            match={matches[prop.id]}
          />
        ))}
      </div>
    </div>
  );
};
