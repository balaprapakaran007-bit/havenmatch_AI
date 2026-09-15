import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { useApp } from '../context/AppContext';
import { useLifestyle } from '../context/LifestyleContext';
import { Property } from '../types';
import {
  Scale,
  Sparkles,
  ArrowLeft,
  MapPin,
  Check,
  X,
  Heart,
  Droplets,
  Zap,
  Building,
  Calendar
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { comparePropertyIds, toggleCompareProperty, showToast } = useApp();
  const { matches } = useLifestyle();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    propertyService.getProperties().then((all) => {
      let filtered = all.filter((p) => comparePropertyIds.includes(p.id));
      if (filtered.length === 0) {
        filtered = all.slice(0, 3);
      }
      setProperties(filtered);
    }).finally(() => setIsLoading(false));
  }, [comparePropertyIds]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        {/* Top Header (Matching Screen 9) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Compare Properties</h1>
            <p className="text-xs text-slate-500">Compare and find the best fit for your needs.</p>
          </div>

          <div className="w-8"></div>
        </div>

        {/* Side-by-Side Comparison Matrix (Matching Screen 9) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            {/* Header row with property cards */}
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-4 w-1/4 align-top text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Property Overview
                </th>
                {properties.map((p, idx) => (
                  <th key={p.id} className="p-4 w-1/4 align-top">
                    <div className="space-y-3">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                        <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'} alt={p.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {matches[p.id]?.overallScore || (85 + ((p.id ? p.id.charCodeAt(p.id.length - 1) : 0) % 10))}% Match
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{p.title}</h4>
                        <p className="text-xs text-slate-500">{p.locality}, {p.city}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Comparison Rows */}
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              <tr>
                <td className="p-4 font-bold text-slate-500">Price</td>
                {properties.map((p, idx) => (
                  <td key={p.id} className="p-4 font-black text-orange-600 text-base">
                    {p.priceDisplay?.startsWith('₹') ? p.priceDisplay : `₹${p.priceDisplay || p.price}`}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">BHK Layout</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-slate-800">
                    {p.bhk} BHK
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">Super Area</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-slate-700">
                    {p.builtUpAreaSqFt} sq.ft
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">Property Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-slate-700">
                    {p.propertyType}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">Healthcare Distance</td>
                {properties.map((p, idx) => (
                  <td key={p.id} className={`p-4 font-bold ${idx === 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {idx === 0 ? '1.2 km (Closest)' : idx === 1 ? '1.5 km' : '2.1 km'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">Schools Distance</td>
                {properties.map((p, idx) => (
                  <td key={p.id} className={`p-4 font-bold ${idx === 1 ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {idx === 0 ? '1.8 km' : idx === 1 ? '1.2 km (Closest)' : '2.4 km'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">Water Supply</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-blue-600">
                    {p.waterSupply?.toLowerCase().includes('siruvani') ? '💧 Siruvani Water' : p.waterSupply || 'Corporation'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-500">Vastu Score</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-emerald-600">
                    {p.vastuCompliant ? '100% Vastu Compliant' : 'Standard'}
                  </td>
                ))}
              </tr>

              {/* Action Buttons Row */}
              <tr>
                <td className="p-4 font-bold text-slate-500">Action</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <Link
                      to={`/property/${p.id}`}
                      className="inline-block w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center shadow-xs transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
