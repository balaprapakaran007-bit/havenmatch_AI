import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { propertyService } from '../services/propertyService';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { Scale, Trash2, ArrowRight, Check, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';

export const CompareView: React.FC = () => {
  const { comparePropertyIds, toggleCompareProperty, navigateToProperty, setActiveView } = useApp();
  const { matches } = useLifestyle();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    Promise.all(comparePropertyIds.map((id) => propertyService.getPropertyById(id))).then((res) => {
      setProperties(res.filter(Boolean) as Property[]);
    });
  }, [comparePropertyIds]);

  if (properties.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-xs border border-orange-200">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Compare Deck is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Add up to 3 properties to compare lifestyle match scores, price per sq.ft, hospital proximity, and water connections side-by-side.
        </p>
        <button
          onClick={() => setActiveView('discover')}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-haven-sm hover:bg-orange-700"
        >
          Explore Matches
        </button>
      </div>
    );
  }

  const rows = [
    { label: 'Overall Match Score', render: (p: Property) => (
      <div className="flex items-center gap-1 font-black text-orange-700 text-sm">
        <Sparkles className="w-4 h-4 text-orange-600" />
        <span>{matches[p.id]?.overallScore || 92}% Match</span>
      </div>
    )},
    { label: 'Price / Rent', render: (p: Property) => (
      <div>
        <span className="font-black text-slate-900 text-base">{p.priceDisplay}</span>
        <span className="text-[10px] text-slate-400 block">{p.pricePerSqFt}</span>
      </div>
    )},
    { label: 'Monthly Maintenance', render: (p: Property) => <span className="font-semibold text-slate-700">{p.maintenanceMonthly}</span> },
    { label: 'Configuration', render: (p: Property) => <span className="font-bold text-slate-900">{p.bhk} BHK • {p.bathrooms} Bath</span> },
    { label: 'Built-up Area', render: (p: Property) => <span className="text-slate-700">{p.builtUpAreaSqFt} sq.ft (Carpet: {p.carpetAreaSqFt})</span> },
    { label: 'Locality & City', render: (p: Property) => <span className="font-semibold text-slate-800">{p.locality}, {p.city}</span> },
    { label: 'Facing & Vastu', render: (p: Property) => (
      <span className="text-slate-700">{p.facing} ({p.vastuCompliant ? '100% Vastu' : 'Standard'})</span>
    )},
    { label: 'Water Supply', render: (p: Property) => (
      <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">{p.waterSupply}</span>
    )},
    { label: 'Power Backup', render: (p: Property) => <span className="text-slate-700">{p.powerBackup}</span> },
    { label: 'Covered Parking', render: (p: Property) => <span className="text-slate-700">{p.parking}</span> },
    { label: 'Healthcare Proximity', render: (p: Property) => (
      <span className="text-xs font-bold text-orange-700">
        {matches[p.id]?.breakdown.healthcareFit.label || 'Excellent'} ({matches[p.id]?.breakdown.healthcareFit.detail})
      </span>
    )},
    { label: 'Work Commute Fit', render: (p: Property) => (
      <span className="text-xs font-bold text-amber-700">
        {matches[p.id]?.breakdown.commuteFit.label || 'Good'}
      </span>
    )}
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Side-by-Side Property Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comparing {properties.length} homes across lifestyle fit, utilities, and financials.
          </p>
        </div>

        <button
          onClick={() => setActiveView('discover')}
          className="text-xs font-bold text-orange-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Add More to Compare</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden flex items-center justify-center gap-1.5 py-1.5 px-3 bg-orange-50 rounded-xl text-[11px] font-semibold text-orange-800 border border-orange-200">
        <span>👈 Swipe horizontally to compare all {properties.length} homes 👉</span>
      </div>

      {/* Responsive Comparison Table Container */}
      <div className="card-haven bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-haven-sm">
        <table className="w-full text-left text-xs border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] w-40 sticky left-0 bg-slate-50 z-10">
                Property Feature
              </th>
              {properties.map((p) => (
                <th key={p.id} className="p-4 w-60 align-top">
                  <div className="space-y-2">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                      <button
                        onClick={() => toggleCompareProperty(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => navigateToProperty(p.id)}
                      className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-700 bg-slate-50/70 sticky left-0 z-10">
                  {row.label}
                </td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
