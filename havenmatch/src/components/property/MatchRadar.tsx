import React from 'react';
import { MatchBreakdown } from '../../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MatchRadarProps {
  breakdown: MatchBreakdown;
  overallScore: number;
}

export const MatchRadar: React.FC<MatchRadarProps> = ({ breakdown, overallScore }) => {
  const dimensions = [
    { key: 'budgetFit', label: 'Budget Fit', data: breakdown.budgetFit },
    { key: 'commuteFit', label: 'Daily Commute', data: breakdown.commuteFit },
    { key: 'healthcareFit', label: 'Healthcare Access', data: breakdown.healthcareFit },
    { key: 'transitFit', label: 'Transit & Metro', data: breakdown.transitFit },
    { key: 'schoolsFit', label: 'Schools & Education', data: breakdown.schoolsFit },
    { key: 'neighborhoodFit', label: 'Neighborhood Atmosphere', data: breakdown.neighborhoodFit },
    { key: 'amenitiesFit', label: 'Society Amenities', data: breakdown.amenitiesFit }
  ];

  const getBadgeColor = (label: string) => {
    switch (label) {
      case 'Excellent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Good':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Moderate':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 90) return 'bg-orange-600';
    if (score >= 80) return 'bg-orange-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="card-haven p-4 sm:p-6 bg-white border border-slate-200/90 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Multi-Dimensional Match Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Evaluated against your active lifestyle priorities and commute targets
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
            {overallScore}%
          </div>
          <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
            Overall Match
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        {dimensions.map((dim) => (
          <div key={dim.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{dim.label}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeColor(dim.data.label)}`}>
                  {dim.data.label} ({dim.data.score}%)
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(dim.data.score)}`}
                style={{ width: `${dim.data.score}%` }}
              ></div>
            </div>

            {/* Micro reason */}
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              {dim.data.score >= 80 ? (
                <CheckCircle2 className="w-3 h-3 text-orange-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <span className="line-clamp-1">{dim.data.detail}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
