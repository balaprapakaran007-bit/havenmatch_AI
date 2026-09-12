import React, { useState, useEffect } from 'react';
import { Visit } from '../types';
import { visitService } from '../services/visitService';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

export const VisitsView: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const { navigateToProperty, setActiveView, showToast } = useApp();

  useEffect(() => {
    visitService.getVisits().then(setVisits);
  }, []);

  const handleCancelVisit = async (id: string) => {
    const updated = await visitService.updateStatus(id, 'Cancelled');
    if (updated) {
      setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'Cancelled' } : v)));
      showToast('Visit appointment cancelled');
    }
  };

  const getStatusBadge = (status: Visit['status']) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <CheckCircle className="w-3.5 h-3.5 text-orange-600" /> Confirmed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Awaiting Owner Confirmation
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (visits.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center mx-auto shadow-xs border border-orange-200">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">No scheduled visits</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule free in-person walkthroughs with verified property owners directly from property detail pages.
          </p>
        </div>
        <button
          onClick={() => setActiveView('discover')}
          className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-haven-sm"
        >
          Explore Properties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Scheduled Property Visits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Direct appointments with owners with zero broker mediation.
          </p>
        </div>
        <button
          onClick={() => setActiveView('discover')}
          className="text-xs font-bold text-orange-700 hover:underline flex items-center gap-1"
        >
          <span>Find More Homes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {visits.map((v) => (
          <div
            key={v.id}
            className="card-haven p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={v.propertyImage}
                alt={v.propertyTitle}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(v.status)}
                  <span className="text-[11px] text-slate-400">Created {v.createdAt}</span>
                </div>
                <h3
                  onClick={() => navigateToProperty(v.propertyId)}
                  className="font-bold text-sm sm:text-base text-slate-900 hover:text-orange-700 cursor-pointer"
                >
                  {v.propertyTitle}
                </h3>
                <p className="text-xs text-slate-500 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 mr-1" />
                  {v.propertyLocality}
                </p>
                <p className="text-xs font-black text-slate-900">
                  {v.propertyPrice} • {v.propertyBhk} BHK
                </p>
              </div>
            </div>

            {/* Visit Details & Actions */}
            <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex flex-col justify-between items-start sm:items-end gap-2">
              <div className="space-y-1 text-xs">
                <div className="flex items-center sm:justify-end gap-1 font-bold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span>{v.date}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{v.timeSlot}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                  <span>Host: {v.sellerName}</span>
                </div>
              </div>

              {v.status !== 'Cancelled' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCancelVisit(v.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200"
                  >
                    Cancel Slot
                  </button>
                  <button
                    onClick={() => navigateToProperty(v.propertyId)}
                    className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 text-[11px] font-bold hover:bg-orange-100 border border-orange-200/60"
                  >
                    View Property
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
